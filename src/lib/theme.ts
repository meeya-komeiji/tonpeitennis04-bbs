'use client';

import { createTheme } from '@mui/material/styles';

// 設計画像のレトロな緑基調掲示板（Rara掲示板風）を再現するテーマ
export const BG_GREEN = '#ccffcc';
export const PANEL_GREEN = '#ccffcc';
export const BORDER_GRAY = '#999999';

const theme = createTheme({
  palette: {
    background: {
      default: '#f0f0f0',
      paper: PANEL_GREEN,
    },
    primary: {
      main: '#1a0dab', // リンクの青
    },
  },
  typography: {
    fontFamily:
      '"Hiragino Kaku Gothic ProN", "Meiryo", "MS PGothic", system-ui, sans-serif',
    fontSize: 14,
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
  },
});

export default theme;
