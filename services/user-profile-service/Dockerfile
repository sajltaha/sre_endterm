FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY src ./src
ENV PORT=3006 SERVICE_NAME=user-profile-service
EXPOSE 3006
CMD ["npm","start"]
