'use client';

import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Panel from './Panel';
import { useThemeMode } from '@/lib/theme-provider';

const NAV: { label: string; href: string }[] = [
  { label: '新規スレッド作成', href: '/new' },
  { label: 'スレッド一覧', href: '/' },
];

/** 設計画像のヘッダー（タイトル＋ナビゲーション＋テーマ切り替え） */
export default function Header() {
  const { themeName, toggle } = useThemeMode();
  return (
    <Panel>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Typography
          component="h1"
          sx={{ fontSize: 20, fontWeight: 'bold', color: 'text.primary', mb: 1.5 }}
        >
          Meeya掲示板 -S17部活ver-
        </Typography>
        <FormControlLabel
          sx={{ m: 0 }}
          labelPlacement="start"
          control={
            <Switch
              size="small"
              checked={themeName === 'modern'}
              onChange={toggle}
              inputProps={{ 'aria-label': 'テーマ切り替え' }}
            />
          }
          label={
            <Typography sx={{ fontSize: 13 }}>
              {themeName === 'modern' ? 'モダン' : 'クラシック'}
            </Typography>
          }
        />
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
