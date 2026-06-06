'use client'

import { useTheme } from 'next-themes'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Monitor, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export function AppearanceForm() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label className="text-base">Tema</Label>
        <p className="text-sm text-muted-foreground">
          Selecciona el tema para el panel de control.
        </p>
        <RadioGroup
          defaultValue={theme}
          onValueChange={(val) => setTheme(val)}
          className="grid max-w-md grid-cols-1 md:grid-cols-3 gap-4 pt-2"
        >
          <div>
            <RadioGroupItem value="light" id="light" className="peer sr-only" />
            <Label
              htmlFor="light"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
            >
              <Sun className="mb-3 h-6 w-6" />
              Claro
            </Label>
          </div>

          <div>
            <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
            <Label
              htmlFor="dark"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
            >
              <Moon className="mb-3 h-6 w-6" />
              Oscuro
            </Label>
          </div>

          <div>
            <RadioGroupItem value="system" id="system" className="peer sr-only" />
            <Label
              htmlFor="system"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
            >
              <Monitor className="mb-3 h-6 w-6" />
              Sistema
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  )
}
