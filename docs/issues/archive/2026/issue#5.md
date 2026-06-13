---
id: ISSUE-0005
title: 開発環境専用スレッド
type: feature
branch: feature/issue-5-dev-only-thread
commit_message: "feat(thread): 開発環境でのみ表示・利用できるスレッドを追加"
paths:
  - src/lib/db.ts
  - src/components/ThreadList.tsx
acceptance_criteria:
  - npm start（ローカルサーバ）で起動したときだけ、開発環境専用スレッドがスレッド一覧に表示される
  - 開発環境専用スレッドでは通常スレッドと同様に投稿・閲覧ができる
  - firebase deploy した本番環境では開発環境専用スレッドが一覧に表示されず、アクセスもできない
manual_checks:
  - npm start で起動し、開発環境専用スレッドが一覧に出ることを確認する
  - 該当スレッドで投稿し、表示されることを確認する
  - npm run build した本番相当ビルドで該当スレッドが出ないことを確認する
notes:
  - 環境判定は process.env.NODE_ENV === 'development' を利用する想定
  - スレッドの実体はFirestoreに置き、一覧表示・アクセス時に環境でフィルタする方針
  - 開発専用スレッドの識別方法（Threadに dev フラグを持たせる / 固定IDで判定 等）は実装時に決定する
---

## 背景

ローカルでの動作確認や実験的な投稿を、本番の友人向け掲示板を汚さずに行いたい。
開発時だけ使える隔離されたスレッドがあると、気兼ねなくデバッグ・お試しができる。

## 実施内容

- 開発環境（`npm start` 実行時）でのみ表示・利用できるスレッドを用意する。
- スレッド一覧の取得/表示時に環境判定（`process.env.NODE_ENV`）でフィルタし、本番環境では開発専用スレッドを除外する。
- 開発専用スレッドかどうかを識別する仕組み（フラグ or 固定ID）を設ける。

## 非対象

- 本番環境向けの新機能・UI変更
- 認証やアクセス権限まわりの本格的な仕組み（あくまで表示フィルタによる簡易な切り分け）

## 実走結果
- completed_at: 2026-06-13T12:44:23.063Z
- branch: feature/issue-5-dev-only-thread
- commit: e97256d
- commit_message: feat(thread): 開発環境でのみ表示・利用できるスレッドを追加
- verification_commands:
  - npm run verify:issue
