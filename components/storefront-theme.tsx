"use client";
import { useContext, useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Moon, Sun } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';
import { SiteTheme } from '@/components/storefront-theme-context';
type Mode = 'light' | 'dark';
export function StorefrontThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>('light');
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const admin = pathname === '/admin' || pathname?.startsWith('/admin/');
  useEffect(() => {
    const system = window.matchMedia('(prefers-color-scheme: dark)');
    const refresh = () => { let saved: string | null = null; try { saved = localStorage.getItem('uksein_site_theme'); } catch {} setMode(saved === 'light' || saved === 'dark' ? saved : system.matches ? 'dark' : 'light'); setReady(true); };
    refresh(); system.addEventListener('change', refresh); window.addEventListener('storage', refresh);
    return () => { system.removeEventListener('change', refresh); window.removeEventListener('storage', refresh); };
  }, []);
  const toggle = () => { const next = mode === 'light' ? 'dark' : 'light'; setMode(next); try { localStorage.setItem('uksein_site_theme', next); } catch {} };
  return <SiteTheme.Provider value={{ mode, toggle, ready }}><div className={admin ? undefined : 'storefront-surface'} data-site-theme={admin ? undefined : mode}>{children}</div></SiteTheme.Provider>;
}
export function StorefrontThemeToggle() {
  const theme = useContext(SiteTheme); const { t } = useLanguage();
  // Preserve the server's button while the provider is mounting or refreshing.
  const mode = theme?.mode ?? 'light';
  const label = t(mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
  return <button className="site-theme-toggle" type="button" disabled={!theme?.ready} aria-label={label} title={label} onClick={theme?.toggle}>{mode === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button>;
}
