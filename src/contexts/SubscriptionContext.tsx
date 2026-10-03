import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  SubscriptionApi,
  UserSubscription,
  SubscriptionPlan,
  DailyUsageInfo,
  PlanEntitlements,
  BillingPayment,
  CheckoutSessionData,
} from '../services/api/subscriptionApi';
import { loadRazorpayScript } from '../utils/razorpayLoader';
import { soundManager } from '../services/audioService';

interface SubscriptionContextType {
  subscription: UserSubscription | null;
  plan: SubscriptionPlan | null;
  dailyUsage: DailyUsageInfo | null;
  entitlements: PlanEntitlements;
  isPremium: boolean;
  loading: boolean;
  isPaywallOpen: boolean;
  paywallReason: string;
  isPricingModalOpen: boolean;
  billingHistory: BillingPayment[];
  canPlayGame: boolean;
  canUseAi: boolean;
  openPaywall: (reason?: string) => void;
  closePaywall: () => void;
  openPricingModal: () => void;
  closePricingModal: () => void;
  refreshSubscription: () => Promise<void>;
  recordGameStart: (gameType?: string) => Promise<boolean>;
  startCheckout: (planCode?: 'PREMIUM' | 'FREE') => Promise<boolean>;
  cancelSubscription: () => Promise<boolean>;
  demoTogglePlan: (targetPlan: 'FREE' | 'PREMIUM') => Promise<void>;
}

const DEFAULT_ENTITLEMENTS: PlanEntitlements = {
  gameAccess: true,
  advancedReports: false,
  aiCoach: true,
  decisionDnaInsights: false,
  premiumScenarios: false,
  unlimitedSimulations: false,
  priorityFlightDeck: false,
};

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [dailyUsage, setDailyUsage] = useState<DailyUsageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [paywallReason, setPaywallReason] = useState<string>('');
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [billingHistory, setBillingHistory] = useState<BillingPayment[]>([]);

  const isPremium = Boolean(subscription?.isPremium);
  const entitlements = subscription?.entitlements || DEFAULT_ENTITLEMENTS;

  const canPlayGame = isPremium || (dailyUsage ? dailyUsage.gamesRemaining > 0 : true);
  const canUseAi = isPremium || (dailyUsage ? dailyUsage.aiRemaining > 0 : true);

  const refreshSubscription = useCallback(async () => {
    try {
      const res = await SubscriptionApi.getSubscription();
      if (res.success && res.data) {
        setSubscription(res.data.subscription);
        setPlan(res.data.plan);
        setDailyUsage(res.data.dailyUsage);
      }
    } catch {
      // Fallback state on offline
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await SubscriptionApi.getBillingHistory();
      if (res.success && res.data) {
        setBillingHistory(res.data);
      }
    } catch {
      // Ignore on offline
    }
  }, []);

  useEffect(() => {
    refreshSubscription();
    fetchHistory();
  }, [refreshSubscription, fetchHistory]);

  const openPaywall = (reason: string = "Today's daily flight training allowance is complete.") => {
    setPaywallReason(reason);
    setIsPaywallOpen(true);
  };

  const closePaywall = () => {
    setIsPaywallOpen(false);
  };

  const openPricingModal = () => {
    setIsPricingModalOpen(true);
  };

  const closePricingModal = () => {
    setIsPricingModalOpen(false);
  };

  /**
   * Authoritative server-side game session gatekeeper
   */
  const recordGameStart = async (gameType: string = 'flight-simulator'): Promise<boolean> => {
    try {
      const res = await SubscriptionApi.authorizeGameStart(gameType);
      if (res.success) {
        // Increment local usage state smoothly
        setDailyUsage((prev) => {
          if (!prev) return null;
          const newUsed = prev.gamesUsed + 1;
          const newRem = Math.max(0, prev.gamesLimit - newUsed);
          return {
            ...prev,
            gamesUsed: newUsed,
            gamesRemaining: newRem,
            isGamesLimitReached: newRem <= 0,
          };
        });
        return true;
      }

      // Blocked by backend
      if (res.error?.code === 'DAILY_LIMIT_REACHED') {
        soundManager.playWarning();
        openPaywall(res.error.message || "Today's daily flight allowance is complete.");
        return false;
      }

      return true;
    } catch {
      // If server is unreachable in development, allow local simulation
      return true;
    }
  };

  /**
   * Launch Razorpay checkout flow with cryptographic backend verification
   */
  const startCheckout = async (planCode: 'PREMIUM' | 'FREE' = 'PREMIUM'): Promise<boolean> => {
    try {
      soundManager.playClick();
      const sessionRes = await SubscriptionApi.createCheckout(planCode);
      if (!sessionRes.success || !sessionRes.data) {
        alert(sessionRes.message || 'Unable to initialize payment checkout.');
        return false;
      }

      const checkoutData = sessionRes.data;
      const scriptLoaded = await loadRazorpayScript();

      return new Promise<boolean>((resolve) => {
        if (!scriptLoaded || !(window as any).Razorpay) {
          // Development sandbox simulation if Razorpay JS is blocked by ad-blocker
          const confirmed = window.confirm(
            `[FinQuest Sandbox Checkout]\nPlan: ${checkoutData.planName} (₹${checkoutData.amount / 100}/mo)\nSimulate successful payment authorization?`
          );
          if (confirmed) {
            SubscriptionApi.verifyPayment({
              razorpay_payment_id: `pay_sandbox_${Date.now()}`,
              razorpay_subscription_id: checkoutData.subscriptionId,
              razorpay_signature: `sandbox_sig_${Date.now()}`,
              planCode: checkoutData.planCode,
            }).then((verifyRes) => {
              if (verifyRes.success) {
                soundManager.playSuccess();
                refreshSubscription();
                fetchHistory();
                setIsPricingModalOpen(false);
                setIsPaywallOpen(false);
                resolve(true);
              } else {
                alert('Verification failed.');
                resolve(false);
              }
            });
          } else {
            resolve(false);
          }
          return;
        }

        const options = {
          key: checkoutData.keyId,
          amount: checkoutData.amount,
          currency: checkoutData.currency,
          name: 'FinQuest Flight Academy',
          description: `Upgrade to ${checkoutData.planName}`,
          image: '/apple-touch-icon.png',
          subscription_id: checkoutData.subscriptionId,
          notes: checkoutData.notes,
          theme: {
            color: '#FF6A2A',
          },
          handler: async (response: any) => {
            try {
              const verifyRes = await SubscriptionApi.verifyPayment({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id || checkoutData.subscriptionId,
                razorpay_signature: response.razorpay_signature,
                razorpay_order_id: response.razorpay_order_id,
                planCode: checkoutData.planCode,
              });

              if (verifyRes.success) {
                soundManager.playSuccess();
                await refreshSubscription();
                await fetchHistory();
                setIsPricingModalOpen(false);
                setIsPaywallOpen(false);
                resolve(true);
              } else {
                soundManager.playWarning();
                alert(verifyRes.error?.message || 'Payment verification could not be confirmed.');
                resolve(false);
              }
            } catch {
              resolve(false);
            }
          },
          modal: {
            ondismiss: () => {
              resolve(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      });
    } catch {
      return false;
    }
  };

  /**
   * Cancels subscription renewal at period end
   */
  const cancelSubscription = async (): Promise<boolean> => {
    try {
      soundManager.playClick();
      const res = await SubscriptionApi.cancelSubscription();
      if (res.success) {
        soundManager.playSuccess();
        await refreshSubscription();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  /**
   * Judge Demo Mode Switcher
   */
  const demoTogglePlan = async (targetPlan: 'FREE' | 'PREMIUM') => {
    try {
      soundManager.playClick();
      const res = await SubscriptionApi.demoToggle(targetPlan);
      if (res.success) {
        soundManager.playSuccess();
        await refreshSubscription();
        await fetchHistory();
      }
    } catch {
      // Ignore
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        plan,
        dailyUsage,
        entitlements,
        isPremium,
        loading,
        isPaywallOpen,
        paywallReason,
        isPricingModalOpen,
        billingHistory,
        canPlayGame,
        canUseAi,
        openPaywall,
        closePaywall,
        openPricingModal,
        closePricingModal,
        refreshSubscription,
        recordGameStart,
        startCheckout,
        cancelSubscription,
        demoTogglePlan,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
