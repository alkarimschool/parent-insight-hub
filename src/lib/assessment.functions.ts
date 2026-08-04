import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const NullableString = z.preprocess(
  (v) => (v === null || v === undefined ? "" : String(v).trim()),
  z.string()
);

const EducationLevelEnum = z.preprocess(
  (v) => {
    if (!v) return "TK";
    const str = String(v).toUpperCase().trim();
    if (["TK", "SD", "SMP", "SMA", "SMK"].includes(str)) return str;
    return "TK";
  },
  z.enum(["TK", "SD", "SMP", "SMA", "SMK"])
);

const GenderEnum = z.preprocess(
  (v) => {
    if (!v) return "L";
    const str = String(v).toUpperCase().trim();
    if (str === "P" || str === "PEREMPUAN") return "P";
    return "L";
  },
  z.enum(["L", "P"])
);

const ScoreNumber = z.preprocess(
  (v) => {
    const num = Number(v);
    if (isNaN(num)) return 3;
    return Math.min(5, Math.max(1, Math.round(num)));
  },
  z.number().int().min(1).max(5)
);

const SubmitSchema = z.object({
  parent: z.object({
    name: NullableString.pipe(z.string().min(1, "Nama orang tua wajib diisi").max(200)),
    whatsapp: NullableString.pipe(z.string().min(3, "Nomor WhatsApp wajib diisi").max(50)),
  }),
  child: z.object({
    name: NullableString.pipe(z.string().min(1, "Nama anak wajib diisi").max(200)),
    gender: GenderEnum,
    birth_date: NullableString.transform((v) => v || "2020-01-01"),
    school: NullableString,
    class_name: NullableString,
    education_level: EducationLevelEnum,
  }),
  answers: z.array(
    z.object({
      question_id: z.preprocess((v) => String(v ?? ""), z.string().min(1)),
      score: ScoreNumber,
      text_answer: z.preprocess((v) => (v === null || v === undefined ? "" : String(v)), z.string()).optional(),
    })
  ).min(1, "Jawaban assessment tidak boleh kosong"),
});

export const submitAssessment = createServerFn({ method: "POST" })
  .inputValidator((rawInput: unknown) => {
    try {
      const payload = (rawInput as any)?.data ?? rawInput;
      return SubmitSchema.parse(payload);
    } catch (err: any) {
      console.error("[submitAssessment] Input validation failed:", err);
      if (err instanceof z.ZodError) {
        const issues = err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
        throw new Error(`Validasi data gagal: ${issues}`);
      }
      throw err;
    }
  })
  .handler(async ({ data }) => {
    const { submitAndAnalyze } = await import("./assessment.server");
    return submitAndAnalyze(data as any);
  });

export const getAssessmentResultFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => {
    const raw = (d as any)?.data ?? d;
    return z.object({
      id: z.string().min(1),
      adminToken: z.boolean().optional(),
    }).parse(raw);
  })
  .handler(async ({ data }) => {
    const { getAssessmentResultServer } = await import("./assessment.server");
    return getAssessmentResultServer(data.id, data.adminToken);
  });

export const testAiPrompt = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => d)
  .handler(async ({ data }) => {
    const { runTestPrompt } = await import("./assessment.server");
    const payload = typeof data === "object" && data !== null ? (data as any).data ?? data : {};
    return runTestPrompt(payload);
  });