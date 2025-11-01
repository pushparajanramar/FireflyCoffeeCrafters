"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Coffee, Trash2, Eye, Plus } from "@/components/icons"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type SavedDrink = {
  id: string
  name: string
  config_json: any
  image_url: string | null
  created_at: string
}

export default function FavoritesPage() {
  const [drinks, setDrinks] = useState<SavedDrink[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    fetchDrinks()
  }, [])

  const fetchDrinks = async () => {
    try {
      const response = await fetch("/api/drinks")
      if (response.ok) {
        const data = await response.json()
        setDrinks(data)
      }
    } catch (error) {
      console.error("[v0] Error fetching drinks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/drinks/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setDrinks(drinks.filter((drink) => drink.id !== id))
        setDeleteId(null)
      }
    } catch (error) {
      console.error("[v0] Error deleting drink:", error)
    }
  }

  const handleView = (drink: SavedDrink) => {
    localStorage.setItem("currentDrink", JSON.stringify(drink.config_json))
    if (drink.image_url) {
      localStorage.setItem("currentDrinkImage", drink.image_url)
    }
    window.location.href = "/summary"
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-page-background to-page-background-secondary">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold text-brand-text mb-2">My Favorites</h2>
              <p className="text-brand-text-muted">Your saved drink creations</p>
            </div>
            <Link href="/builder">
              <Button className="bg-brand-primary hover:bg-brand-primary-hover text-foreground">
                <Plus className="mr-2 h-4 w-4" />
                Create New Drink
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-brand-text-muted">Loading your favorites...</p>
            </div>
          ) : drinks.length === 0 ? (
            <Card className="border-border">
              <CardContent className="py-12 text-center">
                <Coffee className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-brand-text mb-2">No favorites yet</h3>
                <p className="text-brand-text-muted mb-6">Start creating your custom drinks and save them here</p>
                <Link href="/builder">
                  <Button className="bg-brand-primary hover:bg-brand-primary-hover text-foreground">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Drink
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drinks.map((drink) => (
                <Card key={drink.id} className="overflow-hidden hover:shadow-lg transition-shadow border-border">
                  <div className="aspect-square relative bg-gradient-to-br from-page-background to-page-background-secondary">
                    {drink.image_url ? (
                      <img
                        src={drink.image_url || "/placeholder.svg"}
                        alt={drink.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Coffee className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold text-brand-text mb-2 truncate">{drink.name}</h3>
                    <div className="text-sm text-brand-text-muted mb-4 space-y-1">
                      <p>
                        {drink.config_json.base} • {drink.config_json.size}
                      </p>
                      <p className="truncate">{drink.config_json.temperature}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(drink)}
                        className="flex-1 border-border text-brand-text-muted bg-transparent"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteId(drink.id)}
                        className="border-destructive/50 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Drink?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this drink? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
