import { z } from "zod";

const relaxedText = z
  .union([z.string(), z.number()])
  .optional()
  .nullable()
  .transform((v) => (v == null ? "" : String(v)));

const coordField = z
  .union([z.number(), z.string()])
  .transform((v) => (typeof v === "string" ? Number(v.trim()) : v))
  .refine((v) => Number.isFinite(v), { message: "Invalid coordinate" });

const dateField = z.string().trim().min(1);
const timeField = z.string().trim().min(1);

export const validateDGMetrixRow = z.tuple([
  relaxedText,
  relaxedText,
  coordField,
  coordField,
  dateField,
  timeField,
  relaxedText,
  relaxedText,
  relaxedText,
]);

export type DGMetrixRow = z.infer<typeof validateDGMetrixRow>;

export const validateDGMetrixCompetitionsData = z.array(z.unknown());
