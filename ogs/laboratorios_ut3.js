/* =========================================================================
   LABORATORIOS, SIMULADORES Y TEST DE AUTOEVALUACIÓN - OGS UT3
   Archivo: ogs/laboratorios_ut3.js
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

    function formatPyVal(val) {
        return typeof val === 'string' ? `'${val}'` : String(val);
    }

    function formatPyList(arr) {
        return `[${arr.map(formatPyVal).join(', ')}]`;
    }

    function parseInputVal(raw) {
        const trimmed = raw.trim();
        if (trimmed === '') return null;
        if (trimmed === 'True') return true;
        if (trimmed === 'False') return false;
        if (!isNaN(Number(trimmed))) return Number(trimmed);
        return trimmed.replace(/^['"]|['"]$/g, '');
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
       SIMULADOR 1: LISTAS, SLICING Y MEMORIA (Sección 2 - page-section-4)
       ===================================================================== */
    let simList = [10, 25, 40, 55, 70];
    let simListClone = [...simList];

    function htmlLabListas() {
        return `
        <div class="lab-box lab-blue" id="lab-listas">
            <span class="lab-tag tag-blue">Laboratorio 1 · Listas</span>
            <h4 class="lab-title">Simulador de Listas, Slicing y Copia en Memoria</h4>
            <p class="lab-desc">Manipula <code>mi_lista</code> en vivo, observa los índices positivos y negativos, experimenta con rebanadas y comprueba la diferencia entre alias (<code>=</code>) y clon (<code>[:]</code>).</p>
            <div class="lab-cells-board" id="lab-list-board"></div>
            <div class="lab-card">
                <p class="lab-label">Operaciones in-place</p>
                <div class="lab-row">
                    <input type="text" class="lab-input lab-w-md" id="lab-list-val" placeholder="Valor (ej. 99 o 'ok')" autocomplete="off">
                    <input type="number" class="lab-input lab-w-sm" id="lab-list-idx" placeholder="Índice">
                    <button type="button" class="lab-btn lab-btn-primary" id="lab-list-append">.append()</button>
                    <button type="button" class="lab-btn lab-btn-indigo" id="lab-list-insert">.insert()</button>
                    <button type="button" class="lab-btn lab-btn-danger" id="lab-list-pop">.pop()</button>
                    <button type="button" class="lab-btn lab-btn-dark" id="lab-list-sort">.sort()</button>
                    <button type="button" class="lab-btn lab-btn-dark" id="lab-list-rev">.reverse()</button>
                    <button type="button" class="lab-btn lab-btn-light" id="lab-list-reset">Reiniciar</button>
                </div>
            </div>
            <div class="lab-grid-2">
                <div class="lab-card">
                    <p class="lab-label">Slicing: <code id="lab-slice-expr">mi_lista[1:4]</code></p>
                    <div class="lab-grid-3">
                        <input type="number" class="lab-input" id="lab-slice-start" value="1" placeholder="inicio">
                        <input type="number" class="lab-input" id="lab-slice-end" value="4" placeholder="fin">
                        <input type="number" class="lab-input" id="lab-slice-step" value="" placeholder="paso (1)">
                    </div>
                    <div class="lab-output" id="lab-slice-res"></div>
                </div>
                <div class="lab-card">
                    <p class="lab-label">Memoria: Alias vs Clon</p>
                    <div class="lab-mem-warn">alias = mi_lista &rarr; <span id="lab-list-alias"></span></div>
                    <div class="lab-mem-ok">clon = mi_lista[:] &rarr; <span id="lab-list-clone"></span></div>
                </div>
            </div>
        </div>`;
    }

    function initLabListas() {
        const board = document.getElementById('lab-list-board');
        if (!board) return;

        const valIn = document.getElementById('lab-list-val');
        const idxIn = document.getElementById('lab-list-idx');
        const sIn = document.getElementById('lab-slice-start');
        const eIn = document.getElementById('lab-slice-end');
        const pIn = document.getElementById('lab-slice-step');

        const updateSlice = () => {
            const sRaw = sIn.value.trim();
            const eRaw = eIn.value.trim();
            const pRaw = pIn.value.trim();
            const step = pRaw === '' ? 1 : parseInt(pRaw, 10);
            document.getElementById('lab-slice-expr').textContent =
                `mi_lista[${sRaw}:${eRaw}${pRaw !== '' ? ':' + pRaw : ''}]`;

            const resEl = document.getElementById('lab-slice-res');
            if (step === 0 || isNaN(step)) {
                resEl.textContent = 'ValueError: slice step cannot be zero';
                return;
            }
            const len = simList.length;
            const res = [];
            if (step > 0) {
                let start = sRaw === '' ? 0 : parseInt(sRaw, 10);
                let end = eRaw === '' ? len : parseInt(eRaw, 10);
                if (start < 0) start = Math.max(0, len + start);
                if (end < 0) end = Math.max(0, len + end);
                start = Math.min(start, len);
                end = Math.min(end, len);
                for (let i = start; i < end; i += step) res.push(simList[i]);
            } else {
                let start = sRaw === '' ? len - 1 : parseInt(sRaw, 10);
                let end = eRaw === '' ? -1 : parseInt(eRaw, 10);
                if (start < 0 && sRaw !== '') start = len + start;
                if (end < 0 && eRaw !== '') end = len + end;
                start = Math.min(start, len - 1);
                for (let i = start; i > end && i >= 0; i += step) res.push(simList[i]);
            }
            resEl.textContent = formatPyList(res);
        };

        const render = () => {
            if (simList.length === 0) {
                board.innerHTML = '<span class="lab-desc lab-mono">[] (Lista vacía)</span>';
            } else {
                board.innerHTML = simList.map((item, idx) => `
                    <div class="lab-cell">
                        <span class="cell-pos">[${idx}]</span>
                        <span class="cell-val">${esc(formatPyVal(item))}</span>
                        <span class="cell-neg">[${idx - simList.length}]</span>
                    </div>
                `).join('');
            }
            document.getElementById('lab-list-alias').textContent = formatPyList(simList);
            document.getElementById('lab-list-clone').textContent = formatPyList(simListClone);
            updateSlice();
        };

        document.getElementById('lab-list-append').addEventListener('click', () => {
            const val = parseInputVal(valIn.value);
            if (val === null) { toast('Introduce un valor para añadir'); return; }
            simList.push(val);
            valIn.value = '';
            render();
        });
        document.getElementById('lab-list-insert').addEventListener('click', () => {
            const val = parseInputVal(valIn.value);
            if (val === null) { toast('Introduce un valor para insertar'); return; }
            let idx = parseInt(idxIn.value, 10);
            if (isNaN(idx)) idx = 0;
            if (idx < 0) idx = Math.max(0, simList.length + idx);
            simList.splice(idx, 0, val);
            valIn.value = '';
            render();
        });
        document.getElementById('lab-list-pop').addEventListener('click', () => {
            if (simList.length === 0) { toast('IndexError: pop from empty list'); return; }
            const rawIdx = idxIn.value.trim();
            let removed;
            if (rawIdx === '') {
                removed = simList.pop();
            } else {
                let idx = parseInt(rawIdx, 10);
                if (idx < 0) idx = simList.length + idx;
                if (idx < 0 || idx >= simList.length) { toast('IndexError: pop index out of range'); return; }
                removed = simList.splice(idx, 1)[0];
            }
            render();
            toast(`Elemento extraído con pop(): ${formatPyVal(removed)}`);
        });
        document.getElementById('lab-list-sort').addEventListener('click', () => {
            simList.sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
            render();
        });
        document.getElementById('lab-list-rev').addEventListener('click', () => {
            simList.reverse();
            render();
        });
        document.getElementById('lab-list-reset').addEventListener('click', () => {
            simList = [10, 25, 40, 55, 70];
            simListClone = [...simList];
            render();
            toast('Lista reiniciada');
        });
        [sIn, eIn, pIn].forEach(el => el.addEventListener('input', updateSlice));
        render();
    }

    /* =====================================================================
       SIMULADOR 2: COMPARADOR LISTA VS TUPLA (Sección 3 - page-section-5)
       ===================================================================== */
    const tupleCases = [
        {
            id: 0,
            title: 'Coordenadas GPS fijas de una estación meteorológica (latitud, longitud)',
            best: 'tuple',
            reason: 'Las coordenadas de una estación fija no cambian durante la ejecución; tuple protege frente a modificaciones accidentales y ocupa menos memoria.'
        },
        {
            id: 1,
            title: 'Carrito de la compra donde el usuario añade y elimina productos',
            best: 'list',
            reason: 'La colección crece y decrece dinámicamente mediante .append(), .remove() o .pop(), operaciones exclusivas de las estructuras mutables como list.'
        },
        {
            id: 2,
            title: 'Los 7 días de la semana como constantes de referencia en el programa',
            best: 'tuple',
            reason: 'Al ser un conjunto cerrado e invariable de 7 valores constantes, una tupla garantiza integridad de datos.'
        }
    ];

    function htmlLabTuplas() {
        const cards = tupleCases.map(c => `
            <div class="lab-card">
                <div class="lab-row-between">
                    <span class="lab-case-title">${esc(c.title)}</span>
                    <div class="lab-btn-group">
                        <button type="button" class="lab-btn lab-btn-choice" data-case="${c.id}" data-pick="list">Elegir list</button>
                        <button type="button" class="lab-btn lab-btn-soft-purple" data-case="${c.id}" data-pick="tuple">Elegir tuple</button>
                    </div>
                </div>
                <div id="lab-tuple-fb-${c.id}" class="lab-feedback hidden"></div>
            </div>
        `).join('');
        return `
        <div class="lab-box lab-purple" id="lab-tuplas">
            <span class="lab-tag tag-purple">Laboratorio 2 · Tuplas</span>
            <h4 class="lab-title">¿Cuándo usar <code>list</code> y cuándo usar <code>tuple</code>?</h4>
            <p class="lab-desc">Evalúa cada escenario y decide si conviene una estructura mutable (<code>list</code>) o inmutable (<code>tuple</code>).</p>
            <div class="lab-stack">${cards}</div>
        </div>`;
    }

    function initLabTuplas() {
        const box = document.getElementById('lab-tuplas');
        if (!box) return;
        box.addEventListener('click', e => {
            const btn = e.target.closest('button[data-case]');
            if (!btn) return;
            const item = tupleCases.find(c => c.id === Number(btn.dataset.case));
            const fb = document.getElementById(`lab-tuple-fb-${btn.dataset.case}`);
            if (!item || !fb) return;
            const ok = item.best === btn.dataset.pick;
            fb.className = `lab-feedback ${ok ? 'fb-ok' : 'fb-warn'}`;
            fb.innerHTML = `<strong>${ok ? '✔ ¡Elección óptima!' : '💡 Recomendación:'}</strong> Se prefiere <code>${item.best}</code>. ${esc(item.reason)}`;
        });
    }

    /* =====================================================================
       SIMULADOR 3: DICCIONARIOS (Sección 4 - page-section-6)
       ===================================================================== */
    let simDict = { nombre: 'Lucía', curso: '1º ASIR', modulo: 'OGS' };

    function htmlLabDict() {
        return `
        <div class="lab-box lab-emerald" id="lab-dict">
            <span class="lab-tag tag-emerald">Laboratorio 3 · Diccionarios</span>
            <h4 class="lab-title">Consola Interactiva de Diccionarios (<code>dict</code>)</h4>
            <p class="lab-desc">Inserta, modifica o elimina pares clave-valor y comprueba la diferencia entre el acceso directo <code>alumno[k]</code> y <code>alumno.get(k, defecto)</code>.</p>
            <pre class="lab-console" id="lab-dict-view"></pre>
            <div class="lab-grid-2">
                <div class="lab-card">
                    <p class="lab-label">Modificar / Eliminar clave</p>
                    <div class="lab-row">
                        <input type="text" class="lab-input" id="lab-dict-key" placeholder="Clave (ej. nota)" autocomplete="off">
                        <input type="text" class="lab-input" id="lab-dict-val" placeholder="Valor (ej. 9.5)" autocomplete="off">
                    </div>
                    <div class="lab-btn-group">
                        <button type="button" class="lab-btn lab-btn-emerald" id="lab-dict-set">Asignar [k] = v</button>
                        <button type="button" class="lab-btn lab-btn-danger" id="lab-dict-del">del [k]</button>
                        <button type="button" class="lab-btn lab-btn-light" id="lab-dict-reset">Reiniciar</button>
                    </div>
                </div>
                <div class="lab-card">
                    <p class="lab-label">Consultar e Iterar</p>
                    <div class="lab-row">
                        <input type="text" class="lab-input" id="lab-dict-qkey" value="email" placeholder="Clave a buscar" autocomplete="off">
                        <input type="text" class="lab-input" id="lab-dict-def" value="No disponible" placeholder="Por defecto" autocomplete="off">
                    </div>
                    <div class="lab-btn-group">
                        <button type="button" class="lab-btn lab-btn-primary" id="lab-dict-dget">alumno[k]</button>
                        <button type="button" class="lab-btn lab-btn-teal" id="lab-dict-sget">.get(k, def)</button>
                        <button type="button" class="lab-btn lab-btn-dark" data-iter="keys">.keys()</button>
                        <button type="button" class="lab-btn lab-btn-dark" data-iter="values">.values()</button>
                        <button type="button" class="lab-btn lab-btn-dark" data-iter="items">.items()</button>
                    </div>
                </div>
            </div>
            <div class="lab-output" id="lab-dict-out">Prueba a consultar la clave 'email' con alumno[k] frente a .get().</div>
        </div>`;
    }

    function initLabDict() {
        const view = document.getElementById('lab-dict-view');
        const out = document.getElementById('lab-dict-out');
        const box = document.getElementById('lab-dict');
        if (!view || !out || !box) return;

        const render = () => {
            const entries = Object.entries(simDict).map(([k, v]) => `'${k}': ${formatPyVal(v)}`);
            view.textContent = `alumno = {${entries.join(', ')}}`;
        };

        document.getElementById('lab-dict-set').addEventListener('click', () => {
            const k = document.getElementById('lab-dict-key').value.trim();
            const rawV = document.getElementById('lab-dict-val').value;
            if (!k) { toast('Introduce una clave válida'); return; }
            const val = parseInputVal(rawV);
            simDict[k] = val === null ? '' : val;
            render();
            out.innerHTML = `<span class="txt-ok">✔ Asignado:</span> alumno['${esc(k)}'] = ${esc(formatPyVal(simDict[k]))}`;
        });
        document.getElementById('lab-dict-del').addEventListener('click', () => {
            const k = document.getElementById('lab-dict-key').value.trim();
            if (!Object.prototype.hasOwnProperty.call(simDict, k)) {
                out.innerHTML = `<span class="txt-err">❌ KeyError: '${esc(k)}'</span> (La clave no existe en el diccionario)`;
                return;
            }
            delete simDict[k];
            render();
            out.innerHTML = `<span class="txt-ok">✔ Eliminada clave '${esc(k)}'</span> con del alumno['${esc(k)}']`;
        });
        document.getElementById('lab-dict-reset').addEventListener('click', () => {
            simDict = { nombre: 'Lucía', curso: '1º ASIR', modulo: 'OGS' };
            render();
            out.textContent = 'Diccionario restaurado.';
        });
        document.getElementById('lab-dict-dget').addEventListener('click', () => {
            const k = document.getElementById('lab-dict-qkey').value.trim();
            if (Object.prototype.hasOwnProperty.call(simDict, k)) {
                out.innerHTML = `<span class="txt-ok">alumno['${esc(k)}'] &rarr;</span> ${esc(formatPyVal(simDict[k]))}`;
            } else {
                out.innerHTML = `<span class="txt-err">❌ KeyError: '${esc(k)}'</span> &mdash; El programa se detendría sin control de excepciones.`;
            }
        });
        document.getElementById('lab-dict-sget').addEventListener('click', () => {
            const k = document.getElementById('lab-dict-qkey').value.trim();
            const defRaw = document.getElementById('lab-dict-def').value.trim();
            if (Object.prototype.hasOwnProperty.call(simDict, k)) {
                out.innerHTML = `<span class="txt-ok">alumno.get('${esc(k)}') &rarr;</span> ${esc(formatPyVal(simDict[k]))}`;
            } else {
                const ret = defRaw === '' ? 'None' : formatPyVal(defRaw);
                out.innerHTML = `<span class="c-blue">alumno.get('${esc(k)}', ${defRaw === '' ? 'None' : "'" + esc(defRaw) + "'"}) &rarr;</span> ${esc(ret)} (Sin error)`;
            }
        });
        box.addEventListener('click', e => {
            const btn = e.target.closest('button[data-iter]');
            if (!btn) return;
            const mode = btn.dataset.iter;
            if (mode === 'keys') {
                out.textContent = `dict_keys([${Object.keys(simDict).map(k => `'${k}'`).join(', ')}])`;
            } else if (mode === 'values') {
                out.textContent = `dict_values([${Object.values(simDict).map(formatPyVal).join(', ')}])`;
            } else {
                const pairs = Object.entries(simDict).map(([k, v]) => `('${k}', ${formatPyVal(v)})`);
                out.textContent = `dict_items([${pairs.join(', ')}])`;
            }
        });
        render();
    }

    /* =====================================================================
       SIMULADOR 4: CADENAS DE CARACTERES (Sección 5 - page-section-7)
       ===================================================================== */
    function htmlLabStr() {
        return `
        <div class="lab-box lab-sky" id="lab-str">
            <span class="lab-tag tag-sky">Laboratorio 4 · Cadenas (str)</span>
            <h4 class="lab-title">Laboratorio Interactivo de Cadenas de Caracteres</h4>
            <p class="lab-desc">Modifica la cadena de entrada y observa en tiempo real <code>len()</code>, <code>upper()</code>, <code>lower()</code>, <code>capitalize()</code>, <code>find()</code>, <code>replace()</code> y <code>split()</code>.</p>
            <div class="lab-card">
                <p class="lab-label">Cadena base</p>
                <input type="text" class="lab-input" id="lab-str-in" value="Hola mundo Python" autocomplete="off">
                <div class="lab-grid-4">
                    <div class="lab-output">len(): <strong id="lab-str-len"></strong></div>
                    <div class="lab-output">upper(): <span id="lab-str-up"></span></div>
                    <div class="lab-output">lower(): <span id="lab-str-low"></span></div>
                    <div class="lab-output">capitalize(): <span id="lab-str-cap"></span></div>
                </div>
            </div>
            <div class="lab-grid-3">
                <div class="lab-card">
                    <p class="lab-label">.find(subcadena)</p>
                    <input type="text" class="lab-input" id="lab-str-find" value="mundo" autocomplete="off">
                    <div class="lab-output">Índice: <strong id="lab-str-find-res"></strong></div>
                </div>
                <div class="lab-card">
                    <p class="lab-label">.replace(antiguo, nuevo)</p>
                    <div class="lab-row">
                        <input type="text" class="lab-input" id="lab-str-old" value="Hola" autocomplete="off">
                        <input type="text" class="lab-input" id="lab-str-new" value="Adiós" autocomplete="off">
                    </div>
                    <div class="lab-output" id="lab-str-rep-res"></div>
                </div>
                <div class="lab-card">
                    <p class="lab-label">.split(separador)</p>
                    <input type="text" class="lab-input" id="lab-str-sep" value="" placeholder="Vacío = espacios" autocomplete="off">
                    <div class="lab-output" id="lab-str-split-res"></div>
                </div>
            </div>
        </div>`;
    }

    function initLabStr() {
        const sIn = document.getElementById('lab-str-in');
        if (!sIn) return;
        const fIn = document.getElementById('lab-str-find');
        const oIn = document.getElementById('lab-str-old');
        const nIn = document.getElementById('lab-str-new');
        const sepIn = document.getElementById('lab-str-sep');

        const upd = () => {
            const txt = sIn.value;
            document.getElementById('lab-str-len').textContent = txt.length;
            document.getElementById('lab-str-up').textContent = `"${txt.toUpperCase()}"`;
            document.getElementById('lab-str-low').textContent = `"${txt.toLowerCase()}"`;
            const cap = txt.length > 0 ? txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase() : '';
            document.getElementById('lab-str-cap').textContent = `"${cap}"`;

            const idx = txt.indexOf(fIn.value);
            const findEl = document.getElementById('lab-str-find-res');
            findEl.textContent = idx;
            findEl.className = idx === -1 ? 'txt-err' : 'txt-ok';

            const oldS = oIn.value;
            const replaced = oldS ? txt.split(oldS).join(nIn.value) : txt;
            document.getElementById('lab-str-rep-res').textContent = `"${replaced}"`;

            const sep = sepIn.value;
            const parts = sep === '' ? txt.trim().split(/\s+/).filter(Boolean) : txt.split(sep);
            document.getElementById('lab-str-split-res').textContent = formatPyList(parts);
        };

        [sIn, fIn, oIn, nIn, sepIn].forEach(el => el.addEventListener('input', upd));
        upd();
    }

    /* =====================================================================
       SIMULADOR 5: EXCEPCIONES try-except-else-finally (Sección 6 - page-section-8)
       ===================================================================== */
    function htmlLabExc() {
        return `
        <div class="lab-box lab-amber" id="lab-exc">
            <span class="lab-tag tag-amber">Laboratorio 5 · Excepciones</span>
            <h4 class="lab-title">Trazador de Flujo <code>try - except - else - finally</code></h4>
            <p class="lab-desc">Introduce un valor para <code>cad</code> en <code>10 / int(cad)</code> y observa qué bloques se activan en cada escenario.</p>
            <div class="lab-row">
                <input type="text" class="lab-input lab-w-md" id="lab-exc-in" value="2" autocomplete="off">
                <button type="button" class="lab-btn lab-btn-emerald" data-exc="2">Probar "2" (Éxito)</button>
                <button type="button" class="lab-btn lab-btn-soft-amber" data-exc="0">Probar "0" (ZeroDivision)</button>
                <button type="button" class="lab-btn lab-btn-soft-rose" data-exc="abc">Probar "abc" (ValueError)</button>
            </div>
            <div class="lab-grid-5">
                <div class="lab-exc-blk" id="lab-blk-try">try:<br>res = 10 / int(cad)</div>
                <div class="lab-exc-blk" id="lab-blk-val">except ValueError:<br>Error conversión</div>
                <div class="lab-exc-blk" id="lab-blk-zero">except ZeroDivisionError:<br>División por cero</div>
                <div class="lab-exc-blk" id="lab-blk-else">else:<br>Sin errores</div>
                <div class="lab-exc-blk" id="lab-blk-fin">finally:<br>Se ejecuta siempre</div>
            </div>
            <pre class="lab-console" id="lab-exc-con"></pre>
        </div>`;
    }

    function initLabExc() {
        const inp = document.getElementById('lab-exc-in');
        const con = document.getElementById('lab-exc-con');
        const box = document.getElementById('lab-exc');
        if (!inp || !con || !box) return;

        const blocks = ['lab-blk-try', 'lab-blk-val', 'lab-blk-zero', 'lab-blk-else', 'lab-blk-fin'];
        const setBlk = (id, cls) => {
            const el = document.getElementById(id);
            if (el) el.className = `lab-exc-blk ${cls}`;
        };

        const run = () => {
            const raw = inp.value.trim();
            blocks.forEach(id => setBlk(id, 'is-dim'));
            setBlk('lab-blk-try', 'act-blue');
            setBlk('lab-blk-fin', 'act-purple');

            if (!/^-?\d+$/.test(raw)) {
                setBlk('lab-blk-val', 'act-rose');
                con.innerHTML = `<span class="c-rose">except ValueError:</span> No se puede convertir '${esc(raw)}' a entero.\n<span class="c-sky">finally:</span> Fin de la operación.`;
                return;
            }
            const num = parseInt(raw, 10);
            if (num === 0) {
                setBlk('lab-blk-zero', 'act-amber');
                con.innerHTML = `<span class="c-amber">except ZeroDivisionError:</span> No se puede dividir por cero.\n<span class="c-sky">finally:</span> Fin de la operación.`;
                return;
            }
            setBlk('lab-blk-else', 'act-green');
            con.innerHTML = `<span class="c-green">else (Éxito):</span> 10 / ${num} = ${10 / num}\n<span class="c-sky">finally:</span> Fin de la operación.`;
        };

        inp.addEventListener('input', run);
        box.addEventListener('click', e => {
            const btn = e.target.closest('button[data-exc]');
            if (!btn) return;
            inp.value = btn.dataset.exc;
            run();
        });
        run();
    }

    /* =====================================================================
       SIMULADOR 6: FICHEROS NATIVOS Y PUNTERO (Sección 7 - page-section-9)
       ===================================================================== */
    const INITIAL_FILE_CONTENT = 'Linea 1: Python\nLinea 2: Ficheros\nLinea 3: UT3';
    let fileContent = INITIAL_FILE_CONTENT;
    let fileCursor = 0;
    let fileMode = 'r';

    function htmlLabFicheros() {
        return `
        <div class="lab-box lab-rose" id="lab-ficheros">
            <span class="lab-tag tag-rose">Laboratorio 6 · Ficheros</span>
            <h4 class="lab-title">Simulador de Ficheros Nativos, Modos de Acceso y Puntero (<code>tell</code> / <code>seek</code>)</h4>
            <p class="lab-desc">Abre el fichero virtual en distintos modos (<code>r</code>, <code>w</code>, <code>a</code>, <code>r+</code>) y observa cómo se desplaza el puntero al leer o escribir.</p>
            <div class="lab-row-between">
                <div class="lab-row">
                    <select class="lab-select lab-w-md" id="lab-file-mode">
                        <option value="r">Modo "r" (Lectura)</option>
                        <option value="w">Modo "w" (Sobrescribir)</option>
                        <option value="a">Modo "a" (Anexar)</option>
                        <option value="r+">Modo "r+" (Mixto)</option>
                    </select>
                    <button type="button" class="lab-btn lab-btn-primary" id="lab-file-open">open()</button>
                    <button type="button" class="lab-btn lab-btn-light" id="lab-file-reset">Restaurar archivo</button>
                </div>
                <span class="lab-label">Modo activo: <code id="lab-file-curmode">r</code> · f.tell() = <strong id="lab-file-pos">0</strong></span>
            </div>
            <pre class="lab-file-buffer" id="lab-file-buf"></pre>
            <div class="lab-grid-2">
                <div class="lab-card">
                    <p class="lab-label">Lectura y Puntero</p>
                    <div class="lab-btn-group">
                        <button type="button" class="lab-btn lab-btn-indigo" id="lab-file-read5">f.read(5)</button>
                        <button type="button" class="lab-btn lab-btn-teal" id="lab-file-readline">f.readline()</button>
                        <button type="button" class="lab-btn lab-btn-dark" id="lab-file-seek0">f.seek(0)</button>
                    </div>
                </div>
                <div class="lab-card">
                    <p class="lab-label">Escritura (<code>f.write()</code>)</p>
                    <div class="lab-row">
                        <input type="text" class="lab-input" id="lab-file-wtxt" value="\\nLinea nueva" autocomplete="off">
                        <button type="button" class="lab-btn lab-btn-emerald" id="lab-file-write">f.write()</button>
                    </div>
                </div>
            </div>
            <div class="lab-output" id="lab-file-log">Archivo abierto en modo "r". Puntero en posición 0.</div>
        </div>`;
    }

    function initLabFicheros() {
        const bufEl = document.getElementById('lab-file-buf');
        const logEl = document.getElementById('lab-file-log');
        const modeSel = document.getElementById('lab-file-mode');
        if (!bufEl || !logEl || !modeSel) return;

        const render = () => {
            const before = fileContent.slice(0, fileCursor);
            const after = fileContent.slice(fileCursor);
            bufEl.innerHTML = `${esc(before)}<span class="cursor-caret">|</span>${esc(after)}`;
            document.getElementById('lab-file-pos').textContent = fileCursor;
            document.getElementById('lab-file-curmode').textContent = fileMode;
        };

        document.getElementById('lab-file-open').addEventListener('click', () => {
            fileMode = modeSel.value;
            if (fileMode === 'w') {
                fileContent = '';
                fileCursor = 0;
                logEl.innerHTML = '<span class="txt-err">Modo "w":</span> Contenido previo borrado. Puntero en 0.';
            } else if (fileMode === 'a') {
                fileCursor = fileContent.length;
                logEl.innerHTML = `<span class="txt-ok">Modo "a":</span> Contenido conservado. Puntero al final (${fileCursor}).`;
            } else {
                fileCursor = 0;
                logEl.innerHTML = `<span class="c-blue">Modo "${fileMode}":</span> Archivo abierto. Puntero al inicio (0).`;
            }
            render();
        });
        document.getElementById('lab-file-reset').addEventListener('click', () => {
            fileContent = INITIAL_FILE_CONTENT;
            fileMode = 'r';
            fileCursor = 0;
            modeSel.value = 'r';
            logEl.textContent = 'Archivo restaurado y abierto en modo "r". Puntero en posición 0.';
            render();
        });
        document.getElementById('lab-file-read5').addEventListener('click', () => {
            if (fileMode === 'w' || fileMode === 'a') {
                logEl.innerHTML = `<span class="txt-err">io.UnsupportedOperation: not readable</span> (El modo "${fileMode}" no permite lectura).`;
                return;
            }
            const chunk = fileContent.slice(fileCursor, fileCursor + 5);
            fileCursor = Math.min(fileContent.length, fileCursor + 5);
            render();
            logEl.innerHTML = `<span class="txt-ok">f.read(5) &rarr;</span> ${esc(JSON.stringify(chunk))} (Puntero: ${fileCursor})`;
        });
        document.getElementById('lab-file-readline').addEventListener('click', () => {
            if (fileMode === 'w' || fileMode === 'a') {
                logEl.innerHTML = `<span class="txt-err">io.UnsupportedOperation: not readable</span> (El modo "${fileMode}" no permite lectura).`;
                return;
            }
            if (fileCursor >= fileContent.length) {
                logEl.textContent = 'f.readline() -> "" (Fin de archivo EOF alcanzado)';
                return;
            }
            const nextNl = fileContent.indexOf('\n', fileCursor);
            const endIdx = nextNl === -1 ? fileContent.length : nextNl + 1;
            const line = fileContent.slice(fileCursor, endIdx);
            fileCursor = endIdx;
            render();
            logEl.innerHTML = `<span class="txt-ok">f.readline() &rarr;</span> ${esc(JSON.stringify(line))} (Puntero: ${fileCursor})`;
        });
        document.getElementById('lab-file-seek0').addEventListener('click', () => {
            fileCursor = 0;
            render();
            logEl.textContent = 'f.seek(0) ejecutado. Puntero reubicado al inicio (0).';
        });
        document.getElementById('lab-file-write').addEventListener('click', () => {
            if (fileMode === 'r') {
                logEl.innerHTML = '<span class="txt-err">io.UnsupportedOperation: not writable</span> (Abre en modo "w", "a" o "r+").';
                return;
            }
            const rawText = document.getElementById('lab-file-wtxt').value.replace(/\\n/g, '\n');
            if (fileMode === 'a') {
                fileContent += rawText;
                fileCursor = fileContent.length;
            } else {
                const before = fileContent.slice(0, fileCursor);
                const after = fileContent.slice(fileCursor + rawText.length);
                fileContent = before + rawText + after;
                fileCursor += rawText.length;
            }
            render();
            logEl.innerHTML = `<span class="txt-ok">f.write(${esc(JSON.stringify(rawText))})</span> completado (${rawText.length} caracteres).`;
        });
        render();
    }

    /* =====================================================================
       SIMULADOR 7: CSV READER (Sección 8 - page-section-10)
       ===================================================================== */
    function parseCsvLine(line) {
        const result = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
                inQuotes = !inQuotes;
            } else if (ch === ',' && !inQuotes) {
                result.push(cur);
                cur = '';
            } else {
                cur += ch;
            }
        }
        result.push(cur);
        return result;
    }

    function htmlLabCsv() {
        return `
        <div class="lab-box lab-blue" id="lab-csv">
            <span class="lab-tag tag-blue">Laboratorio 7 · CSV</span>
            <h4 class="lab-title">Analizador en Vivo <code>list(csv.reader(fichero))</code></h4>
            <p class="lab-desc">Edita el texto CSV (incluso con campos entre comillas que contengan comas) y comprueba la lista de listas que genera Python.</p>
            <div class="lab-grid-2">
                <div class="lab-card">
                    <p class="lab-label">Archivo CSV de entrada</p>
                    <textarea class="lab-textarea" id="lab-csv-in" rows="4">4/5/2015 13:34,Apples,73
4/5/2015 3:41,"Cherries, rojas",85
4/6/2015 12:46,Pears,14</textarea>
                </div>
                <div class="lab-card">
                    <p class="lab-label">Salida Python: <code>list(csv.reader(f))</code></p>
                    <pre class="lab-console" id="lab-csv-out"></pre>
                </div>
            </div>
        </div>`;
    }

    function initLabCsv() {
        const inp = document.getElementById('lab-csv-in');
        const out = document.getElementById('lab-csv-out');
        if (!inp || !out) return;
        const upd = () => {
            const lines = inp.value.split(/\r?\n/).filter(l => l.trim() !== '');
            const matrix = lines.map(parseCsvLine);
            out.textContent = '[\n' + matrix.map(row => '  [' + row.map(c => `'${c}'`).join(', ') + ']').join(',\n') + '\n]';
        };
        inp.addEventListener('input', upd);
        upd();
    }

    /* =====================================================================
       SIMULADOR 8: TRADUCTOR PYTHON DICT -> JSON (Sección 9 - page-section-11)
       ===================================================================== */
    const jsonState = { isCat: true, miceCaught: 0, name: 'Zophie', felineIQ: null };

    function htmlLabJson() {
        return `
        <div class="lab-box lab-emerald" id="lab-json">
            <span class="lab-tag tag-emerald">Laboratorio 8 · JSON</span>
            <h4 class="lab-title">Traductor de Tipos: Diccionario Python &rarr; JSON (<code>json.dump</code>)</h4>
            <p class="lab-desc">Alterna los valores booleanos y <code>None</code> para observar cómo traduce Python sus tipos nativos al estándar JSON.</p>
            <div class="lab-btn-group">
                <button type="button" class="lab-btn lab-btn-emerald" id="lab-json-bool">Alternar isCat (True / False)</button>
                <button type="button" class="lab-btn lab-btn-indigo" id="lab-json-none">Alternar felineIQ (None / 145)</button>
            </div>
            <div class="lab-grid-2">
                <div class="lab-card">
                    <p class="lab-label">Diccionario Python</p>
                    <pre class="lab-console" id="lab-json-py"></pre>
                </div>
                <div class="lab-card">
                    <p class="lab-label">Archivo JSON generado</p>
                    <pre class="lab-console" id="lab-json-out"></pre>
                </div>
            </div>
        </div>`;
    }

    function initLabJson() {
        const pyEl = document.getElementById('lab-json-py');
        const outEl = document.getElementById('lab-json-out');
        if (!pyEl || !outEl) return;

        const render = () => {
            const pyBool = jsonState.isCat ? 'True' : 'False';
            const pyNone = jsonState.felineIQ === null ? 'None' : jsonState.felineIQ;
            pyEl.innerHTML = `datos_gato = {\n  'isCat': <span class="json-hl">${pyBool}</span>,\n  'miceCaught': ${jsonState.miceCaught},\n  'name': '${jsonState.name}',\n  'felineIQ': <span class="json-hl">${pyNone}</span>\n}`;

            const jBool = jsonState.isCat ? 'true' : 'false';
            const jNull = jsonState.felineIQ === null ? 'null' : jsonState.felineIQ;
            outEl.innerHTML = `{\n  "isCat": <span class="json-hl">${jBool}</span>,\n  "miceCaught": ${jsonState.miceCaught},\n  "name": "${jsonState.name}",\n  "felineIQ": <span class="json-hl">${jNull}</span>\n}`;
        };

        document.getElementById('lab-json-bool').addEventListener('click', () => {
            jsonState.isCat = !jsonState.isCat;
            render();
        });
        document.getElementById('lab-json-none').addEventListener('click', () => {
            jsonState.felineIQ = jsonState.felineIQ === null ? 145 : null;
            render();
        });
        render();
    }

    /* =====================================================================
       TEST DE AUTOEVALUACIÓN (10 preguntas sobre UT3)
       ===================================================================== */
    const quizQuestions = [
        {
            q: '1. ¿Qué ocurre si ejecutamos lista2 = lista1 y modificamos lista1[0] = 99?',
            options: [
                'Solo cambia lista1 porque = crea una copia independiente.',
                'Cambian ambas listas porque = crea un alias que apunta al mismo objeto en memoria.',
                'Python lanza un TypeError por mutabilidad.'
            ],
            answer: 1
        },
        {
            q: '2. ¿Cuál es el resultado de aplicar slicing [1, 2, 3, 4, 5, 6][2:4]?',
            options: ['[2, 3, 4]', '[3, 4]', '[3, 4, 5]'],
            answer: 1
        },
        {
            q: '3. ¿Qué diferencia principal existe entre list.sort() y la función global sorted(lista)?',
            options: [
                'sort() ordena in-place modificando la lista original; sorted() devuelve una nueva lista ordenada.',
                'sorted() solo funciona con cadenas de texto y sort() con números.',
                'No existe ninguna diferencia entre ambas.'
            ],
            answer: 0
        },
        {
            q: '4. ¿Por qué falla la instrucción tupla = (1, 2, 3); tupla[1] = 5?',
            options: [
                'Porque las tuplas empiezan en índice 1.',
                'Porque las tuplas son inmutables y lanzan TypeError al intentar modificar un elemento.',
                'Porque falta importar el módulo tuple.'
            ],
            answer: 1
        },
        {
            q: '5. ¿Qué método de diccionario permite consultar una clave inexistente sin lanzar KeyError?',
            options: ['diccionario.find("clave")', 'diccionario.get("clave", "por_defecto")', 'diccionario.index("clave")'],
            answer: 1
        },
        {
            q: '6. ¿Qué devuelve la expresión "Hola mundo".find("mondo")?',
            options: ['False', 'ValueError', '-1'],
            answer: 2
        },
        {
            q: '7. En un bloque try - except - else - finally, ¿cuándo se ejecuta la cláusula else?',
            options: [
                'Siempre, tanto si hubo excepción como si no.',
                'Únicamente si el bloque try se completó sin lanzar ninguna excepción.',
                'Cuando ocurre una excepción no contemplada en los except.'
            ],
            answer: 1
        },
        {
            q: '8. ¿Qué ocurre al abrir un archivo existente con open("datos.txt", "w", encoding="utf-8")?',
            options: [
                'Añade el contenido nuevo al final respetando el texto anterior.',
                'Lanza FileExistsError.',
                'Sobrescribe por completo el archivo borrando su contenido previo.'
            ],
            answer: 2
        },
        {
            q: '9. ¿Para qué sirve el método f.seek(0) en el manejo de ficheros?',
            options: [
                'Cierra el archivo liberando memoria.',
                'Reubica el puntero de lectura/escritura al inicio absoluto del archivo.',
                'Elimina los primeros 0 bytes del fichero.'
            ],
            answer: 1
        },
        {
            q: '10. Al exportar un diccionario Python a JSON con json.dump(), ¿en qué se convierte el valor None?',
            options: ['null', 'undefined', 'false'],
            answer: 0
        }
    ];
    let quizAnswers = {};

    function htmlTest() {
        return `
        <section class="topic-section lab-section" id="lab-section-test">
            <details class="accordion" id="page-section-test">
                <summary class="summary-title">Test de Autoevaluación (UT3)</summary>
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
        inyectarEnSeccion('page-section-4', htmlLabListas());
        inyectarEnSeccion('page-section-5', htmlLabTuplas());
        inyectarEnSeccion('page-section-6', htmlLabDict());
        inyectarEnSeccion('page-section-7', htmlLabStr());
        inyectarEnSeccion('page-section-8', htmlLabExc());
        inyectarEnSeccion('page-section-9', htmlLabFicheros());
        inyectarEnSeccion('page-section-10', htmlLabCsv());
        inyectarEnSeccion('page-section-11', htmlLabJson());

        const main = document.querySelector('main');
        if (main) main.insertAdjacentHTML('beforeend', htmlTest());

        initLabListas();
        initLabTuplas();
        initLabDict();
        initLabStr();
        initLabExc();
        initLabFicheros();
        initLabCsv();
        initLabJson();
        initQuiz();
        añadirEnlaceMenu();
    });
})();
