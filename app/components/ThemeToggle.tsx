'use client'

import { useTheme } from '../contexts/ThemeContext'
import { Button } from "@/components/ui/button"
import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </Button>
  )
}

