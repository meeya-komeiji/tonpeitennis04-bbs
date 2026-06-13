'use client';

import Link from 'next/link';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { type Thread } from '@/lib/db';

/** 新着スレッド一覧（設計画像の「1、タイトル(レス数) / 2、...」形式のリンク行） */
export default function ThreadList({ threads }: { threads: Thread[] }) {
  const { ui } = useTheme();
  return (
    <Box>
      <Typography
        sx={{ color: ui.heading, fontWeight: 'bold', fontSize: 15, mb: 1 }}
      >
        - 新着スレッド -
      </Typography>
      {threads.length === 0 ? (
        <Typography sx={{ fontSize: 14, color: 'text.primary' }}>
          まだスレッドがありません。「新規スレッド作成」から立ててみよう。
        </Typography>
      ) : (
        <Box sx={{ fontSize: 14, lineHeight: 2 }}>
          {threads.map((t, i) => (
            <Box component="span" key={t.id}>
              {t.dev && (
                <Chip
                  label="DEV"
                  size="small"
                  color="warning"
                  sx={{ height: 18, fontSize: 10, fontWeight: 'bold', mr: 0.5 }}
                />
              )}
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
