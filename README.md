# Cartão de Visita Virtual

Sistema de gerenciamento de cartões de visita virtuais e funcionários com suporte a férias.

## Funcionalidades

- 📇 Cartão de visita virtual com QR Code
- 👥 Gerenciamento de funcionários
- 🗓️ Gerenciamento de férias
- 🔐 Painel administrativo
- 📱 Design responsivo

## Stack Tecnológico

- **Frontend**: React 19, TypeScript, Tailwind CSS, Wouter
- **Backend**: Express, Node.js
- **Database**: MySQL com Drizzle ORM
- **Build**: Vite, esbuild
- **Package Manager**: pnpm

## Instalação

```bash
pnpm install
```

## Desenvolvimento

```bash
pnpm dev
```

Acesse `http://localhost:3000`

## Build

```bash
pnpm build
```

## Produção

```bash
pnpm start
```

## Variáveis de Ambiente

```
DATABASE_URL=mysql://user:password@localhost:3306/cartao_virtual
NODE_ENV=production
PORT=3000
```

## Estrutura do Projeto

```
├── client/          # Frontend React
│   └── src/
│       ├── pages/   # Páginas
│       └── components/
├── server/          # Backend Express
├── drizzle/         # Schema e migrations
├── shared/          # Tipos compartilhados
└── package.json
```

## Licença

MIT
