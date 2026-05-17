import type { JWTPayload } from 'jose';

export interface TokenPayload extends JWTPayload {
  userId: string;
  email: string;
}
