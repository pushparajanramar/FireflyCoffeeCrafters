"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { PriceCalculator } from "./price-calculator"
import { Award } from "@/components/icons"
import { NutritionBox } from "./nutrition-box"



// Calculate total calories from config (stub, replace with real lookup)
function calculateCalories(config: DrinkConfig): number {
  // TODO: Replace with real DB lookup or API call
  let total = 0
  // Example: add up calories for each part if available
  // Replace with real calorie values from DB
  if (config.base) total += 50
  if (config.size) total += 20
  if (config.milk) total += 40
  if (config.syrups.length > 0) total += config.syrups.length * 30
  if (config.toppings.length > 0) total += config.toppings.length * 15
  if (config.temperature) total += 0
  if (config.ice) total += 0
  return total
}
import type { DrinkConfig } from "@/app/builder/page"

export function FinalizeStep({
  config,
  updateConfig,
}: {
  config: DrinkConfig
  updateConfig: (updates: Partial<DrinkConfig>) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="drink-name" className="text-brand-text font-semibold mb-3 block">
          Name Your Creation
        </Label>
        <Input
          id="drink-name"
          placeholder="e.g., Caramel Cloud Dream"
          value={config.name}
          onChange={(e) => updateConfig({ name: e.target.value })}
          className="border-input focus:border-ring"
        />
      </div>

      <Card className="p-6 bg-page-background border-border">
        <h3 className="font-semibold text-brand-text mb-4">Your Drink Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-brand-text-muted">Base:</span>
            <span className="text-brand-text font-medium">{config.base || "Not selected"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-text-muted">Size:</span>
            <span className="text-brand-text font-medium">{config.size || "Not selected"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-text-muted">Milk:</span>
            <span className="text-brand-text font-medium">{config.milk || "Not selected"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-text-muted">Syrups:</span>
            <span className="text-brand-text font-medium">
              {config.syrups.length > 0 ? config.syrups.map((s) => `${s.name} (${s.pumps})`).join(", ") : "None"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-text-muted">Toppings:</span>
            <span className="text-brand-text font-medium">
              {config.toppings.length > 0 ? config.toppings.join(", ") : "None"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-text-muted">Temperature:</span>
            <span className="text-brand-text font-medium">{config.temperature || "Not selected"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-text-muted">Sweetness:</span>
            <span className="text-brand-text font-medium capitalize">{config.sweetness}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-text-muted">Ice:</span>
            <span className="text-brand-text font-medium capitalize">{config.ice}</span>
          </div>
        </div>
      </Card>

      {/* Row with Price, Calorie, and Loyalty boxes */}
      <div className="flex flex-row gap-4 mt-4 w-full">
        {/* Price, Calorie, Loyalty Row */}
        <PriceCalculator
          config={config}
          renderExtras={({ loyaltyPoints }) => (
            <>
              {/* Nutrition Box */}
              <div className="flex-1 flex items-stretch">
                <NutritionBox calorieCount={calculateCalories(config)} />
              </div>
              {/* Loyalty Box */}
              <div className="flex-1 flex items-stretch">
                <Card className="flex flex-col items-center justify-center border-border bg-sb-light-green p-4 min-w-[120px]">
                  <Award className="h-6 w-6 text-brand-primary mb-1" />
                  <span className="text-brand-text font-semibold">Loyalty</span>
                  <span className="text-xl font-bold text-brand-primary">{loyaltyPoints?.total ?? 0}</span>
                  <span className="text-xs text-brand-text-muted">pts</span>
                </Card>
              </div>
            </>
          )}
        />
      </div>
    </div>
  )
}
