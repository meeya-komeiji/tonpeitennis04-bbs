'use client';

import Box from '@mui/material/Box';
import { PANEL_GREEN, BORDER_GRAY } from '@/lib/theme';

/** 設計画像の「緑背景＋細い枠線」のパネル枠 */
export default function Panel({
  children,
  sx,
}: {
  children: React.ReactNode;
  sx?: object;
}) {
  return (
    <Box
      sx={{
        bgcolor: PANEL_GREEN,
        border: `1px solid ${BORDER_GRAY}`,
        p: 2,
        mb: 2,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
