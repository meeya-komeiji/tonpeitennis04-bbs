import { execSync } from "node:child_process";
import {
  assertRequired,
  CURRENT_ISSUE_PATH,
  parseIssueDoc,
  VERIFY_OK_PATH,
  writeJson,
  rmIfExists,
} from "./issue-utils.mjs";

const issuePathArg = process.argv[2];
if (!issuePathArg) {
  console.error("Usage: node .claude/scripts/start-issue.mjs <issue-doc-path>");
  process.exit(1);
}

const { relPath, meta } = parseIssueDoc(issuePathArg);

assertRequired(meta, [
  "id",
  "title",
  "branch",
  "commit_message",
  "acceptance_criteria",
  "manual_checks",
]);

const status = execSync("git status --porcelain", { encoding: "utf8" }).trim();
if (status) {
  console.error(
    "Working tree is not clean. Please start from a clean git state.",
  );
  process.exit(1);
}

const branch = meta.branch;

let branchExists = true;
try {
  execSync(`git rev-parse --verify ${branch}`, { stdio: "ignore" });
} catch {
  branchExists = false;
}

if (branchExists) {
  execSync(`git switch ${branch}`, { stdio: "inherit" });
} else {
  execSync(`git switch -c ${branch}`, { stdio: "inherit" });
}

rmIfExists(VERIFY_OK_PATH);

writeJson(CURRENT_ISSUE_PATH, {
  issuePath: relPath,
  issueId: meta.id,
  title: meta.title,
  branch,
  commitMessage: meta.commit_message,
  startedAt: new Date().toISOString(),
});

console.log(`Started issue: ${meta.id}`);
console.log(`Branch: ${branch}`);
console.log(`Issue doc: ${relPath}`);
