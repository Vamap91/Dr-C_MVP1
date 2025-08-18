FROM node:18-alpine AS builder

WORKDIR /app

# Usar npm em vez de pnpm
COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

ARG VITE_OPENAI_API_KEY
ENV VITE_OPENAI_API_KEY=$VITE_OPENAI_API_KEY

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
