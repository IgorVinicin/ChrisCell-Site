# Chriscell — Site Institucional e Loja

Site da **Chriscell**, assistência técnica especializada em smartphones localizada em São José dos Campos. O projeto reúne em um único lugar: vitrine de serviços, formulário de orçamento, loja de acessórios com carrinho integrado e um painel administrativo para gerenciar produtos.

> Instagram: [@chriscell.sjc](https://instagram.com/chriscell.sjc)
> 

---

## Sobre o projeto

A ideia nasceu da necessidade de tirar a loja do "só Instagram + WhatsApp" e dar uma cara mais profissional para o atendimento online. O site tem três objetivos bem diretos:

1. **Gerar orçamentos** — qualquer pessoa pode descrever o problema do aparelho e enviar direto para o WhatsApp da loja em segundos.
2. **Vender acessórios** — capinhas, películas, carregadores e periféricos ficam expostos em uma loja simples, com carrinho que finaliza o pedido também via WhatsApp (sem necessidade de gateway de pagamento neste momento).
3. **Passar credibilidade** — fotos reais da oficina, identidade visual consistente e um fluxo de navegação rápido, principalmente no celular, que é onde a maioria dos clientes chega.

Tudo é responsivo, otimizado para mobile e usa imagens em múltiplas resoluções com lazy loading e blur-up para carregar rápido mesmo em conexões mais lentas.

---

## Stack utilizada

- **React 18 + Vite 5** — base do front-end
- **TypeScript** — tipagem em todo o projeto
- **Tailwind CSS v3** + design tokens (HSL) — sistema de cores semântico
- **shadcn/ui** + Radix — componentes acessíveis
- **Framer Motion** — animações sutis
- **React Router** — navegação entre páginas
- **Supabase (via Lovable Cloud)** — banco de dados, autenticação do admin e storage de imagens dos produtos
- **Row Level Security (RLS)** — controle de acesso por papel (`admin` em tabela separada `user_roles`, evitando escalonamento de privilégios)

---

## Estrutura

```
src/
├── assets/                # Logo e imagens reais da oficina (com variantes responsivas)
├── components/            # Header, Footer, CartDrawer, WhatsAppFloat, BlurImage, ui/
├── contexts/              # CartContext (estado global do carrinho)
├── pages/
│   ├── Index.tsx          # Home — hero, serviços, delivery
│   ├── Orcamento.tsx      # Formulário de orçamento
│   ├── Loja.tsx           # Catálogo de acessórios
│   ├── AdminLogin.tsx     # Login + recuperação de senha
│   ├── AdminPanel.tsx     # CRUD de produtos
│   └── ResetPassword.tsx  # Definição de nova senha
└── integrations/supabase/ # Client e tipos gerados
```

---

## Funcionalidades

- Formulário de orçamento que monta a mensagem e abre o WhatsApp já preenchido
- Carrinho persistente que envia a lista de itens e o total para o WhatsApp ao finalizar
- Botão flutuante de WhatsApp em todas as páginas
- Painel administrativo protegido (apenas usuários com papel `admin`)
- Cadastro, edição e remoção de produtos com upload de imagem
- Fluxo completo de **"esqueci minha senha"** com email de recuperação e página `/reset-password`
- Imagens responsivas (640w / 1024w / 1600w) com placeholder em base64 (blur-up)

---

## Sobre a experiência de "vibe coding" com IA

Este projeto foi construído quase inteiramente em parceria com uma IA (Lovable), num modelo de trabalho que muita gente tem chamado de **vibe coding**: você descreve o que quer, vê o resultado em tempo real, ajusta, refina, e a parte braçal do código fica por conta do assistente.

Algumas reflexões honestas dessa jornada:

**O que funcionou muito bem.** A velocidade é absurda. Coisas que antes levariam um fim de semana inteiro — montar um design system coerente, integrar um carrinho com contexto global, plugar autenticação com RLS, configurar storage para imagens — saíram em algumas horas de conversa. Iterar visualmente também é prazeroso: você pede "deixa o header com mais blur e mais sofisticado" e vê acontecer. Para alguém que quer **entregar um produto** e não ficar preso em decisões de boilerplate, é libertador.

**O que exige atenção.** A IA acerta muito, mas não acerta tudo. Aprendi rápido que precisava revisar cada mudança, principalmente nas partes de segurança (políticas RLS, separação de papéis, exposição de chaves) e no design — algumas escolhas iniciais ficavam com "cara de IA" (gradientes genéricos, ícones aleatórios, cópia inflada). A diferença entre um site bom e um site **com identidade** continua sendo o olhar humano: foi quando entrei com a paleta da marca, fotos reais da oficina e ajustes de tom de voz que o projeto começou a parecer meu, não um template.

**O que aprendi sobre o processo.** Programar com IA não é "não programar". É outra forma de programar. Você passa a ser mais arquiteto, revisor e diretor de arte do que digitador. Saber **o que pedir**, em que ordem, e identificar quando algo está fora do padrão (um arquivo que não devia ser editado, uma RLS frouxa, uma dependência desnecessária) acabou sendo a habilidade mais importante. A IA acelera quem já entende o terreno; para quem está começando, ela é uma escola excelente desde que você leia o código que ela escreve.

**Resumindo.** Recomendo a experiência. O resultado está aqui, no ar, funcionando — e cada decisão visual, cada texto, cada fluxo passou pela minha revisão. A IA escreveu boa parte das linhas; a direção e a responsabilidade são minhas.

---

## Licença

Projeto privado da Chriscell. O código deste repositório está disponível para fins de estudo e portfólio. Logos, fotos da loja e identidade visual pertencem à Chriscell e não devem ser reutilizados sem autorização.
