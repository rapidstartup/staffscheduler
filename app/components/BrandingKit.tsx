'use client'

import { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function BrandingKit() {
  const { brandingOptions, updateBrandingOptions } = useTheme()
  const [localOptions, setLocalOptions] = useState(brandingOptions)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLocalOptions(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateBrandingOptions(localOptions)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Branding Kit</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="primaryColor">Primary Color</Label>
            <Input
              type="color"
              id="secondaryColor"
              name="secondaryColor"
              value={localOptions.secondaryColor}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="accentColor">Accent Color</La
              id="accentColor"
              name="accentColor"
              value={localOptions.accentColor}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="logo">Logo URL</Label>
            <Input
              type="text"
              id="logo"
              name="logo"
              value={localOptions.logo}
              onChange={handleChange}
            />
          </div>
          <Button type="submit">Update Branding</Button>
        </form>
      </CardContent>
    </Card>
  )
}

