/* =========================================================================
   SIMULADORES, LABORATORIOS Y TEST DE AUTOEVALUACIÓN (simuladores_ut3.js)
   ========================================================================= */

/* -------------------------------------------------------------------------
   SIMULADOR 1: LISTAS, SLICING Y MEMORIA
   ------------------------------------------------------------------------- */
let simList = [10, 25, 40, 55, 70];
let simListClone = [...simList];

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

function renderListSim() {
    const container = document.getElementById('list-visual-container');
    if (!container) return;

    if (simList.length === 0) {
        container.innerHTML = '<span class="hint-text font-mono">[] (Lista vacía)</span>';
    } else {
        container.innerHTML = simList.map((item, idx) => {
            const negIdx = idx - simList.length;
            return `
                <div class="list-cell">
                    <span class="cell-idx-pos">[${idx}]</span>
                    <span class="cell-val">${formatPyVal(item)}</span>
                    <span class="cell-idx-neg">[${negIdx}]</span>
                </div>
            `;
        }).join('');
    }

    document.getElementById('list-alias-view').textContent = formatPyList(simList);
    document.getElementById('list-clone-view').textContent = formatPyList(simListClone);
    updateSliceSim();
}

function resetListSim() {
    simList = [10, 25, 40, 55, 70];
    simListClone = [...simList];
    renderListSim();
    showToast('Lista reiniciada');
}

function simListAppend() {
    const inp = document.getElementById('list-val-input');
    const val = parseInputVal(inp.value);
    if (val === null) {
        showToast('Introduce un valor para añadir');
        return;
    }
    simList.push(val);
    inp.value = '';
    renderListSim();
}

function simListInsert() {
    const valInp = document.getElementById('list-val-input');
    const idxInp = document.getElementById('list-idx-input');
    const val = parseInputVal(valInp.value);
    if (val === null) {
        showToast('Introduce un valor para insertar');
        return;
    }
    let idx = parseInt(idxInp.value, 10);
    if (isNaN(idx)) idx = 0;
    if (idx < 0) idx = Math.max(0, simList.length + idx);
    simList.splice(idx, 0, val);
    valInp.value = '';
    renderListSim();
}

function simListPop() {
    if (simList.length === 0) {
        showToast('IndexError: pop from empty list');
        return;
    }
    const idxInp = document.getElementById('list-idx-input');
    const rawIdx = idxInp.value.trim();
    let removed;
    if (rawIdx === '') {
        removed = simList.pop();
    } else {
        let idx = parseInt(rawIdx, 10);
        if (idx < 0) idx = simList.length + idx;
        if (idx < 0 || idx >= simList.length) {
            showToast('IndexError: pop index out of range');
            return;
        }
        removed = simList.splice(idx, 1)[0];
    }
    renderListSim();
    showToast(`Elemento extraído con pop(): ${formatPyVal(removed)}`);
}

function simListSort() {
    simList.sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
    renderListSim();
}

function simListReverse() {
    simList.reverse();
    renderListSim();
}

function updateSliceSim() {
    const sEl = document.getElementById('slice-start');
    const eEl = document.getElementById('slice-end');
    const pEl = document.getElementById('slice-step');
    if (!sEl || !eEl || !pEl) return;

    const sRaw = sEl.value.trim();
    const eRaw = eEl.value.trim();
    const pRaw = pEl.value.trim();

    const step = pRaw === '' ? 1 : parseInt(pRaw, 10);
    const expr = `mi_lista[${sRaw}:${eRaw}${pRaw !== '' ? ':' + pRaw : ''}]`;
    document.getElementById('slice-expr').textContent = expr;

    if (step === 0 || isNaN(step)) {
        document.getElementById('slice-result').textContent = 'ValueError: slice step cannot be zero';
        return;
    }

    const len = simList.length;
    let start, end;

    if (step > 0) {
        start = sRaw === '' ? 0 : parseInt(sRaw, 10);
        end = eRaw === '' ? len : parseInt(eRaw, 10);
        if (start < 0) start = Math.max(0, len + start);
        if (end < 0) end = Math.max(0, len + end);
        start = Math.min(start, len);
        end = Math.min(end, len);

        const res = [];
        for (let i = start; i < end; i += step) {
            res.push(simList[i]);
        }
        document.getElementById('slice-result').textContent = formatPyList(res);
    } else {
        start = sRaw === '' ? len - 1 : parseInt(sRaw, 10);
        end = eRaw === '' ? -1 : parseInt(eRaw, 10);
        if (start < 0 && sRaw !== '') start = len + start;
        if (end < 0 && eRaw !== '') end = len + end;
        start = Math.min(start, len - 1);

        const res = [];
        for (let i = start; i > end && i >= 0; i += step) {
            res.push(simList[i]);
        }
        document.getElementById('slice-result').textContent = formatPyList(res);
    }
}

/* -------------------------------------------------------------------------
   SIMULADOR 2: COMPARADOR LISTA VS TUPLA
   ------------------------------------------------------------------------- */
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

function renderTupleCases() {
    const container = document.getElementById('tuple-cases-container');
    if (!container) return;

    container.innerHTML = tupleCases.map(c => `
        <div class="sim-panel">
            <div class="ficha-header">
                <span class="font-bold">${c.title}</span>
                <div class="flex-row">
                    <button type="button" onclick="checkTupleCase(${c.id}, 'list')" class="btn btn-sm btn-mono btn-soft-blue">Elegir list</button>
                    <button type="button" onclick="checkTupleCase(${c.id}, 'tuple')" class="btn btn-sm btn-mono btn-soft-purple">Elegir tuple</button>
                </div>
            </div>
            <div id="tuple-fb-${c.id}" class="hidden"></div>
        </div>
    `).join('');
}

function checkTupleCase(id, choice) {
    const item = tupleCases.find(c => c.id === id);
    const fb = document.getElementById(`tuple-fb-${id}`);
    if (!item || !fb) return;

    const isCorrect = item.best === choice;
    fb.className = isCorrect ? 'feedback-box feedback-ok' : 'feedback-box feedback-warn';
    fb.innerHTML = `<strong>${isCorrect ? '✔ ¡Elección óptima!' : '💡 Recomendación:'}</strong> Se prefiere <code class="inline-code">${item.best}</code>. ${item.reason}`;
}

/* -------------------------------------------------------------------------
   SIMULADOR 3: DICCIONARIOS
   ------------------------------------------------------------------------- */
let simDict = { nombre: 'Lucía', curso: '1º DAW', modulo: 'Programación' };

function renderDictSim() {
    const view = document.getElementById('dict-json-view');
    if (!view) return;
    const entries = Object.entries(simDict).map(([k, v]) => `'${k}': ${formatPyVal(v)}`);
    view.textContent = `{${entries.join(', ')}}`;
}

function resetDictSim() {
    simDict = { nombre: 'Lucía', curso: '1º DAW', modulo: 'Programación' };
    renderDictSim();
    document.getElementById('dict-output').textContent = 'Diccionario restaurado.';
}

function simDictSet() {
    const k = document.getElementById('dict-key-in').value.trim();
    const rawV = document.getElementById('dict-val-in').value;
    if (!k) {
        showToast('Introduce una clave válida');
        return;
    }
    const val = parseInputVal(rawV);
    simDict[k] = val === null ? '' : val;
    renderDictSim();
    document.getElementById('dict-output').innerHTML = `<span class="txt-ok">✔ Asignado:</span> alumno['${k}'] = ${formatPyVal(simDict[k])}`;
}

function simDictDel() {
    const k = document.getElementById('dict-key-in').value.trim();
    const out = document.getElementById('dict-output');
    if (!Object.prototype.hasOwnProperty.call(simDict, k)) {
        out.innerHTML = `<span class="txt-err">❌ KeyError: '${k}'</span> (La clave no existe en el diccionario)`;
        return;
    }
    delete simDict[k];
    renderDictSim();
    out.innerHTML = `<span class="txt-ok">✔ Eliminada clave '${k}'</span> con del alumno['${k}']`;
}

function simDictDirectGet() {
    const k = document.getElementById('dict-query-key').value.trim();
    const out = document.getElementById('dict-output');
    if (Object.prototype.hasOwnProperty.call(simDict, k)) {
        out.innerHTML = `<span class="txt-ok">alumno['${k}'] &rarr;</span> ${formatPyVal(simDict[k])}`;
    } else {
        out.innerHTML = `<span class="txt-err">❌ KeyError: '${k}'</span> &mdash; El programa se detendría si no se captura la excepción.`;
    }
}

function simDictSafeGet() {
    const k = document.getElementById('dict-query-key').value.trim();
    const defRaw = document.getElementById('dict-default-val').value.trim();
    const out = document.getElementById('dict-output');
    if (Object.prototype.hasOwnProperty.call(simDict, k)) {
        out.innerHTML = `<span class="txt-ok">alumno.get('${k}') &rarr;</span> ${formatPyVal(simDict[k])}`;
    } else {
        const ret = defRaw === '' ? 'None' : formatPyVal(defRaw);
        out.innerHTML = `<span class="code-blue font-bold">alumno.get('${k}', ${defRaw === '' ? 'None' : "'" + defRaw + "'"}) &rarr;</span> ${ret} (Sin error)`;
    }
}

function simDictIter(mode) {
    const out = document.getElementById('dict-output');
    if (mode === 'keys') {
        out.textContent = `dict_keys([${Object.keys(simDict).map(k => `'${k}'`).join(', ')}])`;
    } else if (mode === 'values') {
        out.textContent = `dict_values([${Object.values(simDict).map(formatPyVal).join(', ')}])`;
    } else {
        const pairs = Object.entries(simDict).map(([k, v]) => `('${k}', ${formatPyVal(v)})`);
        out.textContent = `dict_items([${pairs.join(', ')}])`;
    }
}

/* -------------------------------------------------------------------------
   SIMULADOR 4: CADENAS DE CARACTERES (str)
   ------------------------------------------------------------------------- */
function updateStringLab() {
    const strInp = document.getElementById('str-input');
    if (!strInp) return;

    const txt = strInp.value;
    document.getElementById('str-len').textContent = txt.length;
    document.getElementById('str-upper').textContent = `"${txt.toUpperCase()}"`;
    document.getElementById('str-lower').textContent = `"${txt.toLowerCase()}"`;
    const cap = txt.length > 0 ? txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase() : '';
    document.getElementById('str-cap').textContent = `"${cap}"`;

    const sub = document.getElementById('str-find-sub').value;
    const idx = txt.indexOf(sub);
    const findEl = document.getElementById('str-find-res');
    findEl.textContent = idx;
    findEl.className = idx === -1 ? 'txt-err' : 'txt-ok';

    const oldS = document.getElementById('str-rep-old').value;
    const newS = document.getElementById('str-rep-new').value;
    const replaced = oldS ? txt.split(oldS).join(newS) : txt;
    document.getElementById('str-rep-res').textContent = `"${replaced}"`;

    const sep = document.getElementById('str-split-sep').value;
    const parts = sep === '' ? txt.trim().split(/\s+/).filter(Boolean) : txt.split(sep);
    document.getElementById('str-split-res').textContent = formatPyList(parts);
}

/* -------------------------------------------------------------------------
   SIMULADOR 5: EXCEPCIONES (TRY - EXCEPT - ELSE - FINALLY)
   ------------------------------------------------------------------------- */
function setExcPreset(val) {
    document.getElementById('exc-input').value = val;
    runExceptionSim();
}

function runExceptionSim() {
    const raw = document.getElementById('exc-input').value.trim();
    const blocks = ['blk-try', 'blk-val', 'blk-zero', 'blk-else', 'blk-finally'];
    blocks.forEach(id => {
        const el = document.getElementById(id);
        el.className = 'exc-block exc-dim';
    });

    const activate = (id, activeClass) => {
        const el = document.getElementById(id);
        el.className = `exc-block ${activeClass}`;
    };

    activate('blk-try', 'exc-active-blue');
    activate('blk-finally', 'exc-active-purple');

    const consoleEl = document.getElementById('exc-console');

    if (!/^-?\d+$/.test(raw)) {
        activate('blk-val', 'exc-active-rose');
        consoleEl.innerHTML = `<span class="console-rose">Salida:</span> Error: No se puede convertir '${raw}' a entero (ValueError).<br><span class="console-blue">Finally:</span> Fin de la operación.`;
        return;
    }

    const num = parseInt(raw, 10);
    if (num === 0) {
        activate('blk-zero', 'exc-active-amber');
        consoleEl.innerHTML = `<span class="console-amber">Salida:</span> Error: No se puede dividir por cero (ZeroDivisionError).<br><span class="console-blue">Finally:</span> Fin de la operación.`;
        return;
    }

    const res = 10 / num;
    activate('blk-else', 'exc-active-emerald');
    consoleEl.innerHTML = `<span class="console-green">Else (Éxito):</span> Cálculo exitoso. Resultado = ${res}<br><span class="console-blue">Finally:</span> Fin de la operación.`;
}

/* -------------------------------------------------------------------------
   SIMULADOR 6: FICHEROS NATIVOS Y PUNTERO (tell / seek)
   ------------------------------------------------------------------------- */
const INITIAL_FILE_CONTENT = 'Linea 1: Python\nLinea 2: Ficheros\nLinea 3: UT3';
let fileContent = INITIAL_FILE_CONTENT;
let fileCursor = 0;
let fileMode = 'r';

function renderFileSim() {
    const bufEl = document.getElementById('file-visual-buffer');
    if (!bufEl) return;

    const before = fileContent.slice(0, fileCursor);
    const after = fileContent.slice(fileCursor);

    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    bufEl.innerHTML = `${esc(before)}<span class="cursor-caret">|</span>${esc(after)}`;

    document.getElementById('file-cursor-pos').textContent = fileCursor;
    document.getElementById('file-active-mode').textContent = fileMode;
}

function resetFileSim() {
    fileContent = INITIAL_FILE_CONTENT;
    fileMode = 'r';
    fileCursor = 0;
    document.getElementById('file-mode-select').value = 'r';
    renderFileSim();
    document.getElementById('file-sim-log').textContent = 'Archivo restaurado y abierto en modo "r". Puntero en posición 0.';
}

function simFileOpen() {
    const mode = document.getElementById('file-mode-select').value;
    fileMode = mode;
    const log = document.getElementById('file-sim-log');

    if (mode === 'w') {
        fileContent = '';
        fileCursor = 0;
        log.innerHTML = '<span class="mode-w">Modo "w":</span> Contenido previo borrado. Puntero en 0.';
    } else if (mode === 'a') {
        fileCursor = fileContent.length;
        log.innerHTML = `<span class="txt-ok">Modo "a":</span> Contenido conservado. Puntero al final (${fileCursor}).`;
    } else {
        fileCursor = 0;
        log.innerHTML = `<span class="code-blue font-bold">Modo "${mode}":</span> Archivo abierto. Puntero al inicio (0).`;
    }
    renderFileSim();
}

function simFileRead(n) {
    const log = document.getElementById('file-sim-log');
    if (fileMode === 'w' || fileMode === 'a') {
        log.innerHTML = `<span class="txt-err">io.UnsupportedOperation: not readable</span> (El modo "${fileMode}" no permite lectura).`;
        return;
    }
    const chunk = fileContent.slice(fileCursor, fileCursor + n);
    fileCursor = Math.min(fileContent.length, fileCursor + n);
    renderFileSim();
    log.innerHTML = `<span class="txt-ok">f.read(${n}) &rarr;</span> ${JSON.stringify(chunk)} (Nuevo puntero: ${fileCursor})`;
}

function simFileReadLine() {
    const log = document.getElementById('file-sim-log');
    if (fileMode === 'w' || fileMode === 'a') {
        log.innerHTML = `<span class="txt-err">io.UnsupportedOperation: not readable</span> (El modo "${fileMode}" no permite lectura).`;
        return;
    }
    if (fileCursor >= fileContent.length) {
        log.textContent = 'f.readline() -> "" (Fin de archivo EOF alcanzado)';
        return;
    }
    const nextNl = fileContent.indexOf('\n', fileCursor);
    const endIdx = nextNl === -1 ? fileContent.length : nextNl + 1;
    const line = fileContent.slice(fileCursor, endIdx);
    fileCursor = endIdx;
    renderFileSim();
    log.innerHTML = `<span class="txt-ok">f.readline() &rarr;</span> ${JSON.stringify(line)} (Nuevo puntero: ${fileCursor})`;
}

function simFileSeek(pos) {
    fileCursor = Math.max(0, Math.min(fileContent.length, pos));
    renderFileSim();
    document.getElementById('file-sim-log').textContent = `f.seek(${pos}) ejecutado. Puntero reubicado en posición ${fileCursor}.`;
}

function simFileWrite() {
    const log = document.getElementById('file-sim-log');
    if (fileMode === 'r') {
        log.innerHTML = '<span class="txt-err">io.UnsupportedOperation: not writable</span> (Abre en modo "w", "a" o "r+").';
        return;
    }
    const rawText = document.getElementById('file-write-text').value.replace(/\\n/g, '\n');
    if (fileMode === 'a') {
        fileCursor = fileContent.length;
        fileContent += rawText;
        fileCursor = fileContent.length;
    } else {
        const before = fileContent.slice(0, fileCursor);
        const after = fileContent.slice(fileCursor + rawText.length);
        fileContent = before + rawText + after;
        fileCursor += rawText.length;
    }
    renderFileSim();
    log.innerHTML = `<span class="txt-ok">f.write(${JSON.stringify(rawText)})</span> completado. Escritos ${rawText.length} caracteres.`;
}

/* -------------------------------------------------------------------------
   SIMULADOR 7: CSV READER
   ------------------------------------------------------------------------- */
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

function updateCsvSim() {
    const inp = document.getElementById('csv-raw-input');
    if (!inp) return;

    const raw = inp.value;
    const lines = raw.split(/\r?\n/).filter(l => l.trim() !== '');
    const matrix = lines.map(parseCsvLine);
    const formatted = '[\n' + matrix.map(row => '  [' + row.map(c => `'${c}'`).join(', ') + ']').join(',\n') + '\n]';
    document.getElementById('csv-py-output').textContent = formatted;
}

/* -------------------------------------------------------------------------
   SIMULADOR 8: TRADUCTOR PYTHON DICT -> JSON
   ------------------------------------------------------------------------- */
let jsonDemoState = {
    isCat: true,
    miceCaught: 0,
    name: 'Zophie',
    felineIQ: null
};

function renderJsonSim() {
    const pyEl = document.getElementById('json-py-view');
    const jsonEl = document.getElementById('json-out-view');
    if (!pyEl || !jsonEl) return;

    const pyBool = jsonDemoState.isCat ? 'True' : 'False';
    const pyNone = jsonDemoState.felineIQ === null ? 'None' : jsonDemoState.felineIQ;

    pyEl.innerHTML = `datos_gato = {\n  'isCat': <span class="json-highlight">${pyBool}</span>,\n  'miceCaught': ${jsonDemoState.miceCaught},\n  'name': '${jsonDemoState.name}',\n  'felineIQ': <span class="json-highlight">${pyNone}</span>\n}`;

    const jBool = jsonDemoState.isCat ? 'true' : 'false';
    const jNull = jsonDemoState.felineIQ === null ? 'null' : jsonDemoState.felineIQ;

    jsonEl.innerHTML = `{\n  "isCat": <span class="json-highlight">${jBool}</span>,\n  "miceCaught": ${jsonDemoState.miceCaught},\n  "name": "${jsonDemoState.name}",\n  "felineIQ": <span class="json-highlight">${jNull}</span>\n}`;
}

function toggleJsonBool() {
    jsonDemoState.isCat = !jsonDemoState.isCat;
    renderJsonSim();
}

function toggleJsonNone() {
    jsonDemoState.felineIQ = jsonDemoState.felineIQ === null ? 145 : null;
    renderJsonSim();
}

/* -------------------------------------------------------------------------
   SIMULADOR 9: TEST DE AUTOEVALUACIÓN (10 PREGUNTAS)
   ------------------------------------------------------------------------- */
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

function renderQuiz() {
    const container = document.getElementById('quiz-container');
    if (!container) return;

    container.innerHTML = quizQuestions.map((item, qIdx) => {
        const userChoice = quizAnswers[qIdx];
        const answered = userChoice !== undefined;

        const optsHtml = item.options.map((optText, oIdx) => {
            let btnClass = 'quiz-opt-btn';
            let badge = '';

            if (answered) {
                if (oIdx === item.answer) {
                    btnClass += ' quiz-opt-correct';
                    badge = '<span>✔ Correcta</span>';
                } else if (oIdx === userChoice) {
                    btnClass += ' quiz-opt-wrong';
                    badge = '<span>✖ Incorrecta</span>';
                } else {
                    btnClass += ' quiz-opt-muted';
                }
            }

            return `
                <button type="button" ${answered ? 'disabled' : ''} onclick="answerQuiz(${qIdx}, ${oIdx})" class="${btnClass}">
                    <span>${optText}</span>
                    ${badge}
                </button>
            `;
        }).join('');

        return `
            <div class="quiz-card">
                <p class="quiz-q-title">${item.q}</p>
                <div class="quiz-options">${optsHtml}</div>
            </div>
        `;
    }).join('');

    const score = Object.entries(quizAnswers).reduce((acc, [qIdx, ans]) => {
        return acc + (quizQuestions[qIdx].answer === ans ? 1 : 0);
    }, 0);
    document.getElementById('quiz-score').textContent = `${score} / ${quizQuestions.length}`;
}

function answerQuiz(qIdx, oIdx) {
    if (quizAnswers[qIdx] !== undefined) return;
    quizAnswers[qIdx] = oIdx;
    renderQuiz();
}

function resetQuiz() {
    quizAnswers = {};
    renderQuiz();
    showToast('Test reiniciado');
}

/* -------------------------------------------------------------------------
   INICIALIZACIÓN DE TODOS LOS SIMULADORES DE LA UT3
   ------------------------------------------------------------------------- */
window.addEventListener('DOMContentLoaded', () => {
    renderListSim();
    renderTupleCases();
    renderDictSim();
    updateStringLab();
    renderFileSim();
    updateCsvSim();
    renderJsonSim();
    renderQuiz();
});