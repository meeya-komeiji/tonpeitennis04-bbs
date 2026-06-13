'use client';

import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Panel from './Panel';
import { useThemeMode } from '@/lib/theme-provider';
import { ThemeName } from '@/lib/theme';

const NAV: { label: string; href: string }[] = [
  { label: '新規スレッド作成', href: '/new' },
  { label: 'スレッド一覧', href: '/' },
];

const THEME_OPTIONS: { name: ThemeName; label: string }[] = [
  { name: 'classic', label: 'クラシック' },
  { name: 'modern', label: 'モダン' },
];

/** 設計画像のヘッダー（タイトル＋ナビゲーション＋テーマ切り替え） */
export default function Header() {
  const { themeName, setThemeName } = useThemeMode();
  return (
    <Panel>
      <Typography
        component="h1"
        sx={{ fontSize: 20, fontWeight: 'bold', color: 'text.primary', mb: 1.5 }}
      >
        Meeya掲示板 -S17部活ver-
      </Typography>
      <Box sx={{ mb: 1.5 }}>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 0.5 }}>
          見た目を選べるよ
        </Typography>
        <Stack direction="row" spacing={1}>
          {THEME_OPTIONS.map((opt) => (
            <Chip
              key={opt.name}
              label={opt.label}
              size="small"
              color={themeName === opt.name ? 'primary' : 'default'}
              variant={themeName === opt.name ? 'filled' : 'outlined'}
              onClick={() => setThemeName(opt.name)}
              aria-pressed={themeName === opt.name}
            />
          ))}
        </Stack>
      </Box>
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
