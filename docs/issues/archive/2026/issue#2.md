---
id: ISSUE-0002
title: 特定レスへのアンカー返信機能（>>N）
type: feature
branch: feature/issue-2-anchor-reply
commit_message: "feat(post): 特定レスへのアンカー返信機能を追加"
paths:
  - src/components/PostList.tsx
  - src/components/PostForm.tsx
  - src/app/thread/ThreadView.tsx
acceptance_criteria:
  - 各レスのヘッダーに「返信」ボタン（リンク）が表示される
  - 「返信」を押すとコメント欄に `>>N`（Nはレス番号）が自動挿入され、入力欄にフォーカスが当たる
  - 投稿本文中の `>>N` が青系リンクとして表示される
  - "`>>N` リンクをクリックすると該当レス（id=post-N）へスクロールする"
  - アンカー付きで投稿した内容が保存・再読み込み後も維持される
manual_checks:
  - 複数のレスに対して「返信」を押し、それぞれ正しいレス番号が挿入されること
  - 本文中に複数の `>>N` を含む投稿でも全てリンク化・スクロールできること
  - "存在しないレス番号（例: >>999）でも表示が崩れないこと"
  - アンカーを含まない通常の投稿が従来どおり表示されること
notes:
  - Firestore のデータ構造変更は不要。アンカーは本文テキスト（>>N）として既存 body に保存する
  - 「返信」クリックからフォームへの挿入は forwardRef + useImperativeHandle で PostForm に
    insertAnchor(no) を公開し、ThreadView で配線する
  - 挿入位置はコメント欄の先頭を想定（末尾でも可、要相談）
  - アンカークリック時はまずスクロールのみ。引用ポップアップ表示は非対象
  - 各レスに id="post-{no}" を付与してスクロール先とする
---

## 背景

現在は単純に時系列でレスが並ぶだけで、特定のレスに対して返信していることを示す手段がない。友人間で会話を楽しむ掲示板として、どのレスへの返信かが分かるようにしたい（2ちゃんねる風のアンカー機能）。

## 実施内容

各レスに「返信」ボタンを追加し、押すとコメント欄に `>>N`（Nはレス番号）を自動挿入する。投稿本文中の `>>N` はリンクとして表示し、クリックで該当レスへスクロールする。

- PostList: 各レスに「返信」ボタンと id=post-{no} を付与、本文中の `>>N` をパースしてリンク化
- PostForm: insertAnchor(no) を公開し、`>>N` をコメント欄に挿入＋フォーカス
- ThreadView: PostList の返信クリックと PostForm を ref で配線

データはテキストとして保存するため Firestore のスキーマ変更は不要。

## 非対象

- 引用ポップアップ（アンカーにホバー/クリックで該当レスを浮かせて表示）
- 1つのレスに対する返信一覧の逆引き表示（被アンカー表示）
- アンカーの自動補完・候補表示

## 実走結果
- completed_at: 2026-06-12T15:06:00.221Z
- branch: feature/issue-2-anchor-reply
- commit: bac7ce0
- commit_message: feat(post): 特定レスへのアンカー返信機能を追加
- verification_commands:
  - npm run verify:issue
