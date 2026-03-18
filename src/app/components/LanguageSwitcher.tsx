"use client";

import { Select } from 'antd';
import React from 'react';
import { useI18n } from './I18nProvider';

export default function LanguageSwitcher() {
    // const P locale, setLocale, t} = useI18n(); 解釋如下：
    // 這行代碼使用了 JavaScript 的解構賦值語法，從 useI18n() 返回的對象中提取了三個屬性：locale、setLocale 和 t。
    // 1. locale：這是一個字符串，表示當前選擇的語言環境（例如 'zh-TW'、'en' 或 'ja'）。它用於確定應該顯示哪種語言的文本。
    // 2. setLocale：這是一個函數，用於更新 locale 的值。當用戶從下拉選單中選擇不同的語言時，會調用這個函數來改變當前的語言環境。
    // 3. t：這是一個函數，用於根據當前的 locale 返回對應語言的翻譯文本。你可以傳入一個鍵（例如 'common.language.zh'），t 函數會返回對應語言的翻譯（例如 '中文'）。

    // locale切換方式：當用戶從下拉選單中選擇不同的語言時，會觸發 onChange 事件，該事件會調用 setLocale 函數來更新當前的語言環境。這樣，整個應用程序就會根據新的 locale 重新渲染，顯示對應語言的文本。
    // 資料紀錄在 localStorage 中，並且會同步更新 <html lang> 屬性，以確保整個應用程序的語言環境一致。

    //useI18n 是一個自定義的 React Hook，提供了當前語言環境（locale）、更新語言環境的函數（setLocale）以及翻譯函數（t）。這些功能使得應用程序能夠根據用戶選擇的語言動態顯示對應的文本內容。
    //具體作用是提供一個語言切換器，讓用戶可以選擇不同的語言，並且根據選擇的語言動態更新應用程序中的文本內容。這樣可以提升用戶體驗，使得應用程序能夠支持多種語言，滿足不同地區用戶的需求。
  const { locale, setLocale, t } = useI18n();
  return (
    <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 1000 }}>
      <Select
        size="small"
        value={locale}
        style={{ width: 140 }}
        onChange={(val) => setLocale(val as any)}
        options={[
          { value: 'zh-TW', label: t('common.language.zh') },
          { value: 'en',    label: t('common.language.en') },
          { value: 'ja',    label: t('common.language.ja') },
        ]}
      />
    </div>
  );
}
