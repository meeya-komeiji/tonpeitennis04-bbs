import fs from "node:fs";
import {
  CURRENT_ISSUE_PATH,
  VERIFY_OK_PATH,
  readJsonIfExists,
} from "./issue-utils.mjs";

const raw = fs.readFileSync(0, "utf8");
const payload = raw ? JSON.parse(raw) : {};
const command = payload?.tool_input?.command ?? "";

const isGitCommit = /\bgit\s+commit\b/.test(command);

if (!isGitCommit) {
  process.exit(0);
}

const currentIssue = readJsonIfExists(CURRENT_ISSUE_PATH);
if (!currentIssue) {
  process.exit(0);
}

const verifyState = readJsonIfExists(VERIFY_OK_PATH);
if (!verifyState) {
  console.error(
    "Verification state is missing. Run the verification step before committing.",
  );
  process.exit(2);
}

if (verifyState.issuePath !== currentIssue.issuePath) {
  console.error(
    "Verification state does not match the active issue. Re-run verification before committing.",
  );
  process.exit(2);
}

if (verifyState.branch !== currentIssue.branch) {
  console.error(
    "Verification was run on a different branch. Re-run verification before committing.",
  );
  process.exit(2);
}

process.exit(0);
