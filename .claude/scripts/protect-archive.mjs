import fs from "node:fs";
import path from "node:path";

const raw = fs.readFileSync(0, "utf8");
const payload = raw ? JSON.parse(raw) : {};

const filePath = payload?.tool_input?.file_path ?? "";
if (!filePath) {
  process.exit(0);
}

const normalized = filePath.split(path.sep).join("/");

if (normalized.includes("/docs/issues/archive/")) {
  console.error(
    "Do not edit archived issue documents directly. Edit open issues only, then archive via /issue-close.",
  );
  process.exit(2);
}

process.exit(0);
