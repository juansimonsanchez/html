
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.dropdown').forEach(dd => {
        const btn = dd.querySelector('.dropbtn');
        const content = dd.querySelector('.dropdown-content');
        if (btn && content) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = content.style.display === 'block';
                document.querySelectorAll('.dropdown-content').forEach(c => c.style.display = 'none');
                document.querySelectorAll('.dropbtn').forEach(b => b.classList.remove('active'));
                if (!isOpen) {
                    content.style.display = 'block';
                    btn.classList.add('active');
                }
            });
        }
    });

    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-content').forEach(c => c.style.display = '');
        document.querySelectorAll('.dropbtn').forEach(b => b.classList.remove('active'));
    });

    document.querySelectorAll('a[href*="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const rawHref = this.getAttribute('href') || '';
            const hashIdx = rawHref.indexOf('#');
            if (hashIdx === -1) return;
            const hash = rawHref.substring(hashIdx + 1);
            if (!hash) return;

            let targetId = hash;
            try { targetId = decodeURIComponent(hash); } catch(err) {}

            let targetEl = document.getElementById(targetId) || document.querySelector('[name="' + targetId + '"]');
            if (!targetEl) {
                for (let el of document.querySelectorAll('[id]')) {
                    if (el.id === targetId || decodeURIComponent(el.id) === targetId) {
                        targetEl = el;
                        break;
                    }
                }
            }

            if (targetEl) {
                e.preventDefault();
                const headerOffset = 75;
                const elementPosition = targetEl.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                if (history.pushState) {
                    history.pushState(null, null, '#' + targetId);
                }
            }
        });
    });
});

function copyCode(btn) {
    const code = btn.nextElementSibling ? btn.nextElementSibling.innerText : '';
    navigator.clipboard.writeText(code).then(() => {
        const orig = btn.innerText;
        btn.innerText = '✅ ¡Copiado!';
        btn.style.background = '#16a34a';
        setTimeout(() => {
            btn.innerText = orig;
            btn.style.background = '#334155';
        }, 2000);
    });
}

// ==========================================
// CONFIGURACIÓN PÚBLICA (100% SEGURA EN GITHUB)
// ==========================================
// Reemplaza por la IP local de tu ordenador servidor (ej. http://192.168.1)
const OPEN_WEBUI_URL = "http://172.16.0.20:3000/api"; 
const ID_COLECCION = "d87b1f84-be2b-4ab0-9f82-14ca45fc14d5";
const MODELO_VLLM = "google/gemma-4-e4b-it";  

let chatWindow = null;
let loginBox = null;
let chatBox = null;
let inputArea = null;
let chatInput = null;
let chatSend = null;
let toggleBtn = null;
let btnLogout = null;

let historialMensajes = [];

function initAssistant() {
    chatWindow = document.getElementById('owui-chat-window');
    loginBox = document.getElementById('owui-login-box');
    chatBox = document.getElementById('owui-chat-box');
    inputArea = document.getElementById('owui-input-area');
    chatInput = document.getElementById('owui-chat-input');
    chatSend = document.getElementById('owui-chat-send');
    toggleBtn = document.getElementById('owui-toggle-btn');
    btnLogout = document.getElementById('owui-btn-logout');

    if (!chatWindow || !loginBox || !chatBox || !inputArea || !chatInput || !chatSend || !toggleBtn || !btnLogout) {
        return;
    }

    evaluarEstadoAutenticacion();
    chatSend.addEventListener('click', enviarPregunta);
    chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') enviarPregunta(); });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAssistant);
} else {
    initAssistant();
}

function obtenerToken() {
    return sessionStorage.getItem('owui_auth_token');
}

function evaluarEstadoAutenticacion() {
    if (!loginBox || !chatBox || !inputArea || !btnLogout) return;

    const token = obtenerToken();
    if (token) {
        loginBox.style.display = 'none';
        chatBox.style.display = 'flex';
        inputArea.style.display = 'flex';
        btnLogout.style.display = 'block';
        limpiarConversacion();
    } else {
        loginBox.style.display = 'flex';
        chatBox.style.display = 'none';
        inputArea.style.display = 'none';
        btnLogout.style.display = 'none';
    }
}

// 🔐 PETICIÓN DE LOGIN CONTRA LA API DE TU OPEN WEBUI LOCAL
async function iniciarSesion() {
    const email = document.getElementById('owui-login-email').value.trim();
    const password = document.getElementById('owui-login-password').value;
    const errorDiv = document.getElementById('owui-login-error');

    errorDiv.style.display = 'none';
    if (!email || !password) {
        errorDiv.innerText = "Por favor, rellena todos los campos.";
        errorDiv.style.display = 'block';
        return;
    }

    try {
        const response = await fetch(`${OPEN_WEBUI_URL}/v1/auths/signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.token) {
            // Guarda el token en memoria temporal de la pestaña actual
            sessionStorage.setItem('owui_auth_token', data.token);
            evaluarEstadoAutenticacion();
        } else {
            throw new Error(data.detail || "Error de credenciales o de comunicación.");
        }
    } catch (error) {
        errorDiv.innerText = "Error: No se pudo validar. Comprueba tu servidor local LAN o tus credenciales.";
        errorDiv.style.display = 'block';
        console.error("Detalles de autenticación:", error);
    }
}

function cerrarSesion() {
    sessionStorage.removeItem('owui_auth_token');
    evaluarEstadoAutenticacion();
}

function toggleChat() {
    if (!chatWindow || !toggleBtn || !chatInput) return;

    if (chatWindow.style.display === 'none' || chatWindow.style.display === '') {
        chatWindow.style.display = 'flex';
        toggleBtn.innerHTML = '✕';
        toggleBtn.style.background = '#ef4444';
        toggleBtn.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.4)';
        if (obtenerToken()) chatInput.focus();
    } else {
        chatWindow.style.display = 'none';
        toggleBtn.innerHTML = '💬';
        toggleBtn.style.background = '#10b981';
        toggleBtn.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)';
        // Borra memoria al minimizar por seguridad
        if (obtenerToken()) limpiarConversacion(); 
    }
}

window.toggleChat = toggleChat;
window.iniciarSesion = iniciarSesion;
window.cerrarSesion = cerrarSesion;
window.enviarPregunta = enviarPregunta;

function limpiarConversacion() {
    if (!chatBox || !chatInput) return;

    historialMensajes = [];
    chatBox.innerHTML = `
        <div class="owui-msg owui-msg-ai">
            ¡Acceso autorizado! 👋 He cargado tus apuntes mediante RAG. ¿Qué quieres repasar hoy?
        </div>
    `;
    chatInput.value = '';
}

async function enviarPregunta() {
    if (!chatBox || !chatInput) return;

    const texto = chatInput.value.trim();
    const token = obtenerToken();
    if (!texto || !token) return;

    // Pintar mensaje de usuario
    chatBox.innerHTML += `<div class="owui-msg owui-msg-user">${texto}</div>`;
    chatInput.value = '';
    chatBox.scrollTop = chatBox.scrollHeight;

    historialMensajes.push({ role: "user", content: texto });

    // Indicador visual de carga
    const loadingId = 'loading-' + Date.now();
    chatBox.innerHTML += `<div id="${loadingId}" class="owui-msg owui-msg-ai" style="color: #64748b;"><i>Pensando...</i></div>`;
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        // Enviar consulta RAG firmando con el token JWT del usuario
        const response = await fetch(`${OPEN_WEBUI_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: MODELO_VLLM,
                messages: historialMensajes,
                files: [{ type: "collection", id: ID_COLECCION }]
            })
        });

        const data = await response.json();
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) loadingElement.remove();

        if (data.choices && data.choices) {
            const respuestaIA = data.choices.message.content;
            historialMensajes.push({ role: "assistant", content: respuestaIA });

            chatBox.innerHTML += `
                <div class="owui-msg owui-msg-ai">
                    ${respuestaIA.replace(/\n/g, '<br>')}
                </div>
            `;
        } else {
            throw new Error();
        }
    } catch (error) {
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) loadingElement.remove();
        historialMensajes.pop(); // Limpieza preventiva del historial

        chatBox.innerHTML += `
            <div class="owui-msg owui-msg-error">
                <strong>Error de Red Privada:</strong> La petición no pudo alcanzar tu Open WebUI local. Verifica que estás conectado a tu LAN/VPN y que tienes CORS habilitado.
            </div>
        `;
    }
    chatBox.scrollTop = chatBox.scrollHeight;
}


