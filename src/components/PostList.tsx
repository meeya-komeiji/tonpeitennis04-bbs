'use client';

import { type MouseEvent } from 'react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { useTheme } from '@mui/material/styles';
import { type Post } from '@/lib/db';
import { formatDate } from '@/lib/format';
import { sanitizeHtml } from '@/lib/sanitize';
import { extractUrls, linkifyUrls } from '@/lib/linkify';
import LinkPreview from './LinkPreview';

/**
 * 本文中の `>>N`（アンカー）をクリック可能なリンクに変換する。
 * サニタイズ済みHTML内ではレス番号は `&gt;&gt;N` として現れるため、それを <a> 化する。
 * N は数字のみ、href/属性も数字に限定されるため XSS リスクはない。
 */
function linkifyAnchors(html: string): string {
  return html.replace(
    /(?:&gt;){2}(\d+)/g,
    (_m, no) =>
      `<a href="#post-${no}" data-anchor="${no}" class="res-anchor">&gt;&gt;${no}</a>`
  );
}

/** スレッド内の投稿一覧（設計画像の「1：名前 日時 No.X ＋本文」形式） */
export default function PostList({
  posts,
  onReply,
}: {
  posts: Post[];
  /** 「返信」クリック時にレス番号を通知する。未指定なら返信ボタンを出さない */
  onReply?: (no: number) => void;
}) {
  const { ui } = useTheme();
  // 本文中のアンカー（>>N）クリックで該当レスへスクロールする
  const handleBodyClick = (e: MouseEvent<HTMLElement>) => {
    const anchor = (e.target as HTMLElement).closest('a[data-anchor]');
    if (!anchor) return;
    e.preventDefault();
    const no = anchor.getAttribute('data-anchor');
    document
      .getElementById(`post-${no}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Box>
      {posts.map((post) => {
        // 本文はリッチテキスト(HTML)。描画前にサニタイズしてXSSを防いだうえで、
        // URL検出は >>N アンカーと同様に描画時に行う。
        const safe = sanitizeHtml(post.body);
        const urls = extractUrls(safe);
        return (
        <Box
          key={post.id}
          id={`post-${post.no}`}
          sx={{ mb: 2, scrollMarginTop: 8 }}
        >
          <Box sx={{ fontSize: 13 }}>
            <Box component="span" sx={{ color: ui.meta }}>
              {post.no}：
            </Box>
            <Box component="span" sx={{ color: ui.heading, fontWeight: 'bold' }}>
              {post.name}
            </Box>{' '}
            <Box component="span" sx={{ color: ui.meta }}>
              {formatDate(post.createdAt)}
            </Box>{' '}
            <Box component="span" sx={{ color: ui.title }}>
              No.{post.no}
            </Box>
            {onReply && (
              <>
                {' '}
                <Link
                  component="button"
                  type="button"
                  onClick={() => onReply(post.no)}
                  sx={{
                    color: ui.link,
                    fontSize: 13,
                    p: 0,
                    border: 0,
                    background: 'none',
                    cursor: 'pointer',
                    font: 'inherit',
                    verticalAlign: 'baseline',
                  }}
                >
                  返信
                </Link>
              </>
            )}
          </Box>
          <Box
            onClick={handleBodyClick}
            sx={{
              color: ui.body,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              pl: 3,
              pt: 0.5,
              fontSize: 14,
              lineHeight: 1.7,
              '& a.res-anchor': {
                color: ui.link,
                textDecoration: 'underline',
                cursor: 'pointer',
              },
              '& a.res-link': {
                color: ui.link,
                textDecoration: 'underline',
                wordBreak: 'break-all',
              },
            }}
            // >>N アンカーと http(s) URL をリンク化する（HTMLは上でサニタイズ済み）
            dangerouslySetInnerHTML={{
              __html: linkifyAnchors(linkifyUrls(safe)),
            }}
          />
          {urls.length > 0 && (
            <Box sx={{ pl: 3, pt: 0.5 }}>
              {urls.map((url) => (
                <LinkPreview key={url} url={url} />
              ))}
            </Box>
          )}
        </Box>
        );
      })}
    </Box>
  );
}
