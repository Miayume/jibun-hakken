-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recoveryCodeHash" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Profile" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "ageRange" TEXT,
    "gender" TEXT,
    "prefecture" TEXT,
    "industry" TEXT,
    "jobType" TEXT,
    "employmentType" TEXT,
    "workStyle" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Entry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "what" TEXT,
    "withWho" TEXT,
    "whoPerson" TEXT,
    "whoGoodPoint" TEXT,
    "whyStress" TEXT,
    "whereWas" TEXT,
    "whyFeeling" TEXT,
    "mostImpressive" TEXT,
    "futureUseful" TEXT,
    "futureImprove" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Entry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AnalysisResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "basedOnEntryCount" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnalysisResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Consent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "termsVersion" TEXT NOT NULL,
    "privacyVersion" TEXT NOT NULL,
    "agreedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Consent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Feature" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "isPremium" BOOLEAN NOT NULL DEFAULT false
);

-- CreateIndex
CREATE UNIQUE INDEX "User_recoveryCodeHash_key" ON "User"("recoveryCodeHash");

-- CreateIndex
CREATE INDEX "Entry_userId_createdAt_idx" ON "Entry"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AnalysisResult_userId_scope_idx" ON "AnalysisResult"("userId", "scope");
