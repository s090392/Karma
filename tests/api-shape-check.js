const fs = require("fs");
const path = require("path");

const required = [
  "src/app/api/auth/request-otp/route.ts",
  "src/app/api/auth/verify-otp/route.ts",
  "src/app/api/auth/logout/route.ts",
  "src/app/api/me/route.ts",
  "src/app/api/assessments/route.ts",
  "src/app/api/intel/route.ts",
  "src/app/api/mission/route.ts",
  "src/app/api/subscription/route.ts",
  "src/app/api/streak/route.ts",
  "src/app/api/admin/metrics/route.ts",
  "prisma/schema.prisma",
];

const root = path.resolve(__dirname, "..");
const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error(`Missing dynamic app files: ${missing.join(", ")}`);
  process.exit(1);
}

const schema = fs.readFileSync(path.join(root, "prisma/schema.prisma"), "utf8");
for (const model of ["User", "OtpChallenge", "Assessment", "MissionAction", "Subscription", "Streak"]) {
  if (!schema.includes(`model ${model}`)) {
    console.error(`Missing Prisma model: ${model}`);
    process.exit(1);
  }
}

console.log("API shape checks passed.");
