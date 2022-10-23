FROM node:16.18.0-alpine as base
WORKDIR /app
COPY ["package.json", "package-lock.json", "./"]

FROM base as dev
RUN npm install
COPY . .
CMD [ "node", "index.js" ]