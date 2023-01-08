FROM node:16
WORKDIR /usr
COPY package.json ./
COPY tsconfig.json ./
COPY src ./src
RUN npm install
RUN npm run build


# This is stage two , where the app actually runs
FROM node:16
WORKDIR /usr
COPY package.json ./
COPY static /static
RUN npm install --omit=dev
COPY --from=0 /usr/build .
ENV PORT=80
EXPOSE 80
CMD [ "node", "index.js" ]
