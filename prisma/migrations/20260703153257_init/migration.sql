-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL,
    "lgaId" TEXT,
    "facilityId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_lgaId_fkey" FOREIGN KEY ("lgaId") REFERENCES "LGA" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LGA" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'Borno'
);

-- CreateTable
CREATE TABLE "Facility" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "lgaId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "hasStarlink" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Facility_lgaId_fkey" FOREIGN KEY ("lgaId") REFERENCES "LGA" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Woman" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uniqueCode" TEXT NOT NULL,
    "fullName" TEXT,
    "codedName" TEXT,
    "age" INTEGER NOT NULL,
    "phone" TEXT,
    "alternatePhone" TEXT,
    "lgaId" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "community" TEXT NOT NULL,
    "pregnancyStatus" TEXT NOT NULL,
    "breastfeedingStatus" TEXT NOT NULL,
    "caregiverStatus" BOOLEAN NOT NULL DEFAULT false,
    "childInOtp" BOOLEAN NOT NULL DEFAULT false,
    "childDischargedFromSc" BOOLEAN NOT NULL DEFAULT false,
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "preferredLanguage" TEXT NOT NULL,
    "preferredChannel" TEXT NOT NULL,
    "safeContactStatus" TEXT NOT NULL,
    "safeContactTime" TEXT,
    "registeredByUserId" TEXT NOT NULL,
    "registrationDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Woman_lgaId_fkey" FOREIGN KEY ("lgaId") REFERENCES "LGA" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Woman_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Woman_registeredByUserId_fkey" FOREIGN KEY ("registeredByUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SafeContactAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "womanId" TEXT NOT NULL,
    "ownsPhone" BOOLEAN NOT NULL,
    "sharedPhone" BOOLEAN NOT NULL,
    "sharedWith" TEXT,
    "safeForCalls" BOOLEAN NOT NULL,
    "safeForSms" BOOLEAN NOT NULL,
    "safeForWhatsapp" BOOLEAN NOT NULL,
    "preferredTime" TEXT,
    "neutralMessagesOnly" BOOLEAN NOT NULL,
    "unsafeTopics" TEXT,
    "mobilizerFollowUpPreferred" BOOLEAN NOT NULL DEFAULT false,
    "directContactAllowed" BOOLEAN NOT NULL DEFAULT true,
    "assessedByUserId" TEXT NOT NULL,
    "assessedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SafeContactAssessment_womanId_fkey" FOREIGN KEY ("womanId") REFERENCES "Woman" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SafeContactAssessment_assessedByUserId_fkey" FOREIGN KEY ("assessedByUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NutritionScreening" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "womanId" TEXT NOT NULL,
    "muacCm" REAL,
    "oedema" BOOLEAN NOT NULL DEFAULT false,
    "visiblyWasted" BOOLEAN NOT NULL DEFAULT false,
    "appetiteConcern" BOOLEAN NOT NULL DEFAULT false,
    "pregnantOrBreastfeeding" BOOLEAN NOT NULL DEFAULT false,
    "householdFoodInsecurity" BOOLEAN NOT NULL DEFAULT false,
    "riskCategory" TEXT NOT NULL,
    "screenedByUserId" TEXT NOT NULL,
    "screenedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextScreeningDate" DATETIME,
    CONSTRAINT "NutritionScreening_womanId_fkey" FOREIGN KEY ("womanId") REFERENCES "Woman" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "NutritionScreening_screenedByUserId_fkey" FOREIGN KEY ("screenedByUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "womanId" TEXT NOT NULL,
    "referralType" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "destination" TEXT,
    "dueDate" DATETIME,
    "createdByUserId" TEXT NOT NULL,
    "assignedToUserId" TEXT,
    "completedAt" DATETIME,
    "closedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Referral_womanId_fkey" FOREIGN KEY ("womanId") REFERENCES "Woman" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Referral_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Referral_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReferralUpdate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "referralId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "updatedByUserId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReferralUpdate_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "Referral" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReferralUpdate_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MessageTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "contentText" TEXT NOT NULL,
    "audioUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "MessageLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "womanId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "scheduledAt" DATETIME NOT NULL,
    "sentAt" DATETIME,
    "deliveryStatus" TEXT NOT NULL,
    "responseStatus" TEXT,
    "providerMessageId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MessageLog_womanId_fkey" FOREIGN KEY ("womanId") REFERENCES "Woman" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MessageLog_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "MessageTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NutritionResilienceActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "womanId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "eligibilityReason" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "activityDate" DATETIME NOT NULL,
    "followUpDate" DATETIME,
    "notes" TEXT,
    "recordedByUserId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NutritionResilienceActivity_womanId_fkey" FOREIGN KEY ("womanId") REFERENCES "Woman" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "NutritionResilienceActivity_recordedByUserId_fkey" FOREIGN KEY ("recordedByUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MissedVisit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "womanId" TEXT NOT NULL,
    "visitType" TEXT NOT NULL,
    "expectedDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "assignedToUserId" TEXT,
    "reasonForMissedVisit" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MissedVisit_womanId_fkey" FOREIGN KEY ("womanId") REFERENCES "Woman" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MissedVisit_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ComplaintOrSafeguardingFlag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "womanId" TEXT,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "assignedToUserId" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" DATETIME,
    CONSTRAINT "ComplaintOrSafeguardingFlag_womanId_fkey" FOREIGN KEY ("womanId") REFERENCES "Woman" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ComplaintOrSafeguardingFlag_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ComplaintOrSafeguardingFlag_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "LGA_name_key" ON "LGA"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Facility_name_key" ON "Facility"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Woman_uniqueCode_key" ON "Woman"("uniqueCode");
