document.addEventListener('DOMContentLoaded', () => {
    enhanceTechnicalSheets();
    enhanceCodeBlocks();

    const navList = document.querySelector('.main-nav .nav-list');
    if (navList) {
        document.querySelectorAll('main details').forEach((detail, index) => {
            if (detail.parentElement.closest('details')) return;

            const summary = detail.querySelector(':scope > summary');
            if (!summary) return;

            const label = summary.textContent.replace(/\s+/g, ' ').trim();
            if (!label || /^(ficha|índice)\b/i.test(label)) return;

            if (!detail.id) {
                detail.id = `page-section-${index + 1}`;
            }

            const item = document.createElement('li');
            const link = document.createElement('a');
            link.className = 'nav-link';
            link.href = `#${detail.id}`;
            link.textContent = label;
            if (/test/i.test(label)) {
                link.classList.add('nav-link-test');
            }
            item.appendChild(link);
            navList.appendChild(item);
        });
    }

    document.querySelectorAll('.dropdown').forEach(dd => {
        const btn = dd.querySelector('.dropbtn');
        const content = dd.querySelector('.dropdown-content');
        if (btn && content) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = content.style.display === 'block';
                document.querySelectorAll('.dropdown-content').forEach(c => c.style.display = 'none');
                document.querySelectorAll('.dropbtn').forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-expanded', 'false');
                });
                if (!isOpen) {
                    content.style.display = 'block';
                    btn.classList.add('active');
                    btn.setAttribute('aria-expanded', 'true');
                }
            });
        }
    });

    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-content').forEach(c => c.style.display = '');
        document.querySelectorAll('.dropbtn').forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-expanded', 'false');
        });
    });

    const findTargetByHash = (hash) => {
        if (!hash) return null;
        let targetId = hash;
        try { targetId = decodeURIComponent(hash); } catch (err) {}

        let targetEl = document.getElementById(targetId) || document.querySelector('[name="' + targetId + '"]');
        if (!targetEl) {
            for (const el of document.querySelectorAll('[id]')) {
                if (el.id === targetId || decodeURIComponent(el.id) === targetId) {
                    targetEl = el;
                    break;
                }
            }
        }
        return { targetEl, targetId };
    };

    const revealAndScrollTo = (targetEl, targetId, pushHistory) => {
        if (!targetEl) return;
        // Abrir todos los desplegables <details> ancestros (salvo el propio Índice si el enlace está fuera de él)
        let el = targetEl;
        while (el) {
            if (el.tagName === 'DETAILS') {
                el.open = true;
            }
            el = el.parentElement;
        }
        const scrollEl = (targetEl.offsetHeight === 0 && targetEl.parentElement) ? targetEl.parentElement : targetEl;
        const headerOffset = 75;
        const elementPosition = scrollEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });

        if (pushHistory && history.pushState && targetId) {
            history.pushState(null, null, '#' + targetId);
        }
    };

    // Controlador universal de clics en enlaces ancla (#...)
    document.querySelectorAll('a[href*="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const rawHref = this.getAttribute('href') || '';
            const hashIdx = rawHref.indexOf('#');
            if (hashIdx === -1) return;
            const hash = rawHref.substring(hashIdx + 1);
            if (!hash) return;

            const found = findTargetByHash(hash);
            if (found && found.targetEl) {
                e.preventDefault();
                revealAndScrollTo(found.targetEl, found.targetId, true);
            }
        });
    });

    // Si la página se carga directamente con un hash en la URL, abrir su <details> y desplazar
    if (window.location.hash && window.location.hash.length > 1) {
        const found = findTargetByHash(window.location.hash.substring(1));
        if (found && found.targetEl) {
            revealAndScrollTo(found.targetEl, found.targetId, false);
        }
    }
});

function enhanceTechnicalSheets() {
    document.querySelectorAll('main details > summary').forEach(summary => {
        if (/^ficha\b/i.test(summary.textContent.trim())) {
            summary.parentElement.classList.add('ficha-tecnica');
        }
    });

    document.querySelectorAll('main h2, main h3, main h4').forEach(heading => {
        if (!/^ficha\b/i.test(heading.textContent.trim())) return;

        const card = heading.closest('.box-card');
        if (card) {
            card.classList.add('ficha-tecnica-card');
            heading.classList.add('ficha-title');
        }
    });
}

function detectCodeExtension(pre) {
    const code = pre.querySelector('code') || pre;
    const explicitLanguage = `${code.className} ${pre.className} ${pre.dataset.language || ''}`
        .match(/\b(?:language|lang)-([\w+#.-]+)/i);
    const aliases = {
        bash: 'sh',
        javascript: 'js',
        python: 'py',
        python3: 'py',
        shell: 'sh',
        html: 'html',
        xml: 'xml',
        yml: 'yaml'
    };

    if (explicitLanguage) {
        const language = explicitLanguage[1].toLowerCase();
        return aliases[language] || language;
    }

    const source = code.textContent.trim();
    if (/^\s*#\s*include\s*</m.test(source) ||
        /^\s*(?:public\s+class|public\s+static\s+void\s+main|System\.out\.)/m.test(source)) {
        return /^\s*#\s*include\s*</m.test(source) ? 'c' : 'java';
    }
    if (/^\s*#!.*\b(?:bash|sh)\b/m.test(source) ||
        /^\s*(?:sudo\s|apt(?:-get)?\s|systemctl\s|docker\s|chmod\s|chown\s|mkdir\s|cd\s|grep\s|curl\s|wget\s)/m.test(source)) {
        return 'sh';
    }
    const heading = getCodeHeading(pre);
    if (/\b(?:sql|mysql|dml|consultas?|subconsultas?)\b/i.test(heading) &&
        /^\s*(?:--|#)|^\s*(?:\d+\.\s*)?(?:SELECT|FROM|JOIN|WHERE|INSERT|CREATE|UPDATE|DELETE)\b/im.test(source)) {
        return 'sql';
    }
    if (/^\s*(?:SELECT|WITH|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|USE|SHOW)\b/im.test(source) &&
        /\b(?:FROM|INTO|TABLE|DATABASE|WHERE|JOIN|SET|VALUES)\b/i.test(source)) {
        return 'sql';
    }
    if (/^\s*#!.*\bpython\b/m.test(source) ||
        /^\s*(?:from\s+[\w.]+\s+import\s+|import\s+[\w.]+|def\s+\w+\s*\(|class\s+\w+|print\s*\(|if __name__\s*==)/m.test(source) ||
        (/#.*(?:\n|$)/m.test(source) && /^\s*\w+(?:\[[^\]]+\])?\s*=\s*[\[{]/m.test(source)) ||
        /^\s*\w+\[[^\]]+\]\s*=/m.test(source) ||
        /\b(?:True|False|None|len|range|zip|enumerate|append|extend|sorted|ZeroDivisionError|NameError|TypeError|ValueError|IndexError|FileNotFoundError|KeyError|SyntaxError)\b/.test(source) ||
        /\b(?:str|int|float|input|open)\s*\(|\.\s*(?:replace|upper|lower|strip)\s*\(/.test(source) ||
        (/#.*(?:\n|$)/m.test(source) && /^\s*[\w.]+\s*=/m.test(source))) {
        return 'py';
    }
    if (/^\s*(?:<!doctype\s+html|<html\b|<\/?[a-z][\w-]*(?:\s|>|\/))/i.test(source)) {
        return 'html';
    }
    if (/^\s*(?:const|let|var|function|class|export|import)\s|\bconsole\.\w+\s*\(/m.test(source)) {
        return 'js';
    }
    if (/^\s*(?:\{[\s\S]*"[\w-]+"\s*:|\[[\s\S]*\{)/.test(source)) {
        return 'json';
    }
    if (/^\s*(?:@media|@import|[.#]?[a-z][\w-]*(?:\s+[.#]?[a-z][\w-]*)?\s*\{[\s\S]*?:\s*[^;{}]+;)/i.test(source)) {
        return 'css';
    }
    if (/\bpython\b|listas?|tuplas?|diccionarios?|cadenas?|ficheros?|archivos?|funciones?|m[eé]todos?/i.test(getCodeHeading(pre)) &&
        /(?:#|=|\b(?:in|print)\b|\[[^\]]*\])/m.test(source)) {
        return 'py';
    }

    return 'txt';
}

function getCodeHeading(pre) {
    const main = pre.closest('main');
    if (!main) return document.title;

    let currentHeading = '';
    for (const heading of main.querySelectorAll('h1, h2, h3, h4, h5, h6')) {
        if (heading.compareDocumentPosition(pre) & Node.DOCUMENT_POSITION_FOLLOWING) {
            currentHeading = heading.textContent;
        } else {
            break;
        }
    }

    return currentHeading || document.title;
}

function slugifyCodeFilename(value) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/^\s*\d+(?:\.\d+)*\.?\s*/, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 48)
        .replace(/_+$/g, '') || 'codigo';
}

function createCodeIcon(markup) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = markup;
    return svg;
}

function enhanceCodeBlocks() {
    const filenameCounts = new Map();
    const codeBlocks = document.querySelectorAll('main pre');

    codeBlocks.forEach((pre, index) => {
        if (pre.closest('.console-box, .file-buffer')) return;
        if (!pre.querySelector('code') && !pre.closest('.code-wrapper, .code-container')) return;

        let container = pre.closest('.code-wrapper, .code-container');
        if (!container) {
            container = document.createElement('div');
            pre.parentNode.insertBefore(container, pre);
            container.appendChild(pre);
        }

        container.classList.add('code-wrapper', 'code-container');
        container.setAttribute('role', 'group');
        if (!container.hasAttribute('aria-label')) {
            container.setAttribute('aria-label', 'Bloque de código');
        }

        let header = container.querySelector(':scope > .code-header');
        if (!header) {
            header = document.createElement('div');
            header.className = 'code-header';
            container.insertBefore(header, pre);
        } else if (header.nextElementSibling !== pre) {
            container.insertBefore(header, pre);
        }

        let filename = header.querySelector('.code-filename');
        const extension = detectCodeExtension(pre);
        if (!filename) {
            filename = document.createElement('span');
            filename.className = 'code-filename';
            header.prepend(filename);
        }

        if (!filename.textContent.trim()) {
            const title = getCodeHeading(pre);
            const base = slugifyCodeFilename(title);
            const key = `${base}.${extension}`;
            const count = (filenameCounts.get(key) || 0) + 1;
            filenameCounts.set(key, count);
            filename.textContent = `${base}_${String(count).padStart(2, '0')}.${extension}`;
        }

        let actions = header.querySelector('.code-actions');
        if (!actions) {
            actions = document.createElement('div');
            actions.className = 'code-actions no-print';
            header.appendChild(actions);
        }

        let copyButton = container.querySelector('button.copy-btn, button[onclick*="copyCode"]');
        if (!copyButton) {
            copyButton = document.createElement('button');
            copyButton.type = 'button';
            copyButton.addEventListener('click', () => copyCode(copyButton));
        }
        copyButton.type = 'button';
        copyButton.classList.add('btn-code-action');
        copyButton.title = 'Copiar código al portapapeles';
        copyButton.setAttribute('aria-label', 'Copiar código al portapapeles');
        copyButton.replaceChildren(
            createCodeIcon('<rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>'),
            Object.assign(document.createElement('span'), { textContent: 'Copiar' })
        );
        actions.appendChild(copyButton);

        let downloadButton = actions.querySelector('button[onclick*="downloadCode"], button[data-code-download]');
        if (!downloadButton) {
            downloadButton = document.createElement('button');
            downloadButton.type = 'button';
            downloadButton.dataset.codeDownload = 'true';
            downloadButton.addEventListener('click', () => downloadCode(downloadButton));
            actions.appendChild(downloadButton);
        }
        downloadButton.type = 'button';
        downloadButton.classList.add('btn-code-action');
        downloadButton.title = `Descargar archivo ${filename.textContent.trim()}`;
        downloadButton.setAttribute('aria-label', `Descargar archivo ${filename.textContent.trim()}`);
        downloadButton.replaceChildren(
            createCodeIcon('<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v11m0 0l-4-4m4 4l4-4M4 19h16"></path>'),
            Object.assign(document.createElement('span'), { textContent: 'Descargar' })
        );

        pre.classList.add('code-pre');
    });
}

function toggleAllDetails(openState) {
    document.querySelectorAll('main details').forEach(detail => {
        detail.open = openState;
    });
}

function showToast(message) {
    let toast = document.getElementById('page-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'page-toast';
        toast.className = 'page-toast';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(window._pageToastTimer);
    window._pageToastTimer = setTimeout(() => {
        toast.classList.remove('is-visible');
    }, 2500);
}

async function copyCode(btn) {
    const container = btn.closest('.code-wrapper, .code-container');
    const pre = container ? container.querySelector('pre') : btn.nextElementSibling;
    const code = pre ? (pre.querySelector('code') || pre).textContent.replace(/\r\n?/g, '\n') : '';
    if (!code) {
        showToast('No se encontró código para copiar');
        return;
    }

    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(code);
        } else {
            copyCodeFallback(code);
        }
    } catch {
        try {
            copyCodeFallback(code);
        } catch {
            showToast('No se pudo copiar el código');
            return;
        }
    }

    const label = btn.querySelector('span') || btn;
    const originalText = label.textContent;
    label.textContent = 'Copiado';
    btn.classList.add('is-copied');
    showToast('Código copiado al portapapeles');
    setTimeout(() => {
        label.textContent = originalText;
        btn.classList.remove('is-copied');
    }, 1600);
}

function downloadCode(btn) {
    const container = btn.closest('.code-wrapper, .code-container');
    const pre = container ? container.querySelector('pre') : null;
    const filenameEl = container ? container.querySelector('.code-filename') : null;
    if (!pre || !filenameEl) {
        showToast('No se encontró el archivo de código para descargar');
        return;
    }

    const filename = filenameEl.textContent.trim();
    const code = (pre.querySelector('code') || pre).textContent.replace(/\r\n?/g, '\n');
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast(`Descargando ${filename}`);
}

function copyCodeFallback(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    let copied = false;
    try {
        textarea.select();
        copied = document.execCommand('copy');
    } finally {
        document.body.removeChild(textarea);
    }

    if (!copied) {
        throw new Error('El navegador ha rechazado la copia al portapapeles');
    }
}

function descargarPDF() {
    // Evita lanzar varias generaciones a la vez por dobles clics
    if (descargarPDF.enCurso) return;

    // Si la librería no se ha cargado (p. ej. sin conexión), se usa la impresión del navegador
    if (typeof html2pdf === 'undefined') {
        alert('No se ha podido cargar la librería html2pdf (¿sin conexión a Internet?).\n' +
              'Se abrirá el diálogo de impresión: elige "Guardar como PDF".');
        window.print();
        return;
    }

    // Seleccionamos el contenedor principal de la página
    const origen = document.querySelector('.main-content') || document.querySelector('main') || document.body;

    // Con la página abierta como archivo local (file://), Chrome bloquea la exportación
    // del canvas si contiene imágenes. En ese caso se ofrece generar sin imágenes o imprimir.
    let omitirImagenes = false;
    if (location.protocol === 'file:' && origen.querySelector('img, canvas, svg image')) {
        const sinImagenes = confirm(
            'La página está abierta como archivo local (file://) y Chrome no permite incluir sus imágenes en el PDF.\n\n' +
            'Aceptar → descargar el PDF SIN imágenes.\n' +
            'Cancelar → abrir el diálogo de impresión ("Guardar como PDF") CON imágenes.');
        if (!sinImagenes) {
            window.print();
            return;
        }
        omitirImagenes = true;
    }

    // Obtenemos el título de la página o del recurso para nombrar el PDF
    const tituloDoc = document.title.replace(/[^a-zA-Z0-9_-]/g, "_");
    const nombreArchivo = `${tituloDoc}.pdf`;

    const opciones = {
        margin:       [15, 10, 18, 10], // [superior, izquierdo, inferior, derecho] en mm
        filename:     nombreArchivo,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            scrollX: 0,
            scrollY: 0,
            ignoreElements: el =>
                (el.classList && (el.classList.contains('headerlink') || el.classList.contains('copy-btn'))) ||
                (omitirImagenes && ['IMG', 'CANVAS', 'IMAGE', 'image'].includes(el.tagName))
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        
        // REGLAS CLAVE PARA EVITAR CORTES SIN CREAR PÁGINAS VACÍAS:
        // No forzamos avoid en encabezados para evitar saltos de página artificiales entre apartados.
        pagebreak:    { 
            mode: ['css', 'legacy'], 
            avoid: ['table', 'img', 'figure', 'tr', '.box-notice'] 
        }
    };

    descargarPDF.enCurso = true;

    // Abrimos temporalmente los desplegables para que su contenido salga en el PDF
    const cerrados = Array.from(origen.querySelectorAll('details:not([open])'));
    cerrados.forEach(d => { d.open = true; });

    // Preparamos el elemento de origen directamente aplicándole la clase de exportación
    // Esto garantiza que html2pdf capture el documento auténtico una sola vez, sin duplicarlo ni fragmentarlo
    origen.classList.add('pdf-export');

    // Ocultar botones y enlaces auxiliares durante la exportación
    const botonesOcultar = Array.from(origen.querySelectorAll('.copy-btn, button, .headerlink'));
    botonesOcultar.forEach(el => { el.dataset.prevDisplay = el.style.display; el.style.display = 'none'; });

    // Recortar espacios y saltos de línea superfluos dentro de bloques de código
    const codigosTrim = [];
    origen.querySelectorAll('pre code, pre').forEach(el => {
        if (el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE) {
            codigosTrim.push({ el, original: el.textContent });
            el.textContent = el.textContent.trim();
        }
    });

    const restaurar = () => {
        origen.classList.remove('pdf-export');
        botonesOcultar.forEach(el => { el.style.display = el.dataset.prevDisplay || ''; });
        codigosTrim.forEach(item => { item.el.textContent = item.original; });
        cerrados.forEach(d => { d.open = false; });
        descargarPDF.enCurso = false;
    };

    // Generar el PDF directamente desde el origen limpio
    html2pdf().set(opciones).from(origen).toPdf().get('pdf').then(pdf => {
        const totalPages = pdf.internal.getNumberOfPages();
        const tituloOriginal = document.title;

        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(9);
            pdf.setTextColor(100, 100, 100);

            // --- ENCABEZADO ---
            pdf.text(tituloOriginal, 10, 8);
            pdf.setLineWidth(0.2);
            pdf.line(10, 10, pdf.internal.pageSize.getWidth() - 10, 10);

            // --- PIE DE PÁGINA ---
            const anchoPagina = pdf.internal.pageSize.getWidth();
            const altoPagina = pdf.internal.pageSize.getHeight();
            pdf.line(10, altoPagina - 14, anchoPagina - 10, altoPagina - 14);
            pdf.text(`Página ${i} de ${totalPages}`, anchoPagina - 10, altoPagina - 9, { align: "right" });
            pdf.text("Curso 2026/2027", 10, altoPagina - 9);
        }

        return pdf;
    }).save(nombreArchivo).then(restaurar).catch(err => {
        restaurar();
        console.error('Error al generar el PDF:', err);
        const local = location.protocol === 'file:';
        const motivo = local
            ? 'La página se ha abierto como archivo local (file://) y el navegador bloquea la captura de imágenes.\n' +
              'Ábrela desde un servidor web (p. ej. Live Server o "python3 -m http.server").\n\n'
            : '';
        if (confirm('No se ha podido generar el PDF.\n\n' + motivo +
                    '¿Quieres abrir el diálogo de impresión para "Guardar como PDF"?')) {
            window.print();
        }
    });
}