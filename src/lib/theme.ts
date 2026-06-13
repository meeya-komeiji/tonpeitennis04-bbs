'use client';

import { createTheme, Theme, ThemeOptions } from '@mui/material/styles';

// MUIテーマに、掲示板UIで使う意味的な色・形のトークンをテーマごとに持たせる拡張
declare module '@mui/material/styles' {
  interface Theme {
    panel: {
      bg: string;
      border: string;
      radius: number;
      shadow: string;
    };
    ui: {
      heading: string; // 見出し・投稿者名
      title: string; // スレッドタイトル
      meta: string; // レス番号・日時
      muted: string; // 省略表示などの控えめテキスト
      body: string; // 投稿本文
      link: string; // リンク・アンカー
      error: string; // エラーメッセージ
      fieldBg: string; // 入力欄の背景
      editorToolbarBg: string; // エディタのツールバー背景
      editorBorder: string; // エディタの枠線
      editorRadius: number; // エディタの角丸
      submitBg: string; // 投稿ボタン背景
      submitBgHover: string;
      submitColor: string;
    };
  }
  interface ThemeOptions {
    panel?: Partial<Theme['panel']>;
    ui?: Partial<Theme['ui']>;
  }
}

export type ThemeName = 'classic' | 'modern';

export const DEFAULT_THEME: ThemeName = 'classic';

// 設計画像のレトロな緑基調掲示板（Rara掲示板風）を再現するテーマ
export const BG_GREEN = '#ccffcc';
export const PANEL_GREEN = '#ccffcc';
export const BORDER_GRAY = '#999999';

const classicOptions: ThemeOptions = {
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
  panel: {
    bg: PANEL_GREEN,
    border: BORDER_GRAY,
    radius: 0,
    shadow: 'none',
  },
  ui: {
    heading: '#008000',
    title: '#cc0000',
    meta: '#000000',
    muted: '#888888',
    body: '#1a0dab',
    link: '#1a0dab',
    error: '#cc0000',
    fieldBg: '#ffffff',
    editorToolbarBg: '#f5f5f5',
    editorBorder: '#cccccc',
    editorRadius: 4,
    submitBg: '#666666',
    submitBgHover: '#555555',
    submitColor: '#ffffff',
  },
};

// 明るいフラットデザインの今どきなライトテーマ（白基調・余白広め・角丸・ソフトな影）
const modernOptions: ThemeOptions = {
  palette: {
    background: {
      default: '#f7f8fa',
      paper: '#ffffff',
    },
    primary: {
      main: '#2563eb',
    },
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
    },
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Meiryo", system-ui, sans-serif',
    fontSize: 14,
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10, textTransform: 'none', fontWeight: 600 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
  },
  panel: {
    bg: '#ffffff',
    border: '#e5e7eb',
    radius: 14,
    shadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
  },
  ui: {
    heading: '#6b7280',
    title: '#111827',
    meta: '#9ca3af',
    muted: '#9ca3af',
    body: '#1f2937',
    link: '#2563eb',
    error: '#dc2626',
    fieldBg: '#ffffff',
    editorToolbarBg: '#f9fafb',
    editorBorder: '#e5e7eb',
    editorRadius: 10,
    submitBg: '#2563eb',
    submitBgHover: '#1d4ed8',
    submitColor: '#ffffff',
  },
};

export const classicTheme: Theme = createTheme(classicOptions);
export const modernTheme: Theme = createTheme(modernOptions);

export const themes: Record<ThemeName, Theme> = {
  classic: classicTheme,
  modern: modernTheme,
};

export default classicTheme;
