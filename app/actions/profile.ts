"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

function emptyToNull(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  return value;
}

export async function saveProfile(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/");

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
      passions: emptyToNull(formData.get("passions")),
      supplementQ1: emptyToNull(formData.get("supplementQ1")),
      supplementQ2: emptyToNull(formData.get("supplementQ2")),
      supplementQ3: emptyToNull(formData.get("supplementQ3")),
      personalityWords: emptyToNull(formData.get("personalityWords")),
      visionAnswers: emptyToNull(formData.get("visionAnswers")),
    },
    update: {
      ageRange: emptyToNull(formData.get("ageRange")),
      gender: emptyToNull(formData.get("gender")),
      prefecture: emptyToNull(formData.get("prefecture")),
      industry: emptyToNull(formData.get("industry")),
      jobType: emptyToNull(formData.get("jobType")),
      employmentType: emptyToNull(formData.get("employmentType")),
      workStyle: emptyToNull(formData.get("workStyle")),
      passions: emptyToNull(formData.get("passions")),
      supplementQ1: emptyToNull(formData.get("supplementQ1")),
      supplementQ2: emptyToNull(formData.get("supplementQ2")),
      supplementQ3: emptyToNull(formData.get("supplementQ3")),
      personalityWords: emptyToNull(formData.get("personalityWords")),
      visionAnswers: emptyToNull(formData.get("visionAnswers")),
    },
  });

  redirect("/journal/new");
}
