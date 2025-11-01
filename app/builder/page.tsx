"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
    import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Loader2 } from "@/components/icons"
import { BaseStep } from "@/components/builder/base-step"
import { SizeStep } from "@/components/builder/size-step"
import { MilkStep } from "@/components/builder/milk-step"
import { SyrupStep } from "@/components/builder/syrup-step"
import { ToppingStep } from "@/components/builder/topping-step"
import { TemperatureStep } from "@/components/builder/temperature-step"
import { FinalizeStep } from "@/components/builder/finalize-step"
import { DrinkPreview } from "@/components/builder/drink-preview"
import { PriceCalculator } from "@/components/builder/price-calculator"
import { NutritionBox } from "@/components/builder/nutrition-box"
import { Card } from "@/components/ui/card"
import { Award } from "lucide-react"
// Calculate nutrition from config (stub, replace with real lookup)
function calculateNutrition(config: DrinkConfig) {
  // TODO: Replace with real DB lookup or API call
  let calories = 0, protein = 0, fat = 0, carbs = 0;
  if (config.base) {
    if (config.base === 'Protein Beverages') {
      calories += 130; protein += 10; fat += 2; carbs += 12;
    } else if (config.base === 'Hot Coffee') {
      calories += 5; protein += 1;
    } else if (config.base === 'Cold Coffee') {
      calories += 60; protein += 2; fat += 1; carbs += 10;
    } else if (config.base === 'Hot Tea' || config.base === 'Cold Tea') {
      calories += 0;
    } else if (config.base === 'Hot Chocolate') {
      calories += 190; protein += 6; fat += 4; carbs += 32;
    } else if (config.base === 'Refreshers') {
      calories += 80; carbs += 21;
    } else if (config.base === 'Frappuccino® Blended Beverage') {
      calories += 250; protein += 3; fat += 4; carbs += 50;
    }
  }
  if (config.size) calories += 20;
  if (config.milk) {
    if (config.milk === 'Whole Milk') { calories += 18; protein += 1; fat += 1; carbs += 1; }
    else if (config.milk === '2% Milk') { calories += 15; protein += 1; carbs += 1; }
    else if (config.milk === 'Nonfat Milk') { calories += 10; protein += 1; carbs += 1; }
    else if (config.milk === 'Oat Milk') { calories += 20; protein += 1; fat += 1; carbs += 2; }
    else if (config.milk === 'Almond Milk') { calories += 10; fat += 1; carbs += 1; }
    else if (config.milk === 'Coconut Milk') { calories += 12; fat += 1; carbs += 2; }
    else if (config.milk === 'Soy Milk') { calories += 15; protein += 1; fat += 1; carbs += 1; }
  }
  if (config.syrups.length > 0) {
    for (const s of config.syrups) {
      calories += s.pumps * 20; carbs += s.pumps * 5;
    }
  }
  if (config.toppings.length > 0) {
    for (const t of config.toppings) {
      if (t === 'Whipped Cream') { calories += 15; fat += 1; carbs += 1; }
      else if (t === 'Caramel Drizzle') { calories += 10; carbs += 2; }
    }
  }
  return { calories, protein, fat, carbs };
}
import { getDefaultsForCategory } from "@/lib/defaults"

export type DrinkConfig = {
  base?: string
  size?: string
  milk?: string
  syrups: Array<{ name: string; pumps: number }>
  toppings: string[]
  temperature?: string
  sweetness: string
  ice: string
  name: string
}

const steps = [
  { id: 1, title: "Base", component: BaseStep },
  { id: 2, title: "Size", component: SizeStep },
  { id: 3, title: "Milk", component: MilkStep },
  { id: 4, title: "Syrups", component: SyrupStep },
  { id: 5, title: "Toppings", component: ToppingStep },
  { id: 6, title: "Temperature", component: TemperatureStep },
  { id: 7, title: "Finalize", component: FinalizeStep },
]

export default function DrinkBuilder() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [drinkConfig, setDrinkConfig] = useState<DrinkConfig>({
    syrups: [],
    toppings: [],
    sweetness: "medium",
    ice: "none",
    name: "",
  })
  const [initialized, setInitialized] = useState(false)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [isFinishing, setIsFinishing] = useState(false)

  const progress = (currentStep / steps.length) * 100
  const CurrentStepComponent = steps[currentStep - 1].component

  // On mount, if subcategory param exists, set defaults
  useEffect(() => {
    if (!initialized) {
      const subcategory = searchParams.get("subcategory")
      let defaults = {};
      if (subcategory) {
        defaults = getDefaultsForCategory(subcategory) || {};
      } else {
        // Try to get category from search params or fallback to Coffee
        const category = searchParams.get("category") || "Coffee";
        defaults = getDefaultsForCategory(category) || {};
      }
      setDrinkConfig((prev) => ({
        ...prev,
        ...defaults,
      }))
      setInitialized(true)
    }
  }, [searchParams, initialized])

  // Auto-set temperature/ice based on base
  useEffect(() => {
    if (!drinkConfig.base) return;
    // Hot drinks
    if (["Hot Coffee", "Hot Tea", "Hot Chocolate", "Coffee", "Tea"].includes(drinkConfig.base)) {
      if (drinkConfig.temperature !== "Hot") {
        setDrinkConfig((prev) => ({ ...prev, temperature: "Hot", ice: "none" }))
      }
    }
    // Iced drinks
    if (["Cold Coffee", "Iced Coffee", "Cold Tea", "Refreshers", "Refresher"].includes(drinkConfig.base)) {
      if (drinkConfig.temperature !== "Iced") {
        setDrinkConfig((prev) => ({ ...prev, temperature: "Iced", ice: "regular" }))
      }
    }
    // Blended drinks
    if (["Frappuccino", "Frappuccino® Blended Beverage", "Blended Protein"].includes(drinkConfig.base)) {
      if (drinkConfig.temperature !== "Blended") {
        setDrinkConfig((prev) => ({ ...prev, temperature: "Blended", ice: "blended" }))
      }
    }
  }, [drinkConfig.base])

  const generateDrinkImage = async () => {
    try {
      const response = await fetch("/api/generate-preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(drinkConfig),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate preview")
      }

      return data.imageUrl
    } catch (err) {
      console.error("[v0] Error generating preview:", err)
      return null
    }
  }

  const handleNext = async () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsFinishing(true)
      localStorage.setItem("currentDrink", JSON.stringify(drinkConfig))
      
      // Generate image with logo compositing
      try {
        const response = await fetch("/api/generate-preview", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            config: drinkConfig,
            enableLogo: true 
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("currentDrinkImage", data.imageUrl);
        } else {
          console.error("[v0] Error generating final preview");
        }
      } catch (error) {
        console.error("[v0] Error generating final preview:", error);
      }
      
      setIsFinishing(false)
      router.push("/summary")
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateConfig = (updates: Partial<DrinkConfig>) => {
    setDrinkConfig((prev) => ({ ...prev, ...updates }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-page-background to-page-background-secondary">
      {/* Progress Bar */}
      <div className="container mx-auto px-4 py-4">
        <Progress value={progress} className="h-2" />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          {/* Top: Two columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start h-full">
            {/* Left: Builder Steps */}
            <Card className="border-border h-full min-h-[400px] flex-1 flex flex-col justify-start">
              <CardContent className="flex flex-col h-full justify-start">
                <CurrentStepComponent config={drinkConfig} updateConfig={updateConfig} />

                {/* Navigation Buttons with Title Centered (flex row, title absolutely centered) */}
                <div className="relative flex items-center mt-8 pt-6 border-t border-border min-h-[56px]">
                  <div className="flex-1 flex">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      disabled={currentStep === 1 || isFinishing}
                      className="border border-brand-primary text-brand-primary bg-white hover:bg-brand-primary/10 font-semibold px-6 py-2 rounded-lg shadow-sm transition-all flex items-center gap-2"
                      aria-label="Go Back"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                  </div>
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex justify-center pointer-events-none">
                    <span className="text-xl font-semibold text-brand-text text-center select-none">
                      {steps[currentStep - 1].title}
                    </span>
                  </div>
                  <div className="flex-1 flex justify-end">
                    <Button
                      onClick={handleNext}
                      disabled={isFinishing}
                      className="bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-all flex items-center gap-2"
                      aria-label={currentStep === steps.length ? "Finish" : "Next"}
                    >
                      {isFinishing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          {currentStep === steps.length ? "Finish" : "Next"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right: Preview and Nutrition grouped in Card, visually aligned */}
            <Card className="border-border h-full min-h-[400px] flex-1 flex flex-col items-center justify-start p-6 bg-card/80">
              <div className="w-full flex flex-col items-center justify-start gap-6">
                <div className="w-full flex items-center justify-center">
                  <div className="w-full max-w-xs md:max-w-sm">
                    <DrinkPreview config={drinkConfig} onImageGenerated={setGeneratedImageUrl} />
                  </div>
                </div>
                <div className="w-full flex items-center justify-center">
                  <div className="w-full max-w-xs md:max-w-sm">
                    {(() => {
                      const n = calculateNutrition(drinkConfig);
                      return <NutritionBox calorieCount={n.calories} proteinGrams={n.protein} fatGrams={n.fat} carbsGrams={n.carbs} />;
                    })()}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Bottom: Row of Price and Loyalty, each 50% */}
          <div className="flex flex-col md:flex-row gap-4 w-full mt-4">
            <PriceCalculator
              config={drinkConfig}
              renderExtras={({ loyaltyPoints }) => (
                <div className="flex-1 min-w-[200px] flex flex-col items-center justify-center">
                  <Card className="flex flex-col items-center justify-center border-border bg-sb-light-green p-4 min-w-[120px] h-full w-full">
                    <Award className="h-6 w-6 text-brand-primary mb-1" />
                    <span className="text-brand-text font-semibold">Loyalty</span>
                    <span className="text-xl font-bold text-brand-primary">{loyaltyPoints.total}</span>
                    <span className="text-xs text-brand-text-muted">pts</span>
                    <div className="mt-2 text-xs text-brand-text-muted text-center">
                      {loyaltyPoints.base > 0 && <div>Base: +{loyaltyPoints.base}</div>}
                      {loyaltyPoints.size > 0 && <div>Size: +{loyaltyPoints.size}</div>}
                      {loyaltyPoints.milk > 0 && <div>Milk: +{loyaltyPoints.milk}</div>}
                      {loyaltyPoints.syrups > 0 && <div>Syrups: +{loyaltyPoints.syrups}</div>}
                      {loyaltyPoints.toppings > 0 && <div>Toppings: +{loyaltyPoints.toppings}</div>}
                    </div>
                  </Card>
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  )
}