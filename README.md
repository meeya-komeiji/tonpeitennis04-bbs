# Meeya掲示板 -S17部活ver-

S17部活メンバー間で使う、2ch風の匿名掲示板アプリです。一般公開ではなく、知人どうしで楽しむことを目的にしています。

- フロントエンド: **Next.js (App Router) / TypeScript**
- UI: **Material UI (MUI)**（設計画像の緑基調レトロデザインを再現）
- バックエンド: **Firebase Firestore**（クライアント SDK から直接読み書き）
- ホスティング: **Firebase Hosting**（静的エクスポート、SSR サーバー不要）
- 認証: なし（とりあえずは読み書き＆ホスティングを優先）

## 機能（MVP）

- スレッド一覧（新着順）
- スレッド閲覧（`1：名前 日時 No.X` ＋本文の 2ch 風表示）
- 新規スレッド作成
- スレッドへの返信投稿（レス番号は自動採番）

> 画像添付・文字装飾・検索・アルバム・管理機能は今後の拡張予定です。

## ディレクトリ構成

```
.
├── src/
│   ├── app/
│   │   ├── layout.tsx          # ルートレイアウト（MUI テーマ適用）
│   │   ├── page.tsx            # ホーム（スレッド一覧）
│   │   ├── new/page.tsx        # 新規スレッド作成
│   │   └── thread/             # スレッド閲覧（/thread?id=xxx）
│   ├── components/             # Header / ThreadList / PostList / 各フォーム
│   └── lib/
│       ├── firebase.ts         # Firebase 初期化
│       ├── db.ts               # Firestore 読み書き＆型定義
│       ├── theme.ts            # MUI テーマ（緑基調）
│       └── format.ts           # 日時整形
├── firebase.json               # Hosting / Firestore 設定
├── firestore.rules             # セキュリティルール
├── .firebaserc                 # プロジェクト ID（要編集）
└── next.config.mjs             # output: 'export'（静的書き出し）
```

## データモデル（Firestore）

```
threads/{threadId}
  title: string        # スレッドタイトル
  resCount: number     # レス数（採番に使用）
  createdAt: Timestamp
  updatedAt: Timestamp # 返信のたびに更新（一覧の並び順に使用）

threads/{threadId}/posts/{postId}
  no: number           # レス番号（1 始まり）
  name: string         # 投稿者名（空欄なら「名無しさん」）
  body: string         # 本文
  createdAt: Timestamp
```

---

## ローカル開発

### 開発環境

推奨環境（開発者の動作確認環境）は以下のとおりです。

- OS: **Windows（WSL2 / Ubuntu）**
- Node.js: **v20.20.0**

> Node.js は v20 系で動作確認しています。`nvm` などでバージョンを合わせると安全です。

### 1. 依存インストール

```bash
npm install
```

### 2. Firebase の準備

1. [Firebase コンソール](https://console.firebase.google.com/) でプロジェクトを作成
2. **Firestore Database** を作成（本番モードで可。ルールは後述のものを使用）
3. プロジェクトの設定 → マイアプリ → **ウェブアプリを追加**し、表示される `firebaseConfig` の値を控える

### 3. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成し、控えた値を入力します。

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

> `NEXT_PUBLIC_` で始まる値はブラウザに公開されます。Firebase Web SDK の設定値はもともと公開前提のものなので問題ありません。アクセス制御は Firestore ルール側で行います。

### 4. 開発サーバー起動

```bash
npm start          # http://localhost:3000
```

その他のコマンド:

```bash
npm run build      # 本番ビルド（out/ に静的書き出し）
npx tsc --noEmit   # 型チェックのみ
```

---

## 開発用スレッド

開発中の動作確認に使える、**開発環境（`npm start` / `next dev`）でのみ表示・利用できる専用スレッド**を用意しています。

- 開発環境で一覧を開くと、固定ID（`dev-only-thread`）の「**開発用スレッド**」が自動で用意されます（無ければ作成、あれば再利用するべき等処理）。一覧では `DEV` バッジ付きで表示されます。
- 実体は本番と同じ Firestore に置かれますが、スレッドに `dev: true` フラグを持たせており、**本番環境では一覧から除外され、直接 URL（`/thread?id=dev-only-thread`）でもアクセスできません**。
- このスレッドには自由に投稿して構いません。本番の利用者には見えないので、動作確認用のテスト投稿に使えます。
- あわせて、**開発環境では来訪者カウンターを増やしません**（現在値の読み取りのみ）。ローカルでの開発・リロードで本番の集計が膨らまないようにするためです。

> 制御は `src/lib/db.ts` の `NODE_ENV === 'development'` 判定で行っています。本番ビルド（`npm run build`）では `production` になるため、上記の開発用挙動はすべて無効になります。

---

## デプロイ手順（Firebase Hosting）

### 前提

- Firebase CLI をインストール済み（未導入なら `npm install -g firebase-tools`）
- 上記「ローカル開発」で Firebase プロジェクトと `.env.local` を作成済み

### 1. Firebase にログイン

```bash
firebase login
```

### 2. デプロイ先プロジェクトを指定

`.firebaserc` の `your-firebase-project-id` を、自分の Firebase プロジェクト ID に書き換えます。

```json
{
  "projects": {
    "default": "あなたのプロジェクトID"
  }
}
```

> あるいは CLI で `firebase use --add` を実行して対話的に設定することもできます。

### 3. 静的ビルド

`firebase deploy` は `out/` ディレクトリ（`next.config.mjs` の `output: 'export'` による書き出し）を公開します。デプロイ前に必ずビルドしてください。

```bash
npm run build
```

### 4. Firestore ルールと Hosting をデプロイ

```bash
# 初回はまとめて
firebase deploy

# 個別に行う場合
firebase deploy --only firestore:rules   # セキュリティルールのみ
firebase deploy --only hosting           # サイトのみ
```

デプロイが完了すると `https://<プロジェクトID>.web.app` で公開されます。

### デプロイの流れまとめ

```bash
npm run build && firebase deploy
```

---

## Claude Code での開発フロー

このリポジトリには、Claude Code（`claude.ai/code`）で開発を進めるためのカスタムスキルと自動チェックが組み込まれています。スキルはチャットで `/スキル名` と入力して呼び出します。

### スキル一覧

| コマンド                     | 用途                                                                         |
| ---------------------------- | ---------------------------------------------------------------------------- |
| `/issue-new`                 | 対話で要望を整理し、issue ファイルを `docs/issues/open/` に作成する          |
| `/issue-run <issueパス>`     | issue を起点に、ブランチ切替・実装・検証・コミットまでを一連で実行する       |
| `/issue-close <issueパス>`   | 承認後に実走結果を追記し、issue を `docs/issues/archive/` へ移動する         |
| `/clarify-plan <プランパス>` | 計画ドキュメントを読み込み、1問1答で要求仕様を詰める（実装はしない）         |
| `/check-build`               | `tsc --noEmit` と webpack コンパイルでビルドが通るか確認し、エラーを修正する |

### issue ベースの開発サイクル

要望の発生から完了まで、次の流れで進めます。

```
/issue-new                                  # ① 要望を対話で整理し issue を作成
        ↓  docs/issues/open/issue#N.md
/issue-run docs/issues/open/issue#N.md      # ② ブランチ作成→実装→検証→コミット
        ↓  動作を手動確認（manual_checks）
確認OKです。                                  # ③ ユーザーが明示的に承認
/issue-close docs/issues/open/issue#N.md     # ④ 実走結果を追記し archive へ移動
```

- `/issue-run` は `.claude/scripts/start-issue.mjs`（ブランチ切替）と `verify-issue.mjs`（検証）を内部で実行し、検証が通るまで修正を繰り返してから 1 回だけコミットします。
- `/issue-close` はユーザーが会話内で明示承認している場合のみ実行され、`close-issue.mjs` で issue を archive に移します。
- issue ファイルの frontmatter（`id` / `branch` / `commit_message` / `acceptance_criteria` など）が各スクリプトの入力になります。

### ビルドチェック

コード変更後は `/check-build` でコンパイルを確認できます。内部の手順:

1. `npx tsc --noEmit` で TypeScript 型エラーを検出
2. `PORT=3001 BROWSER=none CI=true npm start` で webpack コンパイル（`Module not found` など import / CSS のエラーを検出）

### 自動型チェック（フック）

`.ts` / `.tsx` を編集するたびに、PostToolUse フック（`.claude/scripts/post-edit-typecheck.sh`）が `tsc --noEmit` をバックグラウンド実行します。型エラーがあると、その内容が次の Claude の応答に自動で注入され、すぐ修正に移れます。設定は `.claude/settings.local.json` の `hooks` を参照してください。

---

## Firestore セキュリティルールについて

`firestore.rules` は認証なし前提で、**誰でも読み書き可能**ですが、最低限のバリデーション（必須項目・文字数制限）と、投稿の改ざん・削除の禁止を行っています。友人間の限定運用を想定したものなので、不特定多数への公開には向きません。必要に応じて認証の追加を検討してください。

## 補足

- ルーティングは静的エクスポートと相性のよいクエリ方式（`/thread?id=xxx`）を採用しています。`firebase.json` の `cleanUrls: true` により拡張子なし URL で解決されます。
- `out/` はビルド成果物のため Git 管理対象外（`.gitignore` 済み）です。
