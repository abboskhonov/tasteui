# Use official Bun image
FROM oven/bun:1-slim

WORKDIR /app

# Copy everything from apps/api
COPY apps/api/ .

# Install dependencies (without frozen-lockfile to allow updates)
RUN bun install

# Expose the port Railway will use
EXPOSE 3001

# Start the server
CMD ["bun", "run", "src/index.ts"]
