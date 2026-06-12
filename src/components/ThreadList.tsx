'use client';

import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { type Thread } from '@/lib/db';

/** 新着スレッド一覧（設計画像の「1、タイトル(レス数) / 2、...」形式のリンク行） */
export default function ThreadList({ threads }: { threads: Thread[] }) {
  return (
    <Box>
      <Typography
        sx={{ color: '#008000', fontWeight: 'bold', fontSize: 15, mb: 1 }}
      >
        - 新着スレッド -
      </Typography>
      {threads.length === 0 ? (
        <Typography sx={{ fontSize: 14, color: '#333' }}>
          まだスレッドがありません。「新規スレッド作成」から立ててみよう。
        </Typography>
      ) : (
        <Box sx={{ fontSize: 14, lineHeight: 2 }}>
          {threads.map((t, i) => (
            <Box component="span" key={t.id}>
              <Link
                href={`/thread?id=${t.id}`}
                style={{ textDecoration: 'underline' }}
              >
                {i + 1}、{t.title}({t.resCount})
              </Link>
              {i < threads.length - 1 ? ' / ' : ''}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
