import { registerSchema } from '@cortex/shared';
import { z } from 'zod';

export const RegisterFormSchema = registerSchema.extend({
  confirmPassword: z.string(),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Паролі не співпадають",
  path: ["confirmPassword"], 
});

export type RegisterFormValues = z.infer<typeof RegisterFormSchema>;