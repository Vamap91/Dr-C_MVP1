# Dr_C - Digital Biodiversity Guide

🌱 **Dr_C** é um guia digital de biodiversidade com IA que oferece informações educacionais sobre natureza, conservação e soluções baseadas na natureza em português e inglês.

## 🚀 Funcionalidades

- **Chat Inteligente**: Sistema de perguntas e respostas sobre biodiversidade
- **Bilíngue**: Suporte completo para Português e Inglês
- **Base de Conhecimento**: Informações sobre abelhas, conservação, biodiversidade e soluções baseadas na natureza
- **Citações Científicas**: Todas as respostas incluem fontes confiáveis
- **Interface Responsiva**: Funciona perfeitamente em desktop e mobile
- **Persona Educacional**: Dr_C oferece respostas inspiradoras e educativas

## 🛠️ Tecnologias

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Icons**: Lucide React
- **Internacionalização**: Sistema customizado i18n
- **Deploy**: Google Cloud Run (containerizado)

## 📦 Instalação e Desenvolvimento

### Pré-requisitos
- Node.js 18+
- npm ou pnpm

### Instalação
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/dr-c-biodiversity.git
cd dr-c-biodiversity

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

### Scripts Disponíveis
```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run preview      # Preview do build
npm run lint         # Verificação de código
```

## 🌍 Deploy no Google Cloud

### Usando Docker (Recomendado)

1. **Build da imagem Docker**:
```bash
docker build -t dr-c-app .
```

2. **Deploy no Cloud Run**:
```bash
# Configure o gcloud CLI
gcloud auth login
gcloud config set project SEU_PROJECT_ID

# Build e push para Container Registry
gcloud builds submit --tag gcr.io/SEU_PROJECT_ID/dr-c-app

# Deploy no Cloud Run
gcloud run deploy dr-c-app \
  --image gcr.io/SEU_PROJECT_ID/dr-c-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Usando GitHub Actions (CI/CD)

O projeto inclui workflows do GitHub Actions para deploy automático:

1. Configure os secrets no GitHub:
   - `GCP_PROJECT_ID`: ID do seu projeto Google Cloud
   - `GCP_SA_KEY`: Chave da Service Account (JSON)

2. Push para a branch `main` ativa o deploy automático

## 📁 Estrutura do Projeto

```
dr-c-biodiversity/
├── public/                 # Arquivos estáticos
├── src/
│   ├── components/         # Componentes React
│   │   └── ui/            # Componentes shadcn/ui
│   ├── hooks/             # Custom hooks
│   │   └── useLanguage.js # Hook de internacionalização
│   ├── i18n/              # Sistema de traduções
│   │   └── translations.js # Traduções PT/EN
│   ├── App.jsx            # Componente principal
│   ├── App.css            # Estilos globais
│   └── main.jsx           # Entry point
├── .github/workflows/      # GitHub Actions
├── Dockerfile             # Configuração Docker
├── docker-compose.yml     # Desenvolvimento local
└── README.md              # Este arquivo
```

## 🧠 Base de Conhecimento

O Dr_C possui conhecimento especializado sobre:

### Português
- **Biodiversidade**: Conceitos fundamentais e importância
- **Abelhas**: Papel na polinização e ecossistemas
- **Conservação**: Estratégias de preservação ambiental
- **Soluções Baseadas na Natureza**: Abordagens sustentáveis

### English
- **Biodiversity**: Fundamental concepts and importance
- **Bees**: Role in pollination and ecosystems
- **Conservation**: Environmental preservation strategies
- **Nature-based Solutions**: Sustainable approaches

## 🎯 Exemplos de Perguntas

### Português
- "O que são abelhas?"
- "Como posso ajudar na conservação?"
- "O que é biodiversidade?"
- "Quais são as soluções baseadas na natureza?"

### English
- "What are bees?"
- "How can I help with conservation?"
- "What is biodiversity?"
- "What are nature-based solutions?"

## 🔧 Configuração de Ambiente

### Variáveis de Ambiente (Opcionais)
```env
# Para futuras integrações
VITE_API_URL=https://api.exemplo.com
VITE_ANALYTICS_ID=seu-analytics-id
```

### Configuração do Docker
O projeto inclui:
- `Dockerfile` otimizado para produção
- `docker-compose.yml` para desenvolvimento
- Multi-stage build para reduzir tamanho da imagem

## 📊 Métricas e Analytics

O projeto está preparado para integração com:
- Google Analytics
- Métricas de uso do chat
- Feedback dos usuários
- Análise de tópicos mais consultados

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🌟 Roadmap

### Próximas Funcionalidades
- [ ] Integração com OpenAI para respostas mais avançadas
- [ ] Sistema RAG com base de dados vetorial
- [ ] Autenticação de usuários
- [ ] Histórico de conversas
- [ ] Métricas em tempo real
- [ ] Funcionalidades de voz
- [ ] Avatar animado do Dr_C
- [ ] API pública para desenvolvedores

### Melhorias Técnicas
- [ ] Testes automatizados (Jest + Testing Library)
- [ ] Storybook para componentes
- [ ] PWA (Progressive Web App)
- [ ] Otimização de performance
- [ ] Acessibilidade (WCAG 2.1)

## 📞 Suporte

Para dúvidas ou suporte:
- Abra uma [issue](https://github.com/seu-usuario/dr-c-biodiversity/issues)
- Entre em contato: [seu-email@exemplo.com]

---

**Dr_C** - Conectando pessoas com a natureza através da tecnologia 🌱🤖

