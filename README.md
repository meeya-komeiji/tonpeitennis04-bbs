# Meeya掲示板 -S17部活ver-

S17部活の友人間で使う、2ch風の匿名掲示板アプリです。一般公開ではなく、知人どうしで楽しむことを目的にしています。

- フロントエンド: **Next.js (App Router) / TypeScript**
- UI: **Material UI (MUI)**（設計画像の緑基調レトロデザインを再現）
- バックエンド: **Firebase Firestore**（クライアント SDK から直接読み書き）
- ホスティング: **Firebase Hosting**（静的エクスポート、SSR サーバー不要）
- 認証: なし（spec.md の方針どおり、まずは読み書き＆ホスティングを優先）

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

## Firestore セキュリティルールについて

`firestore.rules` は認証なし前提で、**誰でも読み書き可能**ですが、最低限のバリデーション（必須項目・文字数制限）と、投稿の改ざん・削除の禁止を行っています。友人間の限定運用を想定したものなので、不特定多数への公開には向きません。必要に応じて認証の追加を検討してください。

## 補足

- ルーティングは静的エクスポートと相性のよいクエリ方式（`/thread?id=xxx`）を採用しています。`firebase.json` の `cleanUrls: true` により拡張子なし URL で解決されます。
- `out/` はビルド成果物のため Git 管理対象外（`.gitignore` 済み）です。
