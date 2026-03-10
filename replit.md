# Estação da Esfiha - Delivery App

Design original moderno inspirado no Five Guys (bold, vermelho #D21033, preto, Public Sans).

## Arquitetura

- **Frontend**: React + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Backend**: Express.js + TypeScript + express-session
- **Banco de Dados**: PostgreSQL (Drizzle ORM)
- **Estado do Carrinho**: React Context + localStorage
- **Fonte**: Public Sans (Google Fonts)

## Design

- Header: preto (#000) com borda vermelha inferior (#D21033)
- Hero: imagem de fundo grande com texto branco bold/uppercase e badges informativos
- Seção "Nossa História": fundo vermelho (#D21033) com texto branco bold
- Category nav: tabs pretas horizontais com underline vermelho no ativo
- Product cards: flat/quadrado, sem bordas arredondadas, botão "+" vermelho
- Floating cart bar: preto flat com borda vermelha no topo e botão CTA vermelho
- Cores primárias: #D21033 (vermelho), #000000 (preto), #F6F6F6 (fundo cinza claro)

## Funcionalidades

- Cardápio completo com 46 produtos em 13 categorias
- Hero section com imagem editável pelo admin, nome da loja e badges informativos
- Seção "Nossa História" editável pelo admin (aparece só se preenchida)
- Banner clicável (URL da imagem + link + título, tudo editável pelo admin)
- Filtro por categoria (nav sticky horizontal preta)
- Busca de produtos em tempo real (no header)
- Carrinho com persistência no localStorage
- Modal ao adicionar produto (campo de observações)
- Checkout completo: dados pessoais, endereço, forma de pagamento
- Troco para dinheiro condicional
- Confirmação de pedido com página de sucesso

## Admin Panel

- Acesso via link secreto: `/painel/acesso/SUASENHA` (sem formulário)
- ADMIN_PASSWORD definido como secret no Replit
- Sessão persistente (express-session)
- Gerenciar: produtos, categorias, configurações da loja
- Configurações editáveis: nome, descrição, imagem hero, status (aberto/fechado), horários, delivery, pedido mínimo, banner, nossa história

## Páginas

- `/` - Home com cardápio (hero + banner + história + produtos)
- `/checkout` - Finalizar pedido
- `/order/:id` - Confirmação do pedido
- `/painel` - Dashboard admin (requer autenticação)
- `/painel/acesso/:token` - Link de acesso admin (automático, sem formulário)

## Programa de Fidelidade

- Rastreado por telefone do cliente (tabela `customers`)
- A cada 10 pedidos com frete pago → 1 frete grátis disponível
- No checkout: campo de telefone → lookup automático → card de status exibido
- Barra de progresso visual (X/10 pedidos) com distinção por pedido pago vs grátis
- Admin: aba "Fidelidade" mostra tabela completa de clientes + stats

## Schema DB (store_settings)

Colunas: isOpen, openTime, closeTime, estimatedTimeMin, estimatedTimeMax,
deliveryFee, minOrder, bannerImageUrl, bannerLink, bannerTitle,
storeName, storeDescription, heroImageUrl, storyTitle, storyText

## Secrets

- `ADMIN_PASSWORD` - senha do admin (usada no link secreto)
- `SESSION_SECRET` - secret da sessão express
