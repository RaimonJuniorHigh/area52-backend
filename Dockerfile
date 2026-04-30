FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx tsc
EXPOSE 8080
# Start de gecompileerde versie uit de 'dist' map of direct via ts-node
CMD ["npx", "ts-node", "app.ts"]