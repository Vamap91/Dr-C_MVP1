# Multi-stage build para otimizar tamanho da imagem
FROM node:18-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# ✅ ADICIONAR: Argumentos de build para variáveis de ambiente
ARG VITE_OPENAI_API_KEY
ENV VITE_OPENAI_API_KEY=$VITE_OPENAI_API_KEY

# ✅ ADICIONAR: Debug para verificar se a variável existe
RUN echo "=== BUILD DEBUG ===" && \
    echo "API Key exists: $(test -n "$VITE_OPENAI_API_KEY" && echo "YES" || echo "NO")" && \
    echo "API Key preview: ${VITE_OPENAI_API_KEY:0:10}..." && \
    echo "=================="

# Copiar arquivos de dependências
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Instalar pnpm e dependências
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copiar código fonte
COPY . .

# ✅ VERIFICAR: Mostrar variáveis de ambiente antes do build
RUN echo "Building with environment:" && env | grep VITE || echo "No VITE variables found"

# Build da aplicação (agora com a variável injetada)
RUN pnpm run build

# ✅ VERIFICAR: Confirmar se a chave foi injetada no build
RUN echo "=== POST-BUILD VERIFICATION ===" && \
    echo "Checking if API key was injected in build..." && \
    (grep -r "sk-" dist/ && echo "✅ API key found in build") || \
    (echo "❌ API key NOT found in build" && exit 1)

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
