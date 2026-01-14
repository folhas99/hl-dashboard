FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better docker cache)
COPY package.json package-lock.json* ./
RUN npm install

# Copy source
COPY . .

# Build
RUN npm run prisma:generate && npm run build

ENV NODE_ENV=production
ENV PORT=5555
EXPOSE 5555

# Create db folder (for sqlite volume)
RUN mkdir -p /data

# On container start, ensure schema exists, then run Next
CMD ["sh", "-lc", "npx prisma db push && npm run start"]
