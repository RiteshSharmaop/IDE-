FROM node:18-alpine

WORKDIR /usr/src/app

RUN apk add --no-cache docker-cli

COPY package*.json ./
RUN npm install --production
RUN npm install -g nodemon

COPY . .

EXPOSE 8080

CMD ["npm", "run", "dev"]
