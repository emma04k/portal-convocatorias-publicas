import { z } from "zod";

export const BOOKMARK_SOURCE_DEFAULT = "SECOP_II";

const trimmedString = z.string().trim().min(1).max(500);
const optionalTrimmedString = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : undefined))
  .optional();

export const createBookmarkSchema = z.object({
  externalId: trimmedString.max(120),
  source: z.string().trim().min(1).max(40).default(BOOKMARK_SOURCE_DEFAULT),
  title: trimmedString,
  entityName: trimmedString,
  status: optionalTrimmedString,
  processNumber: optionalTrimmedString,
  url: z.string().trim().url().optional(),
  rawData: z.record(z.unknown()).default({}),
});

export const bookmarkParamsSchema = z.object({
  externalId: trimmedString.max(120),
});

export const bookmarkDeleteQuerySchema = z.object({
  source: z.string().trim().min(1).max(40).default(BOOKMARK_SOURCE_DEFAULT),
});

export type CreateBookmarkInput = z.infer<typeof createBookmarkSchema>;
export type BookmarkParams = z.infer<typeof bookmarkParamsSchema>;
