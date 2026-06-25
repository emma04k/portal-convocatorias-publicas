import { z } from "zod";

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected date in YYYY-MM-DD format");

const trimmedOptionalString = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : undefined))
  .optional();

const paginationNumber = (defaultValue: number) =>
  z
    .union([z.string(), z.number()])
    .optional()
    .transform((value) => (value === undefined || value === "" ? defaultValue : Number(value)))
    .pipe(z.number().int().nonnegative());

export const convocatoriaQuerySchema = z
  .object({
    q: trimmedOptionalString,
    entity: trimmedOptionalString,
    status: trimmedOptionalString,
    dateFrom: isoDateSchema.optional(),
    dateTo: isoDateSchema.optional(),
    limit: paginationNumber(20).pipe(z.number().max(100)),
    offset: paginationNumber(0),
  })
  .refine(
    (value) => !value.dateFrom || !value.dateTo || value.dateFrom <= value.dateTo,
    { message: "dateFrom must be before or equal to dateTo", path: ["dateFrom"] },
  );

export const convocatoriaDetailParamsSchema = z.object({
  externalId: z.string().trim().min(1).max(120),
});

export type ConvocatoriaQuery = z.infer<typeof convocatoriaQuerySchema>;
export type ConvocatoriaDetailParams = z.infer<typeof convocatoriaDetailParamsSchema>;
