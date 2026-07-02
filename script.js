/**
 * Website Advocacia Marília - Script de Interações e Visibilidade
 * Desenvolvido seguindo as diretrizes estritas do manual criadordesite.md
 * Vanilla JS, sem dependências.
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavbarVisibility();
    initFaqAccordion();
    initMobileMenu();
    initSmoothScrolling();
    initScrollReveal();
    initWhatsAppWidget();
    initWhatsAppFabVisibility();
    initTeamModal();
});

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
        menuToggle.setAttribute('aria-expanded', isActive);
    });

    // Fecha o menu automaticamente quando o usuário clica em algum link
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
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
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
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
