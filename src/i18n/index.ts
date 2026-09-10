import { en } from './en';
import { fr } from './fr';
import type { Content } from './types';
import type { Locale } from './routes';

const DICTS: Record<Locale, Content> = { en, fr };

export function useTranslations(locale: Locale): Content {
  return DICTS[locale];
}

export * from './routes';
export type { Content } from './types';
