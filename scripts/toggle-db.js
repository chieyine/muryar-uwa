const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const mode = process.argv[2]; // "postgres" or "sqlite"

if (mode !== "postgres" && mode !== "sqlite") {
  console.error("Usage: node scripts/toggle-db.js [postgres|sqlite]");
  process.exit(1);
}

const schemaPath = path.join(__dirname, "../prisma/schema.prisma");
let schemaContent = fs.readFileSync(schemaPath, "utf8");

// Replace datasource provider
if (mode === "postgres") {
  schemaContent = schemaContent.replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"');
  console.log("Switching Prisma schema to PostgreSQL...");
} else {
  schemaContent = schemaContent.replace(/provider\s*=\s*"postgresql"/, 'provider = "sqlite"');
  console.log("Switching Prisma schema to SQLite...");
}

fs.writeFileSync(schemaPath, schemaContent, "utf8");

// Regenerate client
try {
  console.log("Regenerating Prisma client...");
  execSync("npx prisma generate", { stdio: "inherit" });
  console.log(`Successfully switched database mode to: ${mode.toUpperCase()}`);
} catch (e) {
  console.error("Prisma client generation failed:", e.message);
  process.exit(1);
}
