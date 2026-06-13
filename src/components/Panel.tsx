'use client';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

/** 全画面共通の「パネル枠」。枠の色・角丸・影は有効なテーマに追従する */
export default function Panel({
  children,
  sx,
}: {
  children: React.ReactNode;
  sx?: object;
}) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        bgcolor: theme.panel.bg,
        border: `1px solid ${theme.panel.border}`,
        borderRadius: `${theme.panel.radius}px`,
        boxShadow: theme.panel.shadow,
        p: 2,
        mb: 2,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
