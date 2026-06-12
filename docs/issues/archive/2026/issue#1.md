---
id: ISSUE-0001
title: 投稿時の文字装飾（太字・斜体・下線・文字色）対応
type: feature
branch: feature/issue-1-rich-text-decoration
commit_message: "feat(post): 投稿フォームに文字装飾ツールバーを追加"
paths:
  - src/components/PostForm.tsx
  - src/components/NewThreadForm.tsx
  - src/components/PostList.tsx
  - src/lib/db.ts
acceptance_criteria:
  - 投稿フォームにツールバーが表示され、選択したテキストに太字・斜体・下線を適用できる
  - ツールバーから文字色（黒・赤・青・緑）を選んで適用できる
  - 新規スレッド作成フォームと返信投稿フォームの両方で装飾が使える
  - 投稿した装飾が PostList の表示にそのまま反映される
  - 装飾付きの内容が保存・再読み込み後も維持される
manual_checks:
  - 太字・斜体・下線・各色を組み合わせて投稿し、表示が崩れないこと
  - 装飾なしのプレーンな投稿も従来どおり表示されること
  - 不正なHTML/スクリプトが投稿本文として実行されないこと（サニタイズ確認）
notes:
  - 本文はプレーンテキストからリッチテキスト（HTML等）へ保存形式を変更する必要がある
  - 既存の whiteSpace pre-wrap 表示からリッチテキスト描画へ切り替えるため、表示崩れに注意
  - XSS対策としてサニタイズ（DOMPurify等）を行う前提
  - 文字色プリセットは初期4色。あとから増減可能な実装にしておくと望ましい
  - エディタはMUI方針に沿いつつ contentEditable ベース or 軽量エディタライブラリを検討
---

## 背景

現在、投稿本文（PostForm）および新規スレッド作成はプレーンテキストのみで、強調したい箇所を目立たせる手段がない。友人間で楽しく使う掲示板として、表現の幅を広げたい。

## 実施内容

投稿フォームにツールバーを追加し、選択テキストに対して以下の装飾を適用できるようにする。

- 太字 / 斜体 / 下線
- 文字色（プリセットから選択：黒・赤・青・緑）

新規スレッド作成フォームと返信投稿フォームの両方に同じツールバーを提供する。保存形式をリッチテキスト対応に変更し、PostList での表示にも反映する。XSS対策のサニタイズを行う。

## 非対象

- 文字サイズ・見出し・リスト・リンク等、上記以外の装飾
- カラーパレットによる自由な色指定（プリセット選択のみ）
- 画像・絵文字の挿入

## 実走結果
- completed_at: 2026-06-12T14:52:49.834Z
- branch: feature/issue-1-rich-text-decoration
- commit: e6c585e
- commit_message: feat(post): 投稿フォームに文字装飾ツールバーを追加
- verification_commands:
  - npm run verify:issue
