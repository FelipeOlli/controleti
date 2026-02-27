FROM node:18-alpine

WORKDIR /app

# Copiar package.json do backend
COPY package*.json ./

# Instalar dependências
RUN npm install --production

# Copiar código do backend
COPY . ./

# Copiar frontend para o nível acima (/frontend)
COPY ../frontend/ /frontend/

EXPOSE 3000

CMD ["node", "server.js"]
