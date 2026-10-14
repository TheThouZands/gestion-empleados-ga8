import { z } from 'zod';

const requiredText = z.string().trim().min(1).max(120);

export const employeeInputSchema = z.strictObject({
  name: requiredText,
  position: requiredText,
  office: requiredText,
  salary: z.number().min(0).max(1_000_000_000).multipleOf(0.01),
});

export const employeeIdSchema = z.string().regex(/^[a-f\d]{24}$/i);
