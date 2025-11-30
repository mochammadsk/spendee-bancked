import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, ZodIssue } from 'zod';

export const validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const zodErr = err as ZodError;
        const messages = zodErr.issues.map((issue: ZodIssue) => issue.message);
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: messages,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Internal validator error',
      });
    }
  };
