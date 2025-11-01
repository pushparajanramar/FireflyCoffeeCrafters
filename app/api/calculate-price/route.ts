import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const config = await request.json()

    let basePrice = 0
    let sizePrice = 0
    let milkPrice = 0
    let syrupsPrice = 0
    let toppingsPrice = 0

    try {
      // Get base price (try exact match, then fallback to ILIKE partial match)
      if (config.base) {
        const baseResult = await sql`
          SELECT price FROM bases WHERE name = ${config.base}
        `
        if (baseResult.length > 0) {
          basePrice = Number(baseResult[0].price) || 0
        } else {
          // Fallback: try partial/ILIKE match to handle slightly different names in seed vs updates
          const likeResult = await sql`
            SELECT price FROM bases WHERE name ILIKE ${"%" + config.base + "%"} LIMIT 1
          `
          if (likeResult.length > 0) {
            basePrice = Number(likeResult[0].price) || 0
          }
        }
      }

      // Get size price (exact match then fallback to ILIKE)
      if (config.size) {
        const sizeResult = await sql`
          SELECT price FROM sizes WHERE name = ${config.size}
        `
        if (sizeResult.length > 0) {
          sizePrice = Number(sizeResult[0].price) || 0
        } else {
          const likeResult = await sql`
            SELECT price FROM sizes WHERE name ILIKE ${"%" + config.size + "%"} LIMIT 1
          `
          if (likeResult.length > 0) {
            sizePrice = Number(likeResult[0].price) || 0
          }
        }
      }

      // Get milk price (exact match then fallback)
      if (config.milk) {
        const milkResult = await sql`
          SELECT price FROM milks WHERE name = ${config.milk}
        `
        if (milkResult.length > 0) {
          milkPrice = Number(milkResult[0].price) || 0
        } else {
          const likeResult = await sql`
            SELECT price FROM milks WHERE name ILIKE ${"%" + config.milk + "%"} LIMIT 1
          `
          if (likeResult.length > 0) {
            milkPrice = Number(likeResult[0].price) || 0
          }
        }
      }

      // Calculate syrups price (price per pump)
      if (config.syrups && config.syrups.length > 0) {
        for (const syrup of config.syrups) {
          let syrupPrice = 0
          const syrupResult = await sql`
            SELECT price FROM syrups WHERE name = ${syrup.name}
          `
          if (syrupResult.length > 0) {
            syrupPrice = Number(syrupResult[0].price) || 0
          } else {
            const likeResult = await sql`
              SELECT price FROM syrups WHERE name ILIKE ${"%" + syrup.name + "%"} LIMIT 1
            `
            if (likeResult.length > 0) syrupPrice = Number(likeResult[0].price) || 0
          }
          syrupsPrice += syrupPrice * (syrup.pumps || 0)
        }
      }

      // Calculate toppings price
      if (config.toppings && config.toppings.length > 0) {
        for (const topping of config.toppings) {
          let toppingPrice = 0
          const toppingResult = await sql`
            SELECT price FROM toppings WHERE name = ${topping}
          `
          if (toppingResult.length > 0) {
            toppingPrice = Number(toppingResult[0].price) || 0
          } else {
            const likeResult = await sql`
              SELECT price FROM toppings WHERE name ILIKE ${"%" + topping + "%"} LIMIT 1
            `
            if (likeResult.length > 0) toppingPrice = Number(likeResult[0].price) || 0
          }
          toppingsPrice += toppingPrice
        }
      }
    } catch (dbError: any) {
      if (dbError.message?.includes('column "price" does not exist')) {
        console.log(
          "[v0] Price columns not found in database. Please run scripts/05-add-price-columns.sql and scripts/06-update-prices.sql",
        )
        // Return zeros for all prices
        return NextResponse.json({
          base: 0,
          size: 0,
          milk: 0,
          syrups: 0,
          toppings: 0,
          total: 0,
          loyaltyPoints: {
            base: 0,
            size: 0,
            milk: 0,
            syrups: 0,
            toppings: 0,
            total: 0,
          },
          warning: "Prices not configured. Please run database migration scripts.",
        })
      }
      throw dbError
    }

    const total = basePrice + sizePrice + milkPrice + syrupsPrice + toppingsPrice

    const loyaltyPoints = {
      base: Math.floor(basePrice * 2),
      size: Math.floor(sizePrice * 2),
      milk: Math.floor(milkPrice * 2),
      syrups: Math.floor(syrupsPrice * 2),
      toppings: Math.floor(toppingsPrice * 2),
      total: 0, // Will be calculated below
    }

    // Calculate total as sum of individual points to avoid rounding errors
    loyaltyPoints.total =
      loyaltyPoints.base + loyaltyPoints.size + loyaltyPoints.milk + loyaltyPoints.syrups + loyaltyPoints.toppings

    return NextResponse.json({
      base: basePrice,
      size: sizePrice,
      milk: milkPrice,
      syrups: syrupsPrice,
      toppings: toppingsPrice,
      total,
      loyaltyPoints,
    })
  } catch (error) {
    console.error("[v0] Error calculating price:", error)
    return NextResponse.json({ error: "Failed to calculate price" }, { status: 500 })
  }
}
