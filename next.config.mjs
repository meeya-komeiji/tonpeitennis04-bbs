/** @type {import('next').NextConfig} */
const nextConfig = {
  // Firebase Hosting への静的エクスポート（SSRサーバー不要）
  output: 'export',
  // 静的エクスポートでは next/image の最適化サーバーが使えないため無効化
  images: { unoptimized: true },
  // 本番ビルドのソースマップを無効化（CLAUDE.md方針）
  productionBrowserSourceMaps: false,
};

export default nextConfig;
