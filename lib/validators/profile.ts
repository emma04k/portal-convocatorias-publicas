import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .email()
  .max(254)
  .transform((email) => email.toLowerCase());

const nameSchema = z.string().trim().min(1).max(100);
const passwordSchema = z.string().min(8).max(128);

export const updateProfileSchema = z
  .object({
    name: nameSchema.optional(),
    email: emailSchema.optional(),
    currentPassword: passwordSchema.optional(),
    newPassword: passwordSchema.optional(),
  })
  .refine((value) => Object.values(value).some((field) => field !== undefined), {
    message: "At least one field is required",
  })
  .refine((value) => !value.newPassword || Boolean(value.currentPassword), {
    message: "currentPassword is required",
    path: ["currentPassword"],
  })
  .refine((value) => !value.currentPassword || Boolean(value.newPassword), {
    message: "newPassword is required",
    path: ["newPassword"],
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
