FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

# Build shared libs first
WORKDIR /libs
COPY libs/package.json libs/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY libs/ ./
RUN pnpm build

# Build members app
WORKDIR /app
COPY members/package.json members/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY members/ ./
RUN pnpm build

FROM nginx:alpine

# Copy custom nginx config
COPY members/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application
COPY --from=builder /app/dist/members /usr/share/nginx/html

EXPOSE 4203

CMD ["nginx", "-g", "daemon off;"]
