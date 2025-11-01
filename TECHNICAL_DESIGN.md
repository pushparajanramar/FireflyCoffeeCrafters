# CraftYourCoffee - Technical Design Document

## Executive Summary

CraftYourCoffee is an AI-powered beverage customization platform that enables users to design custom drinks with real-time AI-generated visual previews. The application uses Adobe Firefly for image generation and Cohere's rerank API for intelligent drink recommendations based on user preferences.

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with custom design tokens
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: React hooks + localStorage + sessionStorage
- **Analytics**: Vercel Analytics

### Backend
- **Runtime**: Next.js API Routes (serverless)
- **Database**: Neon (PostgreSQL)
- **Database Client**: @neondatabase/serverless
- **AI Image Generation**: Adobe Firefly API v3
- **AI Recommendations**: Cohere Rerank API

### AI Tools & Services

#### 1. Adobe Firefly API
- **Purpose**: Generate photorealistic drink images based on customization
- **Version**: v3
- **Endpoints Used**:
  - `/v3/images/generate` - Generate drink images from text prompts
  - `/v3/images/generate-object-composite` - Composite Starbucks logo onto cups
- **Features**:
  - Text-to-image generation with negative prompts
  - Style presets (photo-realistic)
  - Custom sizing (1024x1024)
  - Product-based negative prompts for accurate visualization

#### 2. Cohere Rerank API
- **Purpose**: Intelligent drink recommendations based on user preferences
- **Model**: Rerank-english-v3.0
- **Use Case**: Coffee Wizard feature
- **Process**:
  1. User provides taste preferences and mood
  2. System queries all drink combinations from database
  3. Cohere reranks results based on relevance to user input
  4. Top recommendation is returned with full customization details
- **Training**: Index all coffee bases, milks, syrups, and toppings in database

### Infrastructure
- **Hosting**: Vercel (Edge-optimized serverless functions)
- **Database**: Neon (serverless PostgreSQL)
- **CDN**: Vercel Edge Network
- **Environment**: Production and Preview environments

## Environment Variables

### Database (Neon Integration)
\`\`\`env
# Primary connection strings
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]
POSTGRES_URL=postgresql://[user]:[password]@[host]/[database]

# Pooled connections
POSTGRES_PRISMA_URL=postgresql://[user]:[password]@[host]/[database]?pgbouncer=true
POSTGRES_URL_NON_POOLING=postgresql://[user]:[password]@[host]/[database]

# Unpooled connections
DATABASE_URL_UNPOOLED=postgresql://[user]:[password]@[host]/[database]
POSTGRES_URL_NO_SSL=postgresql://[user]:[password]@[host]/[database]?sslmode=disable
PGHOST_UNPOOLED=[host]

# Individual connection parameters
PGHOST=[host]
PGUSER=[username]
PGPASSWORD=[password]
PGDATABASE=[database_name]

# Project metadata
NEON_PROJECT_ID=[project_id]
\`\`\`

### Application Configuration
\`\`\`env
# Base URL for API calls
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
\`\`\`

### AI Services (Hardcoded in Application)
\`\`\`typescript
// Adobe Firefly Credentials (lib/adobe-firefly.ts)
ORG_ID=9D6FC4045823262D0A495CC8@AdobeOrg
CLIENT_ID=26e4ebed633e40a0b08a3479954b6403
CLIENT_SECRETS=p8e-RKatSGX7Ed03IU3qewdiQdxLW_PaVYuk
TECHNICAL_ACCOUNT_ID=F027223168DAD9A90A495C8A@techacct.adobe.com
TECHNICAL_ACCOUNT_EMAIL=2a1f8f1d-5631-4364-884c-3d19d7cf5f7a@techacct.adobe.com

// Cohere API Key (lib/cohere.ts)
COHERE_API_KEY=78VWOEFbwXZdwIckiVchtMUwryUAhjD8tGYo88Xo
\`\`\`

## Architecture Overview

### Application Flow

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                     Landing Page (Passcode)                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Main Navigation                           │
│  ┌──────────┬──────────┬──────────┬──────────────────────┐ │
│  │ Builder  │ Favorites│  Admin   │   Coffee Wizard      │ │
│  └──────────┴──────────┴──────────┴──────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
         │            │          │              │
         ▼            ▼          ▼              ▼
    ┌────────┐  ┌─────────┐ ┌────────┐  ┌──────────────┐
    │ 7-Step │  │ Saved   │ │ Train  │  │ AI-Powered   │
    │ Builder│  │ Drinks  │ │ AI     │  │ Recommender  │
    │        │  │ List    │ │ Index  │  │ (Cohere)     │
    └────┬───┘  └────┬────┘ └────────┘  └──────┬───────┘
         │           │                          │
         ▼           ▼                          ▼
    ┌────────────────────────────────────────────────┐
    │         Adobe Firefly Image Generation         │
    └────────────────────────────────────────────────┘
\`\`\`

### Data Flow

#### 1. Drink Builder Flow
\`\`\`
User Selection → localStorage → API Routes → Neon DB → Favorites
                      ↓
              Adobe Firefly API
                      ↓
              Generated Image URL
\`\`\`

#### 2. Coffee Wizard Flow
\`\`\`
User Preferences → Cohere Rerank API → Top Match → Adobe Firefly
                         ↓
                  Neon DB (cohere_documents)
                         ↓
                  Ranked Results
\`\`\`

#### 3. AI Training Flow
\`\`\`
Admin Trigger → Fetch All Products → Format Documents → Store in DB
                                                            ↓
                                                    cohere_documents table
                                                            ↓
                                                    Used by Wizard
\`\`\`

## Database Schema

### Core Product Tables

\`\`\`sql
-- Coffee/Tea bases
CREATE TABLE bases (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Drink sizes
CREATE TABLE sizes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  ounces INTEGER NOT NULL,
  price_modifier DECIMAL(5,2) DEFAULT 0.00
);

-- Milk options
CREATE TABLE milks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price_modifier DECIMAL(5,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true
);

-- Temperature options
CREATE TABLE temperatures (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);

-- Flavor syrups
CREATE TABLE syrups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price_per_pump DECIMAL(5,2) DEFAULT 0.80,
  is_seasonal BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true
);

-- Toppings
CREATE TABLE toppings (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(5,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true
);

-- Espresso shot options
CREATE TABLE espresso_shots (
  id SERIAL PRIMARY KEY,
  count INTEGER NOT NULL,
  price DECIMAL(5,2) DEFAULT 0.00
);

-- Ice level options
CREATE TABLE ice_levels (
  id SERIAL PRIMARY KEY,
  level VARCHAR(50) NOT NULL
);

-- Sweetness levels
CREATE TABLE sweetness_levels (
  id SERIAL PRIMARY KEY,
  level VARCHAR(50) NOT NULL
);
\`\`\`

### User Data Tables

\`\`\`sql
-- Saved drinks
CREATE TABLE drinks (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  base VARCHAR(100),
  size VARCHAR(50),
  milk VARCHAR(100),
  temperature VARCHAR(50),
  syrups JSONB,
  toppings JSONB,
  espresso INTEGER,
  ice VARCHAR(50),
  sweetness VARCHAR(50),
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

### AI-Specific Tables

\`\`\`sql
-- Cohere document index for AI recommendations
CREATE TABLE cohere_documents (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  type TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI training status
CREATE TABLE index_training_status (
  id SERIAL PRIMARY KEY,
  status VARCHAR(50) NOT NULL,
  last_trained_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User preferences for AI recommendations
CREATE TABLE user_preferences (
  id SERIAL PRIMARY KEY,
  taste_preferences TEXT,
  dietary_restrictions TEXT,
  favorite_flavors TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

### Pricing Tables

\`\`\`sql
-- Base prices
CREATE TABLE base_prices (
  id SERIAL PRIMARY KEY,
  base_id INTEGER REFERENCES bases(id),
  size_id INTEGER REFERENCES sizes(id),
  price DECIMAL(5,2) NOT NULL
);

-- Loyalty points configuration
CREATE TABLE loyalty_config (
  id SERIAL PRIMARY KEY,
  points_per_dollar DECIMAL(5,2) DEFAULT 10.00,
  bonus_multiplier DECIMAL(5,2) DEFAULT 1.00
);
\`\`\`

## API Routes

### Product APIs
- `GET /api/options` - Fetch all customization options
- `GET /api/drinks` - List saved drinks
- `POST /api/drinks` - Save new drink
- `DELETE /api/drinks/:id` - Delete saved drink

### AI Generation APIs
- `POST /api/generate-preview` - Generate drink image via Adobe Firefly
- `POST /api/wizard/generate` - Get AI drink recommendation via Cohere
- `GET /api/wizard/status` - Check if AI training is complete
- `POST /api/train-index` - Train Cohere index with product data

### Pricing APIs
- `POST /api/calculate-price` - Calculate drink price and loyalty points

### Admin APIs
- `GET /api/preferences` - Get user preferences
- `POST /api/preferences` - Save user preferences

## AI Integration Details

### Adobe Firefly Integration

**Authentication Flow:**
1. Request access token from Adobe IMS
2. Use client credentials grant type
3. Token valid for 24 hours
4. Automatically refreshed on expiry

**Image Generation Process:**
1. Build detailed prompt from drink configuration
2. Generate negative prompt to exclude unwanted elements
3. Call Firefly API with prompts and style presets
4. Receive image URL (valid for 1 hour)
5. Optionally composite Starbucks logo

**Prompt Engineering:**
- Hot drinks: White paper cup with cardboard sleeve, steam, no ice
- Cold drinks: Clear plastic cup, ice cubes, layered appearance
- Product-specific negative prompts exclude unselected ingredients
- Size-specific cup dimensions for accuracy
- Professional photography style with studio lighting

### Cohere Integration

**Training Process:**
1. Fetch all products from database (bases, milks, syrups, toppings)
2. Format as searchable documents with metadata
3. Store in `cohere_documents` table
4. Mark training as complete in `index_training_status`

**Recommendation Process:**
1. User provides preferences (taste, mood, dietary needs)
2. Fetch all documents from `cohere_documents`
3. Call Cohere Rerank API with user query
4. Receive ranked results with relevance scores
5. Select top result and build complete drink configuration
6. Generate image via Adobe Firefly
7. Calculate pricing and loyalty points

**Document Format:**
\`\`\`json
{
  "id": "base-espresso",
  "text": "Espresso - Rich, bold coffee base with intense flavor",
  "type": "base",
  "data": {
    "id": 1,
    "name": "Espresso",
    "description": "Rich, bold coffee base"
  }
}
\`\`\`

## Security Considerations

### Authentication
- Passcode protection for initial access (stored in config)
- Session-based authentication state (sessionStorage)
- Future: Stack Auth integration for user accounts

### API Security
- Adobe Firefly credentials hardcoded (service account)
- Cohere API key hardcoded (server-side only)
- Database credentials via environment variables
- No client-side exposure of sensitive keys

### Data Protection
- User preferences stored server-side
- Drink configurations in localStorage (non-sensitive)
- No PII collection currently
- HTTPS enforced in production

## Performance Optimizations

### Image Generation
- 1024x1024 resolution for quality
- Cached in browser after generation
- Stored URLs in database for favorites
- Lazy loading for drink previews

### Database
- Neon serverless with connection pooling
- Indexed queries for product lookups
- JSONB for flexible drink configurations
- Prepared statements for security

### Frontend
- Next.js App Router for optimal loading
- Server components where possible
- Client components only for interactivity
- Tailwind CSS for minimal bundle size

## Deployment

### Vercel Configuration
\`\`\`json
{
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"]
}
\`\`\`

### Environment Setup
1. Connect Neon integration in Vercel
2. Add `NEXT_PUBLIC_BASE_URL` environment variable
3. Deploy from GitHub repository
4. Run database migrations via Neon SQL Editor

### Database Migrations
Execute SQL scripts in order:
1. `01-create-tables.sql` - Core schema
2. `02-seed-data.sql` - Initial product data
3. `03-add-customization-options.sql` - Extended options
4. `04-update-seed-data.sql` - Additional products

## Future Enhancements

### Planned Features
- User authentication (Stack Auth)
- Order placement and payment (Stripe)
- Nutritional information calculator
- Social sharing of drink creations
- Barista dashboard for order management
- Multi-language support
- Dark mode toggle
- Drink rating and reviews

### AI Improvements
- Fine-tune Cohere model with user feedback
- A/B testing for prompt variations
- Image quality improvements
- Faster generation times
- Cost optimization for API calls

### Performance
- Image CDN integration
- Redis caching for frequent queries
- GraphQL API for flexible data fetching
- Progressive Web App (PWA) support

## Monitoring & Analytics

### Current Tracking
- Vercel Analytics for page views
- Console logging for AI API calls
- Error tracking in production

### Recommended Additions
- Sentry for error monitoring
- PostHog for product analytics
- Custom events for AI usage
- Performance monitoring (Core Web Vitals)

## Cost Considerations

### Adobe Firefly
- Pay-per-generation model
- Approximately $0.03 per image
- Optimize by caching generated images
- Consider rate limiting for abuse prevention

### Cohere API
- Free tier: 100 requests/month
- Paid tier: $1 per 1000 requests
- Optimize by caching recommendations
- Batch training updates

### Neon Database
- Free tier: 0.5 GB storage
- Paid tier: $19/month for 10 GB
- Connection pooling reduces costs
- Serverless scaling for traffic spikes

## Maintenance

### Regular Tasks
- Monitor AI API usage and costs
- Update product database seasonally
- Retrain Cohere index when products change
- Review and optimize prompts
- Update dependencies monthly

### Backup Strategy
- Neon automatic daily backups
- Export drink configurations weekly
- Version control for code changes
- Document AI prompt iterations

---

**Last Updated**: January 2025
**Version**: 1.0
**Maintained By**: Development Team
