# Advocacia Marília — Site Institucional

Site institucional do espaço jurídico **Advocacia Marília** (Marília/SP).
Projeto da **[Almeida Escala Digital](https://almeidaescaladigital.com/)**.

---

## Índice

1. [Sobre o projeto](#sobre-o-projeto)
2. [Stack técnica](#stack-técnica)
3. [Estrutura de arquivos](#estrutura-de-arquivos)
4. [Rodando localmente](#rodando-localmente)
5. [Cache busting](#cache-busting)
6. [Blog (gerador de páginas)](#blog-gerador-de-páginas)
7. [Deploy na Hostinger](#deploy-na-hostinger)
8. [Google Tag Manager](#google-tag-manager)
9. [Pendências](#pendências)

---

## Sobre o projeto

| Campo | Valor |
|---|---|
| **Cliente** | Advocacia Marília |
| **Telefone / WhatsApp** | (14) 3413-8384 |
| **Link WA** | `https://wa.me/551434138384` |
| **Endereço** | Avenida Gonçalves Dias, 18, Centro — Marília/SP |
| **Áreas** | Civil · Imobiliário · Trabalhista · Previdenciário · Administrativo · Família e Sucessões · Penal · Consumidor |

---

## Stack técnica

- **HTML5 estático** — sem framework, sem build obrigatório
- **CSS3 puro** (`style.css`) — sem Tailwind, sem CSS-in-JS; variáveis nativas (`:root`), Grid e Flexbox
- **Vanilla JS** (`script.js`) — sem GSAP; scroll suave via [Lenis](https://lenis.darkroom.engineering/) (`lenis.min.js`, vendorizado localmente)
- **Fontes self-hosted** em `fonts/` (Work Sans, Bitter, Newsreader) — sem Google Fonts externo
- **Node** é usado **só em dev**, para gerar as páginas do blog (`tools/build-blog.mjs`) — o deploy continua 100% estático, sem servidor Node em produção

> Este projeto **não segue** o padrão padrão da agência (Tailwind CDN + GSAP). Foi construído a partir de um prompt próprio do cliente (`criadordesite.md`, não versionado). Não reintroduza Tailwind/GSAP aqui.

---

## Estrutura de arquivos

```
advocacia-marilia/
├── index.html                  # Página única (todas as seções da home)
├── style.css                   # Todo o CSS do site (design tokens + estilos)
├── script.js                   # Toda a interatividade (navbar, menu, FAQ, dropdown, WhatsApp widget, reveal)
├── lenis.min.js                # Lib de scroll suave (vendorizada, sem CDN)
├── .htaccess                   # Config Apache/Hostinger (cache, gzip, HTTPS, headers)
├── fonts/                      # Fontes self-hosted (.woff2)
├── curriculoseadvogados/       # Fotos + mini-currículos dos advogados (equipe)
├── blog/                       # GERADO por tools/build-blog.mjs — não editar os .html aqui na mão
│   ├── index.html              # Hub do blog, com uma seção por categoria (id="<categoria>")
│   └── <slug>/index.html        # Uma pasta por artigo
├── tools/
│   └── build-blog.mjs          # Gerador do blog (fonte única: ARTICLES + CATEGORIES no topo do arquivo)
├── *.png / *.webp               # Imagens do site (favicons, fotos de seção)
├── docs/specs/                 # Specs internas de sessões de trabalho (gitignored, não sobe)
└── README.md                   # Este arquivo
```

**Importante:** `blog/**/index.html` são **arquivos gerados**. Qualquer edição de texto de artigo, categoria ou do "chrome" (header/footer/menu compartilhado) deve ser feita em `tools/build-blog.mjs`, seguida de `node tools/build-blog.mjs` para regravar os HTMLs — nunca edite os HTMLs do blog diretamente, a próxima geração sobrescreve.

---

## Rodando localmente

### Pré-requisitos

- Um servidor HTTP simples para servir os arquivos (não abra o `index.html` direto via `file://` — o dropdown do menu e outras rotinas dependem de fetch/paths relativos que só funcionam via `http://`)
- **Node.js** apenas se for editar o blog (rodar `tools/build-blog.mjs`)

### Passo a passo

```bash
git clone https://github.com/Copyzin/Advocacia-Marilia.git
cd Advocacia-Marilia

# Servidor HTTP local (Python já vem instalado na maioria dos sistemas)
python -m http.server 8080
```

Abra `http://localhost:8080/` no navegador. Para editar o blog, veja a seção [Blog](#blog-gerador-de-páginas) abaixo.

**Checklist de validação local**

- [ ] Menu mobile (drawer lateral) abre e fecha corretamente
- [ ] Dropdown de categorias do "Blog" abre no hover (desktop, ≥992px) e some no mobile
- [ ] FAQ (accordion) expande/recolhe sem pulos de layout
- [ ] Widget de WhatsApp: tooltip de inatividade após 5s, chat simulado com as perguntas frequentes
- [ ] Seção de Especialidades: card de foto com zoom-out no hover, legenda sobe centralizada
- [ ] Animações de entrada (scroll reveal) disparam ao rolar
- [ ] Blog: hub (`/blog/`) lista os artigos por categoria; cada artigo abre em `/blog/<slug>/`

---

## Cache busting

`style.css` e `script.js` são carregados com `?v=N`. Depois de **qualquer** edição em um dos dois:

1. Incremente o número de versão em `index.html`:
   ```html
   <link rel="stylesheet" href="style.css?v=24">
   <script src="script.js?v=9" defer></script>
   ```
2. Se a edição afeta o CSS/JS compartilhado, **também** incremente `CSS_V`/`JS_V` no topo de `tools/build-blog.mjs`:
   ```js
   const CSS_V = 24;
   const JS_V = 9;
   ```
3. Rode `node tools/build-blog.mjs` para regravar as páginas do blog com a versão nova.

Sem isso, o navegador do visitante pode continuar servindo a versão antiga do CSS/JS a partir do cache.

---

## Blog (gerador de páginas)

- **Fonte única:** array `ARTICLES` (corpo dos artigos) e `CATEGORIES` (as 6 áreas) no topo de `tools/build-blog.mjs`. Não há JSON separado — o conteúdo mora no próprio script.
- **Gerador:** `node tools/build-blog.mjs` → produz `blog/index.html` (uma seção por categoria, cada uma com `id="<categoria>"`) e `blog/<slug>/index.html` (um por artigo), com o "chrome" (navbar, footer, widget de WhatsApp) duplicado e caminhos relativos corrigidos pela profundidade da página.
- **Adicionar um artigo:** acrescente um item em `ARTICLES` (mesmo formato dos existentes) → rode o gerador → se for destaque, atualize também o teaser de 3 artigos na seção `#blog` do `index.html` (mural da home).
- **Adicionar/editar uma categoria:** edite `CATEGORIES` em `build-blog.mjs` **e** o mapa `MENUS` em `script.js` (dentro de `initNavDropdowns`) — as duas listas precisam ficar em sincronia, uma alimenta o hub do blog e a outra o dropdown do menu "Blog".

---

## Deploy na Hostinger

Site **100% estático** — sem PHP, sem banco de dados. O deploy é apenas o envio dos arquivos para o servidor.

### O que enviar (e o que não enviar)

Envie **todo o conteúdo do repositório**, exceto:

| Não enviar | Por quê |
|---|---|
| `tools/` | Script de build local (Node); não é usado em runtime. Já bloqueado por `.htaccess`, mas o ideal é nem subir. |
| `docs/`, `*.md`, `*.pdf`, `*.docx` | Notas internas da agência/cliente — sem valor público, já bloqueados por `.htaccess` como segunda camada. |
| `.git/`, `.gitignore` | Controle de versão, não faz parte do site. |

A estrutura dentro de `public_html/` deve ficar assim (arquivos na raiz, sem subpasta extra tipo `public_html/advocacia-marilia/`):

```
public_html/
├── index.html
├── style.css
├── script.js
├── lenis.min.js
├── .htaccess
├── fonts/
├── curriculoseadvogados/
├── blog/
└── *.png / *.webp
```

### Opção 1 — Gerenciador de Arquivos (hPanel)

1. Acesse [hpanel.hostinger.com](https://hpanel.hostinger.com) → **Hospedagem** → domínio do cliente
2. **Gerenciador de Arquivos** → navegue até `public_html/`
3. **Enviar** → selecione os arquivos/pastas listados acima (não a pasta `tools/`)
4. Se o `.htaccess` não aparecer no upload, use **Nova pasta/arquivo** ou o editor de texto do próprio Gerenciador (às vezes arquivos que começam com `.` precisam ser criados manualmente e colados)

### Opção 2 — FTP (FileZilla)

Credenciais em **hPanel → Hospedagem → FTP**. Conecte, navegue até `/public_html/` no painel remoto e arraste os arquivos/pastas do projeto (excluindo `tools/`, `docs/`, `.md`, `.pdf`).

### Opção 3 — Git (se o plano Hostinger tiver acesso Git/SSH)

Alguns planos Hostinger (Business/Premium) permitem apontar `public_html/` para um repositório Git e fazer *pull* a cada deploy. Se disponível:

1. hPanel → **Git** → conecte o repositório `https://github.com/Copyzin/Advocacia-Marilia.git`, branch `main`
2. Configure o diretório de destino como `public_html/`
3. Cada `git push` para `main` pode disparar um novo deploy automático (dependendo da configuração) — **confirme esse comportamento antes de fazer push de mudanças experimentais**, para não publicar algo incompleto direto em produção

### Checklist pós-deploy

- [ ] Domínio carrega a home sem erro
- [ ] HTTPS ativo (cadeado no navegador) — o `.htaccess` força o redirect de `http` para `https`
- [ ] `/blog/` e um artigo (`/blog/planejamento-previdenciario/`) carregam corretamente
- [ ] DevTools → Network: `style.css?v=N` e `script.js?v=N` carregando a versão mais recente (não uma versão antiga em cache)
- [ ] `tools/build-blog.mjs` e os `.md`/`.pdf` internos **não** ficam acessíveis publicamente (teste `seudominio.com/tools/build-blog.mjs` — deve dar 403)
- [ ] Botões de WhatsApp (header, widget flutuante, CTA final) abrem o número certo

---

## Google Tag Manager

O site **ainda não tem** um container GTM instalado — nenhum ID foi fornecido até o momento. Abaixo está o procedimento padrão para quando o cliente disponibilizar o ID (`GTM-XXXXXXX`).

### Onde instalar

O GTM precisa estar presente em **todas** as páginas — a home (`index.html`, editada à mão) e as páginas do blog (geradas por `tools/build-blog.mjs`, a partir da função `chrome()`). Edite **os dois lugares**, ou o rastreamento fica incompleto no blog.

**1. Snippet do `<head>`** — insira **logo após a tag `<head>`**, antes de qualquer outra coisa:

- `index.html`: imediatamente após `<head>` (linha 3)
- `tools/build-blog.mjs`: dentro da função `chrome()`, imediatamente após `<head>` no template

```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
<!-- End Google Tag Manager -->
```

**2. Snippet do `<body>`** — insira **logo após a tag `<body>` de abertura**:

- `index.html`: imediatamente após `<body>` (linha 23)
- `tools/build-blog.mjs`: dentro de `chrome()`, imediatamente após `<body class="${bodyClass}">`

```html
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
```

### Depois de instalar

1. Troque `GTM-XXXXXXX` pelo ID real do container em **ambos** os arquivos
2. Rode `node tools/build-blog.mjs` para propagar o snippet para todas as páginas do blog
3. Bump de `?v=N` **não é necessário** aqui (o GTM não é servido via `style.css`/`script.js`), mas confirme no [Google Tag Assistant](https://tagassistant.google.com/) que o container carrega em `/` e em `/blog/` após o deploy
4. Eventos de clique nos CTAs de WhatsApp (header, FAB, sticky, CTA final) são bons candidatos a tags de conversão — os elementos já têm classes estáveis (`.nav-whatsapp`, `.wa-btn`, `.cta-anim`) para usar como seletor no GTM

---

## Pendências

- [ ] ID do container Google Tag Manager (cliente ainda não forneceu)
- [ ] Domínio de produção definitivo (nenhum domínio/canonical URL foi configurado no código até o momento)
- [ ] Confirmar se o plano Hostinger do cliente tem deploy automático via Git — se sim, revisar o fluxo de push descrito em [Deploy na Hostinger](#deploy-na-hostinger)

---

*Site desenvolvido por [Almeida Escala Digital](https://almeidaescaladigital.com/). Todos os direitos reservados.*
