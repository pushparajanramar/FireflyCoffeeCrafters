"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "@/components/icons"

export function LogoComposingDebugger() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [testImageUrl, setTestImageUrl] = useState("")
  const [testLogoUrl, setTestLogoUrl] = useState("https://sbux-logo.s3.us-east-2.amazonaws.com/Starbucks_Corporation_Logo_.png")

  const runTest = async (action: string, params: any = {}) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/debug/logo-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, ...params }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || "Test failed")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Logo Compositing Debugger</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => runTest("test_basic_generation")}
              disabled={loading}
              variant="outline"
            >
              Test Basic Generation
            </Button>
            
            <Button
              onClick={() => runTest("test_prompt_enhancement")}
              disabled={loading}
              variant="outline"
            >
              Test Prompt-Based Logo
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="testImageUrl">Test Image URL (for ID extraction)</Label>
            <div className="flex gap-2">
              <Input
                id="testImageUrl"
                value={testImageUrl}
                onChange={(e) => setTestImageUrl(e.target.value)}
                placeholder="Paste Firefly image URL here"
              />
              <Button
                onClick={() => runTest("test_url_extraction", { imageUrl: testImageUrl })}
                disabled={loading || !testImageUrl}
                variant="outline"
              >
                Extract ID
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="testLogoUrl">Logo URL</Label>
            <div className="flex gap-2">
              <Input
                id="testLogoUrl"
                value={testLogoUrl}
                onChange={(e) => setTestLogoUrl(e.target.value)}
                placeholder="Logo URL"
              />
              <Button
                onClick={() => runTest("test_logo_upload", { logoUrl: testLogoUrl })}
                disabled={loading || !testLogoUrl}
                variant="outline"
              >
                Upload Logo
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Button
              onClick={() => runTest("test_drink_config", { logoUrl: testLogoUrl })}
              disabled={loading}
              className="w-full"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Test Full Drink Generation with Logo
            </Button>
            
            <Button
              onClick={async () => {
                setLoading(true)
                setError(null)
                setResult(null)
                
                try {
                  const response = await fetch("/api/test-logo", {
                    method: "POST",
                  })
                  
                  const data = await response.json()
                  
                  if (response.ok) {
                    setResult(data)
                  } else {
                    setError(data.error || "Test failed")
                  }
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Network error")
                } finally {
                  setLoading(false)
                }
              }}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Quick Logo Test (Simple Latte)
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700 font-medium">Error:</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {result && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm font-medium text-blue-800 mb-2">
                ✅ {result.message || "Test completed"}
              </p>
              
              {result.imageUrl && (
                <div className="mb-3">
                  <p className="text-xs text-blue-600 mb-1">Generated Image:</p>
                  <img 
                    src={result.imageUrl} 
                    alt="Generated test image" 
                    className="max-w-xs rounded border"
                  />
                </div>
              )}
              
              {result.result && (
                <div className="mb-3">
                  <p className="text-xs text-blue-600 mb-1">Result URL:</p>
                  <p className="text-xs font-mono bg-white p-2 rounded border break-all">
                    {result.result}
                  </p>
                </div>
              )}

              <Textarea
                value={JSON.stringify(result, null, 2)}
                readOnly
                className="text-xs font-mono h-32"
                placeholder="Test results will appear here..."
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}