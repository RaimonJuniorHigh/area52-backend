# Gebruik een officiele Node.js image
FROM node:20-slim

# Zet de werkmap
WORKDIR /app

# Kopieer package files en installeer dependencies
COPY package*.json ./
RUN npm install

# Kopieer de rest van je code
COPY . .

# Compileer TypeScript naar JavaScript
RUN npx tsc

# Expose de poort (Cloud Run verwacht 8080)
EXPOSE 8080

# Start de GECOMPILEERDE versie (dat is de standaard voor productie)
CMD ["node", "dist/app.js"]