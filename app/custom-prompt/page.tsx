"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Sparkles } from "lucide-react"

export default function CustomPromptPage() {
  const [prompt, setPrompt] = useState("")
  const [negativePrompt, setNegativePrompt] = useState(
    "paper cup, cardboard sleeve, opaque cup, logo on cup, text on cup, branding on cup, dark background, black background, gray background, shadows",
  )
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/custom-generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, negativePrompt }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image")
      }

      setImageUrl(data.imageUrl)
    } catch (err) {
      console.error("[v0] Error generating image:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to generate image. Please try again."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-page-background to-page-background-secondary">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-brand-text mb-2">Custom Prompt Generator</h2>
            <p className="text-brand-text-muted">
              Enter your own prompts to generate custom drink images with the Starbucks logo
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-xl text-brand-text">Prompts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="prompt" className="text-brand-text">
                    Prompt
                  </Label>
                  <Textarea
                    id="prompt"
                    placeholder="A professional photograph of a Starbucks drink in a transparent cup..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="negativePrompt" className="text-brand-text">
                    Negative Prompt
                  </Label>
                  <Textarea
                    id="negativePrompt"
                    placeholder="paper cup, dark background..."
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <Button
                  className="w-full bg-brand-primary hover:bg-brand-primary-hover text-foreground"
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Image
                    </>
                  )}
                </Button>

                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/50 rounded-md">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preview Section */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-xl text-brand-text">Generated Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-white rounded-lg flex items-center justify-center overflow-hidden">
                  {loading ? (
                    <div className="text-center text-brand-text-muted">
                      <Loader2 className="h-12 w-12 mx-auto mb-2 animate-spin" />
                      <p className="text-sm">Generating image...</p>
                    </div>
                  ) : imageUrl ? (
                    <img
                      src={imageUrl || "/placeholder.svg"}
                      alt="Generated drink"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-brand-text-muted">
                      <Sparkles className="h-12 w-12 mx-auto mb-2" />
                      <p className="text-sm">Generated image will appear here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
