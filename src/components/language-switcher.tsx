import { useTranslation } from 'react-i18next'

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation()
  return (
    <label className="language-switcher">
      <span className="sr-only">{t('Language')}</span>
      <select
        value={i18n.resolvedLanguage === 'zh' ? 'zh' : 'en'}
        onChange={(event) => void i18n.changeLanguage(event.target.value)}
      >
        <option value="en" lang="en">
          EN
        </option>
        <option value="zh" lang="zh-CN">
          中文
        </option>
      </select>
    </label>
  )
}
