"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Wand2 } from "lucide-react"
import { useState, useEffect } from "react"

export function Navigation() {
  const pathname = usePathname()
  const [isWizardEnabled, setIsWizardEnabled] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if wizard is enabled (training completed)
    fetch("/api/wizard/status")
      .then((res) => res.json())
      .then((data) => setIsWizardEnabled(data.enabled))
      .catch(() => setIsWizardEnabled(false))

    const authStatus = sessionStorage.getItem("isAuthenticated")
    setIsAuthenticated(authStatus === "true")

    const handleStorageChange = () => {
      const authStatus = sessionStorage.getItem("isAuthenticated")
      setIsAuthenticated(authStatus === "true")
    }
    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("auth-change", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("auth-change", handleStorageChange)
    }
  }, [])

  return (
    <nav className="bg-sb-dark-green border-b border-border shadow-sm">
  <div className="container mx-auto px-4 bg-green">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/starbucks-logo.png" alt="Starbucks Logo" width={44} height={44} className="object-contain" />
              <span className="brand-title text-brand-text">CraftYourCoffee</span>
            </Link>
            {isAuthenticated && (
              <div className="nav-links flex gap-2 ml-6">
                <Link href="/wizard" className={`nav-link flex items-center gap-1 px-3 py-2 rounded-lg font-semibold transition-colors ${pathname === "/wizard" ? "bg-brand-primary/10 text-brand-primary" : "text-brand-text-muted hover:bg-brand-primary/5 hover:text-brand-primary"}`}><Wand2 className="h-4 w-4" />Coffee Wizard</Link>
                <Link href="/builder" className={`nav-link px-3 py-2 rounded-lg font-semibold transition-colors ${pathname === "/builder" ? "bg-brand-primary/10 text-brand-primary" : "text-brand-text-muted hover:bg-brand-primary/5 hover:text-brand-primary"}`}>Builder</Link>
                <Link href="/favorites" className={`nav-link px-3 py-2 rounded-lg font-semibold transition-colors ${pathname === "/favorites" ? "bg-brand-primary/10 text-brand-primary" : "text-brand-text-muted hover:bg-brand-primary/5 hover:text-brand-primary"}`}>Favorites</Link>
                <Link href="/admin" className={`nav-link px-3 py-2 rounded-lg font-semibold transition-colors ${pathname === "/admin" ? "bg-brand-primary/10 text-brand-primary" : "text-brand-text-muted hover:bg-brand-primary/5 hover:text-brand-primary"}`}>Admin</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
