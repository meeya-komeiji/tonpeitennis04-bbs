---
name: issue-run
description: issueドキュメントを起点に、内容確認・ブランチ切替・実装・検証・コミット・レビュー依頼までを一連で実行する
argument-hint: "<issue-doc-path>"
disable-model-invocation: true
---

`$ARGUMENTS` に指定された issue ドキュメントに対して、以下の手順を厳密に実行してください。

## 実行手順

1. `$ARGUMENTS` の issue ドキュメントを読む。
2. frontmatter に以下の項目が存在することを確認する。
   - `id`
   - `title`
   - `branch`
   - `commit_message`
   - `acceptance_criteria`
   - `verification_commands`
   - `manual_checks`
3. 次のコマンドを実行する。
   - `node .claude/scripts/start-issue.mjs "$ARGUMENTS"`
4. issue の実施範囲を、3〜6個程度の短い箇条書きで要約する。
5. 実装対象は issue に記載された範囲に限定する。
6. 必要な修正を実装する。
7. 次のコマンドを実行する。
   - `node .claude/scripts/verify-issue.mjs "$ARGUMENTS"`
8. 検証に失敗した場合は、以下を繰り返す。
   - 問題を修正する
   - `node .claude/scripts/verify-issue.mjs "$ARGUMENTS"` を再実行する
   - すべての検証コマンドが成功するまで繰り返す
9. 検証が成功したら、以下を行う。
   - 意図した変更ファイルだけを stage する
   - issue ドキュメントの `commit_message` を使って 1 回だけ commit する
10. この skill では issue ドキュメントを archive に移動しない。
11. 最後に以下をユーザーへ報告する。

- issue id と title
- 現在のブランチ名
- commit hash
- 変更ファイル一覧
- 検証結果
- ユーザーが確認すべき `manual_checks`
- 明示的な承認依頼

## 追加ルール

- 変更は最小限に留め、広範囲なリファクタリングは避ける。
- 既存のプロジェクト規約、命名、構成、実装方針に合わせる。
- Firebase Auth / Firestore / Functions に関わる変更では、可能であれば emulator を前提に確認する。
- この skill の中では issue ドキュメントを archive へ移動しない。
