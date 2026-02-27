FROM node:18-alpine

WORKDIR /app

# Copiar package.json do backend
COPY backend/package*.json ./

# Instalar dependencias
RUN npm install --production

# Copiar codigo do backend
COPY backend/ ./

# Copiar frontend para /app/frontend
COPY frontend/ ./frontend/

EXPOSE 3000

CMD ["node", "server.js"]
