FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY src ./src
ENV PORT=3000 SERVICE_NAME=api-gateway
EXPOSE 3000
CMD ["npm","start"]
