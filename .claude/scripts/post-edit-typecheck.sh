#!/bin/bash
# Edit/Write後にTypeScriptコンパイルチェックを実行し、エラーをClaudeのコンテキストに注入する

FILE=$(jq -r '.tool_input.file_path // empty' 2>/dev/null)

# .ts/.tsx ファイルのみ対象
if ! echo "$FILE" | grep -qE '\.(tsx?|ts)$' 2>/dev/null; then
  exit 0
fi

cd /home/meeya/dev/s17-bbs

RESULT=$(npx tsc --noEmit 2>&1)
ERROR_LINES=$(echo "$RESULT" | grep "error TS" | head -20)

if [ -z "$ERROR_LINES" ]; then
  exit 0
fi

# エラー内容をClaudeのコンテキストに注入
python3 - <<PYEOF
import json, sys

errors = """$ERROR_LINES"""
output = {
    "hookSpecificOutput": {
        "hookEventName": "PostToolUse",
        "additionalContext": f"⚠️ TypeScript compile errors detected after edit:\n{errors}\n\nPlease fix these errors."
    }
}
print(json.dumps(output))
PYEOF
