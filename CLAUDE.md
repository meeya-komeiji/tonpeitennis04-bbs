# CLAUDE.md

## プロジェクト概要

- 一般公開用ではなく、特定の友人間で楽しくことを目的とした掲示板アプリ

## Commands

```bash
npm start          # Dev server at http://localhost:3000
npm run build      # Production build (source maps disabled)
npm test           # Run tests in watch mode
firebase deploy    # Deploy to Firebase Hosting
npx tsc --noEmit   # TypeScript型チェックのみ（高速）
```

## ビルドチェック

コード変更後に `/check-build` スキルを使うとビルドが通るか確認できます。内部では:

1. `npx tsc --noEmit` でTypeScript型エラーを確認
2. `PORT=3001 BROWSER=none npm start` でwebpackコンパイル（Module not foundなどCSSやimportのエラーを検出）

また `.ts`/`.tsx` ファイルを編集するたびに `tsc --noEmit` が自動でバックグラウンド実行され、エラーが検出されると次のClaudeの応答に内容が注入されます（`.claude/scripts/post-edit-typecheck.sh`）。

## コミュニケーション

- 応答は日本語で行う（コード・変数名は英語）
- 複雑なタスクでは実装前に計画を提示し、承認を得てから着手する

## コードスタイル

- TypeScriptで `any` は使わず `unknown` を使う

## Git規約

- Conventional Commits形式で記述し、本文は日本語にする

## UIライブラリ

UIコンポーネントには **Material UI (MUI)** を使用する。新規コンポーネントを作成する際は、独自CSSよりMUIコンポーネントを優先する。

## リファレンス
