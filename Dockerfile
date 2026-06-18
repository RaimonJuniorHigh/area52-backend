FROM node:20-slim

WORKDIR /app

# Kopieer package files
COPY package*.json ./
# Installeer ALLE dependencies (nodig voor de build)
RUN npm install

# Kopieer broncode
COPY . .

# Compileer naar ./dist
RUN npx tsc

# Verwijder de zware dev-dependencies (optioneel, maar aanbevolen)
RUN npm prune --production

EXPOSE 8080

CMD ["node", "dist/app.js"]