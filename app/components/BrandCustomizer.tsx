'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export function BrandCustomizer() {
  const [primaryColor, setPrimaryColor] = useState('#0070f3')
  const [secondaryColor, setSecondaryColor] = useState('#f5f5f5')
  const { toast } = useToast()

  const applyBrandColors = () => {
    document.documentElement.style.setProperty('--primary', primaryColor)
    document.documentElement.style.setProperty('--secondary', secondaryColor)
    
    // In a real application, you would save these preferences to a database
    // associated with the organization or user account
    
    toast({
      title: "Brand colors updated",
      description: "Your custom brand colors have been applied.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand Customization</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label htmlFor="primary-color" className="block text-sm font-medium text-gray-700">
              Primary Color
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <Input
                type="color"
                id="primary-color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-16 p-1"
              />
              <Input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="ml-2 flex-1"
              />
            </div>
          </div>
          <div>
            <label htmlFor="secondary-color" className="block text-sm font-medium text-gray-700">
              Secondary Color
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <Input
                type="color"
                id="secondary-color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-16 p-1"
              />
              <Input
                type="text"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="ml-2 flex-1"
              />
            </div>
          </div>
          <Button onClick={applyBrandColors}>Apply Brand Colors</Button>
        </div>
      </CardContent>
    </Card>
  )
}

