
"use client";
import { FireflyLogoUploader } from "@/components/admin/firefly-logo-uploader"
import { LogoComposingDebugger } from "@/components/admin/logo-composing-debugger"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles, Edit } from "@/components/icons"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"

export default function AdminPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTraining, setIsTraining] = useState(false)
  const [isEditing, setIsEditing] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [savedPreferences, setSavedPreferences] = useState<any>(null)
  const [hasBeenTrained, setHasBeenTrained] = useState(false)
  const [preferences, setPreferences] = useState({
    aroma: "",
    flavor: "",
    acidity: "",
    body: "",
    aftertaste: "",
  })
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isPreviewing, setIsPreviewing] = useState(false)

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch("/api/preferences")
        if (response.ok) {
          const data = await response.json()
          if (data) {
            setSavedPreferences(data)
            setPreferences({
              aroma: data.aroma_preference || "",
              flavor: data.flavor_preference || "",
              acidity: data.acidity_preference || "",
              body: data.body_preference || "",
              aftertaste: data.aftertaste_preference || "",
            })
            setIsEditing(false)
          }
        }
      } catch (error) {
        console.error("Error fetching preferences:", error)
      } finally {
        setIsLoading(false)
      }
    }

    const fetchTrainingStatus = async () => {
      try {
        const response = await fetch("/api/wizard/status")
        if (response.ok) {
          const data = await response.json()
          setHasBeenTrained(data.enabled)
        }
      } catch (error) {
        console.error("Error fetching training status:", error)
      }
    }

    fetchPreferences()
    fetchTrainingStatus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      })

      if (response.ok) {
        alert("Preferences saved successfully!")
        setSavedPreferences({
          aroma_preference: preferences.aroma,
          flavor_preference: preferences.flavor,
          acidity_preference: preferences.acidity,
          body_preference: preferences.body,
          aftertaste_preference: preferences.aftertaste,
        })
        setIsEditing(false)
      } else {
        alert("Failed to save preferences")
      }
    } catch (error) {
      console.error("Error saving preferences:", error)
      alert("Error saving preferences")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    if (savedPreferences) {
      setPreferences({
        aroma: savedPreferences.aroma_preference || "",
        flavor: savedPreferences.flavor_preference || "",
        acidity: savedPreferences.acidity_preference || "",
        body: savedPreferences.body_preference || "",
        aftertaste: savedPreferences.aftertaste_preference || "",
      })
    }
    setIsEditing(false)
  }

  const handleTrainIndex = async () => {
    setIsTraining(true)

    try {
      const response = await fetch("/api/train-index", {
        method: "POST",
      })

      if (response.ok) {
        alert("Index training completed successfully! The Coffee Wizard is now available.")
        setHasBeenTrained(true)
        router.refresh()
      } else {
        alert("Failed to train index")
      }
    } catch (error) {
      console.error("Error training index:", error)
      alert("Error training index")
    } finally {
      setIsTraining(false)
    }
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage coffee preferences and AI training</p>
        </div>

        <FireflyLogoUploader />
        
        <LogoComposingDebugger />
        
        <Card>
          <CardHeader>
            <CardTitle>Your Coffee Preferences</CardTitle>
            <CardDescription>Set canonical preference examples used for AI training and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="aroma">Aroma</Label>
                    <Textarea
                      id="aroma"
                      placeholder="e.g., floral, fruity, nutty, earthy"
                      value={preferences.aroma}
                      onChange={(e) => setPreferences({ ...preferences, aroma: e.target.value })}
                      required
                      rows={2}
                      readOnly={!isEditing}
                      className={!isEditing ? "bg-muted cursor-default" : ""}
                    />
                    <p className="text-xs text-muted-foreground">Hints: floral, citrus, nutty, caramel, chocolate</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="flavor">Flavor</Label>
                    <Textarea
                      id="flavor"
                      placeholder="e.g., chocolate, caramel, spicy, fruity"
                      value={preferences.flavor}
                      onChange={(e) => setPreferences({ ...preferences, flavor: e.target.value })}
                      required
                      rows={2}
                      readOnly={!isEditing}
                      className={!isEditing ? "bg-muted cursor-default" : ""}
                    />
                    <p className="text-xs text-muted-foreground">Hints: chocolate, caramel, berry, toffee, spice</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="acidity">Acidity</Label>
                    <Textarea
                      id="acidity"
                      placeholder="e.g., bright citrus, mild berry, low acidity"
                      value={preferences.acidity}
                      onChange={(e) => setPreferences({ ...preferences, acidity: e.target.value })}
                      required
                      rows={2}
                      readOnly={!isEditing}
                      className={!isEditing ? "bg-muted cursor-default" : ""}
                    />
                    <p className="text-xs text-muted-foreground">Hints: bright, citrusy, mild, low, winey</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="body">Body (Mouthfeel)</Label>
                    <Textarea
                      id="body"
                      placeholder="e.g., light and delicate, full and creamy"
                      value={preferences.body}
                      onChange={(e) => setPreferences({ ...preferences, body: e.target.value })}
                      required
                      rows={2}
                      readOnly={!isEditing}
                      className={!isEditing ? "bg-muted cursor-default" : ""}
                    />
                    <p className="text-xs text-muted-foreground">Hints: light, medium, full, creamy, silky</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aftertaste">Aftertaste (Finish)</Label>
                    <Textarea
                      id="aftertaste"
                      placeholder="e.g., long-lasting chocolate, clean finish"
                      value={preferences.aftertaste}
                      onChange={(e) => setPreferences({ ...preferences, aftertaste: e.target.value })}
                      required
                      rows={2}
                      readOnly={!isEditing}
                      className={!isEditing ? "bg-muted cursor-default" : ""}
                    />
                    <p className="text-xs text-muted-foreground">Hints: clean finish, lingering chocolate, sweet finish, dry finish</p>
                  </div>

                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button type="submit" disabled={isSubmitting} className="flex-1">
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Preferences"
                        )}
                      </Button>
                      {savedPreferences && (
                        <Button type="button" variant="outline" onClick={handleCancel} className="flex-1 bg-transparent">
                          Cancel
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button type="button" onClick={handleEdit} className="w-full bg-transparent" variant="outline">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Preferences
                    </Button>
                  )}
                </form>

                {/* Preview Button and Image */}
                <div className="mt-6 flex flex-col items-center gap-4">
                  <Button
                    type="button"
                    onClick={async () => {
                      setIsPreviewing(true)
                      setPreviewUrl(null)
                      try {
                        const response = await fetch("/api/generate-preview", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ config: preferences }),
                        })
                        if (response.ok) {
                          const data = await response.json()
                          setPreviewUrl(data.imageUrl)
                        } else {
                          setPreviewUrl(null)
                          alert("Failed to generate preview")
                        }
                      } catch (err) {
                        setPreviewUrl(null)
                        alert("Error generating preview")
                      } finally {
                        setIsPreviewing(false)
                      }
                    }}
                    disabled={isPreviewing}
                    className="w-full md:w-auto"
                  >
                    {isPreviewing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Preview...
                      </>
                    ) : (
                      // Button to generate a real-time AI image preview of the current coffee preferences
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Preview
                      </>
                    )}
                  </Button>
                  {previewUrl && (
                    <div className="w-full flex justify-center">
                      <img src={previewUrl} alt="Preview" className="rounded-lg border border-border max-h-64 object-contain" />
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Training</CardTitle>
            <CardDescription>
              Train the AI model with all coffee data to enable the Coffee Wizard feature
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleTrainIndex} disabled={isTraining} className="w-full" variant="secondary">
              {isTraining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Training Index...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {hasBeenTrained ? "Retrain Coffee Index" : "Train Coffee Index"}
                </>
              )}
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">
              This will index all coffee bases, milks, syrups, and toppings using Cohere's rerank API. Once complete,
              the Coffee Wizard will be available in the top menu.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dependent Option Mappings</CardTitle>
            <CardDescription>Control which milks and temperatures are allowed for each base</CardDescription>
          </CardHeader>
          <CardContent>
            <DependentOptionsAdmin />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DependentOptionsAdmin() {
  const [bases, setBases] = useState<Array<{ id: string; name: string }>>([])
  const [selectedBase, setSelectedBase] = useState<string | null>(null)
  const [allMilks, setAllMilks] = useState<Array<{ id: string; name: string }>>([])
  const [allTemps, setAllTemps] = useState<Array<{ id: string; name: string }>>([])
  const [allSyrups, setAllSyrups] = useState<Array<{ id: string; name: string }>>([])
  const [allToppings, setAllToppings] = useState<Array<{ id: string; name: string }>>([])
  const [allSizes, setAllSizes] = useState<Array<{ id: string; name: string }>>([])
  const [allowedMilks, setAllowedMilks] = useState<string[]>([])
  const [allowedTemps, setAllowedTemps] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const bRes = await fetch('/api/options/bases')
        const bData = await bRes.json()
        setBases(bData || [])

  const mRes = await fetch('/api/options/milks')
  const mData = await mRes.json()
  // Map to objects and dedupe by name to avoid duplicate keys
  const mappedMilks = (mData || []).map((m: any) => ({ id: m.id, name: m.name }))
  const uniqueMilks = Array.from(new Map(mappedMilks.map((x: { id: string; name: string }) => [x.name, x])).values()) as Array<{ id: string; name: string }>
  setAllMilks(uniqueMilks)

  const tRes = await fetch('/api/options/temperatures')
  const tData = await tRes.json()
  const mappedTemps = (tData || []).map((t: any) => ({ id: t.id, name: t.name }))
  const uniqueTemps = Array.from(new Map(mappedTemps.map((x: { id: string; name: string }) => [x.name, x])).values()) as Array<{ id: string; name: string }>
  setAllTemps(uniqueTemps)

  // Syrups
  const sRes = await fetch('/api/options/syrups')
  const sData = await sRes.json()
  const mappedSyrups = (sData || []).map((s: any) => ({ id: s.id, name: s.name }))
  const uniqueSyrups = Array.from(new Map(mappedSyrups.map((x: { id: string; name: string }) => [x.name, x])).values()) as Array<{ id: string; name: string }>
  setAllSyrups(uniqueSyrups)

  // Toppings
  const topRes = await fetch('/api/options/toppings')
  const topData = await topRes.json()
  const mappedToppings = (topData || []).map((t: any) => ({ id: t.id, name: t.name }))
  const uniqueToppings = Array.from(new Map(mappedToppings.map((x: { id: string; name: string }) => [x.name, x])).values()) as Array<{ id: string; name: string }>
  setAllToppings(uniqueToppings)

  // Sizes
  const sizeRes = await fetch('/api/options/sizes')
  const sizeData = await sizeRes.json()
  const mappedSizes = (sizeData || []).map((s: any) => ({ id: s.id, name: s.name }))
  const uniqueSizes = Array.from(new Map(mappedSizes.map((x: { id: string; name: string }) => [x.name, x])).values()) as Array<{ id: string; name: string }>
  setAllSizes(uniqueSizes as Array<{ id: string; name: string }>)
      } catch (err) {
        console.error('Error loading dependent options admin', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!selectedBase) return
    const loadForBase = async () => {
      try {
        const res = await fetch(`/api/options/dependent?base=${encodeURIComponent(selectedBase)}`)
        if (res.ok) {
          const data = await res.json()
          setAllowedMilks(Array.from(new Set((data.allowedMilks || []).map((x: string) => x))))
          setAllowedTemps(Array.from(new Set((data.allowedTemperatures || []).map((x: string) => x))))
        } else {
          setAllowedMilks([])
          setAllowedTemps([])
        }
      } catch (err) {
        console.error('Error loading mappings for base', err)
      }
    }
    loadForBase()
  }, [selectedBase])

  const handleSave = async () => {
    if (!selectedBase) return
    setIsSaving(true)
    try {
      const res = await fetch('/api/options/dependent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base: selectedBase, allowedMilks, allowedTemperatures: allowedTemps }),
      })
      if (res.ok) alert('Mappings saved')
      else alert('Failed to save mappings')
    } catch (err) {
      console.error(err)
      alert('Error saving mappings')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) return <div className="py-6 text-center">Loading…</div>

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <select value={selectedBase || ''} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedBase(e.target.value || null)} className="border rounded p-2">
          <option value="">Select base</option>
          {bases.map((b) => (
            <option key={b.id} value={b.name}>{b.name}</option>
          ))}
        </select>
        <Button onClick={handleSave} disabled={!selectedBase || isSaving}>
          {isSaving ? 'Saving…' : 'Save Mappings'}
        </Button>
      </div>

      {/* All available options (read-only lists) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded">
          <h4 className="font-semibold mb-2">All Sizes</h4>
          <ul className="text-sm space-y-1 max-h-48 overflow-auto">
            {allSizes.map((s) => <li key={s.id}>{s.name}</li>)}
          </ul>
        </div>
        <div className="p-4 border rounded">
          <h4 className="font-semibold mb-2">All Syrups</h4>
          <ul className="text-sm space-y-1 max-h-48 overflow-auto">
            {allSyrups.map((s) => <li key={s.id}>{s.name}</li>)}
          </ul>
        </div>
        <div className="p-4 border rounded">
          <h4 className="font-semibold mb-2">All Toppings</h4>
          <ul className="text-sm space-y-1 max-h-48 overflow-auto">
            {allToppings.map((t) => <li key={t.id}>{t.name}</li>)}
          </ul>
        </div>
      </div>

      {selectedBase && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Allowed Milks</h4>
            <div className="space-y-2">
              {allMilks.map((m) => (
                <label key={m.id} className="flex items-center gap-2">
                  <input type="checkbox" checked={allowedMilks.includes(m.name)} onChange={(e) => {
                    if (e.target.checked) setAllowedMilks((s) => Array.from(new Set([...s, m.name])))
                    else setAllowedMilks((s) => s.filter(x => x !== m.name))
                  }} />
                  <span>{m.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Allowed Temperatures</h4>
            <div className="space-y-2">
              {allTemps.map((t) => (
                <label key={t.id} className="flex items-center gap-2">
                  <input type="checkbox" checked={allowedTemps.includes(t.name)} onChange={(e) => {
                    if (e.target.checked) setAllowedTemps((s) => Array.from(new Set([...s, t.name])))
                    else setAllowedTemps((s) => s.filter(x => x !== t.name))
                  }} />
                  <span>{t.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
