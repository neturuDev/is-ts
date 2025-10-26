import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 👇 зміни тут — тепер шукаємо у "lib", а не "src"
const TARGET_DIR = path.join(__dirname, "..", "lib");
const LICENSE_PATTERN = /@license\s+MIT/i;

function checkDir(dir) {
  const files = fs.readdirSync(dir);
  let badFiles = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      badFiles = badFiles.concat(checkDir(filePath));
    } else if (file.endsWith(".ts")) {
      const content = fs.readFileSync(filePath, "utf8");
      if (!LICENSE_PATTERN.test(content)) {
        badFiles.push(filePath);
      }
    }
  }

  return badFiles;
}

if (!fs.existsSync(TARGET_DIR)) {
  console.error(`❌ Directory not found: ${TARGET_DIR}`);
  process.exit(1);
}

const missing = checkDir(TARGET_DIR);

if (missing.length > 0) {
  console.error("❌ Files missing license header:");
  for (const f of missing) console.error(" -", f);
  process.exit(1);
} else {
  console.log("✅ All TypeScript files contain license header.");
}
