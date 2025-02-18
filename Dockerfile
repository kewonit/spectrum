# Builder image
FROM node:18-alpine AS builder

WORKDIR /app

# First install dependencies so we can cache them
RUN apk update && apk upgrade
RUN apk add curl

COPY package.json package-lock.json ./
RUN npm install --force

# Now copy the rest of the app and build it
COPY . .

# Define build arguments
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG DATABASE_URL
ARG DIRECT_URL
ARG CASHFREE_BASE_URL
ARG CASHFREE_SECRET_KEY_PROD
ARG CASHFREE_APP_ID_PROD
ARG SUPABASE_SERVICE_KEY
ARG NEXT_PUBLIC_APP_URL
ARG SPACES_KEY
ARG SPACES_SECRET
ARG NEXT_PUBLIC_SPACE_NAME
ARG NEXT_PUBLIC_SPACES_REGION
ARG SPACE_NAME

# Set environment variables before build
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    DATABASE_URL=$DATABASE_URL \
    DIRECT_URL=$DIRECT_URL \
    CASHFREE_BASE_URL=$CASHFREE_BASE_URL \
    CASHFREE_SECRET_KEY_PROD=$CASHFREE_SECRET_KEY_PROD \
    CASHFREE_APP_ID_PROD=$CASHFREE_APP_ID_PROD \
    SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    SPACES_KEY=$SPACES_KEY \
    SPACES_SECRET=$SPACES_SECRET \
    NEXT_PUBLIC_SPACE_NAME=$NEXT_PUBLIC_SPACE_NAME \
    NEXT_PUBLIC_SPACES_REGION=$NEXT_PUBLIC_SPACES_REGION \
    SPACE_NAME=$SPACE_NAME

# Run build after environment setup
RUN npm run build

# Production image
FROM node:18-alpine AS runner

WORKDIR /app

# Create a non-root user
RUN addgroup -S nonroot && adduser -S nonroot -G nonroot
USER nonroot

# Copy the standalone output from the builder image
COPY --from=builder --chown=nonroot:nonroot /app/.next/standalone ./
COPY --from=builder --chown=nonroot:nonroot /app/public ./public
COPY --from=builder --chown=nonroot:nonroot /app/.next/static ./.next/static

# Prepare the app for production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

# Start the app
CMD ["node", "server.js"]