import { z } from 'zod';

export const planGenerationInputSchema = z.object({
  title: z
    .string({ required_error: 'Event title is required' })
    .trim()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  type: z.enum(['wedding', 'birthday', 'community'], {
    errorMap: () => ({ message: 'Event type must be Wedding, Birthday, or Community' }),
  }),
  date: z
    .string({ required_error: 'Event date is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Date must be a valid calendar date',
    }),
  guestCount: z
    .number({ required_error: 'Guest count is required' })
    .int('Guest count must be an integer')
    .min(1, 'Guest count must be at least 1')
    .max(50000, 'Guest count cannot exceed 50,000'),
  totalBudget: z
    .number({ required_error: 'Total budget is required' })
    .min(50, 'Total budget must be at least 50')
    .max(50000000, 'Total budget cannot exceed 50,000,000'),
  currency: z
    .string()
    .trim()
    .length(3, 'Currency must be a 3-letter ISO code')
    .default('USD')
    .transform((val) => val.toUpperCase()),
  location: z
    .string()
    .trim()
    .max(150, 'Location cannot exceed 150 characters')
    .optional()
    .default(''),
  themeOrStyle: z
    .string()
    .trim()
    .max(150, 'Theme cannot exceed 150 characters')
    .optional()
    .default(''),
  specialRequests: z
    .string()
    .trim()
    .max(1000, 'Special requests cannot exceed 1,000 characters')
    .optional()
    .default(''),
  vibeKeywords: z
    .array(z.string().trim().max(30))
    .max(10, 'Cannot provide more than 10 vibe tags')
    .optional()
    .default([]),
});

export type PlanGenerationInput = z.infer<typeof planGenerationInputSchema>;

export const planRefinementInputSchema = z.object({
  planId: z.string().min(1, 'planId is required'),
  currentPlan: z.any({ required_error: 'currentPlan object is required' }),
  userMessage: z
    .string({ required_error: 'User refinement message is required' })
    .trim()
    .min(2, 'Refinement message must be at least 2 characters')
    .max(800, 'Refinement message cannot exceed 800 characters'),
  chatHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .optional()
    .default([]),
});

export type PlanRefinementInput = z.infer<typeof planRefinementInputSchema>;

