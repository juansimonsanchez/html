#!/bin/bash
# ==============================================================================
# SCRIPT DE LIMPIEZA DE ARCHIVOS GENERADOS
# Borra todas las carpetas y archivos generados (HTML, docs, site, mkdocs.yml)
# dejando ÚNICAMENTE los archivos originales (.docx, .pptx) y script.sh
# ==============================================================================

echo "======================================================================"
echo "🧹 Limpiando archivos y carpetas generadas..."
echo "======================================================================"

# 1. Borrar carpetas generadas (docs, site, carpetas media_*)
find . -type d \( -name "docs" -o -name "site"  \) -exec rm -rf {} + 2>/dev/null

# 2. Borrar archivos HTML generados
find . -type f -name "*.html" -exec rm -f {} + 2>/dev/null

# 3. Borrar archivos de configuración mkdocs.yml generados
find . -type f -name "mkdocs.yml" -exec rm -f {} + 2>/dev/null

# 4. Limpiar scripts Python temporales
rm -f module_builder.py builder.py 2>/dev/null

echo "======================================================================"
echo "✨ Limpieza completada con éxito."
echo "   Se han conservado intactos los archivos .docx, .pptx e instrucciones."
echo "======================================================================"
