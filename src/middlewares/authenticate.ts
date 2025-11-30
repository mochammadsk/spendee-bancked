import dotenv from 'dotenv';
import { NextFunction, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

dotenv.config();

interface AuthRequest extends JwtPayload {
  id?: string;
  email?: string;
  user_name?: string;
  full_name?: string;
  verified?: boolean;
  [key: string]: any;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Unauthorized!' });
    return;
  }

  try {
    const verified = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    req.user = verified;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Unauthorized! Invalid token.' });
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Unauthorized! Token has expired.' });
      return;
    }
    res.status(500).json({ message: 'Internal server error.', error });
    return;
  }
};

export default authenticate;
