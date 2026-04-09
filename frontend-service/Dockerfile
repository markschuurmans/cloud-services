FROM node:24 AS dev

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

FROM dev AS build
RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


