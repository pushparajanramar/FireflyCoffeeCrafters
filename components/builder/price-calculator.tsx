"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DollarSign, Award } from "@/components/icons"
import type { DrinkConfig } from "@/app/builder/page"

interface LoyaltyPointsBreakdown {
  base: number
  size: number
  milk: number
  syrups: number
  toppings: number
  total: number
}

interface PriceBreakdown {
  base: number
  size: number
  milk: number
  syrups: number
  toppings: number
  total: number
  loyaltyPoints: LoyaltyPointsBreakdown
}

interface PriceCalculatorProps {
  config: DrinkConfig
  renderExtras?: (data: { loyaltyPoints: LoyaltyPointsBreakdown; priceBreakdown: PriceBreakdown }) => React.ReactNode
}

export function PriceCalculator({ config, renderExtras }: PriceCalculatorProps) {
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown>({
    base: 0,
    size: 0,
    milk: 0,
    syrups: 0,
    toppings: 0,
    total: 0,
    loyaltyPoints: {
      base: 0,
      size: 0,
      milk: 0,
      syrups: 0,
      toppings: 0,
      total: 0,
    },
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const calculatePrice = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/calculate-price", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(config),
        })

        if (response.ok) {
          const data = await response.json()
          setPriceBreakdown(data)
        }
      } catch (error) {
        console.error("[v0] Error calculating price:", error)
      } finally {
        setLoading(false)
      }
    }

    // Only calculate if we have at least a base selected
    if (config.base) {
      calculatePrice()
    }
  }, [config])

  // If no base selected yet, show a placeholder so the Price area is visible
  if (!config.base) {
    return (
      <div className="flex flex-row gap-4 w-full">
  <Card className="border-border bg-sb-light-green flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-brand-text flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Price Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-brand-text-muted">Select a base to see pricing details.</div>
          </CardContent>
        </Card>
        {/* Render extras (calories, loyalty, etc) if provided */}
        {renderExtras && renderExtras({ loyaltyPoints: priceBreakdown.loyaltyPoints, priceBreakdown })}
      </div>
    )
  }

  return (
    <div className="flex flex-row gap-4 w-full">
      {/* Price Box */}
  <Card className="border-border bg-sb-light-green flex-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-brand-text flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Price Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="text-sm text-brand-text-muted">Calculating...</div>
          ) : (
            <>
              <div className="space-y-2 text-sm">
                {/* Always show base price (may be $0.00 if not configured) */}
                <div className="flex justify-between">
                  <span className="text-brand-text-muted">Base ({config.base})</span>
                  <span className="text-brand-text font-medium">${priceBreakdown.base.toFixed(2)}</span>
                </div>
                {priceBreakdown.size > 0 && (
                  <div className="flex justify-between">
                    <span className="text-brand-text-muted">Size ({config.size})</span>
                    <span className="text-brand-text font-medium">+${priceBreakdown.size.toFixed(2)}</span>
                  </div>
                )}
                {priceBreakdown.milk > 0 && (
                  <div className="flex justify-between">
                    <span className="text-brand-text-muted">Milk ({config.milk})</span>
                    <span className="text-brand-text font-medium">+${priceBreakdown.milk.toFixed(2)}</span>
                  </div>
                )}
                {priceBreakdown.syrups > 0 && (
                  <div className="flex justify-between">
                    <span className="text-brand-text-muted">
                      Syrups ({config.syrups.reduce((sum, s) => sum + s.pumps, 0)} pumps)
                    </span>
                    <span className="text-brand-text font-medium">+${priceBreakdown.syrups.toFixed(2)}</span>
                  </div>
                )}
                {priceBreakdown.toppings > 0 && (
                  <div className="flex justify-between">
                    <span className="text-brand-text-muted">Toppings ({config.toppings.length})</span>
                    <span className="text-brand-text font-medium">+${priceBreakdown.toppings.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <Separator className="bg-border" />

              <div className="flex justify-between items-center pt-1">
                <span className="text-brand-text font-semibold text-base">Total</span>
                <span className="text-brand-primary font-bold text-xl">${priceBreakdown.total.toFixed(2)}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      {/* Render extras (calories, loyalty, etc) if provided */}
      {renderExtras && renderExtras({ loyaltyPoints: priceBreakdown.loyaltyPoints, priceBreakdown })}
    </div>
  )
}
