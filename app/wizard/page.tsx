"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NutritionBox } from "@/components/builder/nutrition-box"
// Nutrition calculation logic copied from builder page
function calculateNutrition(config: any) {
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
  if (config.syrups && config.syrups.length > 0) {
    for (const s of config.syrups) {
      calories += s.pumps * 20; carbs += s.pumps * 5;
    }
  }
  if (config.toppings && config.toppings.length > 0) {
    for (const t of config.toppings) {
      if (t === 'Whipped Cream') { calories += 15; fat += 1; carbs += 1; }
      else if (t === 'Caramel Drizzle') { calories += 10; carbs += 2; }
    }
  }
  return { calories, protein, fat, carbs };
}
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Coffee, Heart, Download, Copy, RotateCcw, Check, DollarSign, Award, Sparkles, Loader2 } from "@/components/icons"

export default function WizardPage() {
  const router = useRouter()
  const [drinkConfig, setDrinkConfig] = useState<any>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [priceBreakdown, setPriceBreakdown] = useState<any>(null)
  const [aiInsights, setAiInsights] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [variantIndex, setVariantIndex] = useState(0)
  const [preferences, setPreferences] = useState({
    aroma: "",
    flavor: "",
    acidity: "",
    body: "",
    aftertaste: "",
  })
  const [isPrefSaving, setIsPrefSaving] = useState(false)

  useEffect(() => {
    generateAIRecommendation()
    // Load preferences for UI
    const loadPrefs = async () => {
      try {
        const res = await fetch('/api/preferences')
        if (res.ok) {
          const data = await res.json()
          if (data) {
            setPreferences({
              aroma: data.aroma_preference || '',
              flavor: data.flavor_preference || '',
              acidity: data.acidity_preference || '',
              body: data.body_preference || '',
              aftertaste: data.aftertaste_preference || '',
            })
          }
        }
      } catch (err) {
        console.error('Error loading preferences', err)
      }
    }
    loadPrefs()
  }, [])

  const generateAIRecommendation = async (index?: number) => {
    setIsLoading(true)
    try {
      const body: any = {}
      if (typeof index === "number") body.variantIndex = index
      else body.variantIndex = variantIndex

      const response = await fetch("/api/wizard/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || "Failed to generate recommendation")
        router.push("/admin")
        return
      }

      const data = await response.json()
  setDrinkConfig(data.drinkConfig)
      setPriceBreakdown(data.pricing)
      setAiInsights(data.aiInsights)

  // Update variantIndex from server response (keeps client/server in sync)
  if (typeof data.variantIndex === 'number') setVariantIndex(Number(data.variantIndex))

      // Save to localStorage for potential navigation
      localStorage.setItem("currentDrink", JSON.stringify(data.drinkConfig))
    } catch (error) {
      console.error("[v0] Error generating AI recommendation:", error)
      alert("Failed to generate recommendation. Please try again.")
      router.push("/admin")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGeneratePreview = async (enableLogo: boolean = true) => {
    if (!drinkConfig) return

    setIsGeneratingImage(true)
    try {
      const response = await fetch("/api/generate-preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          config: drinkConfig,
          enableLogo 
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setImageUrl(data.imageUrl)
        localStorage.setItem("currentDrinkImage", data.imageUrl)
      } else {
        const errorData = await response.json()
        console.error("[v0] Error generating preview:", errorData.error)
      }
    } catch (error) {
      console.error("[v0] Error generating preview:", error)
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const handleSave = async () => {
    if (!drinkConfig) return

    try {
      const response = await fetch("/api/drinks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: drinkConfig.name || "AI Crafted Coffee",
          config: drinkConfig,
          imageUrl: imageUrl,
        }),
      })

      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error("[v0] Error saving drink:", error)
    }
  }

  const handleCopy = () => {
    if (!drinkConfig) return

    const text = `${drinkConfig.name || "AI Crafted Coffee"}
Base: ${drinkConfig.base}
Size: ${drinkConfig.size}
Milk: ${drinkConfig.milk}
Syrups: ${drinkConfig.syrups?.map((s: any) => `${s.name} (${s.pumps} pumps)`).join(", ") || "None"}
Toppings: ${drinkConfig.toppings?.join(", ") || "None"}
Temperature: ${drinkConfig.temperature}
Sweetness: ${drinkConfig.sweetness}
Ice: ${drinkConfig.ice}`

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = async () => {
    if (!imageUrl) return

    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = blobUrl
      link.download = `${drinkConfig?.name || "ai-crafted-coffee"}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error("[v0] Error downloading image:", error)
      window.open(imageUrl, "_blank")
    }
  }

  const handleRegenerate = () => {
    setImageUrl(null)
    setDrinkConfig(null)
    setPriceBreakdown(null)
    setAiInsights(null)
    // Increment variant index to get the next-best match
    const next = variantIndex + 1
    setVariantIndex(next)
    generateAIRecommendation(next)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-page-background to-page-background-secondary flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-brand-primary mx-auto" />
          <p className="text-brand-text-muted">Crafting your perfect coffee with AI...</p>
        </div>
      </div>
    )
  }

  if (!drinkConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-page-background to-page-background-secondary flex items-center justify-center">
        <div className="text-center">
          <p className="text-brand-text-muted mb-4">Unable to generate recommendation</p>
          <Link href="/admin">
            <Button className="bg-brand-primary hover:bg-brand-primary-hover text-foreground">Go to Admin</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-page-background to-page-background-secondary py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="h-8 w-8 text-brand-primary" />
              <h2 className="text-4xl font-bold text-brand-text">AI Crafted Coffee</h2>
            </div>
            <p className="text-brand-text-muted">Personalized just for you based on your preferences</p>
          </div>

          {aiInsights && (
            <Card className="mb-8 border-brand-primary/20 bg-brand-primary/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-brand-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-brand-text font-semibold mb-2">AI Insights</p>
                    <p className="text-brand-text-muted text-sm">{aiInsights.reasoning}</p>
                    <div className="flex gap-4 mt-3 text-xs text-brand-text-muted">
                      <span>Base Match: {(aiInsights.baseScore * 100).toFixed(0)}%</span>
                      <span>Milk Match: {(aiInsights.milkScore * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preferences card moved here from Admin */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Coffee Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pref-aroma">Aroma</Label>
                  <Textarea id="pref-aroma" rows={2} value={preferences.aroma} onChange={(e) => setPreferences((p) => ({ ...p, aroma: e.target.value }))} placeholder="Describe aroma..." />
                  <p className="text-xs text-muted-foreground">Hints: floral, citrus, nutty, caramel, chocolate</p>
                </div>
                <div>
                  <Label htmlFor="pref-flavor">Flavor</Label>
                  <Textarea id="pref-flavor" rows={2} value={preferences.flavor} onChange={(e) => setPreferences((p) => ({ ...p, flavor: e.target.value }))} placeholder="Describe flavor..." />
                  <p className="text-xs text-muted-foreground">Hints: chocolate, caramel, berry, toffee, spice</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pref-acidity">Acidity</Label>
                    <Textarea id="pref-acidity" rows={2} value={preferences.acidity} onChange={(e) => setPreferences((p) => ({ ...p, acidity: e.target.value }))} placeholder="Describe acidity..." />
                    <p className="text-xs text-muted-foreground">Hints: bright, citrusy, mild, low, winey</p>
                  </div>
                  <div>
                    <Label htmlFor="pref-body">Body</Label>
                    <Textarea id="pref-body" rows={2} value={preferences.body} onChange={(e) => setPreferences((p) => ({ ...p, body: e.target.value }))} placeholder="Describe body..." />
                    <p className="text-xs text-muted-foreground">Hints: light, medium, full, creamy, silky</p>
                  </div>
                </div>
                <div>
                  <Label htmlFor="pref-aftertaste">Aftertaste</Label>
                  <Textarea id="pref-aftertaste" rows={2} value={preferences.aftertaste} onChange={(e) => setPreferences((p) => ({ ...p, aftertaste: e.target.value }))} placeholder="Describe aftertaste..." />
                  <p className="text-xs text-muted-foreground">Hints: clean finish, lingering chocolate, sweet finish, dry finish</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      setIsPrefSaving(true)
                      try {
                        const res = await fetch('/api/preferences', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            aroma: preferences.aroma,
                            flavor: preferences.flavor,
                            acidity: preferences.acidity,
                            body: preferences.body,
                            aftertaste: preferences.aftertaste,
                          }),
                        })
                        if (res.ok) {
                          // Trigger rerank/generate with updated preferences
                          await generateAIRecommendation()
                          // Always regenerate preview after rerank so the user sees updated image
                          await handleGeneratePreview()
                        } else {
                          const err = await res.json()
                          alert(err.error || 'Failed to save preferences')
                        }
                      } catch (err) {
                        console.error('Error saving preferences', err)
                        alert('Error saving preferences')
                      } finally {
                        setIsPrefSaving(false)
                      }
                    }}
                    disabled={isPrefSaving}
                    className="bg-brand-primary hover:bg-brand-primary-hover text-foreground"
                  >
                    {isPrefSaving ? 'Saving…' : 'Save Preferences & Rerank'}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      // reset to last AI suggestion preferences => re-run generate
                      generateAIRecommendation()
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Drink Image */}
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="aspect-square bg-gradient-to-br from-page-background to-page-background-secondary rounded-lg overflow-hidden mb-4">
                  {imageUrl ? (
                    <img
                      src={imageUrl || "/placeholder.svg"}
                      alt={drinkConfig.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-text-muted">
                      <Coffee className="h-24 w-24" />
                    </div>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-brand-text text-center mb-4">
                  {drinkConfig.name || "AI Crafted Coffee"}
                </h3>
                <div className="flex flex-col gap-3">
                  {/* Only show Preview Image button */}
                  <Button
                    variant="secondary"
                    onClick={() => handleGeneratePreview(true)}
                    disabled={isGeneratingImage}
                    className="w-full"
                  >
                    {isGeneratingImage ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Preview...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Preview Image
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Drink Details */}

            <div className="space-y-6">
              <Card className="border-border">
                <CardHeader className="flex items-center justify-between">
                  <CardTitle className="text-xl text-brand-text">Recipe Details</CardTitle>
                  <div>
                    <Button size="sm" variant="outline" onClick={handleRegenerate} className="ml-2">
                      Regenerate Recipe
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-brand-text-muted mb-1">Base</p>
                      <p className="font-semibold text-brand-text">{drinkConfig.base}</p>
                    </div>
                    <div>
                      <p className="text-sm text-brand-text-muted mb-1">Size</p>
                      <p className="font-semibold text-brand-text">{drinkConfig.size}</p>
                    </div>
                    <div>
                      <p className="text-sm text-brand-text-muted mb-1">Milk</p>
                      <p className="font-semibold text-brand-text">{drinkConfig.milk}</p>
                    </div>
                    <div>
                      <p className="text-sm text-brand-text-muted mb-1">Temperature</p>
                      <p className="font-semibold text-brand-text">{drinkConfig.temperature}</p>
                    </div>
                  </div>

                  {drinkConfig.syrups && drinkConfig.syrups.length > 0 && (
                    <div>
                      <p className="text-sm text-brand-text-muted mb-2">Syrups</p>
                      <div className="space-y-1">
                        {drinkConfig.syrups.map((syrup: any, index: number) => (
                          <p key={index} className="text-brand-text">
                            {syrup.name} - {syrup.pumps} pump{syrup.pumps > 1 ? "s" : ""}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {drinkConfig.toppings && drinkConfig.toppings.length > 0 && (
                    <div>
                      <p className="text-sm text-brand-text-muted mb-2">Toppings</p>
                      <p className="text-brand-text">{drinkConfig.toppings.join(", ")}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <p className="text-sm text-brand-text-muted mb-1">Sweetness</p>
                      <p className="font-semibold text-brand-text capitalize">{drinkConfig.sweetness}</p>
                    </div>
                    <div>
                      <p className="text-sm text-brand-text-muted mb-1">Ice</p>
                      <p className="font-semibold text-brand-text capitalize">{drinkConfig.ice}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Nutrition Info Below Recipe Details */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-xl text-brand-text">Nutrition Facts</CardTitle>
                </CardHeader>
                <CardContent>
                  {drinkConfig && (
                    (() => {
                      const nutrition = calculateNutrition(drinkConfig);
                      return (
                        <NutritionBox calorieCount={nutrition.calories} proteinGrams={nutrition.protein} fatGrams={nutrition.fat} carbsGrams={nutrition.carbs} />
                      );
                    })()
                  )}
                </CardContent>
              </Card>

              {priceBreakdown && (
                <Card className="border-border bg-brand-primary/5">
                  <CardHeader>
                    <CardTitle className="text-xl text-brand-text flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      {priceBreakdown.base > 0 && (
                        <div className="flex justify-between">
                          <span className="text-brand-text-muted">Base</span>
                          <span className="text-brand-text">${priceBreakdown.base.toFixed(2)}</span>
                        </div>
                      )}
                      {priceBreakdown.size > 0 && (
                        <div className="flex justify-between">
                          <span className="text-brand-text-muted">Size</span>
                          <span className="text-brand-text">+${priceBreakdown.size.toFixed(2)}</span>
                        </div>
                      )}
                      {priceBreakdown.milk > 0 && (
                        <div className="flex justify-between">
                          <span className="text-brand-text-muted">Milk</span>
                          <span className="text-brand-text">+${priceBreakdown.milk.toFixed(2)}</span>
                        </div>
                      )}
                      {priceBreakdown.syrups > 0 && (
                        <div className="flex justify-between">
                          <span className="text-brand-text-muted">Syrups</span>
                          <span className="text-brand-text">+${priceBreakdown.syrups.toFixed(2)}</span>
                        </div>
                      )}
                      {priceBreakdown.toppings > 0 && (
                        <div className="flex justify-between">
                          <span className="text-brand-text-muted">Toppings</span>
                          <span className="text-brand-text">+${priceBreakdown.toppings.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    <Separator className="bg-border" />

                    <div className="flex justify-between items-center">
                      <span className="text-brand-text font-bold text-lg">Total Price</span>
                      <span className="text-brand-primary font-bold text-2xl">${priceBreakdown.total.toFixed(2)}</span>
                    </div>

                    {priceBreakdown.loyaltyPoints?.total > 0 && (
                      <>
                        <Separator className="bg-border my-4" />
                        <div className="bg-brand-primary/10 rounded-lg p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <Award className="h-6 w-6 text-brand-primary" />
                            <div>
                              <p className="text-brand-text font-semibold">Loyalty Points Earned</p>
                              <p className="text-xs text-brand-text-muted">2 points per dollar</p>
                            </div>
                          </div>

                          <div className="space-y-1.5 text-sm">
                            {priceBreakdown.loyaltyPoints.base > 0 && (
                              <div className="flex justify-between">
                                <span className="text-brand-text-muted">Base</span>
                                <span className="text-brand-text font-medium">
                                  {priceBreakdown.loyaltyPoints.base} pts
                                </span>
                              </div>
                            )}
                            {priceBreakdown.loyaltyPoints.size > 0 && (
                              <div className="flex justify-between">
                                <span className="text-brand-text-muted">Size</span>
                                <span className="text-brand-text font-medium">
                                  +{priceBreakdown.loyaltyPoints.size} pts
                                </span>
                              </div>
                            )}
                            {priceBreakdown.loyaltyPoints.milk > 0 && (
                              <div className="flex justify-between">
                                <span className="text-brand-text-muted">Milk</span>
                                <span className="text-brand-text font-medium">
                                  +{priceBreakdown.loyaltyPoints.milk} pts
                                </span>
                              </div>
                            )}
                            {priceBreakdown.loyaltyPoints.syrups > 0 && (
                              <div className="flex justify-between">
                                <span className="text-brand-text-muted">Syrups</span>
                                <span className="text-brand-text font-medium">
                                  +{priceBreakdown.loyaltyPoints.syrups} pts
                                </span>
                              </div>
                            )}
                            {priceBreakdown.loyaltyPoints.toppings > 0 && (
                              <div className="flex justify-between">
                                <span className="text-brand-text-muted">Toppings</span>
                                <span className="text-brand-text font-medium">
                                  +{priceBreakdown.loyaltyPoints.toppings} pts
                                </span>
                              </div>
                            )}
                          </div>

                          <Separator className="bg-border/50" />

                          <div className="flex items-center justify-between">
                            <span className="text-brand-text font-bold">Total Points</span>
                            <span className="text-brand-primary font-bold text-2xl">
                              {priceBreakdown.loyaltyPoints.total}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={handleSave}
                  className="w-full bg-brand-primary hover:bg-brand-primary-hover text-foreground"
                >
                  {saved ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Saved to Favorites!
                    </>
                  ) : (
                    <>
                      <Heart className="mr-2 h-4 w-4" />
                      Save to Favorites
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleRegenerate}
                  variant="outline"
                  className="w-full border-border text-brand-text-muted bg-transparent"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Generate New Recommendation
                </Button>
                <Link href="/builder" className="block">
                  <Button variant="ghost" className="w-full text-brand-text-muted hover:bg-muted">
                    Customize Manually
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
