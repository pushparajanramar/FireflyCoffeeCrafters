"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "@/components/icons"
import type { DrinkConfig } from "@/app/builder/page"

export function DrinkPreview({
  config,
  onImageGenerated,
}: {
  config: DrinkConfig
  onImageGenerated?: (url: string) => void
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [prompts, setPrompts] = useState<{ prompt: string; negativePrompt: string } | null>(null)

  const handleGeneratePreview = async (enableLogo: boolean = true) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/generate-preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          config,
          enableLogo,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate preview")
      }

      setImageUrl(data.imageUrl)
      if (data.prompt && data.negativePrompt) {
        setPrompts({ prompt: data.prompt, negativePrompt: data.negativePrompt })
      }
      if (onImageGenerated) {
        onImageGenerated(data.imageUrl)
      }
    } catch (err) {
      console.error("[v0] Error generating preview:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to generate preview. Please try again."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-xl text-brand-text">Live Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="w-full flex items-center justify-center">
          {/* responsive: full width on small screens, half width on md+ */}
          <div className="w-full md:w-1/2 aspect-square rounded-lg overflow-hidden flex items-center justify-center">
            {loading ? (
              <div className="text-center text-brand-text-muted">
                <Loader2 className="h-12 w-12 mx-auto mb-2 animate-spin" />
                <p className="text-sm">Generating preview...</p>
              </div>
            ) : imageUrl ? (
              <img src={imageUrl || "/placeholder.svg"} alt="Drink preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-brand-primary text-white flex items-center justify-center font-semibold">
                PLACEHOLDER
              </div>
            )}
          </div>
        </div>
        <div className="w-full flex items-center justify-center mt-4">
          <Button
            onClick={() => handleGeneratePreview(true)}
            disabled={loading}
            className="bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-all flex items-center gap-2"
            aria-label="Generate AI Preview with Logo"
          >
            <Sparkles className="h-5 w-5" />
            {loading ? "Generating..." : "Generate with Logo"}
          </Button>
        </div>
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/50 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
        {prompts && (
          <div className="space-y-3 p-3 bg-muted rounded-md text-xs">
            <div>
              <p className="font-semibold text-brand-text mb-1">Prompt:</p>
              <p className="text-brand-text-muted">{prompts.prompt}</p>
            </div>
            <div>
              <p className="font-semibold text-brand-text mb-1">Negative Prompt:</p>
              <p className="text-brand-text-muted">{prompts.negativePrompt}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
