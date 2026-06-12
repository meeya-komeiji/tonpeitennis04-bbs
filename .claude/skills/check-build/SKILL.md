---
name: check-build
description: npm start のコンパイルが通るか確認し、エラーがあれば修正する
---

以下の手順でビルドチェックを実行し、エラーがあれば修正してください。

## ステップ1: TypeScript型チェック（高速）

まず `npx tsc --noEmit` を実行してください。
- エラーがあれば内容を表示し、修正してください。
- 修正後に再度 `npx tsc --noEmit` を実行して確認してください。

## ステップ2: webpack ビルドチェック（npm start 相当）

次のコマンドで webpack コンパイルを実行し、出力を確認してください:

```bash
PORT=3001 BROWSER=none CI=true npm start 2>&1 &
sleep 30
kill %1 2>/dev/null
wait 2>/dev/null
```

`CI=true` を指定すると warning が error として扱われるため、より厳密にチェックできます。
warning だけで良い場合は `CI=true` を外してください。

## 確認ポイント

- `Compiled successfully` または `Compiled with warnings` → 正常（warningは既存のものか確認）
- `Failed to compile` → エラーあり。エラー内容を表示してユーザーに報告し、修正する

## 修正時の注意

- `Module not found` → importパスのtypo・ファイル移動漏れを確認
- `Cannot find module` → TypeScript解決エラー。パス・exportを確認
- `is not exported from` → named exportの名前ずれを確認
