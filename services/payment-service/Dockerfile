FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY src ./src
ENV PORT=3004 SERVICE_NAME=payment-service
EXPOSE 3004
CMD ["npm","start"]
