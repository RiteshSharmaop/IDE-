FROM node:22.18.0-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# Force Vite to bind to 0.0.0.0 inside Docker
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
