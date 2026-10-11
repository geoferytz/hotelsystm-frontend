import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Theme {
  name: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primaryPale: string;
  sidebarBg: string;
  sidebarHover: string;
  white?: string;
  offWhite?: string;
  borderColor?: string;
  textDark?: string;
  textMuted?: string;
}

export const THEMES: Record<string, Theme> = {
  navy: {
    name: 'Navy Blue',
    primary: '#10367D',
    primaryDark: '#0B2658',
    primaryLight: '#74B4D9',
    primaryPale: '#EBEBEB',
    sidebarBg: '#0B2658',
    sidebarHover: '#16418F',
    offWhite: '#EBEBEB',
    borderColor: '#d5dde8',
    textDark: '#16233f',
    textMuted: '#5a6b85',
  },
  green: {
    name: 'Royal Green',
    primary: '#1B6B3A',
    primaryDark: '#14532d',
    primaryLight: '#22874a',
    primaryPale: '#e8f5ee',
    sidebarBg: '#0d3b1f',
    sidebarHover: '#145230',
  },
  blue: {
    name: 'Ocean Blue',
    primary: '#1e40af',
    primaryDark: '#1e3a8a',
    primaryLight: '#2563eb',
    primaryPale: '#eff6ff',
    sidebarBg: '#1e3a8a',
    sidebarHover: '#1e40af',
  },
  purple: {
    name: 'Royal Purple',
    primary: '#7c3aed',
    primaryDark: '#6d28d9',
    primaryLight: '#8b5cf6',
    primaryPale: '#f5f3ff',
    sidebarBg: '#5b21b6',
    sidebarHover: '#6d28d9',
  },
  orange: {
    name: 'Sunset Orange',
    primary: '#ea580c',
    primaryDark: '#c2410c',
    primaryLight: '#f97316',
    primaryPale: '#fff7ed',
    sidebarBg: '#9a3412',
    sidebarHover: '#c2410c',
  },
  teal: {
    name: 'Teal',
    primary: '#0d9488',
    primaryDark: '#0f766e',
    primaryLight: '#14b8a6',
    primaryPale: '#f0fdfa',
    sidebarBg: '#115e59',
    sidebarHover: '#0f766e',
  },
  pink: {
    name: 'Rose Pink',
    primary: '#db2777',
    primaryDark: '#be185d',
    primaryLight: '#ec4899',
    primaryPale: '#fdf2f8',
    sidebarBg: '#9d174d',
    sidebarHover: '#be185d',
  },
  dark: {
    name: 'Dark Mode',
    primary: '#14b8a6',
    primaryDark: '#0f766e',
    primaryLight: '#2dd4bf',
    primaryPale: '#123332',
    sidebarBg: '#071918',
    sidebarHover: '#0f2f2d',
    white: '#111827',
    offWhite: '#020617',
    borderColor: '#24323f',
    textDark: '#e5e7eb',
    textMuted: '#9ca3af',
  },
};

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'hms_theme';
  private currentThemeSubject = new BehaviorSubject<string>('navy');

  constructor() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved && THEMES[saved]) {
      this.currentThemeSubject.next(saved);
    }
    this.applyTheme(this.currentThemeSubject.value);
  }

  get currentTheme() {
    return this.currentThemeSubject.value;
  }

  get currentTheme$() {
    return this.currentThemeSubject.asObservable();
  }

  get availableThemes() {
    return Object.values(THEMES);
  }

  setTheme(themeKey: string): void {
    if (THEMES[themeKey]) {
      this.currentThemeSubject.next(themeKey);
      localStorage.setItem(this.STORAGE_KEY, themeKey);
      this.applyTheme(themeKey);
    }
  }

  private applyTheme(themeKey: string): void {
    const theme = THEMES[themeKey];
    const root = document.documentElement;
    root.setAttribute('data-theme', themeKey);
    root.style.setProperty('--royal-green', theme.primary);
    root.style.setProperty('--royal-green-dark', theme.primaryDark);
    root.style.setProperty('--royal-green-light', theme.primaryLight);
    root.style.setProperty('--royal-green-pale', theme.primaryPale);
    root.style.setProperty('--sidebar-bg', theme.sidebarBg);
    root.style.setProperty('--sidebar-hover', theme.sidebarHover);
    root.style.setProperty('--white', theme.white || '#ffffff');
    root.style.setProperty('--off-white', theme.offWhite || '#EBEBEB');
    root.style.setProperty('--border-color', theme.borderColor || '#d5dde8');
    root.style.setProperty('--text-dark', theme.textDark || '#16233f');
    root.style.setProperty('--text-muted', theme.textMuted || '#5a6b85');
  }
}
