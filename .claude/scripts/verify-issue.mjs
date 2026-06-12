import {
  assertRequired,
  CURRENT_ISSUE_PATH,
  VERIFY_OK_PATH,
  parseIssueDoc,
  writeJson,
  getCurrentBranch,
  readJsonIfExists,
  run,
} from "./issue-utils.mjs";

const issuePathArg = process.argv[2];
if (!issuePathArg) {
  console.error(
    "Usage: node .claude/scripts/verify-issue.mjs <issue-doc-path>",
  );
  process.exit(1);
}

const { relPath, meta } = parseIssueDoc(issuePathArg);

assertRequired(meta, ["id", "title", "branch"]);

const currentIssue = readJsonIfExists(CURRENT_ISSUE_PATH);
if (!currentIssue) {
  console.error("No active issue state found. Run /issue-run first.");
  process.exit(1);
}

const commands = ["npm run verify:issue"];

for (const command of commands) {
  run(command);
}

writeJson(VERIFY_OK_PATH, {
  issuePath: relPath,
  issueId: meta.id,
  branch: getCurrentBranch(),
  commands,
  checkedAt: new Date().toISOString(),
});

console.log(`Verification passed for ${meta.id}`);
