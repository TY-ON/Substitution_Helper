FROM node:22.9.0-alpine3.19@sha256:83b4d7bcfc3d4a40faac3e73a59bc3b0f4b3cc72b9a19e036d340746ebfeaecb
WORKDIR /app

COPY package.json .
RUN npm install

COPY . .

EXPOSE 30000

RUN npm run build

CMD ["npx", "serve", "-s", "build"]
