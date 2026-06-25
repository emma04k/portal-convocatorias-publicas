import { z } from "zod";

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected date in YYYY-MM-DD format");

const trimmedRequiredString = z.string().trim().min(1).max(120);
const trimmedOptionalString = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : undefined))
  .optional();

const savedSearchShape = {
    name: trimmedRequiredString,
    query: trimmedOptionalString,
    entityName: trimmedOptionalString,
    status: trimmedOptionalString,
    dateFrom: isoDateSchema.optional(),
    dateTo: isoDateSchema.optional(),
    filters: z.record(z.unknown()).optional(),
  };

const savedSearchBaseSchema = z
  .object(savedSearchShape)
  .refine(
    (value) => !value.dateFrom || !value.dateTo || value.dateFrom <= value.dateTo,
    { message: "dateFrom must be before or equal to dateTo", path: ["dateFrom"] },
  );

export const createSavedSearchSchema = savedSearchBaseSchema;

export const updateSavedSearchSchema = z
  .object(savedSearchShape)
  .partial()
  .refine((value) => Object.keys(value).length > 0, { message: "At least one field is required" })
  .refine(
    (value) => !value.dateFrom || !value.dateTo || value.dateFrom <= value.dateTo,
    { message: "dateFrom must be before or equal to dateTo", path: ["dateFrom"] },
  );

export const savedSearchParamsSchema = z.object({
  id: trimmedRequiredString,
});

export type CreateSavedSearchInput = z.infer<typeof createSavedSearchSchema>;
export type UpdateSavedSearchInput = z.infer<typeof updateSavedSearchSchema>;
