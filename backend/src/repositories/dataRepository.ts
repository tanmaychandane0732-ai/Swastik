import prisma from "../config/prisma";
import { databaseManager } from "../config/database";
import { inMemoryStore, InMemoryUser, InMemoryUserProfile, InMemoryGameSession, InMemoryDecision } from './inMemoryStore';

// Helper to generate unique IDs
const generateId = (prefix: string = 'id') => `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
const isMongoObjectId = (value: unknown): value is string =>
  typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value);
const addSessionAliases = (session: any): any => ({
  ...session,
  totalCash: session.currentCash,
  totalDebt: session.debt,
  netWorth: session.currentCash - session.debt,
  score: session.overallScore,
});
const addSessionUserFields = (session: any): any => ({
  ...session,
  userName: session.userName ?? session.user?.name,
  userEmail: session.userEmail ?? session.user?.email,
});

export class DataRepository {
  private usePrisma: boolean = false;

  private async syncEmbeddedUserProfile(user: any): Promise<any> {
    const profile = user.profile;
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        role: user.role || 'STUDENT',
        financialIQ: profile?.financialIQ ?? user.financialIQ ?? 50,
        financialHealth: profile?.financialHealth ?? user.financialHealth ?? 75,
        riskScore: profile?.riskScore ?? user.riskScore ?? 20,
        decisionDNA: profile?.decisionDNA ?? user.decisionDNA ?? undefined,
        learningProgress: profile?.learningProgress ?? user.learningProgress ?? { modulesCompleted: [] },
      },
      include: { profile: true },
    });
    return updatedUser;
  }

  constructor() {
    this.usePrisma = databaseManager.isDatabaseConnected();
  }

  public async testConnection(force: boolean = false): Promise<boolean> {
    if (!force) {
      this.usePrisma = databaseManager.isDatabaseConnected();
      return this.usePrisma;
    }
    const connected = await databaseManager.testDatabaseConnection(2500);
    this.usePrisma = connected;
    return connected;
  }

  // --- USERS ---
  async findUserByEmail(email: string): Promise<any | null> {
    if (this.usePrisma && prisma) {
      try {
        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() }, include: { profile: true } });
        return user ? await this.syncEmbeddedUserProfile(user) : null;
      } catch {
        this.usePrisma = false;
      }
    }
    const found = Array.from(inMemoryStore.users.values()).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (!found) return null;
    const profile = Array.from(inMemoryStore.profiles.values()).find((p) => p.userId === found.id);
    return { ...found, profile };
  }

  async findUserById(id: string): Promise<any | null> {
    if (this.usePrisma && prisma) {
      try {
        const user = await prisma.user.findUnique({ where: { id }, include: { profile: true } });
        return user ? await this.syncEmbeddedUserProfile(user) : null;
      } catch {
        this.usePrisma = false;
      }
    }
    const found = inMemoryStore.users.get(id);
    if (!found) return null;
    const profile = Array.from(inMemoryStore.profiles.values()).find((p) => p.userId === found.id);
    return { ...found, profile };
  }

  async getAllUsers(): Promise<any[]> {
    if (this.usePrisma && prisma) {
      try {
        return await prisma.user.findMany({ include: { profile: true } });
      } catch {
        this.usePrisma = false;
      }
    }
    return Array.from(inMemoryStore.users.values()).map((u) => {
      const profile = Array.from(inMemoryStore.profiles.values()).find((p) => p.userId === u.id);
      return { ...u, profile };
    });
  }

  async createUser(data: {
    name: string;
    email: string;
    passwordHash: string;
    role?: string;
    ageGroup?: string;
    educationLevel?: string;
    location?: string;
  }): Promise<any> {
    if (this.usePrisma && prisma) {
      try {
        return await prisma.user.create({
          data: {
            name: data.name,
            email: data.email.toLowerCase(),
            passwordHash: data.passwordHash,
            role: data.role || 'STUDENT',
            ageGroup: data.ageGroup || '18-25',
            educationLevel: data.educationLevel || 'Undergraduate',
            location: data.location || 'India',
            financialIQ: 50,
            financialHealth: 75,
            riskScore: 20,
            learningProgress: { modulesCompleted: [] },
            profile: {
              create: {
                userName: data.name,
                userEmail: data.email.toLowerCase(),
                financialIQ: 50,
                financialHealth: 75,
                riskScore: 20,
              },
            },
          },
          include: { profile: true },
        });
      } catch {
        this.usePrisma = false;
      }
    }

    const id = generateId('usr');
    const newUser: InMemoryUser = {
      id,
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      role: data.role || 'STUDENT',
      ageGroup: data.ageGroup || '18-25',
      educationLevel: data.educationLevel || 'Undergraduate',
      location: data.location || 'India',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryStore.users.set(id, newUser);

    const profile: InMemoryUserProfile = {
      id: generateId('prof'),
      userId: id,
      userName: data.name,
      userEmail: data.email.toLowerCase(),
      financialIQ: 50,
      decisionDNA: null,
      financialHealth: 75,
      riskScore: 20,
      learningProgress: { modulesCompleted: [] },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryStore.profiles.set(profile.id, profile);

    return { ...newUser, profile };
  }

  // --- SCENARIOS ---
  async listScenarios(): Promise<any[]> {
    if (this.usePrisma && prisma) {
      try {
        const list = await prisma.scenario.findMany({
          where: { isActive: true },
          include: { options: true },
          orderBy: { month: 'asc' },
        });
        if (list.length > 0) return list;
      } catch {
        this.usePrisma = false;
      }
    }
    return Array.from(inMemoryStore.scenarios.values()).sort((a, b) => a.month - b.month);
  }

  async getScenarioByMonth(month: number): Promise<any | null> {
    if (this.usePrisma && prisma) {
      try {
        return await prisma.scenario.findFirst({
          where: { month, isActive: true },
          include: { options: true },
        });
      } catch {
        this.usePrisma = false;
      }
    }
    return Array.from(inMemoryStore.scenarios.values()).find((s) => s.month === month) || null;
  }

  // --- SESSIONS ---
  async getScenarios(): Promise<any[]> {
    return this.listScenarios();
  }

  async findSessionById(sessionId: string): Promise<any | null> {
    return this.getSessionById(sessionId);
  }

  async createSession(
    paramOrUserId:
      | string
      | {
          userId: string;
          scenarioType?: string;
          currentMonth?: number;
          totalCash?: number;
          totalDebt?: number;
          netWorth?: number;
          creditScore?: number;
          stressLevel?: number;
          status?: string;
          startingCash?: number;
        },
    startingCashArg: number = 10000
  ): Promise<any> {
    let userId: string;
    let startingCash = startingCashArg;
    let totalDebt = 0;
    let currentMonth = 1;
    let creditScore = 680;
    let stressLevel = 20;
    let status = 'IN_PROGRESS';

    if (typeof paramOrUserId === 'object') {
      userId = paramOrUserId.userId;
      startingCash = paramOrUserId.startingCash ?? paramOrUserId.totalCash ?? 10000;
      totalDebt = paramOrUserId.totalDebt ?? 0;
      currentMonth = paramOrUserId.currentMonth ?? 1;
      creditScore = paramOrUserId.creditScore ?? 680;
      stressLevel = paramOrUserId.stressLevel ?? 20;
      status = paramOrUserId.status ?? 'IN_PROGRESS';
    } else {
      userId = paramOrUserId;
    }

    if (this.usePrisma && prisma) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { name: true, email: true },
        });
        return await prisma.gameSession.create({
          data: {
            userId,
            userName: user?.name,
            userEmail: user?.email,
            currentMonth,
            totalMonths: 6,
            status,
            startingCash,
            currentCash: startingCash,
            savings: 0,
            debt: totalDebt,
            monthlyEmi: 0,
            invested: 0,
            creditScore,
            financialHealth: 75,
            riskScore: 20,
            stressLevel,
            overallScore: 0,
          },
        });
      } catch {
        this.usePrisma = false;
      }
    }

    const id = generateId('sess');
    const newSession: InMemoryGameSession = {
      id,
      userId,
      userName: Array.from(inMemoryStore.users.values()).find((user) => user.id === userId)?.name,
      userEmail: Array.from(inMemoryStore.users.values()).find((user) => user.id === userId)?.email,
      currentMonth,
      totalMonths: 6,
      status,
      startingCash,
      currentCash: startingCash,
      totalCash: startingCash,
      savings: 0,
      debt: totalDebt,
      totalDebt,
      netWorth: startingCash - totalDebt,
      monthlyEmi: 0,
      invested: 0,
      creditScore,
      stressLevel,
      financialHealth: 75,
      riskScore: 20,
      overallScore: 0,
      score: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryStore.sessions.set(id, newSession);
    return newSession;
  }

  async getSessionById(sessionId: string): Promise<any | null> {
    if (this.usePrisma && prisma) {
      try {
        const session = await prisma.gameSession.findUnique({
          where: { id: sessionId },
          include: {
            user: { select: { name: true, email: true } },
            decisions: { include: { scenario: true, option: true } },
          },
        });
        if (!session) return null;
        const enriched = addSessionUserFields(session);
        if ((!session.userName || !session.userEmail) && enriched.userName && enriched.userEmail) {
          await prisma.gameSession.update({
            where: { id: session.id },
            data: { userName: enriched.userName, userEmail: enriched.userEmail },
          });
        }
        return addSessionAliases(enriched);
      } catch {
        this.usePrisma = false;
      }
    }
    const session = inMemoryStore.sessions.get(sessionId);
    if (!session) return null;
    const sessionDecisions = Array.from(inMemoryStore.decisions.values()).filter((d) => d.sessionId === sessionId);
    return { ...session, decisions: sessionDecisions };
  }

  async getUserSessions(userId: string): Promise<any[]> {
    if (this.usePrisma && prisma) {
      try {
        const sessions = await prisma.gameSession.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { name: true, email: true } },
            decisions: true,
          },
        });
        return Promise.all(sessions.map(async (session) => {
          const enriched = addSessionUserFields(session);
          if ((!session.userName || !session.userEmail) && enriched.userName && enriched.userEmail) {
            await prisma.gameSession.update({
              where: { id: session.id },
              data: { userName: enriched.userName, userEmail: enriched.userEmail },
            });
          }
          return addSessionAliases(enriched);
        }));
      } catch {
        this.usePrisma = false;
      }
    }
    return Array.from(inMemoryStore.sessions.values())
      .filter((s) => s.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateSession(sessionId: string, data: Partial<InMemoryGameSession>): Promise<any> {
    if (this.usePrisma && prisma) {
      try {
        const currentCash = data.currentCash ?? data.totalCash;
        const debt = data.debt ?? data.totalDebt;
        const updatedSession = await prisma.gameSession.update({
          where: { id: sessionId },
          data: {
            ...(data.currentMonth !== undefined && { currentMonth: data.currentMonth }),
            ...(data.status !== undefined && { status: data.status }),
            ...(data.startingCash !== undefined && { startingCash: data.startingCash }),
            ...(currentCash !== undefined && { currentCash }),
            ...(data.savings !== undefined && { savings: data.savings }),
            ...(debt !== undefined && { debt }),
            ...(data.monthlyEmi !== undefined && { monthlyEmi: data.monthlyEmi }),
            ...(data.invested !== undefined && { invested: data.invested }),
            ...(data.creditScore !== undefined && { creditScore: data.creditScore }),
            ...(data.stressLevel !== undefined && { stressLevel: data.stressLevel }),
            ...(data.financialHealth !== undefined && { financialHealth: data.financialHealth }),
            ...(data.riskScore !== undefined && { riskScore: data.riskScore }),
            ...(data.overallScore !== undefined && { overallScore: data.overallScore }),
            ...(data.score !== undefined && { overallScore: data.score }),
            ...(data.completedAt !== undefined && { completedAt: data.completedAt }),
            updatedAt: new Date(),
          },
        });
        return addSessionAliases(updatedSession);
      } catch {
        this.usePrisma = false;
      }
    }
    const current = inMemoryStore.sessions.get(sessionId);
    if (!current) throw new Error(`Session ${sessionId} not found`);
    const updated = { ...current, ...data, updatedAt: new Date() };
    inMemoryStore.sessions.set(sessionId, updated);
    return updated;
  }

  async recordDecision(data: any): Promise<any> {
    const scenarioId = isMongoObjectId(data.scenarioId) ? data.scenarioId : undefined;
    const optionId = isMongoObjectId(data.optionId) ? data.optionId : undefined;
    const optionKey = data.optionId || data.choiceSelected;

    if (this.usePrisma && prisma && isMongoObjectId(data.sessionId)) {
      try {
        const session = await prisma.gameSession.findUnique({
          where: { id: data.sessionId },
          include: { user: { select: { id: true, name: true, email: true } } },
        });
        return await prisma.decision.create({
          data: {
            sessionId: data.sessionId,
            userId: session?.user?.id,
            userName: session?.user?.name,
            userEmail: session?.user?.email,
            ...(scenarioId ? { scenarioId } : { scenarioKey: data.scenarioId }),
            ...(optionId ? { optionId } : { optionKey }),
            month: data.month,
            cashBefore: data.cashBefore ?? 0,
            cashAfter: data.cashAfter ?? (data.cashImpact ?? 0),
            debtBefore: data.debtBefore ?? 0,
            debtAfter: data.debtAfter ?? (data.debtImpact ?? 0),
            riskBefore: data.riskBefore ?? 20,
            riskAfter: data.riskAfter ?? 20,
            financialHealthBefore: data.financialHealthBefore ?? 75,
            financialHealthAfter: data.financialHealthAfter ?? 75,
            netWorthBefore: data.netWorthBefore ?? 0,
            netWorthAfter: data.netWorthAfter ?? 0,
            isOptimal: data.isOptimal ?? false,
            headline: data.headline || (data.isOptimal ? 'Optimal Maneuver' : 'Suboptimal Choice'),
            whyItHappened: data.whyItHappened || data.explanation || '',
            financialLesson: data.financialLesson || '',
          },
        });
      } catch {
        this.usePrisma = false;
      }
    }

    const id = generateId('dec');
    const session = inMemoryStore.sessions.get(data.sessionId);
    const user = session ? inMemoryStore.users.get(session.userId) : undefined;
    const newDecision: InMemoryDecision = {
      id,
      ...data,
      userId: user?.id,
      userName: user?.name,
      userEmail: user?.email,
      choiceSelected: data.choiceSelected || data.optionId,
      createdAt: new Date(),
    };
    inMemoryStore.decisions.set(id, newDecision);
    return newDecision;
  }

  async createDecision(data: any): Promise<any> {
    return this.recordDecision(data);
  }

  // --- ASSESSMENTS ---
  async createAssessment(data: {
    userId: string;
    sessionId?: string;
    type: string;
    score: number;
    categoryScores?: any;
    breakdown?: any;
    tier: string;
  }): Promise<any> {
    const categoryScores = data.categoryScores || data.breakdown || {};
    if (this.usePrisma && prisma) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: data.userId },
          select: { name: true, email: true },
        });
        return await prisma.financialAssessment.create({
          data: {
            userId: data.userId,
            userName: user?.name,
            userEmail: user?.email,
            type: data.type,
            score: data.score,
            categoryScores,
            tier: data.tier,
          },
        });
      } catch {
        this.usePrisma = false;
      }
    }

    const id = generateId('diag');
    const newAssessment = {
      id,
      userId: data.userId,
      sessionId: data.sessionId,
      type: data.type,
      score: data.score,
      categoryScores,
      tier: data.tier,
      completedAt: new Date(),
    };
    inMemoryStore.assessments.set(id, newAssessment);
    return newAssessment;
  }

  async getUserAssessments(userId: string): Promise<any[]> {
    if (this.usePrisma && prisma) {
      try {
        return await prisma.financialAssessment.findMany({
          where: { userId },
          orderBy: { completedAt: 'asc' },
        });
      } catch {
        this.usePrisma = false;
      }
    }
    return Array.from(inMemoryStore.assessments.values())
      .filter((a) => a.userId === userId)
      .sort((a, b) => a.completedAt.getTime() - b.completedAt.getTime());
  }

  // --- BADGES ---
  async listBadges(): Promise<any[]> {
    if (this.usePrisma && prisma) {
      try {
        const list = await prisma.badge.findMany();
        if (list.length > 0) return list;
      } catch {
        this.usePrisma = false;
      }
    }
    return Array.from(inMemoryStore.badges.values());
  }

  async getUserBadges(userId: string): Promise<any[]> {
    if (this.usePrisma && prisma) {
      try {
        const userBadges = await prisma.userBadge.findMany({
          where: { userId },
          include: { badge: true },
        });
        return userBadges.map((ub: { badge: any; unlockedAt: Date; }): any => ({ ...ub.badge, unlockedAt: ub.unlockedAt }));
      } catch {
        this.usePrisma = false;
      }
    }
    const matching = Array.from(inMemoryStore.userBadges.values()).filter((ub) => ub.userId === userId);
    return matching.map((ub) => {
      const badge = inMemoryStore.badges.get(ub.badgeId);
      return { ...badge, unlockedAt: ub.unlockedAt };
    });
  }

  async unlockUserBadge(userId: string, badgeCode: string): Promise<any> {
    const badge = Array.from(inMemoryStore.badges.values()).find((b) => b.code === badgeCode);
    if (!badge) return null;

    if (this.usePrisma && prisma) {
      try {
        const dbBadge = await prisma.badge.findUnique({ where: { code: badgeCode } });
        if (dbBadge) {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true, email: true },
          });
          return await prisma.userBadge.upsert({
            where: { userId_badgeId: { userId, badgeId: dbBadge.id } },
            create: { userId, badgeId: dbBadge.id, userName: user?.name, userEmail: user?.email },
            update: { userName: user?.name, userEmail: user?.email },
            include: { badge: true },
          });
        }
      } catch {
        this.usePrisma = false;
      }
    }

    const key = `${userId}_${badge.id}`;
    if (!inMemoryStore.userBadges.has(key)) {
      const user = inMemoryStore.users.get(userId);
      inMemoryStore.userBadges.set(key, {
        id: generateId('ub'),
        userId,
        badgeId: badge.id,
        userName: user?.name,
        userEmail: user?.email,
        unlockedAt: new Date(),
      });
    }
    return { ...badge, unlockedAt: new Date() };
  }

  // --- PROFILE ---
  async getProfile(userId: string): Promise<any | null> {
    if (this.usePrisma && prisma) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: { profile: true },
        });
        if (!user) return null;
        const profile = user.profile || {
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          financialIQ: user.financialIQ,
          financialHealth: user.financialHealth,
          riskScore: user.riskScore,
          decisionDNA: user.decisionDNA,
          learningProgress: user.learningProgress,
        };
        if (!user.profile || !user.profile.userName || !user.profile.userEmail) {
          await prisma.userProfile.upsert({
            where: { userId: user.id },
            create: {
              userId: user.id,
              userName: user.name,
              userEmail: user.email,
              financialIQ: user.financialIQ,
              financialHealth: user.financialHealth,
              riskScore: user.riskScore,
              decisionDNA: user.decisionDNA,
              learningProgress: user.learningProgress,
            },
            update: { userName: user.name, userEmail: user.email },
          });
        }
        return {
          ...user,
          profile,
        };
      } catch {
        this.usePrisma = false;
      }
    }
    const profile = Array.from(inMemoryStore.profiles.values()).find((p) => p.userId === userId);
    const user = inMemoryStore.users.get(userId);
    return profile && user
      ? { ...profile, userName: profile.userName || user.name, userEmail: profile.userEmail || user.email }
      : profile || null;
  }

  async updateProfile(userId: string, data: Partial<InMemoryUserProfile>): Promise<any> {
    if (this.usePrisma && prisma) {
      try {
        const user = await prisma.user.update({
          where: { id: userId },
          data: {
            ...(data.financialIQ !== undefined && { financialIQ: data.financialIQ }),
            ...(data.financialHealth !== undefined && { financialHealth: data.financialHealth }),
            ...(data.riskScore !== undefined && { riskScore: data.riskScore }),
            ...(data.decisionDNA !== undefined && { decisionDNA: data.decisionDNA }),
            ...(data.learningProgress !== undefined && { learningProgress: data.learningProgress }),
          },
          include: { profile: true },
        });
        await prisma.userProfile.upsert({
          where: { userId },
          create: {
            userId,
            userName: user.name,
            userEmail: user.email,
            financialIQ: data.financialIQ ?? user.financialIQ,
            financialHealth: data.financialHealth ?? user.financialHealth,
            riskScore: data.riskScore ?? user.riskScore,
            decisionDNA: data.decisionDNA ?? user.decisionDNA,
            learningProgress: data.learningProgress ?? user.learningProgress,
          },
          update: {
            userName: user.name,
            userEmail: user.email,
            ...(data.financialIQ !== undefined && { financialIQ: data.financialIQ }),
            ...(data.financialHealth !== undefined && { financialHealth: data.financialHealth }),
            ...(data.riskScore !== undefined && { riskScore: data.riskScore }),
            ...(data.decisionDNA !== undefined && { decisionDNA: data.decisionDNA }),
            ...(data.learningProgress !== undefined && { learningProgress: data.learningProgress }),
            updatedAt: new Date(),
          },
        });
        return { ...user, profile: user.profile };
      } catch {
        this.usePrisma = false;
      }
    }
    const profile = Array.from(inMemoryStore.profiles.values()).find((p) => p.userId === userId);
    if (profile) {
      Object.assign(profile, data, { updatedAt: new Date() });
      return profile;
    }
    return null;
  }

  // --- DAILY CHALLENGES ---
  async getDailyChallenge(dateStr?: string): Promise<any | null> {
    const date = dateStr || new Date().toISOString().split('T')[0];
    if (this.usePrisma && prisma) {
      try {
        const chal = await prisma.dailyChallenge.findUnique({ where: { date } });
        if (chal) return chal;
      } catch {
        this.usePrisma = false;
      }
    }
    return inMemoryStore.challenges.get(date) || Array.from(inMemoryStore.challenges.values())[0] || null;
  }

  async updateDailyChallenge(id: string, data: any): Promise<any> {
    for (const [key, val] of inMemoryStore.challenges.entries()) {
      if (val.id === id) {
        Object.assign(val, data);
        return val;
      }
    }
    return null;
  }

  async recordChallengeAttempt(data: {
    challengeId: string;
    userId: string;
    choiceSelected: string;
    score: number;
    isCorrect: boolean;
  }): Promise<any> {
    if (this.usePrisma && prisma && isMongoObjectId(data.challengeId) && isMongoObjectId(data.userId)) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: data.userId },
          select: { name: true, email: true },
        });
        return await prisma.challengeAttempt.create({
          data: {
            challengeId: data.challengeId,
            userId: data.userId,
            userName: user?.name,
            userEmail: user?.email,
            optionId: data.choiceSelected,
            isOptimal: data.isCorrect,
          },
        });
      } catch {
        this.usePrisma = false;
      }
    }
    const id = generateId('att');
    const user = inMemoryStore.users.get(data.userId);
    const attempt = {
      id,
      challengeId: data.challengeId,
      userId: data.userId,
      userName: user?.name,
      userEmail: user?.email,
      optionId: data.choiceSelected,
      isOptimal: data.isCorrect,
      score: data.score,
      attemptedAt: new Date(),
    };
    inMemoryStore.challengeAttempts.set(id, attempt);
    return attempt;
  }

  // --- CLASSROOM COHORT ---
  async createClassroom(data: { name: string; code: string; description?: string; instructorId: string }): Promise<any> {
    const id = generateId('cls');
    const teacher = inMemoryStore.users.get(data.instructorId);
    const classroom = {
      id,
      ...data,
      teacherName: teacher?.name,
      teacherEmail: teacher?.email,
      createdAt: new Date(),
    };
    inMemoryStore.classrooms.set(id, classroom);
    return classroom;
  }

  async findClassroomByCode(code: string): Promise<any | null> {
    return Array.from(inMemoryStore.classrooms.values()).find((c) => c.code.toUpperCase() === code.toUpperCase()) || null;
  }

  async findClassroomById(id: string): Promise<any | null> {
    return inMemoryStore.classrooms.get(id) || null;
  }

  async joinClassroom(classroomId: string, userId: string): Promise<any> {
    const id = generateId('cm');
    const user = inMemoryStore.users.get(userId);
    const member = {
      id,
      classroomId,
      userId,
      userName: user?.name,
      userEmail: user?.email,
      joinedAt: new Date(),
    };
    inMemoryStore.classroomMembers.set(id, member);
    return member;
  }

  async getClassroomMembers(classroomId: string): Promise<any[]> {
    return Array.from(inMemoryStore.classroomMembers.values()).filter((m) => m.classroomId === classroomId);
  }

  async getSessionDecisions(sessionId: string): Promise<any[]> {
    return Array.from(inMemoryStore.decisions.values()).filter((d) => d.sessionId === sessionId);
  }

  async getClassroomCohortSummary(): Promise<any> {
    return {
      cohortName: 'Symbiosis & COEP Financial Aviation League 2026',
      totalCadets: 42,
      averagePreIQ: 48,
      averagePostIQ: 81,
      averageDeltaGain: '+68%',
      topFailureTrap: '7-Day Instant Loan Apps & Telegram Stock Pumps (68% fell for trap on Month 1)',
      resilienceDistribution: {
        highSupercruise: 28,
        moderateHoldingPattern: 11,
        criticalDebtStall: 3,
      },
    };
  }
}

export const dataRepository = new DataRepository();
