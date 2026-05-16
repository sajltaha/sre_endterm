FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY src ./src
ENV PORT=3001 SERVICE_NAME=auth-service
EXPOSE 3001
CMD ["npm","start"]
