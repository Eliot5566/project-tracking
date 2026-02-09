"use client";

import { Select } from 'antd';
import React from 'react';
import { useI18n } from './I18nProvider';

export default function LanguageSwitcher() {
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
          { value: 'en', label: t('common.language.en') },
          { value: 'ja', label: t('common.language.ja') },
        ]}
      />
    </div>
  );
}
