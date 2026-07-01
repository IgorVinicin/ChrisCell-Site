# Estrutura e Funcionalidades do Projeto: ChrisCell

Este documento descreve detalhadamente o estado atual do site da **Chriscell**, listando todas as páginas, componentes principais, funcionalidades implementadas e integrações do sistema.

---

## 1. Mapa de Páginas e Telas

### 🏠 Página Inicial (`/`)
*   **Arquivo:** `src/pages/Index.tsx`
*   **Objetivo:** Apresentação institucional da assistência técnica e atração de clientes.
*   **Funcionalidades:**
    *   **Hero Banner:** Destaque dos serviços especializados (consertos de tela, bateria, etc.).
    *   **Vitrine de Serviços:** Listagem de quais reparos são feitos com cards interativos.
    *   **Seção de Depoimentos:** Avaliações de clientes.
    *   **Contato e Localização:** Link para redes sociais, mapa e horário de funcionamento.
    *   **Botão Flutuante do WhatsApp:** Atalho permanente para atendimento rápido.

### 🛍️ Loja de Acessórios (`/loja`)
*   **Arquivo:** `src/pages/Loja.tsx`
*   **Objetivo:** Catálogo online de acessórios da loja (capinhas, películas, cabos, etc.).
*   **Funcionalidades:**
    *   **Busca e Filtro por Categorias:** Filtros dinâmicos baseados no banco de dados.
    *   **Consulta em Tempo Real:** Carrega dinamicamente os produtos cadastrados no Supabase.
    *   **Controle de Estoque Visual:** Exibe apenas produtos ativos e com quantidade em estoque maior que zero.
    *   **Carrinho Lateral (Cart Drawer):** Painel que desliza da lateral direita mostrando os itens adicionados, quantidade e total do carrinho.

### 🛒 Checkout (`/checkout`)
*   **Arquivo:** `src/pages/Checkout.tsx`
*   **Objetivo:** Finalização de pedidos da loja.
*   **Funcionalidades:**
    *   **Formulário de Entrega:** Captura de nome, telefone, endereço completo (rua, número, bairro, CEP).
    *   **Resumo da Compra:** Exibe os itens, quantidade e valor total.
    *   **Integração de WhatsApp:** Finaliza o pedido montando uma mensagem formatada e redirecionando o cliente direto para o WhatsApp da loja para concluir o pagamento/entrega.

### 📦 Status do Pedido (`/order-status/:id`)
*   **Arquivo:** `src/pages/OrderStatus.tsx`
*   **Objetivo:** Acompanhamento do processamento do pedido pelo cliente.
*   **Funcionalidades:**
    *   **Painel Visual de Etapas:** Exibe o status atual do pedido (Pendente, Preparando, Enviado, Entregue).
    *   **Resumo de Itens:** Detalhamento da compra feita pelo cliente.

### 🔧 Solicitação de Orçamento (`/orcamento`)
*   **Arquivo:** `src/pages/Orcamento.tsx`
*   **Objetivo:** Capturar dados sobre aparelhos danificados para orçamentos de assistência técnica.
*   **Funcionalidades:**
    *   **Formulário Dinâmico:** Campos para Marca/Modelo do celular, descrição detalhada do problema e seleção de tipo de defeito (Tela, Bateria, Molhou, Não Liga, etc.).
    *   **Envio via WhatsApp:** Monta uma mensagem estruturada com todos os dados do aparelho e envia direto para o contato oficial da assistência.

### 🔐 Login do Administrador (`/admin/login`)
*   **Arquivo:** `src/pages/AdminLogin.tsx`
*   **Objetivo:** Login seguro para a equipe gerenciar o site.
*   **Funcionalidades:**
    *   **Autenticação via Supabase Auth:** Login com e-mail e senha.
    *   **Verificação de Cargo (RLS):** Garante que apenas usuários com cargo `admin` na tabela `user_roles` acessem o painel.
    *   **Recuperação de Senha:** Envio de e-mail automático para resetar senha perdida.

### ⚙️ Painel de Administração (`/admin`)
*   **Arquivo:** `src/pages/AdminPanel.tsx`
*   **Objetivo:** Área de gerenciamento de dados e pedidos da loja.
*   **Funcionalidades:**
    *   **Aba de Produtos (CRUD completo):**
        *   **Cadastro:** Nome, descrição, preço, categoria, estoque e status ativo/inativo.
        *   **Upload de Imagens:** Upload direto de fotos do produto para o Supabase Storage.
        *   **Edição e Exclusão:** Atualização e remoção de produtos cadastrados.
    *   **Aba de Pedidos:**
        *   Listagem completa dos pedidos feitos pelos clientes.
        *   Atualização de status do pedido e código de rastreamento.

---

## 2. Tecnologias e Serviços Conectados

*   **Banco de Dados (Supabase Cloud):** Tabelas `products` (dados dos produtos), `user_roles` (controle de acesso), `orders` e `order_items` (dados de compras).
*   **Storage (Supabase Storage):** Bucket público `product-images` para hospedar as fotos dos acessórios.
*   **Componentes Shadcn/UI & Tailwind:** Interface do usuário moderna, estilizada, responsiva e com suporte a temas.
*   **React Context API (`CartContext`):** Gerenciamento do carrinho de compras disponível em todas as páginas do site.
