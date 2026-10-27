FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install -g npm@11 && npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install -g npm@11 && npm ci --omit=dev --ignore-scripts
COPY --from=build /app/dist ./dist
# The app never writes to /app; give ownership to the unprivileged user anyway.
RUN chown -R node:node /app
USER node
EXPOSE 3000
CMD ["sh", "-c", "node dist/database/run-migrations.js && node dist/main"]
