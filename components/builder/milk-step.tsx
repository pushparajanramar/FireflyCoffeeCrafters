"use client"

import { useEffect, useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "@/components/icons"
import type { DrinkConfig } from "@/app/builder/page"

type Milk = {
  id: string
  name: string
  is_dairy_free: boolean
}

export function MilkStep({
  config,
  updateConfig,
}: {
  config: DrinkConfig
  updateConfig: (updates: Partial<DrinkConfig>) => void
}) {
  const [milks, setMilks] = useState<Milk[]>([])
  const [loading, setLoading] = useState(true)
  // Define high-protein milks for protein beverages
  // useMemo placed before any early returns so hooks order is consistent
  const highProteinMilks = useMemo(() => [
    "Oat Milk", "Soy Milk", "Whole Milk", "2% Milk", "Breve (Half & Half)", "Heavy Cream", "Half & Half"
  ], [])

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch all milks first
        const res = await fetch("/api/options/milks")
        const data = await res.json()

        // If a base is selected, fetch dependent allowed milks and filter
        if (config.base) {
          const depRes = await fetch(`/api/options/dependent?base=${encodeURIComponent(config.base)}`)
          if (depRes.ok) {
            const dep = await depRes.json()
            const allowed = new Set(dep.allowedMilks || [])
            // If allowed list is empty, fallback to all
            const filtered = (dep.allowedMilks && dep.allowedMilks.length > 0) ? data.filter((m: any) => allowed.has(m.name)) : data
            setMilks(filtered)
          } else {
            setMilks(data)
          }
        } else {
          setMilks(data)
        }
        setLoading(false)
      } catch (err) {
        console.error("[v0] Error fetching milks:", err)
        setLoading(false)
      }
    }
    load()
  }, [config.base])
  if (loading) {
    return <div className="text-brand-text-muted">Loading milk options...</div>
  }

  // Determine which milks are enabled based on base
  const isProteinBase = config.base === "Protein Beverages" || config.base === "Protein"
  const isMilkEnabled = (milkName: string) => {
    if (isProteinBase) return highProteinMilks.includes(milkName)
    // Add more base-specific constraints here if needed
    return true
  }

  return (
    <div className="space-y-4">
      <p className="text-white mb-6">Choose your milk preference</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {milks.map((milk) => {
          const isSelected = config.milk === milk.name
          const enabled = isMilkEnabled(milk.name)
          return (
            <Card
              key={milk.id}
              className={`p-6 transition-all hover:shadow-md relative ${
                enabled
                  ? "cursor-pointer bg-button-primary "
                  : "bg-muted text-brand-text-muted opacity-60 cursor-not-allowed"
              } ${
                isSelected && enabled
                  ? "border-[3px] border-button-border"
                  : "border border-button-primary hover:border-button-border"
              }`}
              onClick={() => enabled && updateConfig({ milk: milk.name })}
              tabIndex={enabled ? 0 : -1}
              aria-disabled={!enabled}
            >
              {isSelected && enabled && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white flex items-center justify-center">
                  <Check className="h-4 w-4 text-button-primary" strokeWidth={3} />
                </div>
              )}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-primary-foreground">{milk.name}</h3>
                {milk.is_dairy_free && (
                  <Badge variant="secondary" className="bg-success/20 text-success-foreground border-success">
                    Dairy Free
                  </Badge>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
