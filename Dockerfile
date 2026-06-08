FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html index.tsx index.css vite.config.ts vite-env.d.ts tsconfig.json ./
COPY App.tsx types.ts metadata.json ./
COPY components ./components
COPY context ./context
COPY pages ./pages
COPY services ./services
COPY utils ./utils

RUN npm run build

FROM nginx:1.27-alpine AS runner

RUN apk add --no-cache gettext

COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY docker/entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh

COPY --from=builder /app/dist /usr/share/nginx/html

ENV BACKEND_UPSTREAM=http://backend:3001

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
