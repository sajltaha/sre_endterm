FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY src ./src
ENV PORT=3003 SERVICE_NAME=order-service
EXPOSE 3003
CMD ["npm","start"]
