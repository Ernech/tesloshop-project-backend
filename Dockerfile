# --- Etapa 1: Construcción (Aquí podemos usar root temporalmente para compilar) ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Etapa 2: Producción (Aquí aplicamos la seguridad estricta) ---
FROM node:20-alpine AS runner
WORKDIR /app

# Definimos el entorno de producción
ENV NODE_ENV=production

# 1. Copiamos los archivos de dependencias y les asignamos el propietario 'node' de inmediato
COPY --chown=node:node package*.json ./

# 2. Instalamos solo dependencias de producción
RUN npm ci --omit=dev

# 3. Copiamos el código compilado desde la etapa anterior, también con dueño 'node'
COPY --chown=node:node --from=builder /app/dist ./dist

# 4. ¡EL PASO CLAVE! Cambiamos del usuario root al usuario seguro 'node'
USER node

EXPOSE 3000
CMD ["node", "dist/main"]
