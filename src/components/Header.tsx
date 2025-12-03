import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { Sun, Moon, Globe, ChevronDown, RefreshCw } from 'lucide-react'
import { useAppStore } from '../store'
import clsx from 'clsx'

interface Namespace {
  name: string
  status: string
}

export function Header() {
  const { t, i18n } = useTranslation()
  const namespace = useAppStore((state) => state.namespace)
  const setNamespace = useAppStore((state) => state.setNamespace)
  const theme = useAppStore((state) => state.theme)
  const setTheme = useAppStore((state) => state.setTheme)

  const [namespaces, setNamespaces] = useState<Namespace[]>([])
  const [showNsDropdown, setShowNsDropdown] = useState(false)
  const [showLangDropdown, setShowLangDropdown] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchNamespaces = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/namespaces')
      if (res.ok) {
        const data = await res.json()
        setNamespaces(data)
      }
    } catch (error) {
      console.error('Failed to fetch namespaces:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNamespaces()
  }, [])

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang)
    localStorage.setItem('language', lang)
    setShowLangDropdown(false)
  }

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]/95 backdrop-blur-xl px-6 shadow-sm">
      {/* Namespace Selector */}
      <div className="relative">
        <button
          onClick={() => setShowNsDropdown(!showNsDropdown)}
          className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-4 py-2 text-sm font-medium transition-all hover:border-emerald-500/50 hover:shadow-sm"
        >
          <span className="text-[var(--color-text-muted)]">{t('common.namespace')}:</span>
          <span className="text-emerald-500">{namespace}</span>
          <ChevronDown className="h-4 w-4 text-[var(--color-text-muted)]" />
        </button>

        {showNsDropdown && (
          <div className="absolute left-0 top-full mt-2 w-64 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] shadow-xl animate-fade-in overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] p-3">
              <span className="text-sm font-medium">{t('common.selectNamespace')}</span>
              <button
                onClick={fetchNamespaces}
                className="rounded p-1 hover:bg-[var(--color-bg-tertiary)] transition-colors"
                disabled={loading}
              >
                <RefreshCw className={clsx('h-4 w-4', loading && 'animate-spin')} />
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {namespaces.map((ns) => (
                <button
                  key={ns.name}
                  onClick={() => {
                    setNamespace(ns.name)
                    setShowNsDropdown(false)
                  }}
                  className={clsx(
                    'flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors',
                    namespace === ns.name
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'hover:bg-[var(--color-bg-tertiary)]'
                  )}
                >
                  <span className="font-mono">{ns.name}</span>
                  <span
                    className={clsx(
                      'text-xs px-2 py-0.5 rounded',
                      ns.status === 'Active'
                        ? 'bg-emerald-500/20 text-emerald-500'
                        : 'bg-yellow-500/20 text-yellow-500'
                    )}
                  >
                    {ns.status}
                  </span>
                </button>
              ))}
              {namespaces.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-[var(--color-text-muted)]">
                  {loading ? t('common.loading') : t('common.noData')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2">
        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setShowLangDropdown(!showLangDropdown)}
            className="flex items-center gap-2 rounded-lg p-2.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <Globe className="h-5 w-5" />
          </button>

          {showLangDropdown && (
            <div className="absolute right-0 top-full mt-2 w-40 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] shadow-xl animate-fade-in overflow-hidden">
              <button
                onClick={() => handleLanguageChange('en')}
                className={clsx(
                  'flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors',
                  i18n.language === 'en'
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'hover:bg-[var(--color-bg-tertiary)]'
                )}
              >
                🇺🇸 English
              </button>
              <button
                onClick={() => handleLanguageChange('zh')}
                className={clsx(
                  'flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors',
                  i18n.language === 'zh'
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'hover:bg-[var(--color-bg-tertiary)]'
                )}
              >
                🇨🇳 中文
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={handleThemeToggle}
          className="rounded-lg p-2.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>

      {/* Close dropdowns on outside click */}
      {(showNsDropdown || showLangDropdown) && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => {
            setShowNsDropdown(false)
            setShowLangDropdown(false)
          }}
        />
      )}
    </header>
  )
}
