import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import YAML from "yaml";

export const STATE_DIR = path.resolve(process.cwd(), ".claude/state");
export const CURRENT_ISSUE_PATH = path.join(STATE_DIR, "current-issue.json");
export const VERIFY_OK_PATH = path.join(STATE_DIR, "verify-ok.json");

export function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function rmIfExists(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), "utf8");
}

export function parseIssueDoc(issuePathArg) {
  const absPath = path.resolve(process.cwd(), issuePathArg);
  const raw = fs.readFileSync(absPath, "utf8");

  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    throw new Error(`frontmatter not found: ${issuePathArg}`);
  }

  const frontmatterRaw = match[1];
  const meta = YAML.parse(frontmatterRaw) ?? {};
  const body = raw.slice(match[0].length);

  return {
    absPath,
    relPath: path.relative(process.cwd(), absPath).replaceAll("\\", "/"),
    raw,
    meta,
    body,
  };
}

export function assertRequired(meta, fields) {
  const missing = fields.filter((field) => {
    const value = meta[field];
    if (Array.isArray(value)) return value.length === 0;
    return value === undefined || value === null || value === "";
  });

  if (missing.length > 0) {
    throw new Error(
      `missing required frontmatter fields: ${missing.join(", ")}`,
    );
  }
}

export function run(command) {
  console.log(`\n$ ${command}`);
  execSync(command, {
    stdio: "inherit",
    shell: true,
  });
}

export function getCurrentBranch() {
  return execSync("git branch --show-current", {
    encoding: "utf8",
  }).trim();
}

export function getShortHead() {
  return execSync("git rev-parse --short HEAD", {
    encoding: "utf8",
  }).trim();
}

export function issueArchivePath(issueAbsPath) {
  const year = new Date().getFullYear().toString();
  const archiveDir = path.resolve(process.cwd(), "docs/issues/archive", year);
  ensureDir(archiveDir);
  return path.join(archiveDir, path.basename(issueAbsPath));
}
