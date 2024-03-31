FROM node:18 as backend

WORKDIR /mangahay_be
COPY ./package.json ./package-lock.json ./

RUN npm install 

COPY . ./

RUN npm run build 

EXPOSE 3000

CMD [ "npm", "run", "start:prod" ]
