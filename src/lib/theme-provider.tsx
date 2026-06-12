'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';
import { DEFAULT_THEME, themes, ThemeName } from './theme';

const STORAGE_KEY = 's17bbs-theme';

type ThemeContextValue = {
  themeName: ThemeName;
  setThemeName: (name: ThemeName) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useThemeMode(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeMode must be used within AppThemeProvider');
  }
  return ctx;
}

/**
 * テーマ状態をContextで管理し、localStorageと同期するプロバイダ。
 * SSR/初期描画はデフォルト（クラシック）で固定し、マウント後に
 * localStorageの値へ反映してハイドレーション不整合を避ける。
 */
export default function AppThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [themeName, setThemeNameState] = useState<ThemeName>(DEFAULT_THEME);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'classic' || saved === 'modern') {
      setThemeNameState(saved);
    }
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const setThemeName = (name: ThemeName) => {
      setThemeNameState(name);
      localStorage.setItem(STORAGE_KEY, name);
    };
    return {
      themeName,
      setThemeName,
      toggle: () =>
        setThemeName(themeName === 'classic' ? 'modern' : 'classic'),
    };
  }, [themeName]);

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={themes[themeName]}>
        <CssBaseline />
        <GlobalStyles styles={(theme) => ({ a: { color: theme.ui.link } })} />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
