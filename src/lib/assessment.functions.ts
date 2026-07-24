import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SubmitSchema = z.object({
  parent: z.object({
    name: z.string().trim().min(1).max(120),
    whatsapp: z.string().trim().min(6).max(30),
  }),
  child: z.object({
    name: z.string().trim().min(1).max(120),
    gender: z.enum(["L", "P"]).optional().default("L"),
    birth_date: z.string().optional().default("2020-01-01"),
    school: z.string().trim().max(200).optional().default(""),
    class_name: z.string().trim().max(120).optional().default(""),
    education_level: z.enum(["TK", "SD", "SMP", "SMA", "SMK"]).optional().default("TK"),
  }),
  answers: z.array(z.object({ question_id: z.string().min(1), score: z.number().int().min(1).max(5) })).min(1),
});

export const submitAssessment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => SubmitSchema.parse(data))
  .handler(async ({ data }) => {
    const { submitAndAnalyze } = await import("./assessment.server");
    return submitAndAnalyze(data as any);
  });

export const getAssessmentResultFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { getAssessmentResultServer } = await import("./assessment.server");
    return getAssessmentResultServer(data.id);
  });

export const testAiPrompt = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ sample: z.string().optional() }).parse(d))
  .handler(async () => {
    const { runTestPrompt } = await import("./assessment.server");
    return runTestPrompt();
  });