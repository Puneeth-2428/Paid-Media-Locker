FROM node:22-alpine

WORKDIR /usr/src/app

# Install fontconfig and fonts so sharp can composite SVG text
RUN apk add --no-cache fontconfig ttf-dejavu

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4000

CMD ["node", "server.js"]
