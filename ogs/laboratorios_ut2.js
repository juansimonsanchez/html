/* =========================================================================
   LABORATORIOS, SIMULADORES Y TEST DE AUTOEVALUACIÓN - OGS UT2
   Archivo: ogs/laboratorios_ut2.js
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
       LAB 1: Tipos de datos, operadores aritméticos y valores booleanos (Sec. 3)
       ===================================================================== */
    function analizarLiteralPython(raw) {
        const v = raw.trim();
        if (v === '') {
            return { tipo: "<class 'str'>", valor: "''", booleano: false, nota: 'Cadena vacía -> se evalúa como False.' };
        }
        if (v === 'True' || v === 'False') {
            const b = v === 'True';
            return { tipo: "<class 'bool'>", valor: v, booleano: b, nota: 'Booleano explícito.' };
        }
        if (v === '[]' || v === '()' || v === '{}') {
            const tipos = { '[]': 'list', '()': 'tuple', '{}': 'dict' };
            return { tipo: `<class '${tipos[v]}'>`, valor: v, booleano: false, nota: 'Colección vacía -> se evalúa como False.' };
        }
        if ((v.startsWith('"') && v.endsWith('"') && v.length >= 2) || (v.startsWith("'") && v.endsWith("'") && v.length >= 2)) {
            const contenido = v.slice(1, -1);
            return {
                tipo: "<class 'str'>",
                valor: v,
                booleano: contenido.length > 0,
                nota: contenido.length > 0 ? `Cadena con len() = ${contenido.length} -> True.` : 'Cadena vacía -> False.'
            };
        }
        if (/^[+-]?\d+$/.test(v)) {
            const n = parseInt(v, 10);
            return {
                tipo: "<class 'int'>",
                valor: String(n),
                booleano: n !== 0,
                nota: n === 0 ? 'El entero 0 se evalúa como False.' : `bin(${n}) = ${n < 0 ? '-0b' + Math.abs(n).toString(2) : '0b' + n.toString(2)} | hex(${n}) = ${n < 0 ? '-0x' + Math.abs(n).toString(16) : '0x' + n.toString(16)}`
            };
        }
        if (/^[+-]?\d+\.\d+$/.test(v)) {
            const f = parseFloat(v);
            return {
                tipo: "<class 'float'>",
                valor: String(f),
                booleano: f !== 0,
                nota: f === 0 ? 'El real 0.0 se evalúa como False.' : `abs(${f}) = ${Math.abs(f)} | round(${f}, 1) = ${Math.round(f * 10) / 10}`
            };
        }
        return {
            tipo: "<class 'str'>",
            valor: `'${v}'`,
            booleano: true,
            nota: `Texto interpretado como cadena (len = ${v.length}) -> True.`
        };
    }

    function htmlLabTipos() {
        return `
        <div class="lab-box lab-blue" id="lab-tipos">
            <span class="lab-tag tag-blue">Laboratorio 1</span>
            <h4 class="lab-title">Operadores Aritméticos, <code>type()</code> y Evaluación Booleana</h4>
            <p class="lab-desc">Comprueba en vivo la diferencia entre <code>/</code>, <code>//</code> y <code>%</code>, y descubre cómo identifica Python el tipo y valor lógico de cualquier dato.</p>
            <div class="lab-grid-2">
                <div class="lab-card">
                    <p class="lab-label">Calculadora aritmética y de red (<code>//</code>, <code>%</code>, <code>bin</code>, <code>hex</code>)</p>
                    <div class="lab-row">
                        <input type="number" class="lab-input" id="lab-op-a" value="175" aria-label="Dividendo a">
                        <input type="number" class="lab-input" id="lab-op-b" value="30" aria-label="Divisor b">
                    </div>
                    <pre class="lab-console" id="lab-op-out"></pre>
                </div>
                <div class="lab-card">
                    <p class="lab-label">Inspector <code>type()</code> y <code>bool()</code></p>
                    <input type="text" class="lab-input" id="lab-type-in" value="192" autocomplete="off" aria-label="Literal Python">
                    <div class="lab-btn-group">
                        <button type="button" class="lab-btn lab-btn-light" data-lit="0">0</button>
                        <button type="button" class="lab-btn lab-btn-light" data-lit="4.85">4.85</button>
                        <button type="button" class="lab-btn lab-btn-light" data-lit='""'>""</button>
                        <button type="button" class="lab-btn lab-btn-light" data-lit="[]">[]</button>
                        <button type="button" class="lab-btn lab-btn-light" data-lit="True">True</button>
                    </div>
                    <pre class="lab-console" id="lab-type-out"></pre>
                </div>
            </div>
        </div>`;
    }

    function initLabTipos() {
        const aIn = document.getElementById('lab-op-a');
        const bIn = document.getElementById('lab-op-b');
        const opOut = document.getElementById('lab-op-out');
        const tIn = document.getElementById('lab-type-in');
        const tOut = document.getElementById('lab-type-out');
        const box = document.getElementById('lab-tipos');
        if (!aIn || !bIn || !opOut || !tIn || !tOut || !box) return;

        const updOps = () => {
            const a = parseInt(aIn.value, 10);
            const b = parseInt(bIn.value, 10);
            if (isNaN(a) || isNaN(b)) {
                opOut.textContent = 'Introduce dos números enteros válidos.';
                return;
            }
            const binA = a < 0 ? '-0b' + Math.abs(a).toString(2) : '0b' + a.toString(2);
            const hexA = a < 0 ? '-0x' + Math.abs(a).toString(16) : '0x' + a.toString(16);
            if (b === 0) {
                opOut.textContent =
                    `ZeroDivisionError: division by zero (${a} / 0)\n` +
                    `bin(${a}) -> '${binA}'\n` +
                    `hex(${a}) -> '${hexA}'`;
                return;
            }
            const divReal = (a / b).toFixed(4).replace(/\.?0+$/, '');
            const divEnt = Math.floor(a / b);
            const resto = ((a % b) + b) % b;
            opOut.textContent =
                `${a} / ${b}        -> ${divReal}   (float)\n` +
                `${a} // ${b}       -> ${divEnt}   (división entera)\n` +
                `${a} % ${b}        -> ${resto}   (módulo / resto)\n` +
                `divmod(${a}, ${b}) -> (${divEnt}, ${resto})\n` +
                `bin(${a}) -> '${binA}'  |  hex(${a}) -> '${hexA}'`;
        };

        const updType = () => {
            const r = analizarLiteralPython(tIn.value);
            tOut.textContent =
                `type(${r.valor}) -> ${r.tipo}\n` +
                `bool(${r.valor}) -> ${r.booleano ? 'True' : 'False'}\n` +
                `Nota: ${r.nota}`;
        };

        aIn.addEventListener('input', updOps);
        bIn.addEventListener('input', updOps);
        tIn.addEventListener('input', updType);
        box.addEventListener('click', e => {
            const btn = e.target.closest('button[data-lit]');
            if (!btn) return;
            tIn.value = btn.dataset.lit;
            updType();
        });
        updOps();
        updType();
    }

    /* =====================================================================
       LAB 2: Simulador de input(), casteo y print() (Sec. 4)
       ===================================================================== */
    function htmlLabIO() {
        return `
        <div class="lab-box lab-sky" id="lab-io">
            <span class="lab-tag tag-sky">Laboratorio 2</span>
            <h4 class="lab-title">Simulador de <code>input()</code>, Casteo y <code>print()</code></h4>
            <p class="lab-desc">Recuerda la regla de oro: <code>input()</code> siempre devuelve un <code>str</code>. Prueba qué ocurre al operar sin convertir o al aplicar <code>int()</code> / <code>float()</code>.</p>
            <div class="lab-card">
                <p class="lab-label">Dato tecleado por el usuario en <code>dato = input("Valor: ")</code></p>
                <div class="lab-row">
                    <input type="text" class="lab-input" id="lab-io-in" value="15" autocomplete="off">
                    <button type="button" class="lab-btn lab-btn-primary" data-io="raw">dato * 2 (sin casteo)</button>
                    <button type="button" class="lab-btn lab-btn-emerald" data-io="int">int(dato) * 2</button>
                    <button type="button" class="lab-btn lab-btn-indigo" data-io="float">float(dato) * 2</button>
                    <button type="button" class="lab-btn lab-btn-dark" data-io="fmt">print("%s / %d / %.2f")</button>
                </div>
                <pre class="lab-console" id="lab-io-out"></pre>
            </div>
        </div>`;
    }

    function initLabIO() {
        const inp = document.getElementById('lab-io-in');
        const out = document.getElementById('lab-io-out');
        const box = document.getElementById('lab-io');
        if (!inp || !out || !box) return;

        let modo = 'raw';

        const render = () => {
            const raw = inp.value;
            const trimmed = raw.trim();
            if (modo === 'raw') {
                out.textContent =
                    `dato = "${raw}"   # type(dato) -> <class 'str'>\n` +
                    `>>> print(dato * 2)\n` +
                    `${raw + raw}   # ¡Repite el texto, no multiplica numéricamente!`;
            } else if (modo === 'int') {
                if (/^[+-]?\d+$/.test(trimmed)) {
                    const n = parseInt(trimmed, 10);
                    out.textContent =
                        `numero = int("${raw}")   # <class 'int'> -> ${n}\n` +
                        `>>> print(numero * 2)\n` +
                        `${n * 2}`;
                } else {
                    out.textContent =
                        `>>> int("${raw}")\n` +
                        `ValueError: invalid literal for int() with base 10: '${raw}'`;
                }
            } else if (modo === 'float') {
                if (/^[+-]?(\d+\.?\d*|\.\d+)$/.test(trimmed)) {
                    const f = parseFloat(trimmed);
                    out.textContent =
                        `numero = float("${raw}")   # <class 'float'> -> ${f}\n` +
                        `>>> print(numero * 2)\n` +
                        `${f * 2}`;
                } else {
                    out.textContent =
                        `>>> float("${raw}")\n` +
                        `ValueError: could not convert string to float: '${raw}'`;
                }
            } else {
                const esNum = /^[+-]?(\d+\.?\d*|\.\d+)$/.test(trimmed);
                if (esNum) {
                    const f = parseFloat(trimmed);
                    const n = Math.trunc(f);
                    out.textContent =
                        `>>> print("Entrada=%s entero=%d decimal=%.2f" % ("${raw}", ${n}, ${f}))\n` +
                        `Entrada=${raw} entero=${n} decimal=${f.toFixed(2)}`;
                } else {
                    out.textContent =
                        `>>> print("Entrada=%s" % ("${raw}"))\n` +
                        `Entrada=${raw}\n` +
                        `(Introduce un número para probar también %d y %.2f)`;
                }
            }
        };

        inp.addEventListener('input', render);
        box.addEventListener('click', e => {
            const b = e.target.closest('button[data-io]');
            if (!b) return;
            modo = b.dataset.io;
            render();
        });
        render();
    }

    /* =====================================================================
       LAB 3: Control de flujo: if/elif/else (HTTP) y for + range() (Sec. 5)
       ===================================================================== */
    function htmlLabFlujo() {
        return `
        <div class="lab-box lab-emerald" id="lab-flujo">
            <span class="lab-tag tag-emerald">Laboratorio 3</span>
            <h4 class="lab-title">Trazador de Control de Flujo: <code>if/elif/else</code> y <code>for</code> + <code>range()</code></h4>
            <p class="lab-desc">Observa qué rama condicional se ejecuta en el analizador HTTP y simula iteraciones con <code>range()</code>, <code>continue</code> y <code>break</code>.</p>
            <div class="lab-grid-2">
                <div class="lab-card">
                    <p class="lab-label">1. Analizador HTTP (<code>if / elif / else</code>)</p>
                    <div class="lab-row">
                        <input type="number" class="lab-input lab-w-md" id="lab-http-in" value="200">
                        <button type="button" class="lab-btn lab-btn-light" data-http="200">200</button>
                        <button type="button" class="lab-btn lab-btn-light" data-http="301">301</button>
                        <button type="button" class="lab-btn lab-btn-light" data-http="404">404</button>
                        <button type="button" class="lab-btn lab-btn-light" data-http="500">500</button>
                        <button type="button" class="lab-btn lab-btn-light" data-http="403">403</button>
                    </div>
                    <div class="lab-stack" id="lab-http-branches">
                        <div class="lab-exc-blk" id="http-b-200">if codigo == 200: -> OK</div>
                        <div class="lab-exc-blk" id="http-b-30x">elif codigo == 301 or codigo == 302: -> Redirección</div>
                        <div class="lab-exc-blk" id="http-b-404">elif codigo == 404: -> Recurso no encontrado</div>
                        <div class="lab-exc-blk" id="http-b-500">elif codigo == 500: -> Error crítico interno</div>
                        <div class="lab-exc-blk" id="http-b-else">else: -> Código no reconocido o alternativo</div>
                    </div>
                    <div class="lab-output" id="lab-http-out"></div>
                </div>
                <div class="lab-card">
                    <p class="lab-label">2. Simulador <code>for n in range(inicio, fin, paso)</code></p>
                    <div class="lab-grid-3">
                        <input type="number" class="lab-input" id="lab-r-start" value="1" aria-label="Inicio">
                        <input type="number" class="lab-input" id="lab-r-stop" value="11" aria-label="Fin">
                        <input type="number" class="lab-input" id="lab-r-step" value="1" aria-label="Paso">
                    </div>
                    <div class="lab-row">
                        <label class="lab-desc"><input type="checkbox" id="lab-r-cont" checked> <code>continue</code> si par (<code>n % 2 == 0</code>)</label>
                        <label class="lab-desc"><input type="checkbox" id="lab-r-brk" checked> <code>break</code> al llegar a 7</label>
                    </div>
                    <pre class="lab-console" id="lab-r-out"></pre>
                </div>
            </div>
        </div>`;
    }

    function initLabFlujo() {
        const httpIn = document.getElementById('lab-http-in');
        const httpOut = document.getElementById('lab-http-out');
        const rStart = document.getElementById('lab-r-start');
        const rStop = document.getElementById('lab-r-stop');
        const rStep = document.getElementById('lab-r-step');
        const rCont = document.getElementById('lab-r-cont');
        const rBrk = document.getElementById('lab-r-brk');
        const rOut = document.getElementById('lab-r-out');
        const box = document.getElementById('lab-flujo');
        if (!httpIn || !rStart || !box) return;

        const branches = [
            { id: 'http-b-200', cls: 'act-green' },
            { id: 'http-b-30x', cls: 'act-blue' },
            { id: 'http-b-404', cls: 'act-amber' },
            { id: 'http-b-500', cls: 'act-rose' },
            { id: 'http-b-else', cls: 'act-purple' }
        ];

        const updHttp = () => {
            const code = parseInt(httpIn.value, 10);
            let activeId = 'http-b-else';
            let msg = 'Diagnóstico: Código de respuesta HTTP no reconocido o alternativo.';
            if (code === 200) {
                activeId = 'http-b-200';
                msg = 'Diagnóstico: El servidor web responde correctamente (OK).';
            } else if (code === 301 || code === 302) {
                activeId = 'http-b-30x';
                msg = 'Diagnóstico: El recurso solicitado está configurado como una Redirección.';
            } else if (code === 404) {
                activeId = 'http-b-404';
                msg = 'Diagnóstico: Error del cliente. Recurso no encontrado en el servidor.';
            } else if (code === 500) {
                activeId = 'http-b-500';
                msg = 'Diagnóstico: Error crítico interno del servidor web.';
            }
            branches.forEach(b => {
                const el = document.getElementById(b.id);
                if (!el) return;
                el.classList.remove('is-dim', b.cls);
                el.classList.add(b.id === activeId ? b.cls : 'is-dim');
            });
            httpOut.textContent = msg;
        };

        const updRange = () => {
            const s = parseInt(rStart.value, 10);
            const e = parseInt(rStop.value, 10);
            const p = parseInt(rStep.value, 10);
            if (isNaN(s) || isNaN(e) || isNaN(p)) {
                rOut.textContent = 'Introduce valores enteros válidos.';
                return;
            }
            if (p === 0) {
                rOut.textContent = 'ValueError: range() arg 3 must not be zero';
                return;
            }
            const lines = [`# for n in range(${s}, ${e}, ${p}):`];
            let count = 0;
            for (let n = s; p > 0 ? n < e : n > e; n += p) {
                if (++count > 40) {
                    lines.push('... (límite de visualización de 40 iteraciones)');
                    break;
                }
                if (rCont.checked && n % 2 === 0) {
                    lines.push(`n = ${n} -> par -> continue (salta iteración)`);
                    continue;
                }
                lines.push(`n = ${n} -> print("Número:", ${n})`);
                if (rBrk.checked && n === 7) {
                    lines.push('n == 7 -> break (fin inmediato del bucle)');
                    break;
                }
            }
            if (lines.length === 1) lines.push('(Secuencia vacía: el bucle no ejecuta ninguna iteración)');
            rOut.textContent = lines.join('\n');
        };

        httpIn.addEventListener('input', updHttp);
        [rStart, rStop, rStep, rCont, rBrk].forEach(el => el.addEventListener('input', updRange));
        box.addEventListener('click', e => {
            const b = e.target.closest('button[data-http]');
            if (!b) return;
            httpIn.value = b.dataset.http;
            updHttp();
        });
        updHttp();
        updRange();
    }

    /* =====================================================================
       LAB 4: Pila de Recursividad factorial(n) y __name__ == "__main__" (Sec. 6)
       ===================================================================== */
    function htmlLabFunciones() {
        return `
        <div class="lab-box lab-amber" id="lab-funciones">
            <span class="lab-tag tag-amber">Laboratorio 4</span>
            <h4 class="lab-title">Recursividad (<code>factorial(n)</code>) y Control de Ejecución <code>__name__</code></h4>
            <p class="lab-desc">Visualiza cómo desciende la recursividad hasta el caso base y comprueba qué ocurre al ejecutar un script directamente frente a importarlo.</p>
            <div class="lab-grid-2">
                <div class="lab-card">
                    <p class="lab-label">1. Traza recursiva de <code>factorial(n)</code> (0 a 10)</p>
                    <div class="lab-row">
                        <input type="number" min="0" max="10" class="lab-input lab-w-sm" id="lab-fact-in" value="5">
                        <span class="lab-desc">Caso base: <code>n == 0 or n == 1 -> return 1</code></span>
                    </div>
                    <pre class="lab-console" id="lab-fact-out"></pre>
                </div>
                <div class="lab-card">
                    <p class="lab-label">2. Simulador <code>if __name__ == "__main__":</code></p>
                    <div class="lab-btn-group">
                        <button type="button" class="lab-btn lab-btn-emerald" id="lab-run-direct">python3 mi_libreria.py</button>
                        <button type="button" class="lab-btn lab-btn-indigo" id="lab-run-import">import mi_libreria</button>
                    </div>
                    <div class="lab-output" id="lab-main-status"></div>
                    <pre class="lab-console" id="lab-main-out"></pre>
                </div>
            </div>
        </div>`;
    }

    function initLabFunciones() {
        const fIn = document.getElementById('lab-fact-in');
        const fOut = document.getElementById('lab-fact-out');
        const btnDirect = document.getElementById('lab-run-direct');
        const btnImport = document.getElementById('lab-run-import');
        const mStatus = document.getElementById('lab-main-status');
        const mOut = document.getElementById('lab-main-out');
        if (!fIn || !fOut || !btnDirect || !btnImport) return;

        const updFact = () => {
            let n = parseInt(fIn.value, 10);
            if (isNaN(n) || n < 0) {
                fOut.textContent = 'Introduce un entero entre 0 y 10.';
                return;
            }
            if (n > 10) {
                n = 10;
                fIn.value = '10';
            }
            const lines = [];
            for (let k = n; k >= 2; k--) {
                lines.push(`${'  '.repeat(n - k)}-> factorial(${k}) espera ${k} * factorial(${k - 1})`);
            }
            const base = n === 0 ? 0 : 1;
            lines.push(`${'  '.repeat(Math.max(0, n - 1))}* CASO BASE: factorial(${base}) -> return 1`);
            let acc = 1;
            for (let k = 2; k <= n; k++) {
                acc *= k;
                lines.push(`${'  '.repeat(n - k)}<- factorial(${k}) devuelve ${acc}`);
            }
            lines.push(`Resultado final: factorial(${n}) == ${acc}`);
            fOut.textContent = lines.join('\n');
        };

        const pintarMain = (directo) => {
            if (directo) {
                mStatus.textContent = 'Ejecución directa: __name__ == "__main__" -> Condición True';
                mStatus.classList.add('txt-ok');
                mStatus.classList.remove('txt-err');
                mOut.textContent =
                    '$ python3 mi_libreria.py\n' +
                    '1. Se cargan las definiciones def en memoria.\n' +
                    '2. __name__ vale "__main__" -> SÍ entra en el bloque.\n' +
                    '3. Se ejecuta main() / pruebas locales de la librería.';
            } else {
                mStatus.textContent = 'Importado como módulo: __name__ == "mi_libreria" -> Condición False';
                mStatus.classList.remove('txt-ok');
                mStatus.classList.remove('txt-err');
                mOut.textContent =
                    '>>> import mi_libreria\n' +
                    '1. Se cargan las definiciones def en memoria.\n' +
                    '2. __name__ vale "mi_libreria" != "__main__" -> NO entra en el bloque.\n' +
                    '3. Las funciones quedan listas sin ejecutar pruebas accidentales.';
            }
        };

        fIn.addEventListener('input', updFact);
        btnDirect.addEventListener('click', () => pintarMain(true));
        btnImport.addEventListener('click', () => pintarMain(false));
        updFact();
        pintarMain(true);
    }

    /* =====================================================================
       LAB 5: Métodos de cadenas (str) y módulo math (Sec. 7)
       ===================================================================== */
    function htmlLabModulos() {
        return `
        <div class="lab-box lab-rose" id="lab-modulos">
            <span class="lab-tag tag-rose">Laboratorio 5</span>
            <h4 class="lab-title">Taller de Métodos de Cadenas y Módulo <code>math</code></h4>
            <p class="lab-desc">Normaliza cadenas con los métodos integrados de Python y prueba las funciones de redondeo y raíz del módulo estándar <code>math</code>.</p>
            <div class="lab-grid-2">
                <div class="lab-card">
                    <p class="lab-label">1. Transformador de cadenas (<code>str</code>)</p>
                    <input type="text" class="lab-input" id="lab-str-in" value="  juan carlos pérez  " autocomplete="off">
                    <div class="lab-btn-group">
                        <button type="button" class="lab-btn lab-btn-primary" data-str="strip">.strip().title()</button>
                        <button type="button" class="lab-btn lab-btn-indigo" data-str="upper">.upper()</button>
                        <button type="button" class="lab-btn lab-btn-teal" data-str="split">.strip().split(" ")</button>
                        <button type="button" class="lab-btn lab-btn-dark" data-str="len">len() y .find()</button>
                    </div>
                    <pre class="lab-console" id="lab-str-out"></pre>
                </div>
                <div class="lab-card">
                    <p class="lab-label">2. Módulo <code>math</code> (<code>sqrt</code>, <code>ceil</code>, <code>floor</code>, <code>pi</code>)</p>
                    <input type="number" step="0.1" class="lab-input" id="lab-math-in" value="5">
                    <pre class="lab-console" id="lab-math-out"></pre>
                </div>
            </div>
        </div>`;
    }

    function initLabModulos() {
        const sIn = document.getElementById('lab-str-in');
        const sOut = document.getElementById('lab-str-out');
        const mIn = document.getElementById('lab-math-in');
        const mOut = document.getElementById('lab-math-out');
        const box = document.getElementById('lab-modulos');
        if (!sIn || !sOut || !mIn || !mOut || !box) return;

        let strMode = 'strip';

        const toTitle = (txt) => txt.toLowerCase().replace(/(^|\s)\S/g, l => l.toUpperCase());

        const updStr = () => {
            const raw = sIn.value;
            if (strMode === 'strip') {
                const res = toTitle(raw.trim());
                sOut.textContent =
                    `texto = "${raw}"\n` +
                    `>>> texto.strip().title()\n` +
                    `'${res}'`;
            } else if (strMode === 'upper') {
                sOut.textContent =
                    `>>> texto.upper()\n` +
                    `'${raw.toUpperCase()}'\n` +
                    `>>> texto.lower()\n` +
                    `'${raw.toLowerCase()}'`;
            } else if (strMode === 'split') {
                const limpio = raw.trim();
                const partes = limpio === '' ? [] : limpio.split(/\s+/);
                const repr = '[' + partes.map(p => `'${p}'`).join(', ') + ']';
                sOut.textContent =
                    `>>> texto.strip().split(" ")\n` +
                    `${repr}\n` +
                    `>>> "-".join(partes)\n` +
                    `'${partes.join('-')}'`;
            } else {
                const idxA = raw.indexOf('a');
                sOut.textContent =
                    `>>> len(texto)\n${raw.length}\n` +
                    `>>> texto.find("a")\n${idxA}\n` +
                    `>>> texto.endswith(".pdf")\n${raw.endsWith('.pdf') ? 'True' : 'False'}`;
            }
        };

        const updMath = () => {
            const x = parseFloat(mIn.value);
            if (isNaN(x)) {
                mOut.textContent = 'Introduce un número real válido.';
                return;
            }
            const sqrtTxt = x < 0 ? 'ValueError: math domain error' : Math.sqrt(x).toFixed(4);
            const area = Math.PI * Math.pow(x, 2);
            mOut.textContent =
                `math.sqrt(${x})  -> ${sqrtTxt}\n` +
                `math.ceil(${x})  -> ${Math.ceil(x)}\n` +
                `math.floor(${x}) -> ${Math.floor(x)}\n` +
                `Área círculo (pi * r**2) = ${area.toFixed(4)}\n` +
                `ceil(área) = ${Math.ceil(area)} | floor(área) = ${Math.floor(area)}`;
        };

        sIn.addEventListener('input', updStr);
        mIn.addEventListener('input', updMath);
        box.addEventListener('click', e => {
            const b = e.target.closest('button[data-str]');
            if (!b) return;
            strMode = b.dataset.str;
            updStr();
        });
        updStr();
        updMath();
    }

    /* =====================================================================
       TEST DE AUTOEVALUACIÓN (10 preguntas sobre UT2)
       ===================================================================== */
    const quizQuestions = [
        {
            q: '1. ¿Qué caracteriza a Python frente a lenguajes compilados como C o C++?',
            options: [
                'Requiere compilar siempre a un binario ejecutable antes de correr.',
                'Es un lenguaje interpretado que procesa el archivo .py línea a línea mediante un intérprete.',
                'Solo puede ejecutarse en sistemas operativos Linux.'
            ],
            answer: 1
        },
        {
            q: '2. ¿Qué significa que Python utilice tipado dinámico?',
            options: [
                'Que no hace falta declarar el tipo de la variable antes de usarla; el intérprete lo detecta al asignar un valor.',
                'Que todas las variables son siempre de tipo texto (str).',
                'Que las variables no pueden cambiar de valor durante el programa.'
            ],
            answer: 0
        },
        {
            q: '3. ¿Qué devuelven respectivamente las expresiones 5 / 2, 5 // 2 y 5 % 2 en Python?',
            options: [
                '2, 2.5 y 0',
                '2.5, 2 y 1',
                '2.5, 3 y 1'
            ],
            answer: 1
        },
        {
            q: '4. Según las reglas de evaluación booleana en Python, ¿cuál de los siguientes valores se interpreta como False?',
            options: [
                'La cadena "0"',
                'La lista [0]',
                'El número 0, la cadena vacía "" o una lista vacía []'
            ],
            answer: 2
        },
        {
            q: '5. ¿Cuál es la regla de oro de la función input() en Python?',
            options: [
                'Devuelve automáticamente int si el usuario escribe dígitos.',
                'Siempre devuelve el dato capturado en forma de cadena de texto (str).',
                'Solo acepta números enteros positivos.'
            ],
            answer: 1
        },
        {
            q: '6. ¿Cómo delimita Python los bloques de código dentro de if, while, for o def?',
            options: [
                'Mediante llaves { } al inicio y al final del bloque.',
                'Mediante palabras clave begin y end.',
                'Mediante la indentación (sangrado obligatorio, preferentemente 4 espacios).'
            ],
            answer: 2
        },
        {
            q: '7. Dentro de un bucle while o for, ¿qué diferencia hay entre break y continue?',
            options: [
                'break interrumpe y sale inmediatamente del bucle; continue salta el resto de la iteración actual y pasa a la siguiente.',
                'continue finaliza el programa completo; break reinicia el bucle desde 0.',
                'Son sinónimos exactos.'
            ],
            answer: 0
        },
        {
            q: '8. ¿Qué ocurre si pasamos una lista (objeto mutable) a una función y ejecutamos lista.append(5) dentro de ella?',
            options: [
                'La lista original fuera de la función no sufre ningún cambio.',
                'Se altera el estado interno de la lista original al compartirse la referencia al objeto.',
                'Python lanza un error NameError.'
            ],
            answer: 1
        },
        {
            q: '9. Cuando una función devuelve varios valores separados por comas (return suma, resta, producto), ¿cómo los empaqueta Python internamente?',
            options: [
                'En una tupla (tuple) inmutable.',
                'En un diccionario (dict).',
                'En una cadena de texto separada por comas.'
            ],
            answer: 0
        },
        {
            q: '10. ¿Para qué sirve el bloque if __name__ == "__main__": en un script de Python?',
            options: [
                'Para obligar a que el código solo se ejecute cuando el archivo es importado desde otro script.',
                'Para garantizar que el código principal solo se ejecute al lanzar el archivo directamente y no al importarlo como módulo.',
                'Para declarar variables globales en mayúsculas.'
            ],
            answer: 1
        }
    ];
    let quizAnswers = {};

    function htmlTest() {
        return `
        <section class="topic-section lab-section" id="lab-section-test">
            <details class="accordion" id="page-section-test">
                <summary class="summary-title">Test de Autoevaluación (UT2)</summary>
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
        inyectarEnSeccion('page-section-5', htmlLabTipos());
        inyectarEnSeccion('page-section-6', htmlLabIO());
        inyectarEnSeccion('page-section-7', htmlLabFlujo());
        inyectarEnSeccion('page-section-8', htmlLabFunciones());
        inyectarEnSeccion('page-section-9', htmlLabModulos());

        const main = document.querySelector('main');
        if (main) main.insertAdjacentHTML('beforeend', htmlTest());

        initLabTipos();
        initLabIO();
        initLabFlujo();
        initLabFunciones();
        initLabModulos();
        initQuiz();
        añadirEnlaceMenu();
    });
})();
