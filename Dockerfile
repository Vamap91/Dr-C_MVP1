# Multi-stage build para otimizar tamanho da imagem
FROM node:18-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Instalar pnpm e dependências
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copiar código fonte
COPY . .

# Build da aplicação
RUN pnpm run build

# Estágio de produção
FROM nginx:alpine

# Copiar arquivos buildados
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração customizada do nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Expor porta 8080 (Cloud Run requirement)
EXPOSE 8080

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]

