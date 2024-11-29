'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface BrandingOptions {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  logo: string
}

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  brandingOptions: BrandingOptions
  updateBrandingOptions: (options: Partial<BrandingOptions>) => void
}

const defaultBrandingOptions: BrandingOptions = {
  primaryColor: '#3b82f6',
  secondaryColor: '#1e40af',
  accentColor: '#22c55e',
  logo: '/logo.svg',
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light')
  const [brandingOptions, setBrandingOptions] = useState<BrandingOptions>(defaultBrandingOptions)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme) {
      setTheme(savedTheme)
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark')
    }

    const savedBrandingOptions = localStorage.getItem('brandingOptions')
    if (savedBrandingOptions) {
      setBrandingOptions(JSON.parse(savedBrandingOptions))
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', brandingOptions.primaryColor)
    document.documentElement.style.setProperty('--color-secondary', brandingOptions.secondaryColor)
    document.documentElement.style.setProperty('--color-accent', brandingOptions.accentColor)
    localStorage.setItem('brandingOptions', JSON.stringify(brandingOptions))
  }, [brandingOptions])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  const updateBrandingOptions = (options: Partial<BrandingOptions>) => {
    setBrandingOptions(prevOptions => ({ ...prevOptions, ...options }))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, brandingOptions, updateBrandingOptions }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

