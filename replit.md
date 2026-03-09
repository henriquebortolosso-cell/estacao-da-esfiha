# Estação da Esfiha - Delivery App

Clone fiel do Neemo (loja.neemo.com.br) com todas as funcionalidades de delivery.

## Arquitetura

- **Frontend**: React + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Backend**: Express.js + TypeScript
- **Banco de Dados**: PostgreSQL (Drizzle ORM)
- **Estado do Carrinho**: React Context + localStorage

## Funcionalidades

- Cardápio completo com 46 produtos em 13 categorias
- Filtro por categoria (nav sticky horizontal)
- Busca de produtos em tempo real
- Carrinho com persistência no localStorage
- Modal ao adicionar produto (com campo de observações)
- Checkout completo: dados pessoais, endereço, forma de pagamento
- Troco para dinheiro condicional
- Confirmação de pedido
- Página de sucesso do pedido
- Visual fiel ao Neemo (logo, cores vermelho/branco, layout)

## Páginas

- `/` - Home com cardápio
- `/checkout` - Finalizar pedido
- `/order/:id` - Confirmação do pedido

## API Endpoints

- `GET /api/categories` - Lista categorias
- `GET /api/products` - Lista produtos
- `POST /api/orders` - Cria pedido
- `GET /api/orders/:id` - Busca pedido por ID

## Cores (Branding)

- Primary: vermelho `hsl(0 100% 40%)`
- Background: cinza muito claro `hsl(210 20% 98%)`
- Fonte: Space Grotesk

## Assets

- Logo: `/logo.webp` (servido do public/)
- Favicon: `/favicon.webp`
