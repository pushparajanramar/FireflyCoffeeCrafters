"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Check } from "@/components/icons"
import type { DrinkConfig } from "@/app/builder/page"

type Size = {
  id: string
  name: string
  volume_ml: number
}

export function SizeStep({
  config,
  updateConfig,
}: {
  config: DrinkConfig
  updateConfig: (updates: Partial<DrinkConfig>) => void
}) {
  const [sizes, setSizes] = useState<Size[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/options/sizes")
      .then((res) => res.json())
      .then((data) => {
        setSizes(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("[v0] Error fetching sizes:", err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="text-brand-text-muted">Loading sizes...</div>
  }

  return (
    <div className="space-y-4">
      <p className="text-white mb-6">Select your drink size</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {sizes.map((size) => {
          const isSelected = config.size === size.name
          return (
            <Card
              key={size.id}
              className={`p-6 cursor-pointer transition-all hover:shadow-md text-center bg-button-primary relative ${
                isSelected
                  ? "border-[3px] border-button-border"
                  : "border border-button-primary hover:border-button-border"
              }`}
              onClick={() => updateConfig({ size: size.name })}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white flex items-center justify-center">
                  <Check className="h-4 w-4 text-button-primary" strokeWidth={3} />
                </div>
              )}
              <h3 className="font-semibold mb-2 text-lg text-primary-foreground">{size.name}</h3>
              <p className="text-sm text-primary-foreground">{size.volume_ml}ml</p>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
