import { z } from 'zod';

export const signupValidator = z.object({
  email: z
    .string()
    .trim()
    .nonempty({ message: 'Email is required' })
    .email({ message: 'Invalid email format' }),

  full_name: z
    .string()
    .trim()
    .nonempty({ message: 'Full name is required' })
    .min(2, { message: 'Full name must be at least 2 characters' }),

  user_name: z
    .string()
    .trim()
    .nonempty({ message: 'Username is required' })
    .min(3, { message: 'Username must be at least 3 characters' }),

  password: z
    .string()
    .nonempty({ message: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters' }),
});

export type SignupValidatorType = z.infer<typeof signupValidator>;
