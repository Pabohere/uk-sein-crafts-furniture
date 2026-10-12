"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Moon, Sun } from 'lucide-react';
type Mode = 'light' | 'dark';
const ThemeContext = createContext<{ mode: Mode; toggle: () => void } | null>(null);
export function AdminThemeToggle() {
  const theme = useContext(ThemeContext); if (!theme) return null;
  return <button className="admin-theme-toggle" type="button" aria-label={`Switch to ${theme.mode === 'light' ? 'dark' : 'light'} mode`} onClick={theme.toggle}>{theme.mode === 'light' ? <Moon size={17} /> : <Sun size={17} />}<span>{theme.mode === 'light' ? 'Dark mode' : 'Light mode'}</span></button>;
}
export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>('light');
  useEffect(() => {
    const system = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => { let saved: string | null = null; try { saved = localStorage.getItem('uksein_admin_theme'); } catch {} setMode(saved === 'light' || saved === 'dark' ? saved : system.matches ? 'dark' : 'light'); };
    apply(); system.addEventListener('change', apply); window.addEventListener('storage', apply);
    return () => { system.removeEventListener('change', apply); window.removeEventListener('storage', apply); };
  }, []);
  const toggle = () => { const next = mode === 'light' ? 'dark' : 'light'; setMode(next); try { localStorage.setItem('uksein_admin_theme', next); } catch {} };
  return <ThemeContext.Provider value={{ mode, toggle }}><div className="admin-surface" data-admin-theme={mode}><div className="admin-login-theme"><AdminThemeToggle /></div>{children}</div></ThemeContext.Provider>;
}
