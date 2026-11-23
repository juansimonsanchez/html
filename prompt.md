Lee los apuntes teóricos de `@UT4_Teoria.html` y crea los laboratorios interactivos y simuladores para esta unidad siguiendo estrictamente la arquitectura de `@laboratorios_ut3.js` y `@laboratorios.css`:

1. **Crea un nuevo archivo JavaScript específico** junto al HTML (por ejemplo `laboratorios_ut4.js`) siguiendo el patrón de `@laboratorios_ut3.js`:
   - Debe auto-inyectar `<link rel="stylesheet" href="../laboratorios.css">` en el `<head>` si no existe (para que los laboratorios se oculten automáticamente en impresión y en `.pdf-export`).
   - Debe usar `inyectarEnSeccion(sectionId, html)` al dispararse `DOMContentLoaded` para insertar un laboratorio o simulador práctico al final de cada `<article class="box-card">` relevante del tema, sin modificar el contenido teórico original.
   - Debe crear al final de `<main>` una última sección desplegable `<section class="topic-section lab-section">` con un **Test de Autoevaluación de 10 preguntas** sobre los contenidos exactos de `@UT4_Teoria.html` y añadir su enlace al menú `<nav class="main-nav">` si existe.

2. **Estilos estrictos sin CSS inline**:
   - Utiliza exclusivamente las clases ya definidas en `@laboratorios.css` (`.lab-box`, `.lab-blue`, `.lab-purple`, `.lab-emerald`, `.lab-amber`, `.lab-rose`, `.lab-sky`, `.lab-card`, `.lab-btn`, `.lab-input`, `.lab-console`, `.lab-output`, `.lab-quiz-opt`, etc.).
   - No añadas ningún atributo `style="..."` ni etiquetas `<style>` dentro del HTML o del JS.

3. **Modificación mínima en el HTML**:
   - En `@UT4_Teoria.html`, añade únicamente **una línea** en el `<head>` debajo de `script.js`:
     `<script src="laboratorios_ut4.js" defer></script>`
   - No modifiques ninguna otra línea del HTML teórico.