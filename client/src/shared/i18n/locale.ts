import { createContext, useContext } from 'react';

export type Locale = 'en' | 'ar';

export const LocaleContext = createContext<Locale>('en');

/** The locale is app-level state; this hook only reads it. */
export function useLocale(): Locale {
  return useContext(LocaleContext);
}

export function isRtl(locale: Locale): boolean {
  return locale === 'ar';
}
