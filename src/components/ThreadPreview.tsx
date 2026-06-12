'use client';

import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PostList from '@/components/PostList';
import PostForm from '@/components/PostForm';
import { type ThreadPreview as ThreadPreviewData } from '@/lib/db';

/** 1スレッド分のプレビュー（タイトル＋先頭投稿＋最新数件）。設計画像の本文付きパネル */
export default function ThreadPreview({
  preview,
  onPosted,
}: {
  preview: ThreadPreviewData;
  onPosted: () => void;
}) {
  const { thread, posts, omittedAfterFirst } = preview;
  const href = `/thread?id=${thread.id}`;

  return (
    <Box>
      <Link href={href} style={{ textDecoration: 'none' }}>
        <Typography
          sx={{
            color: '#cc0000',
            fontWeight: 'bold',
            fontSize: 17,
            mb: 2,
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          {thread.title}
        </Typography>
      </Link>

      {omittedAfterFirst > 0 ? (
        <>
          <PostList posts={posts.slice(0, 1)} />
          <Box sx={{ fontSize: 13, color: '#888', pl: 3, mb: 2 }}>
            （{omittedAfterFirst}件省略）
          </Box>
          <PostList posts={posts.slice(1)} />
        </>
      ) : (
        <PostList posts={posts} />
      )}

      <Box sx={{ textAlign: 'right' }}>
        <Link href={href} style={{ textDecoration: 'underline', fontSize: 13 }}>
          スレッドを開く →
        </Link>
      </Box>

      <PostForm threadId={thread.id} onPosted={onPosted} />
    </Box>
  );
}
