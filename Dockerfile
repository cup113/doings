FROM node:22-slim

RUN npm install -g pnpm
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

RUN mkdir -p uploads data

EXPOSE 3000
ENV NODE_ENV=production
ENV NODE_OPTIONS=--experimental-sqlite

CMD ["node", "build/index.js"]
