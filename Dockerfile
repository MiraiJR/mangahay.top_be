FROM python:3.9

RUN apt update && apt install -y nodejs npm

WORKDIR /mangahay_be

COPY ./package.json ./package-lock.json ./
COPY ./requirements.txt /mangahay_be/

RUN pip install --no-cache-dir -r requirements.txt
RUN npm install 

COPY . ./

RUN npm run build 

EXPOSE 3000

CMD [ "npm", "run", "start:prod" ]
