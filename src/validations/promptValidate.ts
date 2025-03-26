import { z } from 'zod';
export const PromptsChema = z.object({
  title: z.string(),
  content: z.string()
});
