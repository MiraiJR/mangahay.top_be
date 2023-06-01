FROM node:18-alpine

# port sẽ chạy
EXPOSE 3000 

# dir mã nguồn
WORKDIR /src/app

RUN npm i npm@latest -g

COPY package.json package-lock.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "start:dev"]