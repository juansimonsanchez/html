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
        
        // REGLAS CLAVE PARA EVITAR CORTES:
        pagebreak:    { 
            mode: ['avoid-all', 'css', 'legacy'], 
            avoid: ['p', 'li', 'tr', 'pre', 'table', 'img', 'figure', 'article', 'details', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', '.box-card', '.box-notice', '.code-wrapper'] 
        }
    };

    descargarPDF.enCurso = true;

    // Abrimos temporalmente los desplegables para que su contenido salga en el PDF
    const cerrados = Array.from(origen.querySelectorAll('details:not([open])'));
    cerrados.forEach(d => { d.open = true; });

    // Los navegadores limitan el tamaño máximo de un canvas (~32.000 px de alto).
    // Para páginas largas dividimos el contenido en fragmentos y los añadimos al mismo PDF.
    const ALTO_MAX = 7000; // px CSS por fragmento
    const bloques = [];
    const recoger = nodo => {
        for (const hijo of nodo.children) {
            if (hijo.offsetHeight === 0) continue;
            const indivisible = ['TABLE', 'PRE', 'IMG', 'UL', 'OL'].includes(hijo.tagName);
            if (hijo.offsetHeight > ALTO_MAX && hijo.children.length && !indivisible) {
                recoger(hijo);
            } else {
                bloques.push(hijo);
            }
        }
    };
    recoger(origen);

    const grupos = [];
    let actual = [], alto = 0;
    bloques.forEach(b => {
        const h = b.offsetHeight;
        if (actual.length && alto + h > ALTO_MAX) {
            grupos.push(actual);
            actual = [];
            alto = 0;
        }
        actual.push(b);
        alto += h;
    });
    if (actual.length) grupos.push(actual);
    if (!grupos.length) grupos.push([origen]);

    // Cada fragmento se envuelve en un <main class="main-content"> para conservar los estilos
    const crearContenedor = grupo => {
        const c = document.createElement('main');
        c.className = 'main-content';
        grupo.forEach(n => c.appendChild(n.cloneNode(true)));
        return c;
    };

    const restaurar = () => {
        cerrados.forEach(d => { d.open = false; });
        descargarPDF.enCurso = false;
    };

    // Generar los fragmentos en el worker de html2pdf
    let worker = html2pdf().set(opciones).from(crearContenedor(grupos[0])).toPdf();
    grupos.slice(1).forEach(g => {
        worker = worker.get('pdf')
            .then(pdf => { pdf.addPage(); })
            .from(crearContenedor(g))
            .toContainer()
            .toCanvas()
            .toPdf();
    });

    // Procesar todas las páginas generadas para estampar el Encabezado y el Pie de página
    worker.toPdf().get('pdf').then(pdf => {
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
    }).then(() => {
        // Guardar el documento final y restaurar el DOM
        worker.save(nombreArchivo)
            .then(restaurar)
            .catch(err => {
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
    });
}