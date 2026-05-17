import { SignJWT, jwtVerify } from 'jose';
import { env } from '../../config/env.js';
import type { TokenPayload } from '../../modules/auth/auth.types.js';

const accessSecret = new TextEncoder().encode(env.JWT_SECRET);
const refreshSecret = new TextEncoder().encode(env.JWT_REFRESH_SECRET);

export const generateAccessToken = async (payload: TokenPayload) => {
  return await new SignJWT(payload)
    .setProtectedHeader({
      alg: 'HS256',
    })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(accessSecret);
};

export const generateRefreshToken = async (payload: TokenPayload) => {
  return await new SignJWT(payload)
    .setProtectedHeader({
      alg: 'HS256',
    })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(refreshSecret);
};

export const verifyAccessToken = async (token: string) => {
  return jwtVerify<TokenPayload>(token, accessSecret);
};

export const verifyRefreshToken = async (token: string) => {
  return jwtVerify<TokenPayload>(token, refreshSecret);
};
