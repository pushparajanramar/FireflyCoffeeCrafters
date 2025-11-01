"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Coffee, Leaf, Droplet, IceCream, Flame, Check } from "@/components/icons"
import type { DrinkConfig } from "@/app/builder/page"

type Base = {
  id: string
  name: string
  description: string
  base_index?: number
}

const iconMap: Record<string, any> = {
  Coffee: Coffee,
  Tea: Leaf,
  Refresher: Droplet,
  Frappuccino: IceCream,
  "Hot Chocolate": Flame,
}

export function BaseStep({
  config,
  updateConfig,
}: {
  config: DrinkConfig
  updateConfig: (updates: Partial<DrinkConfig>) => void
}) {
  const [bases, setBases] = useState<Base[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/options/bases")
      .then((res) => res.json())
      .then((data) => {
        // Defensive: sort by base_index if present
        const sorted = Array.isArray(data)
          ? [...data].sort((a, b) => (a.base_index ?? 999) - (b.base_index ?? 999))
          : data
        setBases(sorted)
        setLoading(false)
      })
      .catch((err) => {
        console.error("[v0] Error fetching bases:", err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="text-brand-text-muted">Loading bases...</div>
  }

  return (
    <div className="space-y-2">
      <p className="text-brand-text font-medium mb-2 mt-0">Choose the foundation for your drink</p>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start bg-green">
        {bases.map((base) => {
          const Icon = iconMap[base.name] || Coffee
          const isSelected = config.base === base.name
          return (
            <Card
              key={base.id}
              className={`p-6 cursor-pointer transition-all relative ${isSelected ? "ring-4 ring-offset-2 ring-button-border" : "bg-green text-brand-primary-foreground"}`}
              onClick={() => updateConfig({ base: base.name })}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white flex items-center justify-center">
                  <Check className="h-4 w-4 text-button-primary" strokeWidth={3} />
                </div>
              )}
              <div className="flex items-start gap-4">
                <Icon className="h-8 w-8 flex-shrink-0 text-brand-primary-foreground" />
                <div>
                  <h3 className="font-semibold mb-1">{base.name}</h3>
                  <p className="text-sm">{base.description}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
