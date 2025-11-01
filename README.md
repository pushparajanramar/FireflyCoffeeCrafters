# CraftYourCoffee ☕

A modern, AI-powered beverage customization platform that allows users to design their perfect drink with real-time AI-generated previews.

## 🎯 Business Need

### Problem Statement
Coffee shops and beverage retailers face challenges in helping customers visualize custom drink combinations before ordering. This leads to:
- Customer uncertainty and decision paralysis
- Increased order errors and remakes
- Limited exploration of menu customization options
- Reduced customer satisfaction and engagement

### Solution
CraftYourCoffee provides an interactive, step-by-step drink builder that:
- **Visualizes custom drinks** using AI-generated images before ordering
- **Guides customers** through a structured customization process
- **Saves favorites** for quick reordering and personalization
- **Reduces errors** by clearly displaying all customization choices
- **Increases engagement** through an intuitive, gamified experience

### Target Users
- Coffee shop customers seeking personalized beverages
- Baristas looking to understand complex custom orders
- Beverage retailers wanting to showcase customization options
- Marketing teams promoting seasonal drinks and new offerings

## 🏗️ Architecture

### Technology Stack

**Frontend**
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with custom design tokens
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: React hooks + localStorage
- **Analytics**: Vercel Analytics

**Backend**
- **Runtime**: Next.js API Routes (serverless)
- **Database**: Neon (PostgreSQL)
- **Database Client**: @neondatabase/serverless
- **AI Image Generation**: Adobe Firefly API

**Infrastructure**
- **Hosting**: Vercel
- **Database**: Neon (serverless PostgreSQL)
- **Environment**: Edge-optimized serverless functions

### Project Structure

\`\`\`
├── app/
│   ├── api/                      # API routes
│   │   ├── drinks/              # Drink CRUD operations
│   │   ├── generate-preview/    # AI image generation
│   │   └── options/             # Customization options
│   ├── builder/                 # Step-by-step drink builder
│   ├── favorites/               # Saved drinks page
│   ├── summary/                 # Order summary page
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page
│   └── globals.css              # Global styles + design tokens
│
├── components/
│   ├── builder/                 # Builder step components
│   │   ├── base-step.tsx       # Coffee/tea base selection
│   │   ├── size-step.tsx       # Size selection
│   │   ├── milk-step.tsx       # Milk type selection
│   │   ├── temperature-step.tsx # Hot/iced selection
│   │   ├── syrup-step.tsx      # Syrup flavors
│   │   ├── topping-step.tsx    # Toppings selection
│   │   ├── finalize-step.tsx   # Final customizations
│   │   └── drink-preview.tsx   # AI preview component
│   └── ui/                      # Reusable UI components (shadcn)
│
├── lib/
│   ├── adobe-firefly.ts         # AI image generation logic
│   ├── config.ts                # App configuration
│   └── utils.ts                 # Utility functions
│
├── scripts/
│   ├── 01-create-tables.sql     # Database schema
│   ├── 02-seed-data.sql         # Initial data
│   ├── 03-add-customization-options.sql
│   └── 04-update-seed-data.sql
│
└── public/                      # Static assets
\`\`\`

### Database Schema

**Core Tables**
- `bases` - Coffee/tea base options (Espresso, Latte, etc.)
- `sizes` - Drink sizes (Tall, Grande, Venti)
- `milks` - Milk options (Whole, Oat, Almond, etc.)
- `temperatures` - Hot or Iced
- `syrups` - Flavor syrups (Vanilla, Caramel, seasonal)
- `toppings` - Toppings (Whipped cream, foam, etc.)
- `espresso_shots` - Espresso shot counts
- `ice_levels` - Ice level options
- `drinks` - User-saved drink configurations

**Key Relationships**
- Drinks store complete configuration as JSONB
- All options tables include `is_active` or `is_seasonal` flags
- User drinks linked via `user_id` (prepared for auth)

### Data Flow

1. **Customization Flow**
   \`\`\`
   Landing Page → Builder (7 steps) → AI Preview → Summary → Save to Favorites
   \`\`\`

2. **AI Image Generation**
   \`\`\`
   User Config → buildDrinkPrompt() → Adobe Firefly API → Image URL → Display
   \`\`\`

3. **Data Persistence**
   \`\`\`
   Drink Config → localStorage (temporary) → Neon DB (on save) → Favorites Page
   \`\`\`

### Design System

**Color Tokens** (defined in `globals.css`)
- Primary: Tan/Beige tones (#d4a373)
- Secondary: Terracotta/Brown (#9e6f5c)
- Background: Forest Green (#3d5a40)
- Accent: Seasonal variations
- Semantic tokens for buttons, text, borders, success states

**Typography**
- Font: System UI stack (optimized for readability)
- Hierarchy: Clear heading/body distinction
- Responsive sizing with Tailwind utilities

**Components**
- Built on Radix UI primitives
- Customized with shadcn/ui patterns
- Fully accessible (ARIA compliant)
- Mobile-first responsive design

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ and pnpm (or npm/yarn)
- Neon account (for PostgreSQL database)
- Adobe Firefly API key (for AI image generation)

### 1. Clone and Install

\`\`\`bash
# Clone the repository
git clone <repository-url>
cd craftyourcoffee

# Install dependencies
pnpm install
\`\`\`

### 2. Database Setup

**Create Neon Database**
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string

**Run Database Scripts**
Execute the SQL scripts in order:
\`\`\`bash
# These scripts are in the /scripts folder
# Run them via Neon SQL Editor or your preferred PostgreSQL client
01-create-tables.sql
02-seed-data.sql
03-add-customization-options.sql
04-update-seed-data.sql
\`\`\`

### 3. Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env
# Neon Database (provided by Vercel integration)
DATABASE_URL=your_neon_connection_string
POSTGRES_URL=your_neon_connection_string

# Adobe Firefly API (for AI image generation)
ADOBE_CLIENT_ID=your_adobe_client_id
ADOBE_CLIENT_SECRET=your_adobe_client_secret

# Optional: Stack Auth (for future user authentication)
STACK_SECRET_SERVER_KEY=your_stack_secret_key
NEXT_PUBLIC_STACK_PROJECT_ID=your_stack_project_id
NEXT_PUBLIC_STACK_PUBLISHABLE_KEY=your_stack_publishable_key
\`\`\`

### 4. Run Development Server

\`\`\`bash
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Default Passcode**: `4263` (configured in `lib/config.ts`)

### 5. Deploy to Vercel

\`\`\`bash
# Install Vercel CLI
pnpm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Settings → Environment Variables
\`\`\`

**Vercel Integrations**
- Add Neon integration for automatic database connection
- Configure environment variables for Adobe Firefly

## 🗄️ PostgreSQL Setup & Database Restore

### 1. Install PostgreSQL
- macOS: `brew install postgresql`
- Ubuntu: `sudo apt-get install postgresql`
- Windows: [Download from postgresql.org](https://www.postgresql.org/download/)

### 2. Create Database and User
Run the provided script to drop/create the database and user:

```sh
psql -U postgres -f sql-scripts/00-reset-db.sql
```

### 3. Restore the Database Dump
If you have a `.dump` file (e.g., `craftyourcoffee.dump`):

```sh
# Copy the dump file to your project directory
pg_restore -U coffee_crafter -d craftyourcoffee -Fc craftyourcoffee.dump
```

- If the database/user do not exist, run the reset script first.
- The `-Fc` flag is for custom-format dumps (created with `pg_dump -Fc`).

### 4. (Alternative) Manual Schema & Seed
If you want to set up from scratch (no dump):

```sh
psql -U coffee_crafter -d craftyourcoffee -f sql-scripts/01-schema.sql
psql -U coffee_crafter -d craftyourcoffee -f sql-scripts/02-seed.sql
```

### 5. Update `.env.local`
Set your `DATABASE_URL` to use the new database:

```
DATABASE_URL=postgres://coffee_crafter:default@localhost:5432/craftyourcoffee
```

### 6. Run the App
```sh
pnpm dev
```

---

**Summary for New Developers:**
1. Install PostgreSQL
2. Run `00-reset-db.sql` to create the DB/user
3. Restore with `pg_restore` (or use schema/seed scripts)
4. Set your `.env.local` with the correct `DATABASE_URL`
5. Run `pnpm install` and `pnpm dev`

You’re ready to develop locally!

## 🎨 Customization

### Update Passcode
Edit `lib/config.ts`:
\`\`\`typescript
export const APP_CONFIG = {
  PASSCODE: "your-new-passcode",
} as const
\`\`\`

### Modify Design Tokens
Edit `app/globals.css` to change colors:
\`\`\`css
:root {
  --primary: oklch(0.72 0.04 45);  /* Tan color */
  --secondary: oklch(0.55 0.06 40); /* Terracotta */
  /* ... other tokens */
}
\`\`\`

### Add New Customization Options
1. Add data to database via SQL scripts
2. Update corresponding step component in `components/builder/`
3. Update type definitions if needed

## 📊 Key Features

- ✅ **7-Step Drink Builder** - Guided customization process
- ✅ **AI-Powered Previews** - Real-time drink visualization
- ✅ **Favorites System** - Save and manage custom drinks
- ✅ **Responsive Design** - Mobile-first, works on all devices
- ✅ **Semantic Design System** - Themeable with design tokens
- ✅ **Passcode Protection** - Simple access control
- ✅ **Database-Driven Options** - Easy to update menu items
- ✅ **Seasonal Drinks** - Flag and highlight seasonal offerings

## 🔮 Future Enhancements

- [ ] User authentication (Stack Auth integration ready)
- [ ] Social sharing of drink creations
- [ ] Nutritional information calculator
- [ ] Order placement and payment integration
- [ ] Barista dashboard for order management
- [ ] Multi-language support
- [ ] Dark mode toggle
- [ ] Drink rating and reviews system

## 📝 License

Private project - All rights reserved

## 🤝 Contributing

This is a private project. For questions or suggestions, contact the development team.

---

Built with ❤️ using Next.js, Tailwind CSS, and Adobe Firefly AI
