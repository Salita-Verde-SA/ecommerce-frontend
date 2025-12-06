# Etapa de build - usar versión específica más segura
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar package.json y lock para instalación eficiente
COPY package*.json ./
RUN npm ci

# Copiar el resto del código y construir
COPY . .
RUN npm run build

# Etapa de runtime (Nginx sirviendo estáticos)
FROM nginx:1.25-alpine-slim AS runner

# El default server sirve /usr/share/nginx/html
COPY --from=builder /app/dist /usr/share/nginx/html

# Ajustar permisos
RUN chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/run && \
    rm -rf /var/cache/apk/*

EXPOSE 80
