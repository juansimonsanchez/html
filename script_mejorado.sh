#!/usr/bin/env bash
set -euo pipefail

require_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "❌ Falta la dependencia: $cmd" >&2
    exit 1
  fi
}

install_mkdocs_if_needed() {
  if ! command -v mkdocs >/dev/null 2>&1; then
    echo "⚙️ Instalando MkDocs y Material..."
    if command -v python3 >/dev/null 2>&1; then
      python3 -m pip install --quiet mkdocs mkdocs-material pymdown-extensions
    else
      pip install --quiet mkdocs mkdocs-material pymdown-extensions
    fi
  fi
}

generate_module_builder() {
  cat > module_builder.py <<'PY'
import os
import sys


def main():
    folder = sys.argv[1] if len(sys.argv) > 1 else "."
    print(f"Procesando: {os.path.abspath(folder)}")


if __name__ == "__main__":
    main()
PY
}

convert_ppt_and_docx() {
  local mod_folder="$1"

  (
    cd "$mod_folder"

    find . -maxdepth 1 -type f \( -iname "*.pptx" -o -iname "*.ppt" \) -print0 | while IFS= read -r -d '' file; do
      local base
      base="$(basename "$file" | sed -E 's/\.(pptx|ppt)$//i')"

      echo "  🔄 Convirtiendo presentación: $file"
      libreoffice --headless --convert-to pdf "$file" >/dev/null 2>&1 || true

      if [ -f "${base}.pdf" ]; then
        mkdir -p docs
        cp "${base}.pdf" docs/
      fi
    done

    find . -maxdepth 1 -type f -name "*.docx" -print0 | while IFS= read -r -d '' file; do
      local base
      base="$(basename "$file" .docx)"

      echo "  🔄 Convirtiendo documento: $file"
      libreoffice --headless --convert-to pdf "$file" >/dev/null 2>&1 || true

      if [ -f "${base}.pdf" ]; then
        mkdir -p docs
        cp "${base}.pdf" docs/
      fi

      if command -v pandoc >/dev/null 2>&1; then
        pandoc "$file" -f docx -t html5 --standalone --toc --toc-depth=3 \
          --extract-media="media_${base}" -o "${base}.html" >/dev/null 2>&1 || true

        pandoc "$file" -f docx -t markdown --wrap=none \
          --extract-media="docs/images/${base}" -o "docs/${base}.md" >/dev/null 2>&1 || true
      fi
    done
  )
}

process_module() {
  local mod_folder="$1"
  local mod_name
  mod_name="$(basename "$mod_folder")"

  echo ""
  echo "======================================================================"
  echo "📦 Procesando módulo: $mod_name"
  echo "======================================================================"

  if [ -f "logo.png" ]; then
    cp "logo.png" "$mod_folder/" 2>/dev/null || true
    mkdir -p "$mod_folder/docs"
    cp "logo.png" "$mod_folder/docs/" 2>/dev/null || true
  fi

  convert_ppt_and_docx "$mod_folder"

  python3 module_builder.py "$mod_folder"

  if command -v mkdocs >/dev/null 2>&1; then
    (
      cd "$mod_folder" || exit 1
      mkdocs build >/dev/null 2>&1 || {
        echo "⚠️ mkdocs build falló en: $mod_folder" >&2
      }
    )
  fi
}

main() {
  require_cmd python3
  require_cmd pandoc
  require_cmd libreoffice

  install_mkdocs_if_needed
  generate_module_builder

  local -a module_folders=()

  while IFS= read -r -d '' dir; do
    module_folders+=("$dir")
  done < <(find . -mindepth 1 -maxdepth 1 -type d ! -name ".*" ! -name "docs*" ! -name "site*" -print0)

  if [ "${#module_folders[@]}" -eq 0 ]; then
    module_folders=(".")
  fi

  for mod_folder in "${module_folders[@]}"; do
    process_module "$mod_folder"
  done

  echo ""
  echo "✅ Finalizado"
}

main "$@"
