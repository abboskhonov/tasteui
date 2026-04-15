# Use official Bun image
FROM oven/bun:1-slim

WORKDIR /app

# Copy package files from apps/api
COPY apps/api/package.json apps/api/bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the app
COPY apps/api/ .

# Expose the port Railway will use
EXPOSE 3001

# Start the server
CMD ["bun", "run", "src/index.ts"]
