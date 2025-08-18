FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

ARG VITE_OPENAI_API_KEY
ENV VITE_OPENAI_API_KEY=$VITE_OPENAI_API_KEY

# Debug: Verificar se a variável foi passada
RUN echo "=== DEBUG BUILD ==="
RUN echo "API Key length: ${#VITE_OPENAI_API_KEY}"
RUN echo "API Key preview: ${VITE_OPENAI_API_KEY:0:15}..."

RUN npm run build

# Debug: Verificar se foi injetada no build
RUN echo "=== VERIFICANDO BUILD ==="
RUN grep -r "sk-" dist/ || echo "❌ API key não encontrada no build"
RUN grep -r "undefined" dist/assets/*.js | head -5 || echo "✅ Sem undefined no build"

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
