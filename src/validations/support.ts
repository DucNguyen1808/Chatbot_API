import { z } from 'zod';

export const createSupportSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
  attachment: z.string().optional(),
  category: z.string().min(1, 'Subject is required'),
  priority: z.enum(['1', '2', '3']).optional(),
  user_id: z.string().min(1, 'User_id is required')
});

export type CreateSupportDTO = z.infer<typeof createSupportSchema>;
export const replySupportSchema = z.object({
  response: z.string().min(1, 'Response is required'),
  status: z.enum(['pending', 'resolved']).optional()
});

export type ReplySupportDTO = z.infer<typeof replySupportSchema>;
