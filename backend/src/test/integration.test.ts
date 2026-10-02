import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('FinQuest Full Backend Endpoints Test', () => {
  let authToken = '';
  let testUserId = '';

  it('GET /api/health should return 200 and HEALTHY status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('HEALTHY');
    expect(res.body.service).toContain('FinQuest');
  });

  it('POST /api/auth/register should register a user and return tokens', async () => {
    const email = `fulltest_${Date.now()}@finquest.edu`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Pilot Alpha',
        email,
        password: 'Password123!',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tokens.accessToken).toBeDefined();

    authToken = res.body.data.tokens.accessToken;
    testUserId = res.body.data.user.id;
  });

  it('GET /api/auth/me should return current user info with token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Test Pilot Alpha');
  });

  it('POST /api/sessions should persist the authenticated user identity', async () => {
    const res = await request(app)
      .post('/api/sessions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        startingCash: 20000,
        startingDebt: 0,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.session.userId).toBe(testUserId);
    expect(res.body.data.session.userName).toBe('Test Pilot Alpha');
    expect(res.body.data.session.userEmail).toBeDefined();
    expect(res.body.data.session.userEmail).toContain('@finquest.edu');

    const decisionRes = await request(app)
      .post(`/api/sessions/${res.body.data.session.id}/advance`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        scenarioId: 'in_m1_budget',
        choiceId: 'in_m1_c1',
        choiceText: 'Build an emergency fund',
        cashDelta: 1000,
        debtDelta: 0,
        isOptimal: true,
      });

    expect(decisionRes.status).toBe(200);
    expect(decisionRes.body.data.decisionRecorded.userId).toBe(testUserId);
    expect(decisionRes.body.data.decisionRecorded.userName).toBe('Test Pilot Alpha');
    expect(decisionRes.body.data.decisionRecorded.userEmail).toContain('@finquest.edu');
  });

  it('GET /api/users/profile should return pilot profile', async () => {
    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(testUserId);
  });

  it('PUT /api/users/profile should update pilot profile telemetry', async () => {
    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        financialIQ: 72,
        financialHealth: 88,
        riskScore: 15,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/ai/status should return AI flight coach operational status', async () => {
    const res = await request(app).get('/api/ai/status');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.operational).toBe(true);
  });

  it('POST /api/ai/coach should evaluate financial decision', async () => {
    const res = await request(app)
      .post('/api/ai/coach')
      .send({
        choiceLabel: 'Reject 7-Day Instant Loan with 300% APR',
        scenarioTitle: 'Emergency Laptop Breakdown',
        cash: 12000,
        debt: 0,
        creditScore: 720,
        cashDelta: 0,
        debtDelta: 0,
        isOptimal: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.headline).toBeDefined();
    expect(res.body.data.coachAdvice).toBeDefined();
  });

  it('GET /api/scenarios should return active flight scenarios', async () => {
    const res = await request(app).get('/api/scenarios');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/badges should return flight achievements and badges', async () => {
    const res = await request(app).get('/api/badges');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.allBadges).toBeDefined();
  });

  it('GET /api/challenges/daily and /api/challenges should return dilemma', async () => {
    const res1 = await request(app).get('/api/challenges/daily');
    expect(res1.status).toBe(200);
    expect(res1.body.success).toBe(true);

    const res2 = await request(app).get('/api/challenges');
    expect(res2.status).toBe(200);
    expect(res2.body.success).toBe(true);
  });

  it('GET /api/classroom/cohort/summary and /api/classroom should return cohort data', async () => {
    const res1 = await request(app).get('/api/classroom/cohort/summary');
    expect(res1.status).toBe(200);
    expect(res1.body.success).toBe(true);

    const res2 = await request(app).get('/api/classroom');
    expect(res2.status).toBe(200);
    expect(res2.body.success).toBe(true);
  });

  it('GET /api/analytics/dashboard should return analytics telemetry', async () => {
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.telemetryStatus).toBe('ALL_SYSTEMS_GO');
  });

  it('GET /api/assessments should return user assessments list', async () => {
    const res = await request(app).get('/api/assessments');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
