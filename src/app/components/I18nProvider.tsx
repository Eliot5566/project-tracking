"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import zhTW from '../../i18n/messages/zh-TW.json';
import en from '../../i18n/messages/en.json';
import ja from '../../i18n/messages/ja.json';

export type Locale = 'zh-TW' | 'en' | 'ja';

type Messages = Record<string, string>;

type I18nContextType = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextType | null>(null);

const allMessages: Record<Locale, Messages> = {
  'zh-TW': zhTW as Messages,
  en: en as Messages,
  ja: ja as Messages,
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('zh-TW');

  useEffect(() => {
    const saved = (typeof window !== 'undefined' && (localStorage.getItem('locale') as Locale)) || 'zh-TW';
    setLocaleState(saved);
  }, []);

  // 如果果有變更 locale，則同步更新 <html lang>
  // 設置語言同步到localstorage和<html lang> 
  const setLocale = (l: Locale) => {
    setLocaleState(l);
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', l);
      // 同步 <html lang>
      try {
        document.documentElement.lang = l;
      } catch {}
    }
  };

  // useMemo緩存t函數，避免每次渲染都重新創建
  const t = useMemo(() => {
    const messages = allMessages[locale] || allMessages['zh-TW'];
    return (key: string) => messages[key] ?? key;   
  }, [locale]);

  
  const value: I18nContextType = { locale, setLocale, t };
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
