FROM node:22-alpine
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN corepack install
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 3002
ENV HOST=0.0.0.0
ENV PORT=3002
CMD ["node", ".output/server/index.mjs"]
