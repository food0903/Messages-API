FROM node:alpine

WORKDIR /messages_api

COPY package.json .

COPY package-lock.json .

RUN npm install

COPY Test.js .

EXPOSE 5000

CMD ["node", "Test.js"]
