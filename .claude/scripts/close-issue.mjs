import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import YAML from "yaml";
import {
  assertRequired,
  CURRENT_ISSUE_PATH,
  VERIFY_OK_PATH,
  issueArchivePath,
  parseIssueDoc,
  getCurrentBranch,
  getShortHead,
  readJsonIfExists,
  rmIfExists,
} from "./issue-utils.mjs";

const issuePathArg = process.argv[2];
if (!issuePathArg) {
  console.error("Usage: node .claude/scripts/close-issue.mjs <issue-doc-path>");
  process.exit(1);
}

const { absPath, relPath, meta, body } = parseIssueDoc(issuePathArg);

assertRequired(meta, ["id", "title", "branch", "commit_message"]);

const currentIssue = readJsonIfExists(CURRENT_ISSUE_PATH);
const verifyState = readJsonIfExists(VERIFY_OK_PATH);

if (!currentIssue || currentIssue.issuePath !== relPath) {
  console.error("Active issue state is missing or does not match this issue.");
  process.exit(1);
}

if (!verifyState || verifyState.issuePath !== relPath) {
  console.error("Verification state is missing or stale for this issue.");
  process.exit(1);
}

const resultLines = [
  `- completed_at: ${new Date().toISOString()}`,
  `- branch: ${getCurrentBranch()}`,
  `- commit: ${getShortHead()}`,
  `- commit_message: ${meta.commit_message}`,
  `- verification_commands:`,
  ...(verifyState.commands ?? []).map((cmd) => `  - ${cmd}`),
].join("\n");

let nextBody;
if (/## 実走結果/.test(body)) {
  nextBody = body.replace(
    /## 実走結果[\s\S]*$/m,
    `## 実走結果\n${resultLines}\n`,
  );
} else {
  nextBody = `${body.trimEnd()}\n\n## 実走結果\n${resultLines}\n`;
}

const nextRaw = `---\n${YAML.stringify(meta)}---\n${nextBody}`;
fs.writeFileSync(absPath, nextRaw, "utf8");

const destPath = issueArchivePath(absPath);
fs.renameSync(absPath, destPath);

rmIfExists(CURRENT_ISSUE_PATH);
rmIfExists(VERIFY_OK_PATH);

const archivedRelPath = path.relative(process.cwd(), destPath).replaceAll("\\", "/");
const commitMsg = `close: ${meta.id} ${meta.title}`;

// アーカイブ先の追加と、open ディレクトリ側の削除（旧パス）の両方をステージする
execSync(`git add "${archivedRelPath}" "${relPath}"`, { stdio: "inherit" });
execSync(`git commit -m "${commitMsg}"`, { stdio: "inherit" });

const commitHash = execSync("git rev-parse --short HEAD").toString().trim();

console.log(`Archived to: ${archivedRelPath}`);
console.log(`Issue: ${meta.id}`);
console.log(`Commit: ${commitHash}`);
