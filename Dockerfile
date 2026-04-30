FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx tsc app.ts
EXPOSE 8080
CMD ["node", app.js"]