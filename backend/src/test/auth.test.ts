import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';
import { authService } from '../services/authService';

describe('Auth Service & Endpoints', () => {
  it('registers a new pilot successfully', async () => {
    const email = `testpilot_${Date.now()}@finquest.edu`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Cadet Vikram',
        email,
        password: 'Password123!',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(email);
    expect(res.body.data.tokens.accessToken).toBeDefined();
  });

  it('rejects duplicate pilot registration', async () => {
    const email = `duplicate_${Date.now()}@finquest.edu`;
    await authService.register('Cadet A', email, 'Password123!');

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Cadet B',
        email,
        password: 'Password123!',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('allows guest pilot authentication', async () => {
    const res = await request(app)
      .post('/api/auth/guest')
      .send({ pilotCallsign: 'Ace-Aviator' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.name).toBe('Ace-Aviator');
    expect(res.body.data.tokens.accessToken).toBeDefined();
  });

  it('validates health endpoint', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('HEALTHY');
    expect(res.body.database.operational).toBe(true);
  });
});

