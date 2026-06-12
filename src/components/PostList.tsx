'use client';

import Box from '@mui/material/Box';
import { type Post } from '@/lib/db';
import { formatDate } from '@/lib/format';

/** スレッド内の投稿一覧（設計画像の「1：名前 日時 No.X ＋本文」形式） */
export default function PostList({ posts }: { posts: Post[] }) {
  return (
    <Box>
      {posts.map((post) => (
        <Box key={post.id} sx={{ mb: 2 }}>
          <Box sx={{ fontSize: 13 }}>
            <Box component="span" sx={{ color: '#000' }}>
              {post.no}：
            </Box>
            <Box component="span" sx={{ color: '#008000', fontWeight: 'bold' }}>
              {post.name}
            </Box>{' '}
            <Box component="span" sx={{ color: '#000' }}>
              {formatDate(post.createdAt)}
            </Box>{' '}
            <Box component="span" sx={{ color: '#cc0000' }}>
              No.{post.no}
            </Box>
          </Box>
          <Box
            sx={{
              color: '#1a0dab',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              pl: 3,
              pt: 0.5,
              fontSize: 14,
              lineHeight: 1.7,
            }}
          >
            {post.body}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
