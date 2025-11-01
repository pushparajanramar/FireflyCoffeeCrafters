# Dockerfile for CraftYourCoffee (Next.js + Node.js)

# 1. Use official Node.js LTS image
FROM node:20-alpine AS deps

# 2. Set working directory
WORKDIR /app

# 3. Install dependencies (with pnpm)
COPY pnpm-lock.yaml package.json ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# 4. Copy all files
COPY . .

# 5. Build the Next.js app
RUN pnpm build

# 6. Production image, copy built assets and only necessary files
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# 7. Copy built app and node_modules from previous stage
COPY --from=deps /app/.next ./.next
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/public ./public
COPY --from=deps /app/next.config.mjs ./next.config.mjs
COPY --from=deps /app/postcss.config.mjs ./postcss.config.mjs
COPY --from=deps /app/tailwind.config.js ./tailwind.config.js
COPY --from=deps /app/app ./app
COPY --from=deps /app/components ./components
COPY --from=deps /app/lib ./lib
COPY --from=deps /app/styles ./styles

# 8. Expose port
EXPOSE 3000

# 9. Start the app
CMD ["pnpm", "start"]
