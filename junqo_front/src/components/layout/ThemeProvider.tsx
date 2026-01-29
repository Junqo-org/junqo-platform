/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, useMemo } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  resolvedTheme: "dark" | "light"
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme
    } catch {
      return defaultTheme
    }
  })
  
  const [systemTheme, setSystemTheme] = useState<"dark" | "light">(() => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  })

  // Compute resolved theme based on theme and systemTheme
  const resolvedTheme = useMemo(() => {
    if (theme === "system") {
      return systemTheme
    }
    return theme === "dark" ? "dark" : "light"
  }, [theme, systemTheme])

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    if (theme === "system") {
      const mql = window.matchMedia("(prefers-color-scheme: dark)")
      const currentSystemTheme = mql.matches ? "dark" : "light"

      if (systemTheme !== currentSystemTheme) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSystemTheme(currentSystemTheme)
      }

      root.classList.add(currentSystemTheme)

      const onChange = (e: MediaQueryListEvent) => {
        const next = e.matches ? "dark" : "light"
        root.classList.remove("light", "dark")
        root.classList.add(next)
        setSystemTheme(next)
      }

      mql.addEventListener("change", onChange)
      return () => {
        mql.removeEventListener("change", onChange)
      }
    }

    root.classList.add(theme)
  }, [theme, systemTheme])

  const value = {
    theme,
    resolvedTheme,
    setTheme: (theme: Theme) => {
      try {
        localStorage.setItem(storageKey, theme)
      } catch (e) {
        console.warn('Failed to save theme preference:', e)
      }
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}

