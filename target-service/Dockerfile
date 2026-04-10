FROM node:24

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

RUN mkdir -p src/uploads

EXPOSE 3003

CMD ["npm", "start"]

