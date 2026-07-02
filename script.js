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
    initFeaturedParallax();
    initWhatsAppWidget();
    initWhatsAppFabVisibility();
    initTeamModal();
});

/**
 * 0. LENIS SMOOTH SCROLL (site inteiro)
 * Config validada no projeto Solia: lerp 0.1 = suavidade controlada, sem "lag"
 * nem inercia solta. Touch fica nativo (default do Lenis). Respeita
 * prefers-reduced-motion e degrada em silencio se a lib nao carregar.
 */
function initLenis() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (typeof window.Lenis === 'undefined') return;

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 });

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

function openTeamModal(button, modal) {
    const card = button.closest('.team-card');
    if (!card) return;

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
        setTimeout(() => {
            modalImg.classList.remove('loaded');
            modalImg.src = '';
        }, 500); // Aguarda a transição de fade-out do modal terminar
    }
}
