'use client';

import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Panel from './Panel';

const NAV: { label: string; href: string }[] = [
  { label: '新規スレッド作成', href: '/new' },
  { label: 'スレッド一覧', href: '/' },
];

/** 設計画像のヘッダー（タイトル＋ナビゲーション） */
export default function Header() {
  return (
    <Panel>
      <Typography
        component="h1"
        sx={{ fontSize: 20, fontWeight: 'bold', color: '#333', mb: 1.5 }}
      >
        Meeya掲示板 -S17部活ver-
      </Typography>
      <Box sx={{ textAlign: 'center', fontSize: 14 }}>
        {'| '}
        {NAV.map((item, i) => (
          <Box component="span" key={item.href}>
            <Link href={item.href} style={{ textDecoration: 'underline' }}>
              {item.label}
            </Link>
            {i < NAV.length - 1 ? ' | ' : ' |'}
          </Box>
        ))}
      </Box>
    </Panel>
  );
}
