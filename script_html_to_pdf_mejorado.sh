#!/usr/bin/env bash
set -euo pipefail

# Convierte archivos HTML generados a PDF.   
# Revisa solo los HTML que no tengan su PDF todavía.
# Usa Chromium/Chrome si está disponible, y wkhtmltopdf como alternativa.

convert_with_chromium() {
  local html_file="$1"
  local pdf_file="$2"
  local base_name
  base_name="$(basename "$html_file" .html)"

  if command -v chromium >/dev/null 2>&1; then
    python3 - "$html_file" "$pdf_file" "$base_name" <<'PY'
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

html_file = sys.argv[1]
pdf_file = sys.argv[2]
base_name = sys.argv[3]

Path(pdf_file).parent.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 1800}, device_scale_factor=1)
    page.goto(Path(html_file).resolve().as_uri(), wait_until="domcontentloaded")
    page.add_style_tag(content="""
        @page {
            size: A4;
            margin: 18mm 12mm 20mm 12mm;
        }
        @media print {
            body {
                margin: 0 !important;
            }
            #site-header,
            header#site-header,
            .top-nav,
            .nav-btn,
            .dropdown,
            .dropbtn,
            a[download],
            button,
            .copy-btn,
            #left-panel,
            .headerlink {
                display: none !important;
            }
            #page-layout,
            #main-content,
            main,
            body {
                display: block !important;
                width: 100% !important;
                max-width: none !important;
            }
        }
    """)
    page.pdf(
        path=pdf_file,
        print_background=True,
        display_header_footer=True,
        header_template=f'''<div style="font-size:10px; color:#333; width:100%; text-align:center; font-family:Arial, sans-serif;">{base_name}</div>''',
        footer_template='<div style="font-size:9px; color:#333; width:100%; text-align:center; font-family:Arial, sans-serif;">Página <span class="pageNumber"></span> de <span class="totalPages"></span></div>',
        margin={"top": "20mm", "right": "12mm", "bottom": "20mm", "left": "12mm"},
        prefer_css_page_size=True,
    )
    browser.close()
PY
    return 0
  fi

  if command -v chromium-browser >/dev/null 2>&1; then
    python3 - "$html_file" "$pdf_file" "$base_name" <<'PY'
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

html_file = sys.argv[1]
pdf_file = sys.argv[2]
base_name = sys.argv[3]

Path(pdf_file).parent.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 1800}, device_scale_factor=1)
    page.goto(Path(html_file).resolve().as_uri(), wait_until="domcontentloaded")
    page.add_style_tag(content="""
        @page {
            size: A4;
            margin: 18mm 12mm 20mm 12mm;
        }
        @media print {
            body { margin: 0 !important; }
            #site-header, header#site-header, .top-nav, .nav-btn, .dropdown, .dropbtn, a[download], button, .copy-btn, #left-panel, .headerlink { display: none !important; }
            #page-layout, #main-content, main, body { display: block !important; width: 100% !important; max-width: none !important; }
        }
    """)
    page.pdf(
        path=pdf_file,
        print_background=True,
        display_header_footer=True,
        header_template=f'''<div style="font-size:10px; color:#333; width:100%; text-align:center; font-family:Arial, sans-serif;">{base_name}</div>''',
        footer_template='<div style="font-size:9px; color:#333; width:100%; text-align:center; font-family:Arial, sans-serif;">Página <span class="pageNumber"></span> de <span class="totalPages"></span></div>',
        margin={"top": "20mm", "right": "12mm", "bottom": "20mm", "left": "12mm"},
        prefer_css_page_size=True,
    )
    browser.close()
PY
    return 0
  fi

  if command -v google-chrome >/dev/null 2>&1; then
    python3 - "$html_file" "$pdf_file" "$base_name" <<'PY'
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

html_file = sys.argv[1]
pdf_file = sys.argv[2]
base_name = sys.argv[3]

Path(pdf_file).parent.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path='/usr/bin/google-chrome')
    page = browser.new_page(viewport={"width": 1280, "height": 1800}, device_scale_factor=1)
    page.goto(Path(html_file).resolve().as_uri(), wait_until="domcontentloaded")
    page.add_style_tag(content="""
        @page {
            size: A4;
            margin: 18mm 12mm 20mm 12mm;
        }
        @media print {
            body { margin: 0 !important; }
            #site-header, header#site-header, .top-nav, .nav-btn, .dropdown, .dropbtn, a[download], button, .copy-btn, #left-panel, .headerlink { display: none !important; }
            #page-layout, #main-content, main, body { display: block !important; width: 100% !important; max-width: none !important; }
        }
    """)
    page.pdf(
        path=pdf_file,
        print_background=True,
        display_header_footer=True,
        header_template=f'''<div style="font-size:10px; color:#333; width:100%; text-align:center; font-family:Arial, sans-serif;">{base_name}</div>''',
        footer_template='<div style="font-size:9px; color:#333; width:100%; text-align:center; font-family:Arial, sans-serif;">Página <span class="pageNumber"></span> de <span class="totalPages"></span></div>',
        margin={"top": "20mm", "right": "12mm", "bottom": "20mm", "left": "12mm"},
        prefer_css_page_size=True,
    )
    browser.close()
PY
    return 0
  fi

  return 1
}

convert_with_wkhtmltopdf() {
  local html_file="$1"
  local pdf_file="$2"
  local base_name
  base_name="$(basename "$html_file" .html)"

  if command -v wkhtmltopdf >/dev/null 2>&1; then
    tmp_css="$(mktemp)"
    cat > "$tmp_css" <<EOF
@media print {
  #site-header, header#site-header, .top-nav, .nav-btn, .dropdown, .dropbtn, a[download], button, .copy-btn, #left-panel, .headerlink { display: none !important; }
  #page-layout, #main-content, main, body { display: block !important; width: 100% !important; max-width: none !important; }
}
@page { margin: 18mm 12mm 20mm 12mm; }
EOF
    wkhtmltopdf --enable-local-file-access --user-style-sheet "$tmp_css" --margin-top 20mm --margin-bottom 20mm --margin-left 12mm --margin-right 12mm --header-center "$base_name" --footer-center "Página [page]/[topage]" "$html_file" "$pdf_file" >/dev/null 2>&1
    rm -f "$tmp_css"
    return 0
  fi

  return 1
}

convert_html_to_pdf() {
  local html_file="$1"
  local base_name
  base_name="$(basename "$html_file" .html)"
  local dir_name
  dir_name="$(dirname "$html_file")"
  local pdf_file="${dir_name}/${base_name}.pdf"

  if [ -f "$pdf_file" ]; then
    echo "  ⏭️ Ya existe: $pdf_file"
    return 0
  fi

  echo "  🔄 Generando: $pdf_file"

  if convert_with_chromium "$html_file" "$pdf_file"; then
    echo "  ✅ OK: $pdf_file"
    return 0
  fi

  if convert_with_wkhtmltopdf "$html_file" "$pdf_file"; then
    echo "  ✅ OK: $pdf_file"
    return 0
  fi

  echo "  ❌ Error: no se pudo convertir $html_file" >&2
  echo "  Instala chromium, google-chrome o wkhtmltopdf." >&2
  return 1
}

process_folder() {
  local folder="$1"
  echo "📂 Revisando: $folder"

  while IFS= read -r html_file; do
    convert_html_to_pdf "$html_file"
  done < <(find "$folder" -type f -name "*.html" | sort)
}

main() {
  if [ $# -eq 0 ]; then
    echo "Uso: $0 <carpeta>
Ejemplo: $0 .
Ejemplo: $0 /ruta/a/modulos"
    exit 1
  fi

  local target_dir="$1"
  if [ ! -d "$target_dir" ]; then
    echo "❌ La carpeta no existe: $target_dir" >&2
    exit 1
  fi

  process_folder "$target_dir"
}

main "$@"
