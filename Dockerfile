# Multi-stage build para otimizar tamanho da imagem
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Instalar dependências
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile --legacy-peer-deps

# Copiar código fonte
COPY . .

# Aceitar variável de ambiente no build (SEM HARDCODE!)
ARG VITE_OPENAI_API_KEY
ENV VITE_OPENAI_API_KEY=$VITE_OPENAI_API_KEY

# Build da aplicação
RUN pnpm run build

# Estágio de produção
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
