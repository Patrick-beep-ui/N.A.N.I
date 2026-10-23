import { z } from "zod";

export const startSchema = z.object({
  project: z
    .string()
    .trim()
    .min(1)
    .max(160)
    .regex(/^[a-zA-Z0-9._:/-]+$/)
    .default("n.a.n.i"),
});
export const messageSchema = z.object({
  message: z.string().trim().min(1).max(16000),
});
export type Memory = {
  id: string;
  subject: string;
  content: string;
  scope: string;
  certainty: string;
  sensitivity: string;
  exposure: string[];
};
export type Context = {
  displayName: string;
  language: string;
  timezone: string;
  summary: string | null;
  revision: number;
  memories: Memory[];
  loadedAt: string;
};
export type Permission = { id: string; title: string; patterns: string[] };
export type SessionView = {
  id: string;
  project: string;
  context: Context;
  workingDirectory: string;
  model: string;
  opencode: string;
  engram: string;
};
export type ChatResult = {
  answer: string;
  tools: { name: string; status: string }[];
  operationalMemory: "saved" | "unavailable";
  warnings: string[];
};
