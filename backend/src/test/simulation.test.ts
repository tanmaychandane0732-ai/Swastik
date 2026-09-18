import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';
import { simulationEngine } from '../services/simulationEngine';

describe('Flight Simulation Engine & Endpoints', () => {
  it('creates and initializes a flight session', async () => {
    const res = await request(app)
      .post('/api/sessions')
      .send({
        startingCash: 20000,
        startingDebt: 0,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.session.currentCash).toBe(20000);
    expect(res.body.data.session.currentMonth).toBe(1);
    expect(res.body.data.initialScenario).toBeDefined();
  });

  it('advances a month with salary addition and compounding interest on debt', async () => {
    // Start session
    const { session, initialScenario } = await simulationEngine.startSession({
      userId: 'test_pilot_1',
      startingCash: 10000,
      startingDebt: 10000,
    });

    // Advance month 1 with decision
    const stepResult = await simulationEngine.advanceMonth(session.id, {
      scenarioId: initialScenario?.id || 'scen_1',
      choiceId: 'opt_discipline',
      choiceText: 'Allocated budget 50/30/20 and paid ₹5,000 toward debt',
      cashDelta: -5000,
      debtDelta: -5000,
      isOptimal: true,
    });

    // Monthly baseline: +30,000 salary, -18,000 expenses = +12,000 net cash
    // Debt interest: 10,000 * 0.035 = 350 interest -> debt became 10,350 -> minus 5,000 = 5,350
    // Cash: 10,000 + 12,000 - 5,000 = 17,000
    expect(stepResult.session.currentMonth).toBe(2);
    expect(stepResult.session.currentCash).toBe(17000);
    expect(stepResult.session.debt).toBe(5350);
    expect(stepResult.stepFeedback.interestCharged).toBe(350);
    expect(stepResult.session.creditScore).toBeGreaterThanOrEqual(720);
  });

  it('generates a full flight debrief report with Decision DNA and Risk Radar', async () => {
    const { session } = await simulationEngine.startSession({
      userId: 'test_pilot_complete',
      startingCash: 15000,
      startingDebt: 0,
    });

    // Advance through 6 months
    for (let month = 1; month <= 6; month++) {
      await simulationEngine.advanceMonth(session.id, {
        scenarioId: `scen_${month}`,
        choiceId: `opt_optimal_${month}`,
        choiceText: `Disciplined step ${month}`,
        cashDelta: 2000,
        debtDelta: 0,
        isOptimal: true,
      });
    }

    const report = await simulationEngine.getSessionReport(session.id);
    expect(report.flightStatus).toBe('smooth');
    expect(report.flightDurationMonths).toBe(6);
    expect(report.decisionDNA.archetype).toBeDefined();
    expect(report.decisionDNA.traits.debtDiscipline).toBeGreaterThanOrEqual(70);
    expect(report.riskRadar.debtRisk).toBe(0);
    expect(report.flightLogs.length).toBe(6);
  });
});

