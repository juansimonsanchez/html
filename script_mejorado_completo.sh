#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# SCRIPT DE GENERACIÓN DE DOCUMENTACIÓN PROFESIONAL (HTML + MkDocs Material)
# VERSIÓN OPTIMIZADA Y REORGANIZADA
# ==============================================================================

echo "======================================================================"
echo "🚀 Iniciando generador modular de sitios de documentación"
echo "======================================================================"

require_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "❌ Error: '$cmd' no está instalado. Instálalo antes de continuar."
    exit 1
  fi
}

install_mkdocs_if_needed() {
  if ! command -v mkdocs >/dev/null 2>&1; then
    echo "⚙️ Instalando MkDocs y el tema Material..."
    if command -v python3 >/dev/null 2>&1; then
      python3 -m pip install --quiet mkdocs mkdocs-material pymdown-extensions
    else
      pip install --quiet mkdocs mkdocs-material pymdown-extensions
    fi
  fi
}

require_cmd pandoc
require_cmd python3
require_cmd libreoffice
install_mkdocs_if_needed

cat > module_builder.py <<'PY'
import sys, os, re, unicodedata


def slugify(value):
    value = unicodedata.normalize('NFKD', str(value))
    value = value.encode('ascii', 'ignore').decode('ascii').lower()
    value = re.sub(r'[^\w\s-]', '', value).strip()
    return re.sub(r'[-\s]+', '-', value)


def clean_text(text):
    text = text.strip()
    while (text.startswith('*') and text.endswith('*')) or (text.startswith('_') and text.endswith('_')):
        text = text[1:-1].strip()
    return text


def sort_key(filename):
    num = re.search(r'\d+', filename)
    return int(num.group()) if num else 999


def get_clean_page_title(filename, folder_name):
    if filename == 'index.html':
        return 'Inicio'
    clean_name = os.path.splitext(filename)[0]
    clean_name = re.sub(r'^\w+?', '', clean_name)
    clean_name = clean_name.replace('_26_27', '').replace('_', ' ').strip()
    return clean_name.title()


CSS_STYLES = """
:root {
    --primary: #2563eb;
    --primary-dark: #1d4ed8;
    --bg-header: #1e3a8a;
    --text-header: #ffffff;
    --bg-body: #f8fafc;
    --text-body: #1e293b;
    --border-color: #cbd5e1;
}

html {
    scroll-behavior: smooth;
    scroll-padding-top: 80px;
}

body {
    margin: 0;
    padding: 0;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: var(--bg-body);
    color: var(--text-body);
    min-height: 100vh;
}

h1, h2, h3, h4, h5, h6, [id], a[name] {
    scroll-margin-top: 80px !important;
}

.headerlink {
    display: inline-block;
    margin-left: 0.4rem;
    color: #94a3b8;
    text-decoration: none;
    font-size: 0.8em;
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.2s, color 0.2s;
}

h1:hover .headerlink, h2:hover .headerlink, h3:hover .headerlink,
h4:hover .headerlink, h5:hover .headerlink, h6:hover .headerlink {
    visibility: visible;
    opacity: 1;
}

.headerlink:hover {
    color: var(--primary);
}

#site-header {
    position: sticky;
    top: 0;
    z-index: 10000;
    background: var(--bg-header);
    color: var(--text-header);
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

.header-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
    height: 62px;
}

.site-title {
    font-weight: 700;
    font-size: 1.2rem;
    color: #ffffff;
    letter-spacing: -0.01em;
}

.top-nav {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.top-nav .nav-btn {
    color: #cbd5e1;
    text-decoration: none;
    font-weight: 600;
    padding: 8px 14px;
    border-radius: 6px;
    font-size: 0.95rem;
    transition: background 0.2s, color 0.2s;
}

.top-nav .nav-btn:hover, .top-nav .nav-btn.active {
    background: #1e293b;
    color: #ffffff;
}

#main-content {
    flex: 1;
    padding: 2.5rem 4rem;
    box-sizing: border-box;
    max-width: 1100px !important;
    margin: 0 auto;
    width: 100%;
    min-width: 0;
}

.table-wrapper {
    overflow-x: auto;
    margin: 1.75rem 0;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}

table {
    width: 100% !important;
    border-collapse: collapse !important;
    margin: 0 !important;
    font-size: 0.93rem;
    background: #ffffff;
    table-layout: auto !important;
}

th, td {
    padding: 10px 14px !important;
    border: 1px solid #cbd5e1 !important;
    text-align: left;
    vertical-align: top;
    line-height: 1.5;
    word-break: normal;
    overflow-wrap: break-word;
}

th {
    background-color: #0f172a !important;
    color: #ffffff !important;
    font-weight: 600;
    font-size: 0.95rem;
    border-bottom: 2px solid #0f172a !important;
}

tr:nth-child(even) td {
    background-color: #f8fafc !important;
}

tr:hover td {
    background-color: #f1f5f9 !important;
}

.code-wrapper {
    position: relative;
    margin: 1.5rem 0;
    border-radius: 8px;
    overflow: hidden;
    background: #0f172a;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.copy-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    background: #334155;
    color: #f8fafc;
    border: none;
    padding: 6px 12px;
    border-radius: 5px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    z-index: 10;
}

.copy-btn:hover {
    background: #2563eb;
}

pre {
    margin: 0 !important;
    padding: 1.25rem 1.25rem !important;
    background: #0f172a !important;
    color: #f8fafc !important;
    font-family: "Fira Code", Consolas, Monaco, "Andale Mono", monospace !important;
    font-size: 0.92rem !important;
    line-height: 1.6 !important;
    overflow-x: auto !important;
    white-space: pre-wrap !important;
    word-break: break-all !important;
}

code {
    font-family: "Fira Code", Consolas, Monaco, "Andale Mono", monospace !important;
}

img {
    max-width: 100%;
    height: auto;
    border-radius: 6px;
    margin: 1rem 0;
}

@media (max-width: 768px) {
    .header-container {
        height: auto;
        flex-direction: column;
        padding: 0.75rem 1rem;
        gap: 0.6rem;
    }

    #main-content {
        width: 100% !important;
        padding: 1.25rem 1rem !important;
    }
}
"""

JS_SCRIPT = """
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
"""

CODE_KEYWORDS = [
    'SELECT ', 'INSERT ', 'UPDATE ', 'DELETE ', 'CREATE TABLE', 'ALTER TABLE', 'DROP ',
    'FROM ', 'WHERE ', 'SUDO ', 'APT ', 'MKDIR ', 'CD ', 'GIT ', 'CHMOD ', 'SYSTEMCTL ',
    '<!DOCTYPE', '<HTML', '<HEAD', '<BODY', '<STYLE', '<SCRIPT', '<DIV', '<TABLE', '<TR',
    'FUNCTION(', 'DEF ', 'IMPORT ', 'RETURN ', 'VAR ', 'CONST ', 'LET ', 'CONSOLE.LOG'
]


def remove_body_toc_html(html_content):
    return html_content


def remove_body_toc_md(md_content):
    return md_content


def process_code_blocks_and_tables(html_content):
    def clean_table_tag(m):
        tag = m.group(1)
        attrs = m.group(2) or ""
        for attr in ['style', 'width', 'height', 'align', 'valign', 'bgcolor', 'border', 'cellpadding', 'cellspacing']:
            attrs = re.sub(rf'\s*{attr}=["\'][^"\']*["\']', '', attrs, flags=re.IGNORECASE)
            attrs = re.sub(rf'\s*{attr}=\w+', '', attrs, flags=re.IGNORECASE)
        return f'<{tag}{attrs}>'

    def inspect_table(match):
        table_code = match.group(0)
        clean_text_inside = re.sub(r'<[^>]+>', '', table_code).strip()
        upper_text = clean_text_inside.upper()

        tr_count = len(re.findall(r'<tr[^>]*>', table_code, re.IGNORECASE))
        td_count = len(re.findall(r'<td[^>]*>', table_code, re.IGNORECASE))

        if (tr_count <= 2 and td_count <= 2) or any(kw in upper_text for kw in CODE_KEYWORDS):
            if any(kw in upper_text for kw in CODE_KEYWORDS):
                escaped_code = clean_text_inside.replace('<', '&lt;').replace('>', '&gt;')
                return f'<div class="code-wrapper"><button class="copy-btn" onclick="copyCode(this)">📋 Copiar</button><pre><code>{escaped_code}</code></pre></div>'

        cleaned_tbl = re.sub(r'<(table|tr|td|th|colgroup|col)(\s+[^>]*)?>', clean_table_tag, table_code, flags=re.IGNORECASE)
        cleaned_tbl = re.sub(r'<colgroup>.*?</colgroup>', '', cleaned_tbl, flags=re.DOTALL | re.IGNORECASE)

        trs = re.findall(r'<tr[^>]*>.*?</tr>', cleaned_tbl, flags=re.DOTALL | re.IGNORECASE)
        if len(trs) > 0:
            header_tr = trs[0]
            col_count = len(re.findall(r'<(td|th)[^>]*>', header_tr, flags=re.IGNORECASE))
            if col_count == 2:
                body_trs = []
                for tr in trs:
                    body_tr = re.sub(r'<th(\s+[^>]*)?>', r'<td\1>', tr, flags=re.IGNORECASE)
                    body_tr = re.sub(r'</th>', r'</td>', body_tr, flags=re.IGNORECASE)
                    body_trs.append(body_tr)
                cleaned_tbl = '<tbody>\n' + '\n'.join(body_trs) + '\n</tbody>'
            else:
                header_tr = re.sub(r'<td(\s+[^>]*)?>', r'<th\1>', header_tr, flags=re.IGNORECASE)
                header_tr = re.sub(r'</td>', r'</th>', header_tr, flags=re.IGNORECASE)
                if len(trs) > 1:
                    body_trs = []
                    for tr in trs[1:]:
                        body_tr = re.sub(r'<th(\s+[^>]*)?>', r'<td\1>', tr, flags=re.IGNORECASE)
                        body_tr = re.sub(r'</th>', r'</td>', body_tr, flags=re.IGNORECASE)
                        body_trs.append(body_tr)
                    cleaned_tbl = f'<thead>\n{header_tr}\n</thead>\n<tbody>\n' + '\n'.join(body_trs) + '\n</tbody>'
                else:
                    cleaned_tbl = f'<thead>\n{header_tr}\n</thead>\n<tbody>\n</tbody>'

        return f'<div class="table-wrapper"><table>\n{cleaned_tbl}\n</table></div>'

    html_content = re.sub(r'<table[^>]*>.*?</table>', inspect_table, html_content, flags=re.DOTALL | re.IGNORECASE)

    def wrap_pre_code(match):
        code_inside = match.group(1)
        return f'<div class="code-wrapper"><button class="copy-btn" onclick="copyCode(this)">📋 Copiar</button><pre><code>{code_inside}</code></pre></div>'

    html_content = re.sub(r'<pre[^>]*>\s*<code[^>]*>(.*?)</code>\s*</pre>', wrap_pre_code, html_content, flags=re.DOTALL | re.IGNORECASE)

    def convert_unicode_codeblock_html(match):
        code_inside = match.group(1).strip()
        clean_txt = re.sub(r'<[^>]+>', '', code_inside).strip()
        escaped = clean_txt.replace('<', '&lt;').replace('>', '&gt;')
        return f'<div class="code-wrapper"><button class="copy-btn" onclick="copyCode(this)">📋 Copiar</button><pre><code>{escaped}</code></pre></div>'

    html_content = re.sub(r'[\uec03](.*?)[\uec02]', convert_unicode_codeblock_html, html_content, flags=re.DOTALL | re.IGNORECASE)

    def convert_blockquote_code(match):
        bq_text = match.group(1)
        clean_txt = re.sub(r'<[^>]+>', '', bq_text).strip()
        if any(kw in clean_txt.upper() for kw in CODE_KEYWORDS):
            escaped = clean_txt.replace('<', '&lt;').replace('>', '&gt;')
            return f'<div class="code-wrapper"><button class="copy-btn" onclick="copyCode(this)">📋 Copiar</button><pre><code>{escaped}</code></pre></div>'
        return match.group(0)

    html_content = re.sub(r'<blockquote[^>]*>(.*?)</blockquote>', convert_blockquote_code, html_content, flags=re.DOTALL | re.IGNORECASE)
    return html_content


def add_permalinks_to_html(html_content):
    def replace_h(match):
        tag = match.group(1)
        attrs = match.group(2) or ""
        inner = match.group(3)
        id_m = re.search(r'id=["\']([^"\']+)["\']', attrs, re.IGNORECASE)
        if id_m:
            h_id = id_m.group(1)
            if 'class="headerlink"' not in inner:
                inner_with_link = f'{inner} <a class="headerlink" href="#{h_id}" title="Enlace permanente">¶</a>'
                return f'<{tag}{attrs}>{inner_with_link}</{tag}>'
        return match.group(0)

    return re.sub(r'<(h[1-6])(\s+[^>]*)?>(.*?)</\1>', replace_h, html_content, flags=re.IGNORECASE | re.DOTALL)


def format_markdown_file(md_path):
    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()

    content = remove_body_toc_md(content)

    def convert_grid_table(match):
        table_text = match.group(0)
        lines = table_text.strip().split('\n')
        rows = []
        current_row_lines = []
        for line in lines:
            if line.startswith('+'):
                if current_row_lines:
                    rows.append(current_row_lines)
                    current_row_lines = []
            elif line.startswith('|'):
                parts = line.split('|')[1:-1]
                current_row_lines.append(parts)
        parsed_rows = []
        for r_lines in rows:
            if not r_lines:
                continue
            num_cols = len(r_lines[0])
            col_texts = [''] * num_cols
            for l_parts in r_lines:
                for idx, part in enumerate(l_parts):
                    if idx < num_cols:
                        col_texts[idx] += part.strip() + '\n'
            parsed_rows.append([t.strip() for t in col_texts])
        if not parsed_rows:
            return table_text
        is_2col = all(len(r) == 2 for r in parsed_rows)
        if is_2col:
            html_rows = []
            for r in parsed_rows:
                col1 = r[0]
                col2 = r[1]
                col1_html = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', col1)
                col2_html = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', col2)
                paras = [p.strip() for p in col2_html.split('\n') if p.strip()]
                if len(paras) > 1:
                    col2_html = ''.join([f'<p>{p}</p>' for p in paras])
                elif len(paras) == 1:
                    col2_html = paras[0]
                html_rows.append(f'  <tr>\n    <td>{col1_html}</td>\n    <td>{col2_html}</td>\n  </tr>')
            html_table = '<div class="table-wrapper">\n<table class="property-table">\n<tbody>\n' + '\n'.join(html_rows) + '\n</tbody>\n</table>\n</div>'
            return html_table
        return table_text

    grid_pattern = r'\+-[^\n]+\+\n(?:\|[^\n]+\|\n|\+=[=+]+\+\n|\+-[^\n]+\+\n)+'
    content = re.sub(grid_pattern, convert_grid_table, content)

    def convert_unicode_codeblock_md(match):
        code = match.group(1).strip()
        code = code.replace('\\"', '"').replace('\\<', '<').replace('\\>', '>').replace('\\_', '_')
        code_upper = code.upper()
        lang = "text"
        if any(kw in code_upper for kw in ['SELECT ', 'INSERT ', 'UPDATE ', 'DELETE ', 'CREATE TABLE']):
            lang = "sql"
        elif any(kw in code_upper for kw in ['SUDO ', 'APT ', 'MKDIR ', 'SYSTEMCTL ', 'DOCKER ', 'GIT ']):
            lang = "bash"
        elif any(kw in code_upper for kw in ['DEF ', 'CLASS ', 'IMPORT ', 'PRINT(']):
            lang = "python"
        return f"\n\n```{lang}\n{code}\n```\n\n"

    content = re.sub(r'[\uec03](.*?)[\uec02]', convert_unicode_codeblock_md, content, flags=re.DOTALL)

    lines = content.split('\n')
    new_lines = []
    in_code = False

    sql_keywords = ['SELECT ', 'INSERT ', 'UPDATE ', 'DELETE ', 'CREATE TABLE', 'ALTER TABLE', 'DROP ', 'FROM ', 'WHERE ', 'SHOW DATABASES', 'USE ']
    bash_keywords = ['SUDO ', 'APT ', 'MKDIR ', 'CD ', 'SYSTEMCTL ', 'CHMOD ', 'DOCKER ', 'GIT ']
    html_keywords = ['<HTML>', '<DIV', '<TABLE', '<SCRIPT', '<STYLE', '<HEAD>', '<BODY>']

    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        if stripped.startswith('```'):
            in_code = not in_code
            new_lines.append(line)
            i += 1
            continue

        if in_code:
            new_lines.append(line)
            i += 1
            continue

        if stripped.startswith('>') and not stripped.startswith('>>>'):
            bq_lines = []
            while i < len(lines) and lines[i].strip().startswith('>'):
                clean_l = re.sub(r'^>\s*', '', lines[i].strip())
                bq_lines.append(clean_l)
                i += 1

            code_text = '\n'.join(bq_lines)
            upper_code = code_text.upper()

            if any(kw in upper_code for kw in sql_keywords):
                new_lines.append('```sql')
                new_lines.append(code_text)
                new_lines.append('```')
            elif any(kw in upper_code for kw in bash_keywords):
                new_lines.append('```bash')
                new_lines.append(code_text)
                new_lines.append('```')
            elif any(kw in upper_code for kw in html_keywords):
                new_lines.append('```html')
                new_lines.append(code_text)
                new_lines.append('```')
            else:
                for bl in bq_lines:
                    new_lines.append(f'> {bl}')
            continue

        new_lines.append(line)
        i += 1

    new_content = '\n'.join(new_lines)

    md_filename = os.path.basename(md_path)
    base_name = md_filename.replace('.md', '')
    pdf_filename = base_name + '.pdf'
    pdf_path = os.path.join(os.path.dirname(md_path), pdf_filename)
    if os.path.exists(pdf_path) and md_filename != 'index.md':
        pdf_banner = f'<div style="margin-bottom: 1.5rem; padding: 10px 15px; background: #f1f5f9; border-left: 4px solid #2563eb; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;"><span>📄 <strong>Documento PDF original:</strong></span><a href="../{pdf_filename}" download style="background-color: #2563eb; color: white; padding: 6px 14px; border-radius: 4px; text-decoration: none; font-weight: 600; font-size: 0.85rem;">📥 Descargar PDF</a></div>\n\n'
        if not new_content.startswith('<div style="margin-bottom:'):
            new_content = pdf_banner + new_content

    with open(md_path, 'w', encoding='utf-8') as f:
        f.write(new_content)


def build_navbar_html(folder_name, current_page_title):
    nav = []
    nav.append('<header id="site-header">')
    nav.append('  <div class="header-container">')
    nav.append(f'    <div class="site-title" style="display:flex; align-items:center;"><img src="logo.png" alt="Logo" style="height:36px; width:auto; margin-right:10px; vertical-align:middle; border-radius:3px;"><span>{folder_name.upper()} &ndash; {current_page_title}</span></div>')
    nav.append('    <nav class="top-nav">')
    nav.append('      <a href="index.html" class="nav-btn">Inicio</a>')
    nav.append('    </nav>')
    nav.append('  </div>')
    nav.append('</header>')
    return '\n'.join(nav)


def create_index_html(folder_path, folder_name, prog_file, pres_file, teoria_files, tareas_files):
    index_path = os.path.join(folder_path, 'index.html')

    body = []
    body.append(f'<h1>Módulo: {folder_name.upper()}</h1>')
    body.append(f'<p>Bienvenido al portal de contenidos del módulo <strong>{folder_name.upper()}</strong>. Accede a la presentación, programación docente, unidades de teoría o tareas a través de las secciones a continuación:</p>')

    if pres_file:
        body.append('<div style="margin-top:2rem; background:white; padding:1.5rem; border-radius:8px; border:1px solid #e2e8f0; box-shadow:0 1px 3px rgba(0,0,0,0.05);">')
        body.append('<h2 style="margin-top:0; color:#0f172a; border-bottom:2px solid #2563eb; padding-bottom:0.5rem;">Presentación del Módulo</h2>')
        body.append('<ul style="list-style:none; padding-left:0;">')
        body.append(f'<li style="margin:10px 0;"><a href="{pres_file[1]}" style="color:#2563eb; text-decoration:none; font-weight:600; font-size:1.05rem;">{pres_file[0]}</a></li>')
        body.append('</ul></div>')

    if prog_file:
        body.append('<div style="margin-top:2rem; background:white; padding:1.5rem; border-radius:8px; border:1px solid #e2e8f0; box-shadow:0 1px 3px rgba(0,0,0,0.05);">')
        body.append('<h2 style="margin-top:0; color:#0f172a; border-bottom:2px solid #2563eb; padding-bottom:0.5rem;">Programación Docente</h2>')
        body.append('<ul style="list-style:none; padding-left:0;">')
        body.append(f'<li style="margin:10px 0;"><a href="{prog_file[1]}" style="color:#2563eb; text-decoration:none; font-weight:600; font-size:1.05rem;">{prog_file[0]}</a></li>')
        body.append('</ul></div>')

    if teoria_files:
        body.append('<div style="margin-top:2rem; background:white; padding:1.5rem; border-radius:8px; border:1px solid #e2e8f0; box-shadow:0 1px 3px rgba(0,0,0,0.05);">')
        body.append('<h2 style="margin-top:0; color:#0f172a; border-bottom:2px solid #2563eb; padding-bottom:0.5rem;">Teoría (Unidades Didácticas)</h2>')
        body.append('<ul style="list-style:none; padding-left:0;">')
        for title, fname in teoria_files:
            body.append(f'<li style="margin:10px 0;"><a href="{fname}" style="color:#2563eb; text-decoration:none; font-weight:600; font-size:1.05rem;">{title}</a></li>')
        body.append('</ul></div>')

    if tareas_files:
        body.append('<div style="margin-top:2rem; background:white; padding:1.5rem; border-radius:8px; border:1px solid #e2e8f0; box-shadow:0 1px 3px rgba(0,0,0,0.05);">')
        body.append('<h2 style="margin-top:0; color:#0f172a; border-bottom:2px solid #2563eb; padding-bottom:0.5rem;">Tareas y Prácticas</h2>')
        body.append('<ul style="list-style:none; padding-left:0;">')
        for title, fname in tareas_files:
            body.append(f'<li style="margin:10px 0;"><a href="{fname}" style="color:#2563eb; text-decoration:none; font-weight:600; font-size:1.05rem;">{title}</a></li>')
        body.append('</ul></div>')

    content = '\n'.join(body)
    navbar = build_navbar_html(folder_name, 'Inicio')

    html = f'''<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{folder_name} - Inicio</title>
    <link rel="stylesheet" href="style.css">
    <script src="script.js"></script>
</head>
<body>
    {navbar}
    <div id="page-layout">
        <main id="main-content">
            {content}
        </main>
    </div>
</body>
</html>'''

    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(html)


def create_mkdocs_config(folder_path, folder_name, prog_file, pres_file, teoria_files, tareas_files):
    yml_path = os.path.join(folder_path, 'mkdocs.yml')
    lines = []
    lines.append(f'site_name: "{folder_name.upper()}"')
    lines.append(f'site_description: "Material docente de {folder_name.upper()}"')
    lines.append('use_directory_urls: false')
    lines.append('')
    lines.append('theme:')
    lines.append('  name: material')
    lines.append('  logo: logo.png')
    lines.append('  language: es')
    lines.append('  features:')
    lines.append('    - navigation.tabs')
    lines.append('    - navigation.tabs.sticky')
    lines.append('    - navigation.sections')
    lines.append('    - navigation.expand')
    lines.append('    - navigation.indexes')
    lines.append('    - navigation.top')
    lines.append('    - toc.integrate')
    lines.append('    - content.code.copy')
    lines.append('  palette:')
    lines.append('    - media: "(prefers-color-scheme: light)"')
    lines.append('      scheme: default')
    lines.append('      primary: indigo')
    lines.append('      accent: blue')
    lines.append('    - media: "(prefers-color-scheme: dark)"')
    lines.append('      scheme: slate')
    lines.append('      primary: indigo')
    lines.append('      accent: blue')
    lines.append('')
    lines.append('markdown_extensions:')
    lines.append('  - tables')
    lines.append('  - admonition')
    lines.append('  - pymdownx.details')
    lines.append('  - pymdownx.superfences')
    lines.append('  - pymdownx.highlight:')
    lines.append('      anchor_linenums: true')
    lines.append('      line_spans: __span')
    lines.append('      pygments_lang_class: true')
    lines.append('  - pymdownx.inlinehilite')
    lines.append('  - pymdownx.snippets')
    lines.append('  - pymdownx.tabbed:')
    lines.append('      alternate_style: true')
    lines.append('  - toc:')
    lines.append('      permalink: true')
    lines.append('      permalink_title: "Enlace permanente"')
    lines.append('      toc_depth: 3')
    lines.append('')
    lines.append('plugins:')
    lines.append('  - search')
    lines.append('')
    lines.append('extra_css:')
    lines.append('  - stylesheets/extra.css')
    lines.append('')
    lines.append('nav:')
    lines.append('  - Inicio: index.md')

    if pres_file:
        md_name = pres_file[1].replace('.html', '.md')
        lines.append(f'  - Presentación: "{md_name}"')

    if prog_file:
        md_name = prog_file[1].replace('.html', '.md')
        lines.append(f'  - Programación: "{md_name}"')

    if teoria_files:
        lines.append('  - Teoría:')
        for title, fname in teoria_files:
            md_name = fname.replace('.html', '.md')
            lines.append(f'      - "{title}": "{md_name}"')

    if tareas_files:
        lines.append('  - Tareas y Prácticas:')
        for title, fname in tareas_files:
            md_name = fname.replace('.html', '.md')
            lines.append(f'      - "{title}": "{md_name}"')

    with open(yml_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')


def inject_layout_to_html(filepath, folder_name):
    filename = os.path.basename(filepath)
    current_page_title = get_clean_page_title(filename, folder_name)
    navbar_html = build_navbar_html(folder_name, current_page_title)

    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    html = remove_body_toc_html(html)
    html = process_code_blocks_and_tables(html)
    html = add_permalinks_to_html(html)

    body_match = re.search(r'<body[^>]*>(.*?)</body>', html, re.DOTALL | re.IGNORECASE)
    body_content = body_match.group(1) if body_match else html

    body_content = re.sub(r'<header id="site-header">.*?</header>', '', body_content, flags=re.DOTALL)
    body_content = re.sub(r'<div id="page-layout">', '', body_content)
    body_content = re.sub(r'<aside id="left-panel">.*?</aside>', '', body_content, flags=re.DOTALL)

    base_name = filename.replace('.html', '')
    pdf_name = base_name + '.pdf'
    pdf_path = os.path.join(os.path.dirname(filepath), pdf_name)
    download_btn_html = ''
    if os.path.exists(pdf_path) and filename != 'index.html':
        download_btn_html = f'<div style="display:flex; justify-content:flex-end; margin-bottom:1.2rem;"><a href="{pdf_name}" download style="background-color:#2563eb; color:white; padding:8px 16px; border-radius:6px; text-decoration:none; font-weight:600; font-size:0.9rem; display:inline-flex; align-items:center; gap:6px; box-shadow:0 2px 4px rgba(37,99,235,0.2);">📥 Descargar PDF</a></div>'

    new_html = f'''<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{folder_name.upper()} - {current_page_title}</title>
    <link rel="stylesheet" href="style.css">
    <script src="script.js"></script>
</head>
<body>
    {navbar_html}
    <div id="page-layout">
        <main id="main-content">
            {download_btn_html}
            {body_content}
        </main>
    </div>
</body>
</html>'''

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_html)


def process_module_folder(folder_path):
    folder_name = os.path.basename(os.path.abspath(folder_path))

    with open(os.path.join(folder_path, 'style.css'), 'w', encoding='utf-8') as f:
        f.write(CSS_STYLES)
    with open(os.path.join(folder_path, 'script.js'), 'w', encoding='utf-8') as f:
        f.write(JS_SCRIPT)

    docs_dir = os.path.join(folder_path, 'docs')
    if os.path.exists(docs_dir):
        for root, _, files in os.walk(docs_dir):
            for md_file in files:
                if md_file.endswith('.md'):
                    format_markdown_file(os.path.join(root, md_file))

    html_files = [f for f in os.listdir(folder_path) if f.endswith('.html') and f != 'index.html']

    prog_file = None
    pres_file = None
    teoria_files = []
    tareas_files = []

    for f in html_files:
        f_lower = f.lower()
        title = os.path.splitext(f)[0].replace('_', ' ')
        if 'presentacion' in f_lower or 'presentación' in f_lower or 'presenta' in f_lower:
            pres_file = (title, f)
        elif 'programacion' in f_lower or 'programación' in f_lower:
            prog_file = (title, f)
        elif 'teoria' in f_lower or 'teoría' in f_lower:
            teoria_files.append((title, f))
        elif 'tarea' in f_lower or 'practica' in f_lower or 'práctica' in f_lower:
            tareas_files.append((title, f))
        else:
            teoria_files.append((title, f))

    teoria_files.sort(key=lambda x: sort_key(x[1]))
    tareas_files.sort(key=lambda x: sort_key(x[1]))

    create_index_html(folder_path, folder_name, prog_file, pres_file, teoria_files, tareas_files)

    for f in [f for f in os.listdir(folder_path) if f.endswith('.html')]:
        file_path = os.path.join(folder_path, f)
        if os.path.isfile(file_path):
            inject_layout_to_html(file_path, folder_name)

    create_mkdocs_config(folder_path, folder_name, prog_file, pres_file, teoria_files, tareas_files)

    os.makedirs(docs_dir, exist_ok=True)
    css_dir = os.path.join(docs_dir, 'stylesheets')
    os.makedirs(css_dir, exist_ok=True)
    with open(os.path.join(css_dir, 'extra.css'), 'w', encoding='utf-8') as f:
        f.write('')

    with open(os.path.join(docs_dir, 'index.md'), 'w', encoding='utf-8') as f:
        f.write(f'# Módulo {folder_name.upper()}\n\nBienvenido al portal del módulo **{folder_name.upper()}**.\n')


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Uso: script_mejorado_completo.sh <carpeta_modulo>')
        sys.exit(1)
    process_module_folder(sys.argv[1])
PY

# 3. Procesar cada subcarpeta de módulo de forma independiente
echo "📂 Buscando subcarpetas de módulos independientes..."
module_folders=()
while IFS= read -r -d '' dir; do
    module_folders+=("$dir")
done < <(find . -mindepth 1 -maxdepth 1 -type d ! -name ".*" ! -name "docs*" ! -name "site*" -print0)

if [ ${#module_folders[@]} -eq 0 ]; then
    module_folders=(".")
fi

for mod_folder in "${module_folders[@]}"; do
    mod_name="$(basename "$mod_folder")"
    echo ""
    echo "======================================================================"
    echo "📦 Procesando Módulo independiente: '$mod_name' ($mod_folder)"
    echo "======================================================================"

    if [ -f "logo.png" ]; then
        cp logo.png "$mod_folder/" 2>/dev/null || true
        mkdir -p "$mod_folder/docs"
        cp logo.png "$mod_folder/docs/" 2>/dev/null || true
    fi

    (
        cd "$mod_folder" || exit

        find . -maxdepth 1 -type f \( -iname "*.pptx" -o -iname "*.ppt" \) -print0 | while IFS= read -r -d '' pptx; do
            base_pres="$(basename "$pptx" | sed -E 's/\.(pptx|ppt)$//i')"
            echo "  ⚙️ LibreOffice convirtiendo presentación PPTX a PDF: $pptx"
            libreoffice --headless --convert-to pdf "$pptx" 2>/dev/null || true

            pdf_file="${base_pres}.pdf"
            if [ -f "$pdf_file" ]; then
                mkdir -p docs
                cp "$pdf_file" docs/

                cat <<HEOF > "${base_pres}.html"
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Presentación - ${base_pres}</title>
    <link rel="stylesheet" href="style.css">
    <script src="script.js"></script>
</head>
<body>
    <h1 style="margin-top:0;">Diapositivas de la Presentación</h1>
    <div style="width:100%; height:82vh; border-radius:8px; overflow:hidden; border:1px solid #cbd5e1;">
        <iframe src="${pdf_file}" width="100%" height="100%" style="border:none;"></iframe>
    </div>
</body>
</html>
HEOF

                cat <<MEOF > "docs/${base_pres}.md"
# Presentación del Módulo

<iframe src="../${pdf_file}" width="100%" height="750px" style="border:none; border-radius:8px;"></iframe>
MEOF
            fi
        done

        mkdir -p docs/images

        find . -maxdepth 1 -type f -name "*.docx" -print0 | while IFS= read -r -d '' docx; do
            base_name="$(basename "$docx" .docx)"
            echo "  ⚙️ LibreOffice convirtiendo documento a PDF: $docx"
            libreoffice --headless --convert-to pdf "$docx" 2>/dev/null || true
            if [ -f "$base_name.pdf" ]; then
                mkdir -p docs
                cp "$base_name.pdf" docs/
            fi

            echo "  📄 Pandoc convirtiendo: $docx -> $base_name.html & docs/$base_name.md"

            pandoc "$docx" -f docx -t html5 \
                --standalone \
                --toc \
                --toc-depth=3 \
                --extract-media="media_$base_name" \
                -o "$base_name.html" 2>/dev/null || true

            pandoc "$docx" -f docx -t markdown \
                --extract-media="docs/images/$base_name" \
                --wrap=none \
                -o "docs/$base_name.md" 2>/dev/null || true
        done
    )

    python3 module_builder.py "$mod_folder"

    if command -v mkdocs >/dev/null 2>&1; then
        echo "  🏗️ Compilando sitio web profesional MkDocs Material..."
        (
            cd "$mod_folder" || exit
            mkdocs build >/dev/null 2>&1 || true
            touch site/.nojekyll 2>/dev/null || true
        )
        echo "  ✅ MkDocs Material compilado con éxito en: $mod_folder/site/index.html"
    fi
done

rm -f module_builder.py

echo ""
echo "======================================================================"
echo "✨ ¡TODOS LOS MÓDULOS PROCESADOS CON ÉXITO!"
echo "======================================================================"
