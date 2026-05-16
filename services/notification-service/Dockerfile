FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY src ./src
ENV PORT=3005 SERVICE_NAME=notification-service
EXPOSE 3005
CMD ["npm","start"]
