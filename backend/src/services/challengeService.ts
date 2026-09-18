import { dataRepository } from '../repositories/dataRepository';

export interface ChallengeOption {
  id: string;
  text: string;
  isOptimal: boolean;
  consequence: string;
  voteCount?: number;
  communityVotePercent?: number;
}

export interface DailyChallengeResponse {
  id: string;
  date: string;
  title: string;
  description: string;
  category: string;
  options: ChallengeOption[];
}

export class ChallengeService {
  public async getDailyChallenge(dateString?: string): Promise<DailyChallengeResponse> {
    const challenge = await dataRepository.getDailyChallenge(dateString);
    if (!challenge) {
      // Return default challenge
      return {
        id: 'challenge_default',
        date: new Date().toISOString().split('T')[0],
        title: 'Emergency Medical Dilemma',
        description: 'Your close cousin asks for a quick ₹25,000 personal loan via UPI for an urgent clinic deposit. You only have ₹30,000 in your emergency fund.',
        category: 'EMERGENCY_RISK',
        options: [
          {
            id: 'opt_1',
            text: 'Transfer ₹25,000 immediately without asking for medical bills or repayment timeline.',
            isOptimal: false,
            communityVotePercent: 18,
            consequence: 'Drains 83% of your liquid safety altitude; high risk of non-repayment causing family friction.',
          },
          {
            id: 'opt_2',
            text: 'Offer to pay ₹5,000 directly to the hospital pharmacy as a gift, keeping your own emergency runway safe.',
            isOptimal: true,
            communityVotePercent: 64,
            consequence: 'Demonstrates familial empathy without compromising your personal financial airworthiness.',
          },
          {
            id: 'opt_3',
            text: 'Take a quick high-interest instant loan on your own card to lend them ₹25,000.',
            isOptimal: false,
            communityVotePercent: 18,
            consequence: 'Catastrophic double-debt trap: you absorb 36% APR credit risk for another person.',
          },
        ],
      };
    }

    const options = (challenge.options as ChallengeOption[]) || [];
    const totalVotes = options.reduce((sum, opt) => sum + (opt.voteCount || 0), 0);

    const formattedOptions = options.map((opt) => ({
      id: opt.id,
      text: opt.text,
      isOptimal: opt.isOptimal,
      consequence: opt.consequence,
      communityVotePercent: totalVotes > 0 ? Math.round(((opt.voteCount || 0) / totalVotes) * 100) : 33,
    }));

    return {
      id: challenge.id,
      date: challenge.date,
      title: challenge.title,
      description: challenge.description,
      category: challenge.category,
      options: formattedOptions,
    };
  }

  public async submitAttempt(userId: string, challengeId: string, optionId: string): Promise<any> {
    const challenge = await dataRepository.getDailyChallenge();
    const options = (challenge?.options as ChallengeOption[]) || [];
    const chosenOption = options.find((o) => o.id === optionId);

    const isOptimal = chosenOption ? chosenOption.isOptimal : false;
    const scoreAwarded = isOptimal ? 100 : 25;

    // Update vote counts
    const updatedOptions = options.map((o) => {
      if (o.id === optionId) {
        return { ...o, voteCount: (o.voteCount || 0) + 1 };
      }
      return o;
    });

    if (challenge) {
      await dataRepository.updateDailyChallenge(challenge.id, {
        options: updatedOptions,
      });
    }

    // Record attempt
    const attempt = await dataRepository.recordChallengeAttempt({
      challengeId,
      userId,
      choiceSelected: optionId,
      score: scoreAwarded,
      isCorrect: isOptimal,
    });

    // Update pilot XP / points in profile
    const profile = await dataRepository.getProfile(userId);
    if (profile) {
      await dataRepository.updateProfile(userId, {
        totalSimulations: (profile.totalSimulations || 0) + 1,
      });
    }

    return {
      attempt,
      isOptimal,
      explanation: chosenOption?.consequence || 'Decision logged in flight telemetry.',
      updatedOptions,
    };
  }
}

export const challengeService = new ChallengeService();

