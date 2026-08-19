FROM node:18-alpine AS builder

WORKDIR /app

COPY client/package.json client/package-lock.json ./

RUN npm install

COPY client/src ./src
COPY client/public ./public
COPY client/index.html client/vite.config.js client/tailwind.config.js client/postcss.config.js ./

RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
