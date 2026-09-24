#!/usr/bin/env bash
set -euo pipefail

# Convierte archivos HTML generados a PDF.   
# Revisa solo los HTML que no tengan su PDF todavía.
# Usa Chromium/Chrome si está disponible, y wkhtmltopdf como alternativa.

convert_with_chromium() {
  local html_file="$1"
  local pdf_file="$2"

  if command -v chromium >/dev/null 2>&1; then
    chromium --headless --disable-gpu --print-to-pdf="$pdf_file" "$html_file" >/dev/null 2>&1
    return 0
  fi

  if command -v chromium-browser >/dev/null 2>&1; then
    chromium-browser --headless --disable-gpu --print-to-pdf="$pdf_file" "$html_file" >/dev/null 2>&1
    return 0
  fi

  if command -v google-chrome >/dev/null 2>&1; then
    google-chrome --headless --disable-gpu --print-to-pdf="$pdf_file" "$html_file" >/dev/null 2>&1
    return 0
  fi

  return 1
}

convert_with_wkhtmltopdf() {
  local html_file="$1"
  local pdf_file="$2"

  if command -v wkhtmltopdf >/dev/null 2>&1; then
    wkhtmltopdf --enable-local-file-access "$html_file" "$pdf_file" >/dev/null 2>&1
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
