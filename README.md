# SalesApp Web (`sales_web`)

Interface web moderna para gestão de vendas, controle de estoque, despesas e acompanhamento financeiro em tempo real. Desenvolvida com **Next.js (App Router)**, **React 19**, **TypeScript** e **Tailwind CSS 4**, consumindo a API REST e WebSockets do [`sales_api`](../sales_api).

---

## ✨ Principais Funcionalidades

- **📊 Dashboard Analítico**
  - KPIs financeiros consolidados: *Saldo Atual*, *Lucro Líquido*, *Receitas* e *Despesas*.
  - Gráfico comparativo de *Receitas vs Despesas* (visualização em barras ou linhas, com navegação entre períodos).
  - Ranking e gráfico dos *Produtos Mais Vendidos* por faturamento líquido.
  - Distribuição proporcional por categoria (*Vendas*, *Entrada de Estoque* e *Outros Gastos*), já considerando descontos aplicados.
  - *Histórico de Atividade* recente filtrado por período (*Hoje*, *Esta semana*, *Este mês*, *Este ano*).

- **🛒 Gestão de Vendas e Entradas de Estoque**
  - Criação de vendas e entradas de estoque com múltiplos produtos, cálculo automático de subtotal, aplicação de descontos e atualização de saldo em estoque.
  - Cancelamento de registros (com estorno automático de estoque) e exclusão de registros cancelados.
  - Visualização detalhada em painel lateral/página dedicada.

- **📦 Produtos, Categorias e Outras Despesas**
  - Cadastro completo de produtos com controle de quantidade em estoque e vínculo por categoria.
  - Categorias personalizadas com seletor de cores (`react-colorful`) separadas por tipo (*Produtos* e *Despesas*).
  - Registro e controle de despesas avulsas (*Outras Despesas*), com exclusão individual ou em lote (*bulk delete*).

- **🏢 Sistema Multi-Empresa (Multi-Tenant) e Permissões**
  - Criação e alternância rápida entre empresas.
  - Sistema de convites para membros em tempo real (via WebSocket) com níveis de permissão (*Administrador*, *Editor* e *Visualizador*).
  - Gerenciamento de membros, cargos e dados cadastrais/endereço da empresa (com busca automática de CEP).

- **👤 Conta, Segurança e Autenticação**
  - Fluxo completo de cadastro com verificação de e-mail, login com JWT + Refresh Token automático, recuperação de senha (*Esqueci minha senha*) e troca de e-mail confirmada por link.
  - Edição de perfil e upload de avatar/logo com recorte interativo de imagem (*crop*).

- **🌍 Internacionalização e Tema**
  - Suporte nativo a **Português (`pt-BR`)** e **Inglês (`en-US`)**.
  - Tema **Claro (Light)** e **Escuro (Dark)** adaptável.

---

## 🛠️ Tecnologias Utilizadas

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router) + [React 19](https://react.dev/)
- **Linguagem:** [TypeScript 5](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS 4](https://tailwindcss.com/) + Ícones [@mui/icons-material](https://mui.com/material-ui/material-icons/)
- **Gerenciamento de Estado:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Formulários e Validação:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Gráficos:** [Recharts](https://recharts.org/)
- **Cliente HTTP:** [Axios](https://axios-http.com/) (com interceptors para autenticação e refresh token)
- **Testes:** [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/)

---

## 📂 Estrutura do Projeto

```text
sales_web/
├── api/
│   ├── axiosClient.ts       # Instância do Axios, interceptors de JWT e refresh token
│   ├── schemas/             # Interfaces e tipos TypeScript dos contratos da API
│   └── services/            # Serviços de comunicação com os endpoints do backend
├── app/
│   ├── (login)/             # Rotas públicas (login, cadastro, verificação de e-mail, reset de senha)
│   ├── (pages)/             # Rotas autenticadas (Dashboard, Vendas, Estoque, Produtos, Categorias, Despesas, Conta)
│   ├── components/          # Design System e componentes reutilizáveis (AppGrid, AppModal, AppTabs, AppButton, etc.)
│   ├── utils/               # Formatadores, hooks customizados (usePagination, usePermission, useWebSocket) e i18n
│   └── globals.css          # Variáveis de tema (Light/Dark) e utilitários globais Tailwind
├── enums/                   # Enumerações compartilhadas (ActionType, CategoryType, CompanyPermission, etc.)
├── locales/                 # Dicionários de tradução (pt-BR.json e en-US.json)
├── stores/                  # Stores globais do Zustand (token, locale, dialog, mobileMenu)
└── __tests__/               # Testes unitários e de integração dos componentes e utilitários
```

---

## ⚙️ Configuração e Execução

### 1. Pré-requisitos

- **Node.js** `20+`
- **pnpm** (ou `npm` / `yarn`)
- Backend [`sales_api`](../sales_api) em execução (padrão em `http://localhost:8000`)

### 2. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto `sales_web`:

```env
NEXT_PUBLIC_BASE_API=http://localhost:8000
# Opcional: caso queira sobrescrever a URL do WebSocket derivada da API
# NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

### 3. Instalação das Dependências

```bash
pnpm install
# ou
npm install
```

### 4. Executando em Desenvolvimento

```bash
pnpm dev
# ou
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

---

## 🧪 Scripts Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `pnpm dev` | Inicia o servidor de desenvolvimento do Next.js em `http://localhost:3000` |
| `pnpm build` | Gera o build otimizado para produção |
| `pnpm start` | Inicia o servidor em modo de produção após o build |
| `pnpm lint` | Executa a verificação do ESLint no código |
| `pnpm test` | Executa toda a suíte de testes automatizados com Vitest |
| `pnpm test:watch` | Executa o Vitest em modo interativo (*watch*) |

---

## 📄 Licença

Este projeto está sob a licença MIT.
