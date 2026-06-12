'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PostList from '@/components/PostList';
import PostForm, { type PostFormHandle } from '@/components/PostForm';
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
  const postFormRef = useRef<PostFormHandle>(null);
  const handleReply = (no: number) => postFormRef.current?.insertAnchor(no);

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
          <PostList posts={posts.slice(0, 1)} onReply={handleReply} />
          <Box sx={{ fontSize: 13, color: '#888', pl: 3, mb: 2 }}>
            （{omittedAfterFirst}件省略）
          </Box>
          <PostList posts={posts.slice(1)} onReply={handleReply} />
        </>
      ) : (
        <PostList posts={posts} onReply={handleReply} />
      )}

      <Box sx={{ textAlign: 'right' }}>
        <Link href={href} style={{ textDecoration: 'underline', fontSize: 13 }}>
          スレッドを開く →
        </Link>
      </Box>

      <PostForm ref={postFormRef} threadId={thread.id} onPosted={onPosted} />
    </Box>
  );
}
