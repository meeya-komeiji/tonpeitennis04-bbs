---
name: issue-close
description: ユーザーの明示承認後に、issueドキュメントへ実走結果を書き込み、archiveへ移動する
argument-hint: "<issue-doc-path>"
disable-model-invocation: true
---

`$ARGUMENTS` に指定された issue ドキュメントに対して、以下の手順を厳密に実行してください。

## 実行手順

1. 現在の会話内で、ユーザーが明示的に承認している場合のみ続行する。
2. `$ARGUMENTS` の issue ドキュメントを読む。
3. 次のコマンドを実行する。
   - `node .claude/scripts/close-issue.mjs "$ARGUMENTS"`
4. 最後に以下をユーザーへ報告する。
   - archive 後のファイルパス
   - issue id
   - commit hash
   - 短い完了要約

## 追加ルール

- この skill では実装ファイルを修正しない。
- issue ドキュメントの更新と archive 移動だけを行う。
- ユーザー承認が明示的でない場合は close せず、承認待ちで止める。
