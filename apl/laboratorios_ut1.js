/* =========================================================================
   LABORATORIOS INTERACTIVOS DE HTML5 Y CSS3 + TEST - APL UT1
   Archivo: apl/laboratorios_ut1.js
   Usa exclusivamente clases de ../laboratorios.css (sin estilos inline)
   ========================================================================= */
(function () {
    'use strict';

    /* ---------- Auto-inyección de la hoja de estilos ---------- */
    function inyectarCss() {
        const ya = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
            .some(l => (l.getAttribute('href') || '').indexOf('laboratorios.css') !== -1);
        if (ya) return;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '../laboratorios.css';
        document.head.appendChild(link);
    }
    inyectarCss();

    function toast(msg) {
        if (typeof window.showToast === 'function') window.showToast(msg);
    }

    function esc(s) {
        return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    }

    /* ---------- Inyección al final del article de una sección ---------- */
    function inyectarEnSeccion(sectionId, html) {
        const det = document.getElementById(sectionId);
        if (!det) return null;
        const art = det.querySelector('article.box-card') || det.querySelector('.box-card');
        if (!art) return null;
        const wrap = document.createElement('div');
        wrap.innerHTML = html.trim();
        const node = wrap.firstElementChild;
        art.appendChild(node);
        return node;
    }

    /* =====================================================================
       LAB 1 (HTML5): Semántica HTML5 + Validador de código HTML (Sec. 6)
       ===================================================================== */
    const htmlCases = [
        {
            id: 0,
            title: 'Contenedor exclusivo para los enlaces del menú principal de navegación',
            opts: ['<nav>', '<aside>', '<section>'],
            best: '<nav>',
            reason: '<nav> está destinado específicamente a bloques de enlaces de navegación principal.'
        },
        {
            id: 1,
            title: 'Un glosario técnico formado por términos y sus definiciones',
            opts: ['<ul>', '<ol>', '<dl>'],
            best: '<dl>',
            reason: 'Las listas de definición (<dl>, <dt>, <dd>) están diseñadas para glosarios de términos y descripciones.'
        },
        {
            id: 2,
            title: 'Pregunta de formulario donde el usuario solo puede elegir UN sistema operativo',
            opts: ['checkbox', 'radio', 'textarea'],
            best: 'radio',
            reason: 'Los botones type="radio" con el mismo atributo name son mutuamente excluyentes (solo una opción activa).'
        }
    ];

    const htmlPresets = {
        estructura: `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <title>Mi primera web</title>
  </head>
  <body>
    <header><h1>Portal SMR</h1></header>
    <main><p>Contenido principal con <strong>HTML5</strong>.</p></main>
  </body>
</html>`,
        tabla: `<table border="1">
  <thead>
    <tr><th>Servicio</th><th>Puerto</th></tr>
  </thead>
  <tbody>
    <tr><td>HTTP</td><td>80</td></tr>
    <tr><td colspan="2">HTTPS (443) - Cifrado SSL/TLS</td></tr>
  </tbody>
</table>`,
        imagen: `<a href="https://iescelia.org" target="_blank">
  <img src="logo.png" alt="Logo del centro" width="120">
</a>`,
        formulario: `<form action="procesar.php" method="POST">
  <label for="user">Usuario:</label>
  <input type="text" id="user" name="usuario" required>
  <input type="submit" value="Enviar">
</form>`
    };

    function htmlLabHtml5() {
        const casesHtml = htmlCases.map(c => `
            <div class="lab-card">
                <div class="lab-row-between">
                    <span class="lab-case-title">${esc(c.title)}</span>
                    <div class="lab-btn-group">
                        ${c.opts.map(o => `<button type="button" class="lab-btn lab-btn-choice" data-hcase="${c.id}" data-hpick="${esc(o)}">${esc(o)}</button>`).join('')}
                    </div>
                </div>
                <div id="lab-hfb-${c.id}" class="lab-feedback hidden"></div>
            </div>
        `).join('');

        return `
        <div class="lab-box lab-blue" id="lab-html5">
            <span class="lab-tag tag-blue">Laboratorio 1 · HTML5</span>
            <h4 class="lab-title">Selector de Etiquetas Semánticas e Inspector de Código HTML5</h4>
            <p class="lab-desc">Elige la etiqueta HTML5 adecuada para cada escenario y analiza fragmentos HTML para comprobar buenas prácticas (etiquetas vacías, atributos obligatorios y cierres).</p>
            <div class="lab-stack">${casesHtml}</div>
            <div class="lab-card">
                <p class="lab-label">Inspector rápido de código HTML5</p>
                <div class="lab-btn-group">
                    <button type="button" class="lab-btn lab-btn-light" data-hpreset="estructura">Estructura HTML5</button>
                    <button type="button" class="lab-btn lab-btn-light" data-hpreset="tabla">Tabla colspan</button>
                    <button type="button" class="lab-btn lab-btn-light" data-hpreset="imagen">Imagen + Enlace</button>
                    <button type="button" class="lab-btn lab-btn-light" data-hpreset="formulario">Formulario</button>
                </div>
                <div class="lab-grid-2">
                    <textarea class="lab-textarea" id="lab-html-code" rows="8">${esc(htmlPresets.estructura)}</textarea>
                    <pre class="lab-console" id="lab-html-report"></pre>
                </div>
            </div>
        </div>`;
    }

    function initLabHtml5() {
        const box = document.getElementById('lab-html5');
        const codeEl = document.getElementById('lab-html-code');
        const repEl = document.getElementById('lab-html-report');
        if (!box || !codeEl || !repEl) return;

        const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

        const analizar = () => {
            const src = codeEl.value;
            const sinComentarios = src.replace(/<!--[\s\S]*?-->/g, '');
            const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g;
            const stack = [];
            const avisos = [];
            let totalTags = 0;
            let vacias = 0;
            let m;

            while ((m = tagRegex.exec(sinComentarios)) !== null) {
                const full = m[0];
                const name = m[1].toLowerCase();
                const attrs = m[2] || '';
                totalTags++;

                if (full.startsWith('</')) {
                    if (stack.length && stack[stack.length - 1] === name) {
                        stack.pop();
                    } else {
                        avisos.push(`✖ Etiqueta de cierre </${name}> sin apertura coincidente.`);
                    }
                } else if (voidTags.has(name) || full.endsWith('/>')) {
                    vacias++;
                    if (name === 'img') {
                        if (!/\bsrc\s*=/.test(attrs)) avisos.push('⚠ <img> sin atributo obligatorio src.');
                        if (!/\balt\s*=/.test(attrs)) avisos.push('⚠ <img> sin atributo alt (accesibilidad).');
                    }
                } else {
                    stack.push(name);
                    if (name === 'a' && !/\bhref\s*=/.test(attrs) && !/\bname\s*=/.test(attrs)) {
                        avisos.push('⚠ <a> sin atributo href.');
                    }
                }
            }
            stack.forEach(t => avisos.push(`✖ Etiqueta <${t}> abierta sin cerrar.`));

            const lineas = [
                `Etiquetas detectadas: ${totalTags} (vacías: ${vacias})`,
                `¿Declara <!DOCTYPE html>?: ${/<!doctype\s+html>/i.test(src) ? 'Sí' : 'No (solo necesario en documento completo)'}`
            ];
            if (avisos.length === 0) {
                lineas.push('✔ Estructura HTML bien formada y sin advertencias.');
            } else {
                lineas.push('Diagnóstico:');
                avisos.forEach(a => lineas.push('  ' + a));
            }
            repEl.textContent = lineas.join('\n');
        };

        box.addEventListener('click', e => {
            const cBtn = e.target.closest('button[data-hcase]');
            if (cBtn) {
                const item = htmlCases.find(c => c.id === Number(cBtn.dataset.hcase));
                const fb = document.getElementById(`lab-hfb-${cBtn.dataset.hcase}`);
                if (!item || !fb) return;
                const ok = item.best === cBtn.dataset.hpick;
                fb.className = `lab-feedback ${ok ? 'fb-ok' : 'fb-warn'}`;
                fb.innerHTML = `<strong>${ok ? '✔ ¡Correcto!' : '💡 Revisa la teoría:'}</strong> La opción adecuada es <code>${esc(item.best)}</code>. ${esc(item.reason)}`;
                return;
            }
            const pBtn = e.target.closest('button[data-hpreset]');
            if (pBtn && htmlPresets[pBtn.dataset.hpreset]) {
                codeEl.value = htmlPresets[pBtn.dataset.hpreset];
                analizar();
            }
        });
        codeEl.addEventListener('input', analizar);
        analizar();
    }

    /* =====================================================================
       LAB 2 (HTML5): Generador de Enlaces, Imágenes y Controles (Sec. 6)
       ===================================================================== */
    function htmlLabEnlacesForm() {
        return `
        <div class="lab-box lab-sky" id="lab-html-gen">
            <span class="lab-tag tag-sky">Laboratorio 2 · HTML5</span>
            <h4 class="lab-title">Constructor de Enlaces (<code>&lt;a&gt;</code>) y Controles de Formulario (<code>&lt;form&gt;</code>)</h4>
            <p class="lab-desc">Configura los atributos y comprueba el código HTML5 exacto que necesita el navegador.</p>
            <div class="lab-grid-2">
                <div class="lab-card">
                    <p class="lab-label">1. Generador de hipervínculos</p>
                    <select class="lab-select" id="lab-link-type">
                        <option value="ext">Enlace externo en nueva pestaña (target="_blank")</option>
                        <option value="local">Enlace interno a otra página local</option>
                        <option value="anchor">Salto interno a un marcador (#id)</option>
                        <option value="img">Imagen clicable (&lt;a&gt;&lt;img&gt;&lt;/a&gt;)</option>
                    </select>
                    <div class="lab-row">
                        <input type="text" class="lab-input" id="lab-link-href" value="https://iescelia.org" placeholder="Destino (href)">
                        <input type="text" class="lab-input" id="lab-link-txt" value="Web IES Celia Viñas" placeholder="Texto o alt">
                    </div>
                    <pre class="lab-console" id="lab-link-out"></pre>
                </div>
                <div class="lab-card">
                    <p class="lab-label">2. Generador de controles de formulario</p>
                    <select class="lab-select" id="lab-form-type">
                        <option value="text">Cuadro de texto (type="text")</option>
                        <option value="password">Contraseña (type="password")</option>
                        <option value="checkbox">Casilla múltiple (type="checkbox")</option>
                        <option value="radio">Botón excluyente (type="radio")</option>
                        <option value="select">Lista desplegable (&lt;select&gt;)</option>
                    </select>
                    <input type="text" class="lab-input" id="lab-form-name" value="sistema" placeholder="Atributo name">
                    <pre class="lab-console" id="lab-form-out"></pre>
                </div>
            </div>
        </div>`;
    }

    function initLabEnlacesForm() {
        const lType = document.getElementById('lab-link-type');
        const lHref = document.getElementById('lab-link-href');
        const lTxt = document.getElementById('lab-link-txt');
        const lOut = document.getElementById('lab-link-out');
        const fType = document.getElementById('lab-form-type');
        const fName = document.getElementById('lab-form-name');
        const fOut = document.getElementById('lab-form-out');
        if (!lType || !fType) return;

        const updLink = () => {
            const t = lType.value;
            const h = lHref.value.trim() || '#';
            const txt = lTxt.value.trim() || 'Enlace';
            if (t === 'ext') {
                lOut.textContent = `<a href="${h}" target="_blank">${txt}</a>\n<!-- target="_blank" abre el destino en una pestaña nueva -->`;
            } else if (t === 'local') {
                const file = h.includes('://') ? 'pagina2.html' : h;
                lOut.textContent = `<a href="${file}">${txt}</a>\n<!-- Ruta relativa al mismo directorio del servidor -->`;
            } else if (t === 'anchor') {
                const id = h.replace(/^#/, '').replace(/[^a-zA-Z0-9_-]/g, '') || 'geografia';
                lOut.textContent = `<a href="#${id}">${txt}</a>\n...\n<h2 id="${id}">Sección destino</h2>`;
            } else {
                lOut.textContent = `<a href="${h}">\n  <img src="logo.png" alt="${txt}">\n</a>`;
            }
        };

        const updForm = () => {
            const t = fType.value;
            const name = fName.value.trim() || 'campo';
            if (t === 'text') {
                fOut.textContent = `<label for="id_${name}">Etiqueta:</label>\n<input type="text" id="id_${name}" name="${name}" required>`;
            } else if (t === 'password') {
                fOut.textContent = `<label for="id_${name}">Contraseña:</label>\n<input type="password" id="id_${name}" name="${name}" required>`;
            } else if (t === 'checkbox') {
                fOut.textContent = `<label><input type="checkbox" name="${name}" value="op1"> Opción 1</label>\n<label><input type="checkbox" name="${name}" value="op2"> Opción 2</label>\n<!-- Permite marcar varias opciones a la vez -->`;
            } else if (t === 'radio') {
                fOut.textContent = `<label><input type="radio" name="${name}" value="linux"> Linux</label>\n<label><input type="radio" name="${name}" value="win"> Windows</label>\n<!-- Mismo name="${name}": solo una opción activa -->`;
            } else {
                fOut.textContent = `<select name="${name}">\n  <option value="win">Windows Server</option>\n  <option value="linux" selected>GNU/Linux Debian</option>\n</select>`;
            }
        };

        [lType, lHref, lTxt].forEach(el => el.addEventListener('input', updLink));
        [fType, fName].forEach(el => el.addEventListener('input', updForm));
        updLink();
        updForm();
    }

    /* =====================================================================
       LAB 3 (CSS3): Colores (RGB <-> Hex) y Prioridad de Estilos (Sec. 7)
       ===================================================================== */
    function htmlLabCssColoresPrioridad() {
        return `
        <div class="lab-box lab-emerald" id="lab-css-prio">
            <span class="lab-tag tag-emerald">Laboratorio 3 · CSS3</span>
            <h4 class="lab-title">Conversor de Colores (RGB &harr; Hexadecimal) y Cascada de Prioridad</h4>
            <p class="lab-desc">Convierte componentes RGB (0-255) a hexadecimal y comprueba qué declaración CSS prevalece cuando varias afectan al mismo elemento.</p>
            <div class="lab-grid-2">
                <div class="lab-card">
                    <p class="lab-label">1. Conversor RGB numérico &harr; Hexadecimal</p>
                    <div class="lab-grid-3">
                        <input type="number" min="0" max="255" class="lab-input" id="lab-rgb-r" value="199" aria-label="Rojo">
                        <input type="number" min="0" max="255" class="lab-input" id="lab-rgb-g" value="166" aria-label="Verde">
                        <input type="number" min="0" max="255" class="lab-input" id="lab-rgb-b" value="128" aria-label="Azul">
                    </div>
                    <div class="lab-btn-group">
                        <button type="button" class="lab-btn lab-btn-light" data-rgb="0,0,0">black</button>
                        <button type="button" class="lab-btn lab-btn-light" data-rgb="255,255,255">white</button>
                        <button type="button" class="lab-btn lab-btn-light" data-rgb="245,67,24">rgb(245,67,24)</button>
                        <button type="button" class="lab-btn lab-btn-light" data-rgb="199,166,128">#C7A680</button>
                    </div>
                    <pre class="lab-console" id="lab-rgb-out"></pre>
                </div>
                <div class="lab-card">
                    <p class="lab-label">2. Jerarquía de prioridad CSS (activa/desactiva reglas)</p>
                    <div class="lab-row">
                        <label class="lab-desc"><input type="checkbox" id="prio-1"> &lt;span&gt;</label>
                        <label class="lab-desc"><input type="checkbox" id="prio-2" checked> style=""</label>
                        <label class="lab-desc"><input type="checkbox" id="prio-3" checked> &lt;div&gt;</label>
                        <label class="lab-desc"><input type="checkbox" id="prio-4" checked> &lt;style&gt;</label>
                        <label class="lab-desc"><input type="checkbox" id="prio-5" checked> .css externo</label>
                    </div>
                    <div class="lab-stack">
                        <div class="lab-exc-blk" id="pblk-1">1. &lt;span style="color: red"&gt; (Más particular)</div>
                        <div class="lab-exc-blk" id="pblk-2">2. Etiqueta concreta (&lt;p style="color: blue"&gt;)</div>
                        <div class="lab-exc-blk" id="pblk-3">3. Contenedor de sección (&lt;div style="..."&gt;)</div>
                        <div class="lab-exc-blk" id="pblk-4">4. Cabecera del documento (&lt;style&gt; en &lt;head&gt;)</div>
                        <div class="lab-exc-blk" id="pblk-5">5. Hoja externa (&lt;link rel="stylesheet" href="estilos.css"&gt;)</div>
                    </div>
                    <div class="lab-output" id="lab-prio-res"></div>
                </div>
            </div>
        </div>`;
    }

    function initLabCssColoresPrioridad() {
        const box = document.getElementById('lab-css-prio');
        const rIn = document.getElementById('lab-rgb-r');
        const gIn = document.getElementById('lab-rgb-g');
        const bIn = document.getElementById('lab-rgb-b');
        const rgbOut = document.getElementById('lab-rgb-out');
        const prioRes = document.getElementById('lab-prio-res');
        if (!box || !rIn || !rgbOut || !prioRes) return;

        const clamp = v => Math.max(0, Math.min(255, parseInt(v, 10) || 0));
        const hex2 = n => n.toString(16).toUpperCase().padStart(2, '0');

        const updRgb = () => {
            const r = clamp(rIn.value);
            const g = clamp(gIn.value);
            const b = clamp(bIn.value);
            const hex = `#${hex2(r)}${hex2(g)}${hex2(b)}`;
            let nombre = 'Sin palabra clave básica exacta';
            if (r === 0 && g === 0 && b === 0) nombre = 'black';
            else if (r === 255 && g === 255 && b === 255) nombre = 'white';
            else if (r === 255 && g === 0 && b === 0) nombre = 'red';
            else if (r === 0 && g === 128 && b === 0) nombre = 'green';
            else if (r === 0 && g === 0 && b === 255) nombre = 'blue';

            rgbOut.textContent =
                `RGB numérico : rgb(${r}, ${g}, ${b})\n` +
                `Hexadecimal  : ${hex}\n` +
                `Desglose     : R=${r} (${hex2(r)}) · G=${g} (${hex2(g)}) · B=${b} (${hex2(b)})\n` +
                `Palabra clave: ${nombre}`;
        };

        const labels = [
            'Nivel 1: <span> inline (gana por ser la declaración más particular)',
            'Nivel 2: atributo style="" en la etiqueta concreta',
            'Nivel 3: estilo heredado desde el contenedor <div>',
            'Nivel 4: bloque <style> definido en <head>',
            'Nivel 5: hoja de estilos externa (.css)'
        ];

        const updPrio = () => {
            let winner = 0;
            for (let i = 1; i <= 5; i++) {
                const chk = document.getElementById(`prio-${i}`);
                if (chk && chk.checked && winner === 0) winner = i;
            }
            for (let i = 1; i <= 5; i++) {
                const blk = document.getElementById(`pblk-${i}`);
                if (!blk) continue;
                blk.className = 'lab-exc-blk ' + (i === winner ? 'act-green' : 'is-dim');
            }
            prioRes.textContent = winner
                ? `Regla ganadora -> ${labels[winner - 1]}`
                : 'Ninguna regla activa: se aplican los estilos por defecto del navegador.';
        };

        [rIn, gIn, bIn].forEach(el => el.addEventListener('input', updRgb));
        for (let i = 1; i <= 5; i++) {
            const chk = document.getElementById(`prio-${i}`);
            if (chk) chk.addEventListener('change', updPrio);
        }
        box.addEventListener('click', e => {
            const btn = e.target.closest('button[data-rgb]');
            if (!btn) return;
            const [r, g, b] = btn.dataset.rgb.split(',');
            rIn.value = r;
            gIn.value = g;
            bIn.value = b;
            updRgb();
        });
        updRgb();
        updPrio();
    }

    /* =====================================================================
       LAB 4 (CSS3): Modelo de Caja (Box Model) y Shorthand (Sec. 7)
       ===================================================================== */
    function htmlLabBoxShorthand() {
        return `
        <div class="lab-box lab-amber" id="lab-css-box">
            <span class="lab-tag tag-amber">Laboratorio 4 · CSS3</span>
            <h4 class="lab-title">Calculadora del Modelo de Caja (<code>box-sizing</code>) y Propiedades Shorthand</h4>
            <p class="lab-desc">Compara cómo cambia el ancho real con <code>content-box</code> vs <code>border-box</code> y desglosa valores abreviados de <code>margin</code> / <code>padding</code> en sentido horario.</p>
            <div class="lab-grid-2">
                <div class="lab-card">
                    <p class="lab-label">1. Modelo de Caja (Box Model)</p>
                    <div class="lab-grid-4">
                        <input type="number" min="0" class="lab-input" id="lab-bm-w" value="300" aria-label="width">
                        <input type="number" min="0" class="lab-input" id="lab-bm-p" value="15" aria-label="padding">
                        <input type="number" min="0" class="lab-input" id="lab-bm-b" value="2" aria-label="border">
                        <input type="number" min="0" class="lab-input" id="lab-bm-m" value="20" aria-label="margin">
                    </div>
                    <select class="lab-select" id="lab-bm-sizing">
                        <option value="content-box">box-sizing: content-box (por defecto)</option>
                        <option value="border-box" selected>box-sizing: border-box (incluye padding y border)</option>
                    </select>
                    <pre class="lab-console" id="lab-bm-out"></pre>
                </div>
                <div class="lab-card">
                    <p class="lab-label">2. Traductor Shorthand (<code>margin</code> / <code>padding</code>)</p>
                    <input type="text" class="lab-input" id="lab-sh-in" value="10px 15px 20px 25px" autocomplete="off">
                    <div class="lab-btn-group">
                        <button type="button" class="lab-btn lab-btn-light" data-sh="10px">1 valor</button>
                        <button type="button" class="lab-btn lab-btn-light" data-sh="10px 20px">2 valores</button>
                        <button type="button" class="lab-btn lab-btn-light" data-sh="2em 3em 4em">3 valores</button>
                        <button type="button" class="lab-btn lab-btn-light" data-sh="10px 15px 20px 25px">4 valores</button>
                    </div>
                    <pre class="lab-console" id="lab-sh-out"></pre>
                </div>
            </div>
        </div>`;
    }

    function initLabBoxShorthand() {
        const box = document.getElementById('lab-css-box');
        const wIn = document.getElementById('lab-bm-w');
        const pIn = document.getElementById('lab-bm-p');
        const bIn = document.getElementById('lab-bm-b');
        const mIn = document.getElementById('lab-bm-m');
        const sIn = document.getElementById('lab-bm-sizing');
        const bmOut = document.getElementById('lab-bm-out');
        const shIn = document.getElementById('lab-sh-in');
        const shOut = document.getElementById('lab-sh-out');
        if (!box || !wIn || !shIn) return;

        const updBox = () => {
            const w = Math.max(0, parseFloat(wIn.value) || 0);
            const p = Math.max(0, parseFloat(pIn.value) || 0);
            const b = Math.max(0, parseFloat(bIn.value) || 0);
            const m = Math.max(0, parseFloat(mIn.value) || 0);
            const sizing = sIn.value;

            let contentW, visibleW;
            if (sizing === 'border-box') {
                visibleW = w;
                contentW = Math.max(0, w - 2 * p - 2 * b);
            } else {
                contentW = w;
                visibleW = w + 2 * p + 2 * b;
            }
            const totalW = visibleW + 2 * m;

            bmOut.textContent =
                `/* width:${w}px | padding:${p}px | border:${b}px | margin:${m}px */\n` +
                `box-sizing       : ${sizing}\n` +
                `Ancho contenido  : ${contentW}px\n` +
                `Ancho caja vis.  : ${visibleW}px  (contenido + relleno + borde)\n` +
                `Espacio total    : ${totalW}px  (caja + margen transparente)`;
        };

        const updSh = () => {
            const parts = shIn.value.trim().split(/\s+/).filter(Boolean);
            let top, right, bottom, left, regla;
            if (parts.length === 1) {
                [top] = parts; right = bottom = left = top;
                regla = '1 valor -> igual en los 4 lados';
            } else if (parts.length === 2) {
                [top, right] = parts; bottom = top; left = right;
                regla = '2 valores -> (arriba/abajo) y (derecha/izquierda)';
            } else if (parts.length === 3) {
                [top, right, bottom] = parts; left = right;
                regla = '3 valores -> arriba, laterales (izq/der) y abajo';
            } else if (parts.length === 4) {
                [top, right, bottom, left] = parts;
                regla = '4 valores -> sentido horario (arriba, derecha, abajo, izquierda)';
            } else {
                shOut.textContent = 'Introduce entre 1 y 4 valores separados por espacios (ej. 10px 20px).';
                return;
            }
            shOut.textContent =
                `/* ${regla} */\n` +
                `margin-top    : ${top};\n` +
                `margin-right  : ${right};\n` +
                `margin-bottom : ${bottom};\n` +
                `margin-left   : ${left};`;
        };

        [wIn, pIn, bIn, mIn, sIn].forEach(el => el.addEventListener('input', updBox));
        shIn.addEventListener('input', updSh);
        box.addEventListener('click', e => {
            const btn = e.target.closest('button[data-sh]');
            if (!btn) return;
            shIn.value = btn.dataset.sh;
            updSh();
        });
        updBox();
        updSh();
    }

    /* =====================================================================
       LAB 5 (CSS3): Selectores CSS y Posicionamiento de Capas (Sec. 7)
       ===================================================================== */
    function htmlLabSelectoresPos() {
        return `
        <div class="lab-box lab-rose" id="lab-css-sel">
            <span class="lab-tag tag-rose">Laboratorio 5 · CSS3</span>
            <h4 class="lab-title">Inspector de Selectores CSS y Posicionamiento de Capas</h4>
            <p class="lab-desc">Identifica qué elementos alcanza cada tipo de selector (<code>etiqueta</code>, <code>.clase</code>, <code>p.clase</code>, <code>#id</code>) y compara los esquemas de posicionamiento.</p>
            <div class="lab-grid-2">
                <div class="lab-card">
                    <p class="lab-label">1. Probador de selectores</p>
                    <select class="lab-select" id="lab-sel-pick">
                        <option value="p">p { ... } — Selector de elemento</option>
                        <option value=".destacado">.destacado { ... } — Clase genérica</option>
                        <option value="p.aviso">p.aviso { ... } — Clase asociada a &lt;p&gt;</option>
                        <option value="#menu-principal">#menu-principal { ... } — Identificador único</option>
                    </select>
                    <pre class="lab-console" id="lab-sel-out"></pre>
                </div>
                <div class="lab-card">
                    <p class="lab-label">2. Posicionamiento y Visibilidad de Capas</p>
                    <div class="lab-btn-group">
                        <button type="button" class="lab-btn lab-btn-light" data-pos="static">static</button>
                        <button type="button" class="lab-btn lab-btn-light" data-pos="relative">relative</button>
                        <button type="button" class="lab-btn lab-btn-light" data-pos="absolute">absolute</button>
                        <button type="button" class="lab-btn lab-btn-light" data-pos="fixed">fixed</button>
                        <button type="button" class="lab-btn lab-btn-light" data-pos="vis">visibility: hidden</button>
                        <button type="button" class="lab-btn lab-btn-light" data-pos="disp">display: none</button>
                    </div>
                    <pre class="lab-console" id="lab-pos-out"></pre>
                </div>
            </div>
        </div>`;
    }

    function initLabSelectoresPos() {
        const box = document.getElementById('lab-css-sel');
        const selPick = document.getElementById('lab-sel-pick');
        const selOut = document.getElementById('lab-sel-out');
        const posOut = document.getElementById('lab-pos-out');
        if (!box || !selPick || !selOut || !posOut) return;

        const selInfo = {
            'p': 'Tipo: Selector de etiqueta.\nAlcance: Aplica a TODOS los párrafos <p> del documento.\nCoincide con: <p>, <p class="aviso">, <p class="destacado">.',
            '.destacado': 'Tipo: Clase no asociada (genérica).\nAlcance: Reutilizable en cualquier etiqueta con class="destacado".\nCoincide con: <p class="destacado">, <span class="destacado">, <div class="destacado">.',
            'p.aviso': 'Tipo: Clase asociada a una etiqueta.\nAlcance: Solo se aplica si el elemento es <p> Y tiene class="aviso".\nCoincide con: <p class="aviso"> (NO aplica a <div class="aviso">).',
            '#menu-principal': 'Tipo: Identificador único (#id).\nAlcance: Un único elemento en todo el HTML con id="menu-principal".\nRegla: No pueden existir dos elementos con el mismo ID.'
        };

        const posInfo = {
            static: 'position: static\n- Valor por defecto en el flujo normal del documento.\n- Ignora coordenadas top, right, bottom, left.',
            relative: 'position: relative\n- Se desplaza respecto a su posición original en el flujo.\n- Mantiene reservado su hueco original sin mover a las demás cajas.',
            absolute: 'position: absolute\n- Se extrae del flujo normal del documento.\n- Se ubica respecto al ancestro posicionado más cercano (o la ventana).',
            fixed: 'position: fixed\n- Anclada a coordenadas fijas de la ventana del navegador.\n- Permanece inmóvil incluso al hacer scroll.',
            vis: 'visibility: hidden\n- Oculta visualmente la capa en pantalla.\n- CONTINÚA ocupando su espacio físico en el flujo del documento.',
            disp: 'display: none\n- Elimina la caja del renderizado visual.\n- NO ocupa ningún espacio físico en el flujo del documento.'
        };

        const updSel = () => { selOut.textContent = selInfo[selPick.value] || ''; };
        const updPos = (k) => { posOut.textContent = posInfo[k] || ''; };

        selPick.addEventListener('change', updSel);
        box.addEventListener('click', e => {
            const btn = e.target.closest('button[data-pos]');
            if (!btn) return;
            updPos(btn.dataset.pos);
        });
        updSel();
        updPos('relative');
    }

    /* =====================================================================
       TEST DE AUTOEVALUACIÓN (10 preguntas sobre HTML5 y CSS3)
       ===================================================================== */
    const quizQuestions = [
        {
            q: '1. ¿Qué indica la declaración <!DOCTYPE html> al principio de un documento web?',
            options: [
                'Que el archivo contiene código JavaScript ejecutable.',
                'Al navegador moderno que debe procesar el archivo bajo el estándar HTML5.',
                'El título que aparecerá en la pestaña del navegador.'
            ],
            answer: 1
        },
        {
            q: '2. ¿Cuál de las siguientes parejas contiene únicamente etiquetas HTML5 vacías (sin etiqueta de cierre)?',
            options: [
                '<p> y <div>',
                '<img> y <br>',
                '<table> y <ul>'
            ],
            answer: 1
        },
        {
            q: '3. ¿Qué etiqueta semántica de HTML5 encapsula el contenido central y único del documento?',
            options: ['<main>', '<aside>', '<nav>'],
            answer: 0
        },
        {
            q: '4. Para construir un glosario técnico con términos y sus explicaciones, ¿qué etiquetas HTML se recomiendan?',
            options: [
                '<ul> y <li>',
                '<dl>, <dt> y <dd>',
                '<table> y <colspan>'
            ],
            answer: 1
        },
        {
            q: '5. En una tabla HTML, ¿para qué sirve el atributo colspan="2" en una celda <td>?',
            options: [
                'Para que la celda ocupe el espacio horizontal de dos columnas.',
                'Para que la celda ocupe el espacio vertical de dos filas.',
                'Para fijar un borde de 2 píxeles.'
            ],
            answer: 0
        },
        {
            q: '6. ¿Qué atributo de la etiqueta <a> fuerza la apertura del enlace en una nueva pestaña del navegador?',
            options: ['href="_new"', 'target="_blank"', 'rel="external"'],
            answer: 1
        },
        {
            q: '7. En un formulario HTML, ¿qué diferencia existe entre type="checkbox" y type="radio"?',
            options: [
                'checkbox permite elegir varias opciones a la vez; radio solo permite una opción dentro del mismo grupo (mismo name).',
                'radio permite marcar múltiples opciones y checkbox solo una.',
                'Ambos funcionan exactamente igual.'
            ],
            answer: 0
        },
        {
            q: '8. Según la jerarquía de prioridad de CSS3, cuando varias reglas afectan al mismo texto, ¿cuál prevalece?',
            options: [
                'La hoja de estilos externa (.css) sobre cualquier otra.',
                'La declaración más particular (por ejemplo, estilo en <span> o atributo style frente a <style> o archivo externo).',
                'Siempre los estilos por defecto del navegador.'
            ],
            answer: 1
        },
        {
            q: '9. ¿Qué diferencia hay entre una clase (.destacado) y un identificador (#menu-principal) en CSS?',
            options: [
                'Una clase solo puede usarse una vez y un identificador en múltiples elementos.',
                'Una clase puede reutilizarse en múltiples elementos; un identificador (#) es único para un solo elemento en el documento.',
                'Los identificadores solo funcionan en etiquetas <span>.'
            ],
            answer: 1
        },
        {
            q: '10. En el modelo de caja CSS, ¿en qué orden se aplican los 4 valores de margin: 10px 15px 20px 25px; y qué área es siempre transparente?',
            options: [
                'Izquierda, arriba, derecha, abajo; el padding es siempre transparente.',
                'Arriba, derecha, abajo, izquierda (sentido horario); el margin es siempre transparente.',
                'Arriba, abajo, izquierda, derecha; el border es siempre transparente.'
            ],
            answer: 1
        }
    ];
    let quizAnswers = {};

    function htmlTest() {
        return `
        <section class="topic-section lab-section" id="lab-section-test">
            <details class="accordion" id="page-section-test">
                <summary class="summary-title">Test de Autoevaluación (HTML5 y CSS3)</summary>
                <div class="box-card">
                    <div class="lab-box lab-purple">
                        <div class="lab-scoreboard">
                            <span class="lab-label">Puntuación</span>
                            <strong class="lab-score" id="lab-quiz-score">0 / ${quizQuestions.length}</strong>
                            <button type="button" class="lab-btn lab-btn-light" id="lab-quiz-reset">Reiniciar test</button>
                        </div>
                        <div class="lab-stack" id="lab-quiz-container"></div>
                    </div>
                </div>
            </details>
        </section>`;
    }

    function renderQuiz() {
        const cont = document.getElementById('lab-quiz-container');
        if (!cont) return;
        cont.innerHTML = quizQuestions.map((item, qIdx) => {
            const choice = quizAnswers[qIdx];
            const answered = choice !== undefined;
            const opts = item.options.map((txt, oIdx) => {
                let cls = 'lab-quiz-opt';
                let badge = '';
                if (answered) {
                    if (oIdx === item.answer) { cls += ' is-correct'; badge = '<span>✔ Correcta</span>'; }
                    else if (oIdx === choice) { cls += ' is-wrong'; badge = '<span>✖ Incorrecta</span>'; }
                    else cls += ' is-muted';
                }
                return `<button type="button" class="${cls}" data-q="${qIdx}" data-o="${oIdx}" ${answered ? 'disabled' : ''}><span>${esc(txt)}</span>${badge}</button>`;
            }).join('');
            return `<div class="lab-card"><p class="lab-q-title">${esc(item.q)}</p><div class="lab-stack">${opts}</div></div>`;
        }).join('');

        const score = Object.entries(quizAnswers)
            .reduce((a, [q, ans]) => a + (quizQuestions[q].answer === ans ? 1 : 0), 0);
        const scoreEl = document.getElementById('lab-quiz-score');
        if (scoreEl) scoreEl.textContent = `${score} / ${quizQuestions.length}`;
    }

    function initQuiz() {
        const cont = document.getElementById('lab-quiz-container');
        const reset = document.getElementById('lab-quiz-reset');
        if (!cont || !reset) return;
        cont.addEventListener('click', e => {
            const b = e.target.closest('button[data-q]');
            if (!b || b.disabled) return;
            quizAnswers[b.dataset.q] = Number(b.dataset.o);
            renderQuiz();
        });
        reset.addEventListener('click', () => {
            quizAnswers = {};
            renderQuiz();
            toast('Test reiniciado');
        });
        renderQuiz();
    }

    /* ---------- Menú de navegación ---------- */
    function añadirEnlaceMenu() {
        const ul = document.querySelector('nav.main-nav .nav-list');
        if (!ul) return;
        const li = document.createElement('li');
        li.innerHTML = '<a href="#lab-section-test" class="nav-link">Test</a>';
        li.firstElementChild.addEventListener('click', () => {
            const d = document.getElementById('page-section-test');
            if (d) d.open = true;
        });
        ul.appendChild(li);
    }

    /* ---------- Inicialización ---------- */
    window.addEventListener('DOMContentLoaded', () => {
        inyectarEnSeccion('page-section-8', htmlLabHtml5());
        inyectarEnSeccion('page-section-8', htmlLabEnlacesForm());
        inyectarEnSeccion('page-section-9', htmlLabCssColoresPrioridad());
        inyectarEnSeccion('page-section-9', htmlLabBoxShorthand());
        inyectarEnSeccion('page-section-9', htmlLabSelectoresPos());

        const main = document.querySelector('main');
        if (main) main.insertAdjacentHTML('beforeend', htmlTest());

        initLabHtml5();
        initLabEnlacesForm();
        initLabCssColoresPrioridad();
        initLabBoxShorthand();
        initLabSelectoresPos();
        initQuiz();
        añadirEnlaceMenu();
    });
})();
