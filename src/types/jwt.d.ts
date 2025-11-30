import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id?: string;
        email?: string;
        user_name?: string;
        full_name?: string;
        verified?: boolean;
        [key: string]: any;
      };
    }
  }
}
