"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Check, Copy } from "@/components/icons"

export function FireflyLogoUploader({ onImageId }: { onImageId?: (id: string) => void }) {
  const [logoUrl, setLogoUrl] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const [imageId, setImageId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [defaultLogoUrl, setDefaultLogoUrl] = useState<string>("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Fetch default logo URL
    fetch("/api/admin/logo")
      .then(res => res.json())
      .then(data => {
        if (data.defaultLogoUrl) {
          setDefaultLogoUrl(data.defaultLogoUrl)
          setLogoUrl(data.defaultLogoUrl)
        }
      })
      .catch(console.error)
  }, [])

  const handleUploadFromUrl = async () => {
    if (!logoUrl.trim()) return
    setUploading(true)
    setError(null)
    setImageId(null)
    
    try {
      const response = await fetch("/api/admin/logo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ logoUrl: logoUrl.trim() }),
      })
      
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || "Upload failed")
        return
      }
      
      setImageId(data.imageId)
      if (onImageId) onImageId(data.imageId)
    } catch (err) {
      setError("Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const handleCopyImageId = async () => {
    if (imageId) {
      await navigator.clipboard.writeText(imageId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleUseDefault = () => {
    setLogoUrl(defaultLogoUrl)
    setError(null)
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Logo Management</CardTitle>
        <CardDescription>
          Upload your logo to Adobe Firefly for compositing onto generated drink images. 
          The system will automatically handle logo placement and compositing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="logoUrl">Logo Image URL</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="logoUrl"
                type="url"
                placeholder="https://example.com/logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={handleUseDefault}
                disabled={uploading}
                title="Use default Starbucks logo"
              >
                Default
              </Button>
            </div>
          </div>

          <Button 
            onClick={handleUploadFromUrl} 
            disabled={!logoUrl.trim() || uploading} 
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading to Firefly...
              </>
            ) : (
              "Upload Logo to Firefly"
            )}
          </Button>

          {imageId && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-800">✅ Upload Successful!</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyImageId}
                  className="text-green-700 hover:text-green-800"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied!" : "Copy ID"}
                </Button>
              </div>
              <div className="text-sm text-green-700 break-all font-mono bg-white p-2 rounded border">
                <strong>Firefly Image ID:</strong> {imageId}
              </div>
              <p className="text-xs text-green-600 mt-2">
                This logo will now be automatically composited onto all generated drink images.
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>Supported formats:</strong> PNG, JPG, GIF (PNG with transparency recommended)</p>
            <p><strong>Optimal size:</strong> 512x512px or larger, square aspect ratio</p>
            <p><strong>Note:</strong> Logo will be automatically positioned on the lower-right corner of cups</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
