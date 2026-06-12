---
id: ISSUE-0001
# issueを一意に識別するIDを書く。連番や日付ベースなど、チームで統一する。
title: ログイン後にダッシュボードへ遷移しない不具合を修正
# issueの内容がひと目で分かるタイトルを書く。
type: fix
# 例: fix / feature / refactor / chore
branch: fix/issue-0001-login-redirect
# このissue用に作成するブランチ名を書く。
commit_message: "fix(auth): redirect to dashboard after login"
# 完了時に使うコミットメッセージを書く。
paths:
  - src/features/auth/**
  - src/routes/**
# 主に変更対象になりそうなディレクトリやファイルを書く。厳密でなくてよい。
acceptance_criteria:
  - メールログイン成功後に /dashboard へ遷移する
  - リロード後もログイン状態が維持される
  - 未ログインで保護ページへ入ると /login へ戻る
# 「何を満たせば完了か」を箇条書きで書く。
manual_checks:
  - メールログイン成功後に /dashboard へ遷移することを確認する
  - 未ログインで保護ページへアクセスすると /login へ戻ることを確認する
  - リロード後もセッションが維持されることを確認する
# 人が実際に画面や挙動を見て確認してほしい項目を書く。
notes:
  - Firebase Auth を使用
  - 可能なら emulator で確認
# 補足事項、注意点、前提条件、非機能面の注意などを書く。
---

## 背景

なぜこの対応が必要なのかを書く。  
不具合であれば現象、改善であれば現状の課題を書く。

## 実施内容

今回このissueで実装したい内容を書く。  
「何をどう変えるか」を簡潔に書く。

## 非対象

今回あえてやらないことを書く。  
スコープの暴走を防ぐために重要。

## 実走結果

<!-- issue-close で追記 -->

---

## 使い方

### 開始

/issue-run docs/issues/open/ISSUE-0042-login-redirect.md

### 承認後

確認OKです。
/issue-close docs/issues/open/ISSUE-0042-login-redirect.md
