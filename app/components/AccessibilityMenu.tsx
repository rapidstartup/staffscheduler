'use client'

import { useState, useEffect } from 'react'
import { Settings, X } from 'lucide-react'

export default function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [fontSize, setFontSize] = useState(16)
  const [highContrast, setHighContrast] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`
    document.body.classList.toggle('high-contrast', highContrast)
    document.body.classList.toggle('reduced-motion', reducedMotion)
  }, [fontSize, highContrast, reducedMotion])

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg"
        aria-label="Open accessibility menu"
      >
        <Settings size={24} />
      </button>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Accessibility Options</h2>
              <button onClick={() => setIsOpen(false)} aria-label="Close accessibility menu">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="font-size" className="block mb-2 font-medium">
                  Font Size: {fontSize}px
                </label>
                <input
                  id="font-size"
                  type="range"
                  min="12"
                  max="24"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={highContrast}
                    onChange={(e) => setHighContrast(e.target.checked)}
                    className="mr-2"
                  />
                  High Contrast
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={reducedMotion}
                    onChange={(e) => setReducedMotion(e.target.checked)}
                    className="mr-2"
                  />
                  Reduced Motion
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

