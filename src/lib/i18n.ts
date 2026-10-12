import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { zh } from '../locales/zh'

export const languageStorageKey = 'ee-language'
export type Language = 'en' | 'zh'
export function savedLanguage(): Language {
  try {
    return localStorage.getItem(languageStorageKey) === 'zh' ? 'zh' : 'en'
  } catch {
    return 'en'
  }
}
const en = {
  ...Object.fromEntries(Object.keys(zh).map((key) => [key, key])),
  Wood_material: 'Wood',
  Bamboo_material: 'Bamboo',
  items: '{{count}} items',
  items_one: '{{count}} item',
  items_other: '{{count}} items',
  essentials: '{{count}} essentials',
  essentials_one: '{{count}} essential',
  essentials_other: '{{count}} essentials',
}
// Chinese has a single plural form; English uses i18next's CLDR plural rules.
const chinese = {
  ...zh,
  items_one: zh.items,
  items_other: zh.items,
  essentials_one: zh.essentials,
  essentials_other: zh.essentials,
}

function updateDocument(language: string) {
  if (typeof document === 'undefined') return
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en'
  document.title = i18n.t('Daykind — Good things for everyday living')
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute(
      'content',
      i18n.t(
        'Thoughtful objects for your home, your rituals, and wherever the day takes you.',
      ),
    )
}
i18n.on('languageChanged', (language) => {
  updateDocument(language)
  try {
    localStorage.setItem(languageStorageKey, language)
  } catch {
    /* Language switching still works when storage is unavailable. */
  }
})
export const i18nReady = i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, zh: { translation: chinese } },
  lng: savedLanguage(),
  fallbackLng: 'en',
  supportedLngs: ['en', 'zh'],
  keySeparator: false,
  nsSeparator: false,
  interpolation: { escapeValue: false },
})
export default i18n

// Errors stay as canonical messages in state, so existing errors change language too.
export function translateMessage(message?: string) {
  if (!message) return ''
  return i18n.t(message, { defaultValue: message })
}
export function money(cents: number) {
  return new Intl.NumberFormat(i18n.language === 'zh' ? 'zh-CN' : 'en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}
export function formatDate(
  value: string,
  dateStyle: 'medium' | 'long' = 'medium',
) {
  return new Intl.DateTimeFormat(i18n.language === 'zh' ? 'zh-CN' : 'en-US', {
    dateStyle,
  }).format(new Date(value))
}
