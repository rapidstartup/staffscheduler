import { useTheme } from '../contexts/ThemeContext'
import { Sun, Moon } from 'lucide-react'

// ... (previous imports and code)

export default function Navigation() {
  const { theme, toggleTheme } = useTheme()
  
  // ... (previous code)

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg">
      {/* ... (previous navigation items) */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </button>
      {/* ... (rest of the navigation) */}
    </nav>
  )
}

