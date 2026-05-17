import bcrypt from 'bcryptjs';
import { authRepository } from './auth.repository.js';
import type { LoginInput, RegisterInput } from './auth.schema.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../shared/helpers/jwt.helper.js';

export const authService = {
  async register(payload: RegisterInput) {
    const existingUser = await authRepository.findByEmail(payload.email);

    if (existingUser) {
      throw new Error('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const user = await authRepository.create({
      email: payload.email,
      password: hashedPassword,
    });

    return user;
  },

  async login(payload: LoginInput) {
    const user = await authRepository.findByEmail(payload.email);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(payload.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
    };

    const accessToken = await generateAccessToken(tokenPayload);

    const refreshToken = await generateRefreshToken(tokenPayload);

    await authRepository.updateRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  },

  async refresh(refreshToken: string) {
    const { payload } = await verifyRefreshToken(refreshToken);

    const user = await authRepository.findById(payload.userId as string);

    if (!user) {
      throw new Error('Unauthorized');
    }

    if (user.refreshToken !== refreshToken) {
      throw new Error('Invalid refresh token');
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
    };

    const newAccessToken = await generateAccessToken(tokenPayload);

    const newRefreshToken = await generateRefreshToken(tokenPayload);

    await authRepository.updateRefreshToken(user.id, newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  },

  async logout(userId: string) {
    await authRepository.updateRefreshToken(userId, null);
  },
};
