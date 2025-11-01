import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Disable native bindings to avoid compatibility issues on Mac
  native: false,
  // Optional: Configure pool settings for local development
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

pool.on("error", (err) => {
  console.error("[v0] Unexpected error on idle client", err)
})

// Helper function to execute SQL queries
export async function sql(strings: TemplateStringsArray, ...values: any[]): Promise<any[]> {
  const client = await pool.connect()
  try {
    // Construct the query from template literal
    const query = strings.reduce((acc, str, i) => acc + str + (i < values.length ? `$${i + 1}` : ""), "")
    const result = await client.query(query, values)
    return result.rows
  } catch (error) {
    console.error("[v0] Query execution error:", error)
    throw error
  } finally {
    client.release()
  }
}

// Helper function to test database connection
export async function testConnection() {
  try {
    console.log("[v0] Testing database connection with URL:", process.env.DATABASE_URL?.replace(/:[^:@]+@/, ":****@"))
    const result = await sql`SELECT NOW() as current_time`
    console.log("[v0] Database connected successfully:", result[0].current_time)
    return true
  } catch (error) {
    console.error("[v0] Database connection failed:", error)
    return false
  }
}

// Export the pool for direct access if needed
export { pool }
