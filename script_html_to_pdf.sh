#!/usr/bin/env bash
set -euo pipefail

# Convierte archivos HTML a PDF usando Chromium/Chrome o wkhtmltopdf
# Si no tienes una herramienta instalada, se avisará claramente.

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "❌ No se encontró: $1" >&2
    exit 1
  }
}

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

process_folder() {
  local folder="$1"
  echo "📂 Procesando carpeta: $folder"

  find "$folder" -type f -name "*.html" | while IFS= read -r file; do
    base="$(basename "$file" .html)"
    dir="$(dirname "$file")"
    pdf_output="$dir/${base}.pdf"

    if [ -f "$pdf_output" ]; then
      echo "  ⏭️ Ya existe: $pdf_output"
      continue
    fi

    echo "  🔄 Generando PDF para: $file"

    if convert_with_chromium "$file" "$pdf_output"; then
      echo "  ✅ PDF generado: $pdf_output"
      continue
    fi

    if convert_with_wkhtmltopdf "$file" "$pdf_output"; then
      echo "  ✅ PDF generado: $pdf_output"
      continue
    fi

    echo "  ❌ No se pudo generar PDF para: $file"
    echo "  Instala uno de estos: chromium, google-chrome o wkhtmltopdf"
  done
}

main() {
  if [ $# -eq 0 ]; then
    echo "Uso: $0 <carpeta>"
    echo "Ejemplo: $0 ."
    exit 1
  fi

  folder="$1"
  if [ ! -d "$folder" ]; then
    echo "❌ La carpeta no existe: $folder"
    exit 1
  fi

  process_folder "$folder"
}

main "$@"
