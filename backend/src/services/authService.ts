import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { dataRepository } from '../repositories/dataRepository';
import { InMemoryUser, InMemoryUserProfile } from '../repositories/inMemoryStore';

export interface AuthTokens {
  accessToken: string;
  expiresIn: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  profile?: InMemoryUserProfile | null;
}

export class AuthService {
  private generateToken(userId: string, email: string, role: string): string {
    return jwt.sign(
      { userId, email, role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );
  }

  public async register(name: string, email: string, passwordHashOrPlain: string): Promise<{ user: UserResponse; tokens: AuthTokens }> {
    const existing = await dataRepository.findUserByEmail(email.toLowerCase().trim());
    if (existing) {
      const error: any = new Error('A pilot with this email already exists.');
      error.statusCode = 409;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordHashOrPlain, salt);

    const user = await dataRepository.createUser({
      email: email.toLowerCase().trim(),
      name: name.trim(),
      passwordHash,
      role: 'STUDENT',
    });

    const token = this.generateToken(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profile: user.profile || null,
      },
      tokens: {
        accessToken: token,
        expiresIn: env.JWT_EXPIRES_IN,
      },
    };
  }

  public async login(email: string, passwordPlain: string): Promise<{ user: UserResponse; tokens: AuthTokens }> {
    const user = await dataRepository.findUserByEmail(email.toLowerCase().trim());
    if (!user) {
      const error: any = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!isMatch) {
      const error: any = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const token = this.generateToken(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profile: user.profile || null,
      },
      tokens: {
        accessToken: token,
        expiresIn: env.JWT_EXPIRES_IN,
      },
    };
  }

  public async createGuestSession(pilotCallsign?: string): Promise<{ user: UserResponse; tokens: AuthTokens }> {
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const guestEmail = `${guestId}@flight.finquest.edu`;
    const callsign = pilotCallsign?.trim() || `Cadet-${Math.floor(1000 + Math.random() * 9000)}`;

    const guestUser = await dataRepository.createUser({
      email: guestEmail,
      name: callsign,
      passwordHash: 'GUEST_NO_PASS',
      role: 'STUDENT',
    });

    const token = this.generateToken(guestUser.id, guestUser.email, guestUser.role);

    return {
      user: {
        id: guestUser.id,
        email: guestUser.email,
        name: guestUser.name,
        role: guestUser.role,
        profile: guestUser.profile || null,
      },
      tokens: {
        accessToken: token,
        expiresIn: env.JWT_EXPIRES_IN,
      },
    };
  }

  public async getProfile(userId: string): Promise<UserResponse> {
    const user = await dataRepository.findUserById(userId);
    if (!user) {
      const error: any = new Error('Pilot not found.');
      error.statusCode = 404;
      throw error;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      profile: user.profile || null,
    };
  }
}

export const authService = new AuthService();

