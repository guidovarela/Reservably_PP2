import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark'
interface Ctx { theme: Theme; toggle: () => void; setTheme: (t: Theme) => void }
const ThemeContext = createContext<Ctx | undefined>(undefined)
const KEY = 'barberia-theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light'
    const stored = localStorage.getItem(KEY) as Theme | null
    if (stored) return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(KEY, theme)
  }, [theme])

  return (
    <ThemeContext.Provider
      value={{ theme, toggle: () => setThemeState((t) => (t === 'light' ? 'dark' : 'light')), setTheme: setThemeState }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme dentro de ThemeProvider')
  return ctx
}