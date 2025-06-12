FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3001

# Specifica esplicitamente il comando di avvio
CMD ["node", "dist/server/index.js"]