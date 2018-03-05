FROM node:8-slim

WORKDIR /usr/src/app

COPY package.json package-lock.json lerna.json /usr/src/app/
RUN npm install --unsafe-perm --quiet

CMD ["npm", "start"]
