---
id: ISSUE-0004
title: 本文URLの自動リンク化とリンクプレビューカード
type: feature
branch: feature/issue-4-url-link-cards
commit_message: "feat(post): 本文URLの自動リンク化とプレビューカードを追加"
paths:
  - src/components/PostList.tsx
  - src/lib/linkify.ts
  - src/components/LinkPreview.tsx
acceptance_criteria:
  - 本文中の http(s):// URL がクリック可能なリンクとして表示される
  - リンクの直下に、URLの種類に応じたプレビューカード/埋め込みが表示される
  - YouTube の URL は埋め込みプレイヤー（iframe）になる
  - Google Maps の URL は地図埋め込み（iframe）になる
  - X(Twitter) の URL はツイート埋め込みになる
  - 上記以外の URL はドメイン名付きのシンプルな軽量カードになる
  - 既存の >>N アンカー機能・本文サニタイズ（XSS対策）が壊れない
manual_checks:
  - YouTube(watch / youtu.be / shorts)のURLを投稿し、プレイヤーが出る
  - Google Maps のURLを投稿し、地図が出る
  - X(Twitter)のURLを投稿し、ツイートが出る
  - 通常サイトのURLを投稿し、ドメイン付きカードが出る
  - 1投稿に複数URLを書いてもそれぞれ正しく表示される
  - URLでない文字列やscriptタグを書いてもXSSが発生しない
notes:
  - 一般サイトのOGP（タイトル/説明/サムネ付きカード）はサーバー側取得が必要なため本issueでは対象外。将来issueで対応する。
  - 埋め込みはiframe等を含むため、サニタイズ済みHTMLへの直接埋め込みではなく、本文からURLを抽出してReactコンポーネント（LinkPreview）として描画する方針とする。
  - X(Twitter)埋め込みは widgets.js の読み込みが必要。
  - URL検出は既存の linkifyAnchors と同様、描画時に行う。
---

## 背景

現状、本文中にURLを書いてもただのテキストで表示され、クリックもできない。
友人間で動画・地図・投稿などを共有する場面が多いため、LINEやTeamsのように
URLを貼るだけで自動でリンク化され、内容のプレビューが見えると体験が良くなる。

## 実施内容

- 本文中の `http(s)://` URL を検出し、クリック可能なリンクにする。
- リンクの下に、URLの種類を判定して適切なプレビューを表示する `LinkPreview` コンポーネントを追加する。
  - YouTube（watch / youtu.be / shorts）→ 埋め込みプレイヤー
  - Google Maps → 地図の埋め込み
  - X(Twitter) → ツイート埋め込み
  - それ以外 → ドメイン名付きのシンプルな軽量カード
- URL抽出・種類判定ロジックは `src/lib/linkify.ts` に切り出す。
- 表示は MUI コンポーネント（Card など）を優先して構築する。

## 非対象

- 一般サイトのOGP（タイトル/説明/サムネイル付き）カード … サーバー側取得が必要なため将来issue。
- Instagram / Spotify など3サービス以外の埋め込み。

## 実走結果
- completed_at: 2026-06-13T12:32:55.200Z
- branch: feature/issue-4-url-link-cards
- commit: e1d5e87
- commit_message: feat(post): 本文URLの自動リンク化とプレビューカードを追加
- verification_commands:
  - npm run verify:issue
