import { prisma } from "../src/lib/db";
import * as bcrypt from "bcryptjs";

async function main() {
  console.log("Seeding database...");

  // Clean the database
  await prisma.complaintOrSafeguardingFlag.deleteMany();
  await prisma.missedVisit.deleteMany();
  await prisma.nutritionResilienceActivity.deleteMany();
  await prisma.messageLog.deleteMany();
  await prisma.messageTemplate.deleteMany();
  await prisma.referralUpdate.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.nutritionScreening.deleteMany();
  await prisma.safeContactAssessment.deleteMany();
  await prisma.woman.deleteMany();
  await prisma.user.deleteMany();
  await prisma.facility.deleteMany();
  await prisma.lGA.deleteMany();

  // 1. Seed LGAs (5)
  const lgas = [];
  const lgaNames = ["Maiduguri", "Jere", "Konduga", "Bama", "Mafa"];
  for (const name of lgaNames) {
    const lga = await prisma.lGA.create({
      data: { name, state: "Borno" },
    });
    lgas.push(lga);
  }
  console.log(`Created ${lgas.length} LGAs.`);

  // 2. Seed Facilities (10)
  const facilities = [];
  const facilityData = [
    { name: "Muna PHC", lgaIndex: 1, type: "PHC", hasStarlink: true },
    { name: "Gwange PHC", lgaIndex: 0, type: "PHC", hasStarlink: false },
    { name: "Dalori PHC", lgaIndex: 2, type: "PHC", hasStarlink: true },
    { name: "Gubio Road PHC", lgaIndex: 0, type: "PHC", hasStarlink: false },
    { name: "Custom House PHC", lgaIndex: 1, type: "PHC", hasStarlink: true },
    { name: "Mairi PHC", lgaIndex: 0, type: "PHC", hasStarlink: false },
    { name: "Bulabulin PHC", lgaIndex: 0, type: "PHC", hasStarlink: false },
    { name: "Mashamari PHC", lgaIndex: 1, type: "PHC", hasStarlink: false },
    { name: "Old Maiduguri PHC", lgaIndex: 0, type: "PHC", hasStarlink: false },
    { name: "Gomari PHC", lgaIndex: 0, type: "PHC", hasStarlink: false },
  ];

  for (const f of facilityData) {
    const facility = await prisma.facility.create({
      data: {
        name: f.name,
        lgaId: lgas[f.lgaIndex].id,
        type: f.type,
        hasStarlink: f.hasStarlink,
        isActive: true,
      },
    });
    facilities.push(facility);
  }
  console.log(`Created ${facilities.length} Facilities.`);

  // 3. Seed Users (10 staff)
  const users = [];
  const passwordHash = await bcrypt.hash("password123", 10);

  const staffData = [
    { fullName: "Admin User", email: "admin@muryaruwa.org", role: "ADMIN", lgaIndex: null, facilityIndex: null },
    { fullName: "FRAD Supervisor", email: "supervisor@muryaruwa.org", role: "SUPERVISOR", lgaIndex: 0, facilityIndex: null },
    { fullName: "Supervisor Jere", email: "supervisor.jere@muryaruwa.org", role: "SUPERVISOR", lgaIndex: 1, facilityIndex: null },
    { fullName: "CHEW Muna", email: "chew.muna@muryaruwa.org", role: "CHEW", lgaIndex: 1, facilityIndex: 0 }, // Muna PHC
    { fullName: "Midwife Muna", email: "midwife.muna@muryaruwa.org", role: "MIDWIFE", lgaIndex: 1, facilityIndex: 0 }, // Muna PHC
    { fullName: "CHEW Gwange", email: "chew.gwange@muryaruwa.org", role: "CHEW", lgaIndex: 0, facilityIndex: 1 }, // Gwange PHC
    { fullName: "Midwife Gwange", email: "midwife.gwange@muryaruwa.org", role: "MIDWIFE", lgaIndex: 0, facilityIndex: 1 }, // Gwange PHC
    { fullName: "Mobilizer Jere", email: "mobilizer.jere@muryaruwa.org", role: "MOBILIZER", lgaIndex: 1, facilityIndex: 0 },
    { fullName: "Mobilizer Maiduguri", email: "mobilizer.mc@muryaruwa.org", role: "MOBILIZER", lgaIndex: 0, facilityIndex: 1 },
    { fullName: "PHC Board Reviewer", email: "board@muryaruwa.org", role: "PHC_BOARD_VIEWER", lgaIndex: null, facilityIndex: null },
  ];

  for (const s of staffData) {
    const user = await prisma.user.create({
      data: {
        fullName: s.fullName,
        email: s.email,
        password: passwordHash,
        role: s.role,
        lgaId: s.lgaIndex !== null ? lgas[s.lgaIndex].id : null,
        facilityId: s.facilityIndex !== null ? facilities[s.facilityIndex].id : null,
        isActive: true,
      },
    });
    users.push(user);
  }
  console.log(`Created ${users.length} Users.`);

  // 4. Seed Message Templates
  const templates = [];
  const templateData = [
    { title: "ANC Reminder", category: "ANC_REMINDER", language: "ENGLISH", channel: "VOICE", contentText: "Hello. This is Muryar Uwa from your PHC. Please remember your ANC visit. If you feel weak, dizzy, have bleeding, severe headache or swelling, please go to the PHC immediately." },
    { title: "ANC Reminder (Hausa)", category: "ANC_REMINDER", language: "HAUSA", channel: "VOICE", contentText: "Sannu ku da zuwa. Wannan shi ne Muryar Uwa daga PHC dinku. Da fatan za a tuna da ziyarar ANC dinku. Idan kun ji rauni, jiri, zubar jini, ciwon kai mai tsanani ko kumburi, da fatan za a je PHC nan da nan." },
    { title: "PNC Reminder", category: "PNC_REMINDER", language: "ENGLISH", channel: "VOICE", contentText: "Hello. This is Muryar Uwa from your PHC. Please remember your PNC follow-up visit. Regular checks are important to keep you and your baby healthy." },
    { title: "Maternal Nutrition Advice", category: "MATERNAL_NUTRITION", language: "ENGLISH", channel: "VOICE", contentText: "Hello. Try to eat small nutritious meals when you can. Beans, groundnut, millet, maize, vegetables, eggs or fish when available can help strengthen you and your baby." },
    { title: "Maternal Nutrition Advice (Hausa)", category: "MATERNAL_NUTRITION", language: "HAUSA", channel: "VOICE", contentText: "Barka da rana. Yi kokari ku ci kananan abinci masu gina jiki lokacin da za ku iya. Wake, gyada, gero, masara, kayan lambu, kwai ko kifi lokacin da suke da sauki na iya taimaka muku da jaririnku." },
    { title: "Tom Brown Invite", category: "TOM_BROWN", language: "ENGLISH", channel: "VOICE", contentText: "Hello. Your PHC team is organizing a Tom Brown demonstration for mothers. Please attend if it is safe for you. You will learn how to prepare a nutritious local food mixture." },
    { title: "Tom Brown Invite (Hausa)", category: "TOM_BROWN", language: "HAUSA", channel: "VOICE", contentText: "Sannu ku da zuwa. Kungiyar PHC dinku tana shirya nuna shirin Tom Brown ga iyaye mata. Da fatan za a halarta idan yana da lafiya a gare ku. Za ku koyi yadda ake shirya hadin gwiwar abinci na gida mai gina jiki." },
    { title: "OTP Return Reminder", category: "OTP_REMINDER", language: "ENGLISH", channel: "VOICE", contentText: "Hello. Please remember your child’s OTP follow-up day. If you cannot come, inform the PHC worker or mobilizer so they can support you." },
    { title: "MUAC Follow-up", category: "MUAC_RECHECK", language: "ENGLISH", channel: "VOICE", contentText: "Hello. Please return to the PHC or meet the mobilizer for your MUAC follow-up. This helps us know if your nutrition is improving." },
    { title: "Seedling Session Reminder", category: "SEEDLING", language: "ENGLISH", channel: "VOICE", contentText: "Hello. Your nutrition group will meet for sack-garden and seedling support. This is to help improve household food diversity with small vegetables at home." },
    { title: "Seedling Session Reminder (Hausa)", category: "SEEDLING", language: "HAUSA", channel: "VOICE", contentText: "Sannu. Kungiyar abinci mai gina jiki dinku zata hadu domin sack-garden da taimakon irin shuka. Wannan shine don taimakawa wajen inganta nau'ikan abinci na gida tare da kananan kayan lambu a gida." },
    { title: "Neutral Health Reminder", category: "SAFE_CONTACT", language: "ENGLISH", channel: "VOICE", contentText: "Hello. This is a health reminder from your PHC. Please remember your next visit and contact the PHC worker if you need support." },
    { title: "Neutral Health Reminder (Hausa)", category: "SAFE_CONTACT", language: "HAUSA", channel: "VOICE", contentText: "Sannu. Wannan tunatarwa ce ta lafiya daga PHC dinku. Da fatan za a tuna ziyararku ta gaba kuma a tuntubi ma'aikacin PHC idan kuna buƙatar taimako." },
  ];

  for (const t of templateData) {
    const template = await prisma.messageTemplate.create({
      data: {
        title: t.title,
        category: t.category,
        language: t.language,
        channel: t.channel,
        contentText: t.contentText,
        isActive: true,
      },
    });
    templates.push(template);
  }
  console.log(`Created ${templates.length} Message Templates.`);

  // 5. Seed Women (40)
  const women = [];
  const chewUser = users.find(u => u.role === "CHEW") || users[3];

  const firstNames = ["Amina", "Fatima", "Zainab", "Hadiza", "Maryam", "Hauwa", "Aisha", "Khadija", "Halima", "Safiya", "Fati", "Yagana", "Falmata", "Hamsatu", "Bintu", "Zara", "Asta", "Kulu", "Maimuna", "Zarah"];
  const lastNames = ["Goni", "Mustapha", "Bukar", "Ibrahim", "Abba", "Modu", "Yerima", "Shettima", "Ali", "Usman", "Musa", "Kyari", "Kassim", "Babagana", "Bulama", "Sheriff", "Tijjani", "Maina", "Usman", "Gana"];
  const languages = ["HAUSA", "KANURI", "FULFULDE", "ENGLISH"];
  const channels = ["VOICE", "IVR", "SMS", "WHATSAPP_VOICE", "MOBILIZER"];
  const contactStatuses = ["DIRECT_SAFE", "NEUTRAL_ONLY", "MOBILIZER_ONLY", "NO_DIRECT_CONTACT", "OPTED_OUT"];

  for (let i = 0; i < 40; i++) {
    const fName = firstNames[i % firstNames.length];
    const lName = lastNames[i % lastNames.length];
    const code = `ML-${chewUser.role === "CHEW" ? "MU" : "GW"}-${1000 + i}`;
    
    // Choose facility
    const facility = facilities[i % facilities.length];
    
    // Determine contact status details
    const cStatus = contactStatuses[i % contactStatuses.length];
    const preferredLang = languages[i % languages.length];
    const preferredChan = cStatus === "MOBILIZER_ONLY" || cStatus === "NO_DIRECT_CONTACT" ? "MOBILIZER" : channels[i % channels.length];

    const ownsPhone = cStatus !== "MOBILIZER_ONLY" && cStatus !== "NO_DIRECT_CONTACT" && i % 3 !== 0;
    const sharedPhone = !ownsPhone && cStatus !== "OPTED_OUT";

    const woman = await prisma.woman.create({
      data: {
        uniqueCode: code,
        fullName: i % 10 === 0 ? null : `${fName} ${lName}`, // some coded/anonymous names
        codedName: i % 10 === 0 ? `ML-ANON-${200 + i}` : null,
        age: 18 + (i * 7) % 27,
        phone: ownsPhone || sharedPhone ? `+23480${Math.floor(10000000 + Math.random() * 90000000)}` : null,
        alternatePhone: i % 5 === 0 ? `+23490${Math.floor(10000000 + Math.random() * 90000000)}` : null,
        lgaId: facility.lgaId,
        facilityId: facility.id,
        community: `Community Sector ${1 + (i % 4)}`,
        pregnancyStatus: i % 3 === 0 ? "PREGNANT" : "NOT_PREGNANT",
        breastfeedingStatus: i % 3 === 1 ? "BREASTFEEDING" : "NOT_BREASTFEEDING",
        caregiverStatus: i % 2 === 0,
        childInOtp: i % 4 === 0,
        childDischargedFromSc: i % 8 === 0,
        consentGiven: true,
        preferredLanguage: preferredLang,
        preferredChannel: preferredChan,
        safeContactStatus: cStatus,
        safeContactTime: "09:00 - 11:00",
        registeredByUserId: chewUser.id,
        status: cStatus === "OPTED_OUT" ? "OPTED_OUT" : "ACTIVE",
      },
    });

    // Create safe contact assessment
    await prisma.safeContactAssessment.create({
      data: {
        womanId: woman.id,
        ownsPhone,
        sharedPhone,
        sharedWith: sharedPhone ? "Husband" : null,
        safeForCalls: cStatus === "DIRECT_SAFE" || cStatus === "NEUTRAL_ONLY",
        safeForSms: cStatus === "DIRECT_SAFE",
        safeForWhatsapp: cStatus === "DIRECT_SAFE" && i % 4 === 0,
        preferredTime: "Morning",
        neutralMessagesOnly: cStatus === "NEUTRAL_ONLY",
        unsafeTopics: cStatus === "NEUTRAL_ONLY" ? "Direct reproductive talk" : null,
        mobilizerFollowUpPreferred: cStatus === "MOBILIZER_ONLY" || cStatus === "NO_DIRECT_CONTACT",
        directContactAllowed: cStatus === "DIRECT_SAFE" || cStatus === "NEUTRAL_ONLY",
        assessedByUserId: chewUser.id,
      },
    });

    women.push(woman);
  }
  console.log(`Created ${women.length} Women and Safe Contact Assessments.`);

  // 6. Seed Nutrition Screenings (20)
  const screenings = [];
  const midwifeUser = users.find(u => u.role === "MIDWIFE") || users[4];

  // Screen the first 20 women
  for (let i = 0; i < 20; i++) {
    const woman = women[i];
    
    // Determine MUAC and risk category
    let muac = 24.5 - (i % 6);
    let oedema = i % 15 === 0;
    let visiblyWasted = i % 12 === 0;
    let risk: "NORMAL" | "AT_RISK" | "MODERATE_CONCERN" | "SEVERE_CONCERN" | "URGENT_REFERRAL" = "NORMAL";

    if (oedema) {
      risk = "URGENT_REFERRAL";
    } else if (visiblyWasted) {
      risk = "SEVERE_CONCERN";
    } else if (muac < 19.0) {
      risk = "URGENT_REFERRAL";
    } else if (muac >= 19.0 && muac < 21.0) {
      risk = "SEVERE_CONCERN";
    } else if (muac >= 21.0 && muac < 23.0) {
      risk = "MODERATE_CONCERN";
    } else if (muac >= 23.0 && i % 3 === 0) {
      risk = "AT_RISK";
    }

    const screening = await prisma.nutritionScreening.create({
      data: {
        womanId: woman.id,
        muacCm: oedema ? null : muac,
        oedema,
        visiblyWasted,
        appetiteConcern: i % 5 === 0,
        pregnantOrBreastfeeding: woman.pregnancyStatus === "PREGNANT" || woman.breastfeedingStatus === "BREASTFEEDING",
        householdFoodInsecurity: i % 4 === 0,
        riskCategory: risk,
        screenedByUserId: midwifeUser.id,
        screenedAt: new Date(Date.now() - (i * 2) * 24 * 60 * 60 * 1000), // staggered dates
        nextScreeningDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    screenings.push(screening);
  }
  console.log(`Created ${screenings.length} Nutrition Screenings.`);

  // 7. Seed Referrals (80)
  const referrals = [];
  const referralTypes = ["ANC", "PNC", "PHC_REVIEW", "NUTRITION_COUNSELLING", "MUAC_RECHECK", "OTP_FOLLOW_UP", "SC_FOLLOW_UP", "TOM_BROWN_DEMO", "SEEDLING_SUPPORT", "FSL_SOCIAL_PROTECTION", "PROTECTION", "EMERGENCY"];
  const referralStatuses = ["IDENTIFIED", "COUNSELLED", "REFERRED", "MESSAGE_SENT", "REACHED", "ATTENDED", "COMPLETED", "NOT_REACHED", "ESCALATED", "CLOSED"];
  const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];

  const mobilizerUser = users.find(u => u.role === "MOBILIZER") || users[7];

  for (let i = 0; i < 80; i++) {
    const woman = women[i % women.length];
    const type = referralTypes[i % referralTypes.length];
    const priority = priorities[i % priorities.length];
    const status = referralStatuses[i % referralStatuses.length];

    const ref = await prisma.referral.create({
      data: {
        womanId: woman.id,
        referralType: type,
        priority: priority,
        status: status,
        reason: `Follow-up required for ${type.replace("_", " ").toLowerCase()}`,
        destination: `PHC Location ${1 + (i % 3)}`,
        dueDate: new Date(Date.now() + (i % 5 - 2) * 24 * 60 * 60 * 1000),
        createdByUserId: chewUser.id,
        assignedToUserId: i % 2 === 0 ? mobilizerUser.id : chewUser.id,
        completedAt: status === "COMPLETED" ? new Date() : null,
        closedAt: status === "CLOSED" ? new Date() : null,
        createdAt: new Date(Date.now() - (i % 10) * 24 * 60 * 60 * 1000),
      },
    });

    // Create a referral update log
    await prisma.referralUpdate.create({
      data: {
        referralId: ref.id,
        status: "IDENTIFIED",
        note: "Referral created automatically upon screening.",
        updatedByUserId: chewUser.id,
        createdAt: ref.createdAt,
      },
    });

    if (status !== "IDENTIFIED") {
      await prisma.referralUpdate.create({
        data: {
          referralId: ref.id,
          status: status,
          note: `Status updated to ${status} following outreach.`,
          updatedByUserId: ref.assignedToUserId || chewUser.id,
          createdAt: new Date(ref.createdAt.getTime() + 12 * 60 * 60 * 1000),
        },
      });
    }

    referrals.push(ref);
  }
  console.log(`Created ${referrals.length} Referrals & Updates.`);

  // 8. Seed Message Logs (50)
  const logs = [];
  const logStatuses = ["PENDING", "SENT", "DELIVERED", "FAILED", "SKIPPED_UNSAFE", "MOBILIZER_ASSIGNED"];
  const responseStatuses = ["NO_RESPONSE", "CONFIRMED", "CALLBACK_REQUESTED", "HELP_NEEDED", null];

  for (let i = 0; i < 50; i++) {
    const woman = women[i % women.length];
    const template = templates[i % templates.length];
    const cStatus = logStatuses[i % logStatuses.length];
    const rStatus = cStatus === "DELIVERED" ? responseStatuses[i % responseStatuses.length] : null;

    const log = await prisma.messageLog.create({
      data: {
        womanId: woman.id,
        templateId: template.id,
        channel: woman.preferredChannel,
        scheduledAt: new Date(Date.now() - (i % 5) * 24 * 60 * 60 * 1000),
        sentAt: cStatus !== "PENDING" && cStatus !== "SKIPPED_UNSAFE" ? new Date() : null,
        deliveryStatus: cStatus,
        responseStatus: rStatus,
        providerMessageId: `msg_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(Date.now() - (i % 5) * 24 * 60 * 60 * 1000),
      },
    });
    logs.push(log);
  }
  console.log(`Created ${logs.length} Message Logs.`);

  // 9. Seed Nutrition Resilience Activities (15)
  const resilienceActivities = [];
  const eligibilityReasons = ["LOW_MUAC", "PREGNANT", "BREASTFEEDING", "CAREGIVER_OF_SAM_CHILD", "SC_DISCHARGE_CAREGIVER", "HOUSEHOLD_FOOD_INSECURITY", "SUPERVISOR_APPROVED"];
  const resilienceTypes = ["TOM_BROWN_DEMO", "LOCAL_FOOD_DEMO", "MUAC_FOLLOWUP", "SEEDLING_SUPPORT", "SACK_GARDEN_SUPPORT", "NUTRITION_GROUP", "FSL_REFERRAL", "SOCIAL_PROTECTION_REFERRAL"];
  const resilienceStatuses = ["PLANNED", "ATTENDED", "RECEIVED", "REFERRED", "COMPLETED", "MISSED"];

  for (let i = 0; i < 15; i++) {
    const woman = women[i % women.length];
    const type = resilienceTypes[i % resilienceTypes.length];
    const reason = eligibilityReasons[i % eligibilityReasons.length];
    const status = resilienceStatuses[i % resilienceStatuses.length];

    const act = await prisma.nutritionResilienceActivity.create({
      data: {
        womanId: woman.id,
        activityType: type,
        eligibilityReason: reason,
        status: status,
        activityDate: new Date(Date.now() - (i % 3) * 24 * 60 * 60 * 1000),
        followUpDate: status === "COMPLETED" || status === "RECEIVED" ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : null,
        notes: `Recorded support for ${type.replace("_", " ").toLowerCase()}`,
        recordedByUserId: chewUser.id,
      },
    });
    resilienceActivities.push(act);
  }
  console.log(`Created ${resilienceActivities.length} Nutrition Resilience Activities.`);

  // 10. Seed Missed Visits (10)
  const missedVisits = [];
  const visitTypes = ["ANC", "PNC", "OTP", "SC_FOLLOWUP", "MUAC_RECHECK", "TOM_BROWN_DEMO", "REFERRAL_APPOINTMENT"];
  const missedStatuses = ["OPEN", "CONTACTED", "RESCHEDULED", "COMPLETED", "ESCALATED", "CLOSED"];

  for (let i = 0; i < 10; i++) {
    const woman = women[i * 2 % women.length];
    const type = visitTypes[i % visitTypes.length];
    const status = missedStatuses[i % missedStatuses.length];

    const visit = await prisma.missedVisit.create({
      data: {
        womanId: woman.id,
        visitType: type,
        expectedDate: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000),
        status: status,
        assignedToUserId: status !== "OPEN" ? mobilizerUser.id : null,
        reasonForMissedVisit: status !== "OPEN" ? "Traveled or lack of transport support" : null,
      },
    });
    missedVisits.push(visit);
  }
  console.log(`Created ${missedVisits.length} Missed Visits.`);

  // 11. Seed Safeguarding Flags (3)
  const flags = [];
  const flagTypes = ["COMPLAINT", "SAFE_CONTACT_CONCERN", "GBV_DISCLOSURE", "DATA_PRIVACY", "STAFF_CONDUCT", "FRAUD", "OTHER"];
  const severities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
  const flagStatuses = ["OPEN", "IN_REVIEW", "REFERRED", "RESOLVED", "CLOSED"];

  const complaintsData = [
    { type: "SAFE_CONTACT_CONCERN", severity: "HIGH", description: "Beneficiary reports that her husband monitors her incoming messages. Direct contact should be disabled immediately and mobilizer visits utilized instead.", status: "OPEN" },
    { type: "COMPLAINT", severity: "MEDIUM", description: "Long waiting times reported at Muna PHC during nutrition screening sessions.", status: "IN_REVIEW" },
    { type: "GBV_DISCLOSURE", severity: "CRITICAL", description: "Disclosed domestic concern during ANC follow-up. Coded case referred to protection partner.", status: "REFERRED" },
  ];

  for (let i = 0; i < complaintsData.length; i++) {
    const cd = complaintsData[i];
    const woman = women[i * 5 % women.length];

    const flag = await prisma.complaintOrSafeguardingFlag.create({
      data: {
        womanId: woman.id,
        type: cd.type,
        severity: cd.severity,
        description: cd.description,
        status: cd.status,
        assignedToUserId: users[1].id, // Supervisor
        createdByUserId: chewUser.id,
      },
    });
    flags.push(flag);
  }
  console.log(`Created ${flags.length} Safeguarding flags.`);

  console.log("Database seeded successfully!");
}

export async function seedDatabase() {
  // Ensure we clean and seed the database using the hybrid client
  await main();
}

// Only run automatically if executed directly via CLI
const isDirectRun = process.argv[1] && (process.argv[1].endsWith("seed.ts") || process.argv[1].endsWith("seed.js"));
if (isDirectRun) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
