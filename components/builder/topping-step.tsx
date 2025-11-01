"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import type { DrinkConfig } from "@/app/builder/page"

type Topping = {
  id: string
  name: string
  type: string
}

export function ToppingStep({
  config,
  updateConfig,
}: {
  config: DrinkConfig
  updateConfig: (updates: Partial<DrinkConfig>) => void
}) {
  const [toppings, setToppings] = useState<Topping[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/options/toppings")
      .then((res) => res.json())
      .then((data) => {
        setToppings(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("[v0] Error fetching toppings:", err)
        setLoading(false)
      })
  }, [])

  const toggleTopping = (toppingName: string) => {
    const isSelected = config.toppings.includes(toppingName)
    if (isSelected) {
      updateConfig({
        toppings: config.toppings.filter((t) => t !== toppingName),
      })
    } else {
      updateConfig({
        toppings: [...config.toppings, toppingName],
      })
    }
  }

  if (loading) {
    return <div className="text-brand-text-muted">Loading toppings...</div>
  }

  return (
    <div className="space-y-4">
      <p className="text-white mb-6">Select toppings for your drink (optional)</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {toppings.map((topping) => {
          const isSelected = config.toppings.includes(topping.name)
          return (
            <Card
              key={topping.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-md relative bg-button-primary ${
                isSelected
                  ? "border-[3px] border-button-border"
                  : "border border-button-primary hover:border-button-border"
              }`}
              onClick={() => toggleTopping(topping.name)}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                  <Check className="h-3 w-3 text-button-primary" />
                </div>
              )}
              <h3 className="font-semibold text-sm mb-1 text-primary-foreground">{topping.name}</h3>
              <Badge variant="outline" className="text-xs border-primary-foreground text-primary-foreground">
                {topping.type}
              </Badge>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
