import React, { createContext, useContext, useState } from 'react';
import translations from './translations';

const LangContext = createContext();

// Obtiene el titulo segun idioma
export function getTitle(item, lang) {
  if (!item) return '—';
  if (lang === 'es') return item.title_es || item.movie_es || item.title || item.movie || '—';
  if (lang === 'ru') return item.title_ru || item.movie_ru || item.title || item.movie || '—';
  return item.title || item.movie || '—';
}

// Nombre de idioma segun idioma de interfaz
export function getLangName(langCode, uiLang) {
  const map = {
    ru: { ru: 'Русский', es: 'Ruso', en: 'Russian' },
    en: { ru: 'Английский', es: 'Inglés', en: 'English' },
    es: { ru: 'Испанский', es: 'Español', en: 'Spanish' },
  };
  return map[langCode]?.[uiLang] || langCode.toUpperCase();
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState('ru');
  const t = translations[lang];

  return (
    <LangContext.Provider value={{ lang, setLang, t, getTitle: (item) => getTitle(item, lang) }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
