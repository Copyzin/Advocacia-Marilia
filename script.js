/**
 * Website Advocacia Marília - Script de Interações e Visibilidade
 * Desenvolvido seguindo as diretrizes estritas do manual criadordesite.md
 * Vanilla JS, sem dependências.
 */

document.addEventListener('DOMContentLoaded', () => {
    initLenis();
    initNavbarVisibility();
    initFaqAccordion();
    initMobileMenu();
    initNavDropdowns();
    initSmoothScrolling();
    initScrollReveal();
    initFeaturedInvert();
    initFeaturedParallax();
    initHeroParallax();
    initWhatsAppWidget();
    initWhatsAppFabVisibility();
    initTeamModal();
    initLocationMap();
});

/**
 * 0. LENIS SMOOTH SCROLL (site inteiro)
 * Config validada no projeto Solia: lerp 0.1 = suavidade controlada, sem "lag"
 * nem inercia solta. Touch fica nativo (default do Lenis). Respeita
 * prefers-reduced-motion e degrada em silencio se a lib nao carregar.
 * "prevent" exclui o painel do WhatsApp e o modal de perfil da equipe: sem
 * isso o Lenis captura o wheel em QUALQUER lugar da pagina (inclusive sobre
 * um overlay/modal aberto) e rola o site por baixo dele em vez do conteudo
 * interno (chat ou bio do card) -- o overflow:hidden do body sozinho nao
 * impede isso, porque o Lenis rola via JS, nao via scroll nativo do browser.
 */
function initLenis() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (typeof window.Lenis === 'undefined') return;

    const lenis = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
        wheelMultiplier: 1,
        prevent: (node) => node.closest('.wa-panel') || node.closest('.team-modal'),
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    window.__lenis = lenis;
}

/**
 * 1. NAVBAR INTELIGENTE (esconde ao descer, reaparece ao subir)
 * Visivel no topo; ao rolar para baixo ela sai de cena; qualquer scroll-up
 * cumulativo >= 60px a traz de volta (padrao landing-patterns.md par. 6), para o
 * usuario nunca ficar sem navegacao. Jitter de trackpad (<6px) e ignorado.
 * Funciona em qualquer pagina (home e blog), sem depender de #inicio existir.
 */
function initNavbarVisibility() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    const UP_REVEAL_THRESHOLD = 60;  // px acumulados de scroll-up para revelar
    const DOWN_HIDE_THRESHOLD = 80;  // px acumulados de scroll-down para esconder
    const JITTER = 6;                // ignora micro-oscilacoes de trackpad
    const TOP_ZONE = 80;             // ate aqui a navbar fica sempre visivel

    let lastY = window.scrollY;
    let upAccum = 0;
    let downAccum = 0;

    function onScroll() {
        const y = window.scrollY;
        const delta = y - lastY;
        lastY = y;

        navbar.classList.toggle('scrolled', y > 50);

        if (y <= TOP_ZONE) {
            navbar.classList.remove('navbar-hidden');
            upAccum = 0;
            downAccum = 0;
            return;
        }

        if (delta < -JITTER) {
            upAccum += -delta;
            downAccum = 0;
            if (upAccum >= UP_REVEAL_THRESHOLD) navbar.classList.remove('navbar-hidden');
        } else if (delta > JITTER) {
            downAccum += delta;
            upAccum = 0;
            if (downAccum >= DOWN_HIDE_THRESHOLD) navbar.classList.add('navbar-hidden');
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

/**
 * 2. UX DO ACCORDION (FAQ)
 * Utiliza transição de CSS Grid (grid-template-rows: 0fr -> 1fr) para evitar layout shifts e travamentos.
 */
function initFaqAccordion() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            if (!answer) return;
            
            const isExpanded = question.getAttribute('aria-expanded') === 'true';
            
            // Opcional: Fecha outros accordions abertos para um visual mais limpo
            faqQuestions.forEach(otherQuestion => {
                if (otherQuestion !== question) {
                    otherQuestion.setAttribute('aria-expanded', 'false');
                    const otherAnswer = otherQuestion.nextElementSibling;
                    if (otherAnswer) otherAnswer.classList.remove('open');
                }
            });

            // Alterna o estado do accordion clicado
            if (isExpanded) {
                question.setAttribute('aria-expanded', 'false');
                answer.classList.remove('open');
            } else {
                question.setAttribute('aria-expanded', 'true');
                answer.classList.add('open');
            }
        });
    });
}

/**
 * 3. MENU MOBILE HAMBÚRGUER
 * Gerencia a abertura e fechamento do menu responsivo lateral.
 */
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    const navItems = document.querySelectorAll('.nav-item');
    
    if (!menuToggle || !navLinks) return;

    menuToggle.addEventListener('click', () => {
        const isActive = menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.classList.toggle('menu-open', isActive); // overlay escurecedor (CSS body::before)
        menuToggle.setAttribute('aria-expanded', isActive);
    });

    // Fecha o menu automaticamente quando o usuário clica em algum link
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.classList.remove('menu-open');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

/**
 * 3.5. DROPDOWN DE CATEGORIAS NO MENU (BLOG)
 * So desktop (Dropdown Patterns.md, origem HAAS): injeta o submenu por JS a partir
 * de um mapa MENUS. Chave por data-dropdown (nao por href): o href do link "Blog"
 * muda de profundidade entre a home (blog/) e as paginas internas (../blog/,
 * ../../blog/), entao o link de cada categoria e montado em cima do href REAL do
 * gatilho (+ "#" + id), o que ja resolve certo em qualquer profundidade.
 * Categorias espelham CATEGORIES de tools/build-blog.mjs: atualize os dois juntos
 * se uma area de atuacao mudar. Hover tolerante (dwell/close delay), um aberto por
 * vez, acessivel por teclado (foco abre, Esc fecha). display:contents no mobile
 * (CSS) neutraliza o wrapper: sem dropdown reaproveitado no drawer.
 * Caret = <span class="nav-caret"> injetado (NUNCA ::after: o .nav-item ja usa
 * ::after pro sublinhado do hover, e reaproveitar o pseudo-elemento faz o
 * quadradinho herdar position/transform do sublinhado e nascer fora do lugar).
 */
function initNavDropdowns() {
    const nav = document.getElementById('navLinks');
    if (!nav) return;

    const MENUS = {
        blog: {
            eyebrow: 'Categorias',
            items: [
                { id: 'previdenciario', label: 'Direito Previdenciário', sub: 'Aposentadorias, benefícios e planejamento junto ao INSS.' },
                { id: 'familia-sucessoes', label: 'Família e Sucessões', sub: 'Inventários, partilhas, divórcios e planejamento sucessório.' },
                { id: 'imobiliario', label: 'Direito Imobiliário', sub: 'Compra e venda, locações e regularização de imóveis.' },
                { id: 'trabalhista', label: 'Direito do Trabalho', sub: 'Relações de emprego, verbas e prevenção de litígios.' },
                { id: 'penal', label: 'Direito Penal e Execução Penal', sub: 'Defesa criminal, flagrantes e direitos na execução da pena.' },
                { id: 'civil-consumidor', label: 'Civil e Consumidor', sub: 'Contratos, cobranças e relações de consumo.' },
            ],
        },
    };

    const OPEN_DELAY = 120;   // ms -- exige dwell; flick de passagem nao abre
    const CLOSE_DELAY = 220;  // ms -- tolerancia ao sair; re-entrada cancela

    const controllers = [];
    const closeOthers = (except) => controllers.forEach((c) => { if (c !== except) c.closeNow(); });

    nav.querySelectorAll('a[data-dropdown]').forEach((trigger) => {
        const menu = MENUS[trigger.dataset.dropdown];
        if (!menu) return;

        const base = trigger.getAttribute('href'); // ja vem certo pra profundidade da pagina

        const group = document.createElement('span');
        group.className = 'nav-group';
        trigger.parentNode.insertBefore(group, trigger);
        group.appendChild(trigger);
        trigger.classList.add('nav-group__trigger');
        trigger.setAttribute('aria-haspopup', 'true');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.insertAdjacentHTML('beforeend', '<span class="nav-caret" aria-hidden="true"></span>');

        const itemsHTML = menu.items.map((it) =>
            '<a class="nav-dropdown__item" href="' + base + '#' + it.id + '" role="menuitem">' +
                '<span class="nav-dropdown__label">' + it.label + '</span>' +
                '<span class="nav-dropdown__sub">' + it.sub + '</span>' +
            '</a>'
        ).join('');

        const panel = document.createElement('div');
        panel.className = 'nav-dropdown';
        panel.setAttribute('role', 'menu');
        panel.innerHTML =
            '<div class="nav-dropdown__inner">' +
                '<p class="nav-dropdown__eyebrow">' + menu.eyebrow + '</p>' + itemsHTML +
            '</div>';
        group.appendChild(panel);           // painel e FILHO do grupo (hover tolerante)

        let openT = null, closeT = null;
        const isOpen  = () => group.classList.contains('is-open');
        const showNow = () => {
            clearTimeout(openT); clearTimeout(closeT);
            closeOthers(ctrl);               // exclusao mutua: fecha os outros JA
            group.classList.add('is-open');
            trigger.setAttribute('aria-expanded', 'true');
        };
        const closeNow = () => {
            clearTimeout(openT); clearTimeout(closeT);
            group.classList.remove('is-open');
            trigger.setAttribute('aria-expanded', 'false');
        };
        const ctrl = { closeNow };
        controllers.push(ctrl);

        group.addEventListener('mouseenter', () => {
            clearTimeout(closeT);            // re-entrada rapida cancela o fechamento
            if (isOpen()) return;
            clearTimeout(openT);
            openT = setTimeout(showNow, OPEN_DELAY);
        });
        group.addEventListener('mouseleave', () => {
            clearTimeout(openT);             // cancela abertura pendente (flick)
            if (isOpen()) { clearTimeout(closeT); closeT = setTimeout(closeNow, CLOSE_DELAY); }
        });

        // Teclado: foco abre na hora (sem dwell); Esc fecha e devolve o foco.
        group.addEventListener('focusin', () => { clearTimeout(closeT); showNow(); });
        group.addEventListener('focusout', (e) => {
            if (!group.contains(e.relatedTarget)) { clearTimeout(closeT); closeT = setTimeout(closeNow, CLOSE_DELAY); }
        });
        group.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') { closeNow(); trigger.focus(); }
        });
    });
}

/**
 * 4. NAVEGAÇÃO SUAVE
 * Garante rolagem nativa suave com ajustes para navegadores antigos e foco de acessibilidade.
 */
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                if (window.__lenis) {
                    // offset -80 replica o scroll-padding-top da navbar fixa
                    window.__lenis.scrollTo(targetElement, { offset: -80, duration: 1.1, force: true });
                } else {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }

                // Atualiza o foco de acessibilidade
                targetElement.setAttribute('tabindex', '-1');
                targetElement.focus({ preventScroll: true });
            }
        });
    });
}

/**
 * 5. SCROLL REVEAL (Animação de Entrada ao Rolar)
 * Utiliza o IntersectionObserver para evitar escutas de scroll pesadas e travamentos de renderização.
 */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');
    
    if (revealElements.length === 0) return;
    
    const revealObserverOptions = {
        root: null,
        threshold: 0.15, // Dispara quando 15% do elemento está visível
        rootMargin: '0px 0px -40px 0px' // Offset sutil de segurança
    };
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // Interrompe a observação do elemento após sua primeira animação
                observer.unobserve(entry.target);
            }
        });
    }, revealObserverOptions);
    
    revealElements.forEach(element => {
        revealObserver.observe(element);
    });
}

/**
 * 5.1. INVERSAO DO CARD "COMPROMISSO" (Abordagem de Trabalho)
 * Substitui o gatilho :hover cru por uma maquina de estados com 3 protecoes,
 * porque a coreografia usa delays escalonados e delays congelam pela metade
 * quando o hover reverte no meio da sequencia:
 *   1. INTENCAO (90ms): so inverte com hover sustentado -- tangenciar a borda
 *      do card com o cursor nao dispara nada.
 *   2. TRAVA (1000ms): uma vez iniciada, a entrada COMPLETA antes de poder
 *      reverter -- a animacao nunca para no meio, mesmo se o cursor sair.
 *   3. GRACA (220ms): ao sair, a reversao espera um instante -- re-entrada
 *      rapida cancela a saida sem nenhum piscar.
 * Mesmo padrao de tolerancia do chat do WhatsApp (whatsapp-bubble-button par. 7b).
 */
function initFeaturedInvert() {
    const card = document.querySelector('.method-featured');
    const media = card ? card.querySelector('.method-featured-media') : null;
    if (!card || !media) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const ENTER_INTENT = 90;
    const EXIT_GRACE = 220;
    const MIN_HOLD = 1000;

    let enterTimer = null;
    let exitTimer = null;
    let holdUntil = 0;

    media.addEventListener('pointerenter', () => {
        clearTimeout(exitTimer);
        if (card.classList.contains('is-inverted')) return;
        clearTimeout(enterTimer);
        enterTimer = setTimeout(() => {
            card.classList.add('is-inverted');
            holdUntil = performance.now() + MIN_HOLD;
        }, ENTER_INTENT);
    });

    media.addEventListener('pointerleave', () => {
        clearTimeout(enterTimer);
        clearTimeout(exitTimer);
        if (!card.classList.contains('is-inverted')) return;
        const wait = Math.max(EXIT_GRACE, holdUntil - performance.now());
        exitTimer = setTimeout(() => card.classList.remove('is-inverted'), wait);
    });
}

/**
 * 5.2. PARALLAX SUTIL DA FOTO DO CARD "COMPROMISSO" (Abordagem de Trabalho)
 * A foto e 8% mais alta que o quadro (CSS: height 108% / top -4%) e desliza
 * ate +-4% conforme o card cruza o viewport. Head-safe: o deslocamento maximo
 * corta no maximo 3.7% do topo da imagem, abaixo da margem de 5.5% que o crop
 * guarda acima do cabelo da advogada. rAF + scroll passivo (sem jank).
 */
function initFeaturedParallax() {
    const media = document.querySelector('.method-featured-media');
    const img = media ? media.querySelector('.featured-img') : null;
    if (!media || !img) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let ticking = false;

    function update() {
        ticking = false;
        const r = media.getBoundingClientRect();
        const vh = window.innerHeight;
        if (r.bottom < 0 || r.top > vh) return;
        // Progresso -1..1 do centro do quadro em relacao ao centro do viewport
        const p = ((r.top + r.height / 2) - vh / 2) / (vh / 2 + r.height / 2);
        const range = r.height * 0.04;
        img.style.transform = 'translateY(' + (-p * range).toFixed(1) + 'px)';
    }

    function onScroll() {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(update);
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
}

/**
 * 5.3. PARALLAX DE SCROLL DA FOTO DE FUNDO DO HERO
 * Mesmo efeito do hero da Solia (GSAP scrub la, vanilla aqui: este projeto nao
 * usa GSAP): a foto desliza ate 8% da propria altura enquanto o Hero cruza o
 * viewport (progress 0 no topo do scroll, 1 quando o Hero termina de passar).
 * height:112% + top:0 no CSS reserva a sobra so embaixo -- desloca so pra cima,
 * nunca vaza a cor do fundo da secao seguinte. rAF + scroll passivo (sem jank).
 */
function initHeroParallax() {
    const hero = document.getElementById('inicio');
    const img = hero ? hero.querySelector('.hero-media-img') : null;
    if (!hero || !img) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const RANGE_RATIO = 0.08;
    let ticking = false;

    function update() {
        ticking = false;
        const r = hero.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        const progress = Math.min(1, Math.max(0, -r.top / r.height));
        const range = r.height * RANGE_RATIO;
        img.style.transform = 'translateY(' + (-progress * range).toFixed(1) + 'px)';
    }

    function onScroll() {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(update);
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
}

/**
 * 5.5. VISIBILIDADE DO WIDGET DE WHATSAPP (esconde no Hero)
 * Fica oculto enquanto a Hero (#inicio) esta visivel; aparece assim que o
 * usuario rola alem dela (coincide com a chegada em #sobre, a secao seguinte).
 * IntersectionObserver (nao scroll listener) por padrao do criadordesite.md.
 */
function initWhatsAppFabVisibility() {
    const widget = document.getElementById('waWidget');
    if (!widget) return;

    // Paginas sem hero (blog): FAB visivel desde o load
    const hero = document.getElementById('inicio');
    if (!hero) {
        widget.classList.add('is-visible');
        return;
    }

    // A navbar fixa cobre os primeiros "--nav-height" px do viewport: sem esse
    // encolhimento na raiz de interseccao, o hero ainda conta como "visivel"
    // por uma fatia inteiramente escondida atras da navbar. Soma-se uma folga
    // extra para o gatilho cair um pouco DENTRO do #sobre, nao bem na emenda
    // (emenda exata e um limite geometrico fragil, sensivel a arredondamento).
    const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'), 10) || 80;
    const triggerMargin = navHeight + 100;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            widget.classList.toggle('is-visible', !entry.isIntersecting);
        });
    }, { threshold: 0, rootMargin: `-${triggerMargin}px 0px 0px 0px` });

    observer.observe(hero);
}

/**
 * 6. WIDGET DE WHATSAPP FLUTUANTE INTELIGENTE
 * Gerencia a interatividade do chat simulado de WhatsApp e tooltip de inatividade.
 */
function initWhatsAppWidget() {
    const widget = document.getElementById('waWidget');
    if (widget) {
        setupWhatsAppWidget(widget);
    }
}

function setupWhatsAppWidget(widget) {
    const elements = {
        widget: widget,
        btn: document.getElementById('waBtn'),
        panel: document.getElementById('waPanel'),
        tooltip: document.getElementById('waTooltip'),
        tooltipClose: document.getElementById('waTooltipClose'),
        chatArea: document.getElementById('waChatArea'),
        faqList: document.getElementById('waFaqList'),
        faqButtons: document.querySelectorAll('.wa-faq-btn')
    };

    if (!elements.btn || !elements.panel) return;

    // Estado compartilhado entre tooltip, interacoes e chat (spec: whatsapp-bubble-button.md par. 2 e 7b)
    const state = {
        interacted: false,
        tooltipTimeout: null,
        overBtn: false,
        overPanel: false,
        closeTimer: null,
        reopenTimer: null,
        dismissed: false,   // "X" do tooltip dispensa na sessao (hover longo no FAB reabre)
        pinned: false       // clicar numa pergunta "pina" o chat: nao fecha sozinho
    };

    setupWhatsAppTooltip(elements, state);
    setupWhatsAppInteractions(elements, state);
    setupWhatsAppChat(elements, state);
}

function setupWhatsAppTooltip(elements, state) {
    state.tooltipTimeout = setTimeout(() => {
        if (!state.interacted) {
            elements.tooltip.classList.add('active');
        }
    }, 5000);

    elements.tooltipClose.addEventListener('click', (e) => {
        e.stopPropagation();
        elements.tooltip.classList.remove('active');
        state.interacted = true;
        state.dismissed = true;
        clearTimeout(state.tooltipTimeout);
    });
}

/**
 * Comportamento do chat portado de whatsapp-bubble-button.md (par. 7b):
 * - abre no pointerenter do FAB (desktop);
 * - fecha ~260ms depois que o ponteiro sai do FAB E do painel (grace period --
 *   e o que evita o fechamento instantaneo ao atravessar o vao entre eles);
 * - clicar numa pergunta "pina" (nao fecha sozinho); clique fora despina e fecha;
 * - o "X" do tooltip dispensa, mas hover de 600ms no FAB reabre (nunca e permanente).
 * Mobile/touch: sem chat -- o FAB e um link direto pro wa.me (CSS esconde painel/tooltip).
 */
function setupWhatsAppInteractions(elements, state) {
    const isHoverSupported = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!isHoverSupported) return;

    const GRACE_CLOSE_MS = 260;
    const REOPEN_DELAY_MS = 600;

    const openChat = () => {
        elements.panel.classList.add('active');
        elements.tooltip.classList.remove('active');
        state.interacted = true;
        clearTimeout(state.tooltipTimeout);
    };

    const closeChat = () => {
        elements.panel.classList.remove('active');
        state.pinned = false;
    };

    const scheduleClose = () => {
        clearTimeout(state.closeTimer);
        state.closeTimer = setTimeout(() => {
            if (!state.overBtn && !state.overPanel && !state.pinned) closeChat();
        }, GRACE_CLOSE_MS);
    };

    elements.btn.addEventListener('pointerenter', () => {
        state.overBtn = true;
        clearTimeout(state.closeTimer);
        if (state.dismissed) {
            // dispensa pelo "X" nao e permanente: hover sustentado reabre
            clearTimeout(state.reopenTimer);
            state.reopenTimer = setTimeout(() => {
                if (!state.overBtn) return;
                state.dismissed = false;
                openChat();
            }, REOPEN_DELAY_MS);
        } else {
            openChat();
        }
    });

    elements.btn.addEventListener('pointerleave', () => {
        state.overBtn = false;
        clearTimeout(state.reopenTimer);
        scheduleClose();
    });

    elements.panel.addEventListener('pointerenter', () => {
        state.overPanel = true;
        clearTimeout(state.closeTimer);
    });

    elements.panel.addEventListener('pointerleave', () => {
        state.overPanel = false;
        scheduleClose();
    });

    document.addEventListener('click', (e) => {
        if (!elements.panel.classList.contains('active')) return;
        if (elements.widget.contains(e.target)) return;
        closeChat();
    });
}

function setupWhatsAppChat(elements, state) {
    const faqAnswers = {
        '1': "O escritório funciona como um espaço de cooperação jurídica compartilhada. Cada advogado exerce suas atividades com total autonomia profissional, independência técnica e sigilo. Isso garante atendimento personalizado e especializado, ao mesmo tempo em que permite a cooperação entre os profissionais quando a complexidade do caso exige.",
        '2': "O agendamento pode ser feito de forma simples pelo telefone fixo (14) 3413 8384 ou clicando nos botões de CTA (\"Falar com um Advogado\") espalhados pelo site, que direcionam para o nosso atendimento digital. Realizamos atendimentos presenciais na nossa sede e também consultas remotas por videoconferência.",
        '3': "Para a primeira reunião de avaliação, sugerimos trazer seus documentos pessoais (RG, CPF e comprovante de endereço) e toda a documentação que esteja diretamente relacionada ao seu caso (por exemplo: contratos, notificações, carteira de trabalho, certidões de nascimento/óbito, decisões judiciais anteriores, etc.).",
        '4': "Estamos estabelecidos em sede própria na Avenida Gonçalves Dias, 18, Centro - Marília, SP (próximo à região central). Nossa estrutura física foi planejada para garantir total acessibilidade, conforto e absoluta privacidade durante os atendimentos."
    };

    elements.faqButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const questionText = btn.textContent;
            if (id && faqAnswers[id]) {
                if (state) state.pinned = true; // conversa iniciada: chat nao fecha sozinho
                handleFaqClick(id, questionText, faqAnswers[id], elements);
            }
        });
    });
}

function handleFaqClick(id, questionText, answerText, elements) {
    elements.faqList.style.display = 'none';
    elements.chatArea.classList.add('wa-chat-area--full'); // sem a lista, chat preenche o painel

    const userMsg = document.createElement('div');
    userMsg.className = 'wa-message wa-msg-sent';
    userMsg.innerHTML = `<p>${questionText}</p>`;
    elements.chatArea.appendChild(userMsg);
    
    elements.chatArea.scrollTop = elements.chatArea.scrollHeight;

    const typingMsg = document.createElement('div');
    typingMsg.className = 'wa-message wa-msg-received wa-msg-typing';
    typingMsg.innerHTML = `
        <div class="wa-typing-dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    elements.chatArea.appendChild(typingMsg);
    elements.chatArea.scrollTop = elements.chatArea.scrollHeight;

    const delay = Math.floor(Math.random() * 300) + 1200;
    setTimeout(() => {
        renderFaqResponse(typingMsg, answerText, elements);
    }, delay);
}

function renderFaqResponse(typingElement, answerText, elements) {
    if (typingElement && typingElement.parentNode) {
        typingElement.parentNode.removeChild(typingElement);
    }

    const responseMsg = document.createElement('div');
    responseMsg.className = 'wa-message wa-msg-received';
    responseMsg.innerHTML = `<p>${answerText}</p>`;
    elements.chatArea.appendChild(responseMsg);
    elements.chatArea.scrollTop = elements.chatArea.scrollHeight;

    setTimeout(() => {
        elements.faqList.style.display = 'flex';
        elements.chatArea.classList.remove('wa-chat-area--full'); // lista de volta: chat volta a so ocupar o proprio conteudo
        elements.chatArea.scrollTop = elements.chatArea.scrollHeight;
    }, 300);
}

/**
 * 7. MODAL DE DETALHES DE PERFIL DA EQUIPE
 * Controla a exibição premium do perfil e mini-currículo do advogado em modal/dialog.
 */
function initTeamModal() {
    const buttons = document.querySelectorAll('.team-expand-btn');
    const modal = document.getElementById('teamModal');
    if (buttons.length > 0 && modal) {
        setupTeamModalEvents(buttons, modal);
    }
}

function setupTeamModalEvents(buttons, modal) {
    const closeBtn = document.getElementById('teamModalClose');
    const overlay = document.getElementById('teamModalOverlay');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            openTeamModal(btn, modal);
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeTeamModal(modal));
    }
    if (overlay) {
        overlay.addEventListener('click', () => closeTeamModal(modal));
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeTeamModal(modal);
        }
    });
}

/**
 * Canais de contato individuais exibidos como botões circulares no modal.
 * A ordem do array define a ordem visual; só renderiza o que o card declarar
 * via data-* no elemento .team-contact-data (ausência de atributo = sem botão).
 */
const TEAM_CONTACT_TYPES = [
    {
        attr: 'instagram',
        label: 'Instagram',
        external: true,
        icon: '<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>'
    },
    {
        attr: 'facebook',
        label: 'Facebook',
        external: true,
        icon: '<path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z"/>'
    },
    {
        attr: 'whatsapp',
        label: 'WhatsApp',
        external: true,
        icon: '<path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.748-.984zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01a1.1 1.1 0 0 0-.792.372c-.272.297-1.04 1.016-1.04 2.479s1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>'
    },
    {
        attr: 'email',
        label: 'E-mail',
        external: false,
        icon: '<path d="M12 12.713L.015 3.75h23.97L12 12.713zm0 2.574L0 6.313V20.25h24V6.313l-12 8.974z"/>'
    },
    {
        attr: 'phone',
        label: 'Telefone',
        external: false,
        icon: '<path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>'
    }
];

function renderTeamModalContacts(card, name) {
    const container = document.getElementById('teamModalContacts');
    if (!container) return;

    container.innerHTML = '';
    const data = card.querySelector('.team-contact-data');
    let count = 0;

    if (data) {
        TEAM_CONTACT_TYPES.forEach(type => {
            const href = data.getAttribute('data-' + type.attr);
            if (!href) return;

            const link = document.createElement('a');
            link.className = 'team-contact-btn';
            link.href = href;
            link.setAttribute('aria-label', type.label + ' de ' + name);
            link.setAttribute('title', type.label);
            if (type.external) {
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
            }
            link.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden="true">' + type.icon + '</svg>';
            container.appendChild(link);
            count++;
        });
    }

    container.classList.toggle('has-contacts', count > 0);
}

// IDs dos setTimeout de limpeza pos-fechamento (ver closeTeamModal). Precisam
// ser cancelados se um novo perfil abrir antes dos 500ms virarem, senao a
// limpeza "atrasada" apaga a imagem/contatos do perfil recem-aberto.
let teamModalImageCleanupTimer = null;
let teamModalContactsCleanupTimer = null;

function openTeamModal(button, modal) {
    const card = button.closest('.team-card');
    if (!card) return;

    clearTimeout(teamModalImageCleanupTimer);
    clearTimeout(teamModalContactsCleanupTimer);

    const name = card.querySelector('.team-name')?.textContent || '';
    const oab = card.querySelector('.team-oab')?.textContent || '';
    const specialty = card.querySelector('.team-specialty')?.textContent || '';
    const imgSrc = card.querySelector('.team-img')?.getAttribute('src') || '';
    const bioText = card.querySelector('.team-bio-data')?.innerHTML || '';

    const modalImg = document.getElementById('teamModalImg');
    const modalName = document.getElementById('teamModalName');
    const modalOab = document.getElementById('teamModalOab');
    const modalSpecialty = document.getElementById('teamModalSpecialty');
    const modalBio = document.getElementById('teamModalBio');

    if (modalImg) {
        modalImg.classList.remove('loaded');
        modalImg.src = imgSrc;
        modalImg.alt = name;
        
        // Trata cache do navegador ou carregamento assíncrono para evitar flash visual
        if (modalImg.complete) {
            modalImg.classList.add('loaded');
        } else {
            modalImg.onload = () => {
                modalImg.classList.add('loaded');
            };
        }
    }
    
    if (modalName) modalName.textContent = name;
    if (modalOab) modalOab.textContent = oab;
    if (modalSpecialty) modalSpecialty.textContent = specialty;
    if (modalBio) modalBio.innerHTML = bioText;

    renderTeamModalContacts(card, name);

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeTeamModal(modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    // Remove o estado de carregamento da imagem após o fechamento para a próxima abertura
    const modalImg = document.getElementById('teamModalImg');
    if (modalImg) {
        teamModalImageCleanupTimer = setTimeout(() => {
            modalImg.classList.remove('loaded');
            modalImg.src = '';
        }, 500); // Aguarda a transição de fade-out do modal terminar
    }

    // Limpa os botões de contato para não vazarem para o próximo perfil aberto
    const modalContacts = document.getElementById('teamModalContacts');
    if (modalContacts) {
        teamModalContactsCleanupTimer = setTimeout(() => {
            modalContacts.innerHTML = '';
            modalContacts.classList.remove('has-contacts');
        }, 500);
    }
}

/**
 * Minimapa interativo da seção Localização (Leaflet + tiles OpenStreetMap,
 * vendorizados localmente -- ver leaflet.min.js/leaflet.css). Substituiu um
 * iframe simples do Google Maps: sem API própria, um embed assim não expõe
 * pan/zoom para JS, então travar o arraste era a única forma de manter um pin
 * customizado alinhado -- com Leaflet o próprio motor da lib reposiciona
 * marker/popup a cada frame de pan/zoom, então dá para ter as duas coisas
 * (mapa 100% arrastável + pin/popup sempre grudados no endereço certo, sem
 * lag/flicker). Lazy: só monta o mapa quando a seção se aproxima do viewport.
 */
function initLocationMap() {
    const container = document.getElementById('locationMap');
    if (!container || typeof L === 'undefined') return;

    const LAT = -22.2222946;
    const LNG = -49.9452386;
    const ROUTE_URL = 'https://www.google.com/maps/dir/?api=1&destination=Av.%20Gon%C3%A7alves%20Dias%2C%2018%20-%20Centro%2C%20Mar%C3%ADlia%20-%20SP%2C%20Brasil';

    const observer = new IntersectionObserver((entries, obs) => {
        if (entries.some((entry) => entry.isIntersecting)) {
            createLocationMap(container, LAT, LNG, ROUTE_URL);
            obs.disconnect();
        }
    }, { rootMargin: '300px' });

    observer.observe(container);
}

function createLocationMap(container, lat, lng, routeUrl) {
    const map = L.map(container, {
        center: [lat, lng],
        zoom: 17,
        scrollWheelZoom: false, // sem "sequestrar" o scroll da pagina ao passar o mouse
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
    }).addTo(map);

    // Tint navy por cima dos tiles (o filtro grayscale do pane fica no CSS)
    const tint = document.createElement('div');
    tint.className = 'location-map-tint';
    tint.setAttribute('aria-hidden', 'true');
    map.getContainer().appendChild(tint);

    const pinIcon = L.divIcon({
        className: 'location-pin-wrapper',
        html: `<div class="location-pin">
            <svg class="location-pin-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden="true">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/>
            </svg>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -30],
    });

    const marker = L.marker([lat, lng], { icon: pinIcon, alt: 'Ver detalhes do endereço', keyboard: true }).addTo(map);

    const popupHtml = `<a href="${routeUrl}" target="_blank" rel="noopener noreferrer" class="location-card" aria-label="Ver rotas até Av. Gonçalves Dias, 18. Estacionamento próprio no local.">
        <p class="location-card-title">Av. Gonçalves Dias, 18</p>
        <p class="location-card-sub">Centro, Marília - SP</p>
        <p class="location-card-parking">
            <span class="location-card-parking-icon" aria-hidden="true">P</span>
            Estacionamento próprio no local
            <span class="location-card-arrow" aria-hidden="true">
                <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 12 12 4M12 4H5.5M12 4v6.5"/>
                </svg>
            </span>
        </p>
    </a>`;

    marker.bindPopup(popupHtml, { maxWidth: 220, minWidth: 220, autoPanPadding: [16, 16] });

    // Hover (desktop) abre/fecha o popup; toque usa o click padrao do Leaflet
    // (abre ao tocar o pin, fecha no X ou tocando fora). Ponte de hover entre
    // pin e popup: sair do pin em direcao ao popup nao fecha antes de dar tempo
    // de alcancar o link dentro dele.
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        let closeTimer = null;
        const cancelClose = () => { if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; } };
        const scheduleClose = () => { cancelClose(); closeTimer = setTimeout(() => marker.closePopup(), 200); };

        marker.on('mouseover', () => { cancelClose(); marker.openPopup(); });
        marker.on('mouseout', scheduleClose);
        marker.on('popupopen', (e) => {
            const el = e.popup.getElement();
            if (el) {
                el.addEventListener('mouseenter', cancelClose);
                el.addEventListener('mouseleave', scheduleClose);
            }
        });
    }
}
