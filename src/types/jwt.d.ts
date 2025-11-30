import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id?: string;
        email?: string;
        user_name?: string;
        full_name?: string;
        [key: string]: any;
      };
    }
  }
}
