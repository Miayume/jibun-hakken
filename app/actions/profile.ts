"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { runAnalysisForUser } from "@/lib/analysis/trigger";

function emptyToNull(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  return value;
}

function parsePassions(formData: FormData): string | null {
  const passions = [];
  for (let i = 0; i < 3; i++) {
    const raw = formData.get(`p${i}_item`);
    if (raw === null) break; // このカード自体がDOMにない
    const item = (raw as string).trim();
    if (!item) continue; // itemが空なら保存しない
    passions.push({
      item,
      why1: ((formData.get(`p${i}_why1`) as string) ?? "").trim(),
      why2: ((formData.get(`p${i}_why2`) as string) ?? "").trim(),
      why3: ((formData.get(`p${i}_why3`) as string) ?? "").trim(),
    });
  }
  return passions.length > 0 ? JSON.stringify(passions) : null;
}

function parseVisionAnswers(formData: FormData): string | null {
  const answers: Record<string, string> = {};
  let hasAny = false;
  for (let i = 1; i <= 8; i++) {
    const val = ((formData.get(`vision_q${i}`) as string) ?? "").trim();
    answers[`q${i}`] = val;
    if (val) hasAny = true;
  }
  return hasAny ? JSON.stringify(answers) : null;
}

function parsePersonalityWords(formData: FormData): string | null {
  const words = formData.getAll("personalityWords").map((w) => w as string);
  return words.length > 0 ? JSON.stringify(words) : null;
}

export async function saveProfile(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/");

  const passions = parsePassions(formData);
  const visionAnswers = parseVisionAnswers(formData);
  const personalityWords = parsePersonalityWords(formData);

  await prisma.profile.upsert({
    where: { userId },
    create: {
      userId,
      ageRange: emptyToNull(formData.get("ageRange")),
      gender: emptyToNull(formData.get("gender")),
      prefecture: emptyToNull(formData.get("prefecture")),
      industry: emptyToNull(formData.get("industry")),
      jobType: emptyToNull(formData.get("jobType")),
      employmentType: emptyToNull(formData.get("employmentType")),
      workStyle: emptyToNull(formData.get("workStyle")),
      passions,
      supplementQ1: emptyToNull(formData.get("supplementQ1")),
      supplementQ2: emptyToNull(formData.get("supplementQ2")),
      supplementQ3: emptyToNull(formData.get("supplementQ3")),
      personalityWords,
      visionAnswers,
    },
    update: {
      ageRange: emptyToNull(formData.get("ageRange")),
      gender: emptyToNull(formData.get("gender")),
      prefecture: emptyToNull(formData.get("prefecture")),
      industry: emptyToNull(formData.get("industry")),
      jobType: emptyToNull(formData.get("jobType")),
      employmentType: emptyToNull(formData.get("employmentType")),
      workStyle: emptyToNull(formData.get("workStyle")),
      passions,
      supplementQ1: emptyToNull(formData.get("supplementQ1")),
      supplementQ2: emptyToNull(formData.get("supplementQ2")),
      supplementQ3: emptyToNull(formData.get("supplementQ3")),
      personalityWords,
      visionAnswers,
    },
  });

  after(async () => {
    await runAnalysisForUser(userId);
    revalidatePath("/analysis");
  });

  redirect("/journal/new");
}
