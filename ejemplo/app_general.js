/* =========================================================================
   FUNCIONALIDADES GENERALES DE LA PÁGINA (app_general.js)
   Reutilizable en todas las unidades didácticas
   ========================================================================= */

/**
 * Desplaza suavemente la ventana hasta la parte superior de la página.
 */
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
}

/**
 * Muestra una notificación flotante temporal en la esquina inferior derecha.
 * @param {string} message - Texto a mostrar en la notificación.
 */
function showToast(message) {
    const toast = document.getElementById('toast');
    const msgEl = document.getElementById('toast-msg');
    if (!toast || !msgEl) return;

    msgEl.textContent = message;
    toast.classList.add('toast-visible');
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => {
        toast.classList.remove('toast-visible');
    }, 2500);
}

/**
 * Abre o cierra todos los bloques desplegables (<details class="accordion">).
 * @param {boolean} openState - true para expandir todo, false para contraer todo.
 */
function toggleAllDetails(openState) {
    document.querySelectorAll('details.accordion').forEach(det => {
        det.open = openState;
    });
}

/**
 * Abre el bloque desplegable asociado a una sección concreta al pulsar en el índice.
 * @param {string} sectionId - Identificador de la sección (ej. 'sec-2').
 */
function openSection(sectionId) {
    const sec = document.getElementById(sectionId);
    if (sec) {
        const det = sec.querySelector('details');
        if (det) det.open = true;
    }
}

/**
 * Copia al portapapeles el contenido del bloque <pre> asociado al botón pulsado.
 * @param {HTMLElement} btn - Botón de copiado pulsado.
 */
function copyCode(btn) {
    const container = btn.closest('.code-container');
    const pre = container ? container.querySelector('pre') : null;
    if (!pre) return;

    const codeText = pre.textContent;
    const textarea = document.createElement('textarea');
    textarea.value = codeText;
    textarea.className = 'sr-only-offscreen';
    document.body.appendChild(textarea);
    textarea.select();

    let copied = false;
    try {
        copied = document.execCommand('copy');
    } catch (err) {
        copied = false;
    }
    document.body.removeChild(textarea);

    if (!copied && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(codeText).catch(() => {});
    }

    const labelSpan = btn.querySelector('span');
    const origText = labelSpan ? labelSpan.textContent : 'Copiar';
    btn.classList.add('is-copied');
    if (labelSpan) labelSpan.textContent = '¡Copiado!';
    showToast('Código copiado al portapapeles');

    setTimeout(() => {
        btn.classList.remove('is-copied');
        if (labelSpan) labelSpan.textContent = origText;
    }, 1600);
}

/**
 * Descarga como archivo .py el contenido del bloque de código asociado.
 * @param {HTMLElement} btn - Botón de descarga pulsado.
 */
function downloadCode(btn) {
    const container = btn.closest('.code-container');
    const pre = container ? container.querySelector('pre') : null;
    if (!pre) return;

    const filenameEl = container.querySelector('.code-filename');
    const filename = filenameEl ? filenameEl.textContent.trim() : 'codigo_apuntes.py';
    const blob = new Blob([pre.textContent], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Descargando ${filename}`);
}

/**
 * Expande todas las secciones y genera un PDF del contenido principal.
 */
function descargarPDF() {
    const btnPdf = document.getElementById('btn-pdf');
    const element = document.querySelector('main');
    const detailsList = Array.from(document.querySelectorAll('details.accordion'));
    const prevStates = detailsList.map(d => d.open);

    detailsList.forEach(d => d.open = true);
    document.body.classList.add('pdf-exporting');

    if (btnPdf) {
        btnPdf.disabled = true;
    }

    const restaurarEstado = () => {
        document.body.classList.remove('pdf-exporting');
        detailsList.forEach((d, idx) => d.open = prevStates[idx]);
        if (btnPdf) {
            btnPdf.disabled = false;
        }
    };

    const docTitle = document.title
        ? document.title.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_-]+/g, '_').replace(/^_|_$/g, '') + '.pdf'
        : 'Apuntes.pdf';

    if (typeof html2pdf !== 'undefined' && element) {
        const opt = {
            margin: [10, 10, 12, 10],
            filename: docTitle,
            image: { type: 'jpeg', quality: 0.96 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        html2pdf().set(opt).from(element).save()
            .then(() => {
                restaurarEstado();
                showToast('PDF descargado correctamente');
            })
            .catch(() => {
                restaurarEstado();
                window.print();
            });
    } else {
        setTimeout(() => {
            window.print();
            restaurarEstado();
        }, 250);
    }
}