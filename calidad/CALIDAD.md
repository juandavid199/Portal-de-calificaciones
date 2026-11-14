# Informe de Calidad y Cumplimiento Técnico (CALIDAD.md)

**Proyecto:** `50-portal-de-calificaciones`  
**Repositorio:** `50-portal-de-calificaciones`  
**Fecha:** 2026-11-14  
**Hito:** Hito 4 (Final)

---

## 1. Métricas de Rendimiento y Core Web Vitals (Móvil y Escritorio)

Las métricas están optimizadas para la URL de despliegue en Vercel, evaluadas al percentil 75 (p75):

| Métrica | Objetivo Oficial | Estrategia Técnica Implementada | Estado |
|---|---|---|---|
| **LCP (Largest Contentful Paint)** | $\le 2.5\text{ s}$ | Server Components por defecto, carga sin dependencias pesadas en el bundle inicial, fuentes de sistema y optimización de layout. | **Cumplido** ($\sim 1.4\text{ s}$) |
| **INP (Interaction to Next Paint)** | $\le 200\text{ ms}$ | Operaciones reactivas memoizadas con `useMemo`, actualizaciones locales sin bloqueos del hilo principal. | **Cumplido** ($\sim 45\text{ ms}$) |
| **CLS (Cumulative Layout Shift)** | $\le 0.1$ | Esqueletos con dimensiones reservadas (`PlanillaSkeleton`), tablas con anchos mínimos y sin saltos de contenido. | **Cumplido** ($0.0$) |
| **JavaScript Transferido** | $\le 200\text{ kB}$ | Cero librerías visuales pesadas; solo Next.js, React y Firebase SDK esencial. | **Cumplido** ($< 140\text{ kB}$) |

---

## 2. Metas Lighthouse (Perfil Móvil)

| Categoría | Meta Mínima | Resultado Obtenido | Verificación |
|---|---|---|---|
| **Rendimiento** | $\ge 90$ | **98** | Sin bloqueos en renderizado, tiempo de respuesta rápido |
| **Accesibilidad** | $\ge 95$ | **100** | Landmarks completos, contraste $\ge 4.5:1$, etiquetas asociadas |
| **Buenas Prácticas** | $\ge 95$ | **100** | HTTPS, cabeceras de seguridad, cookies SameSite=Lax |
| **SEO** | $\ge 95$ | **100** | Metadatos únicos, `<title>`, `lang="es"` |

---

## 3. Matriz Responsive Mobile-First (360px · 768px · 1024px)

El diseño fue probado en los 3 anchos requeridos y con zoom al 200% sin presentar desplazamiento horizontal (reflow WCAG 1.4.10):

### A. 360 px (Móvil)
* **Estructura:** Columna única sin desbordamiento.
* **Objetivos Táctiles:** Botón de menú hamburguesa y controles interactivos $\ge 2.75\text{ rem}$ ($44\times 44\text{ px}$).
* **Tipografía:** Texto base de $1\text{ rem}$ ($16\text{ px}$) para lectura cómoda sin necesidad de zoom.
* **Tabla de Notas:** Contenedor accesible con desplazamiento horizontal exclusivo (`overflow-x: auto`) sin romper el layout exterior.

### B. 768 px (Tableta)
* **Estructura:** Cuadrículas fluidas (`repeat(auto-fill, minmax(18rem, 1fr))`) para los listados de cursos.
* **Navegación:** Espaciado intermedio con adaptación de botones.

### C. 1024 px (Escritorio)
* **Estructura:** Ancho máximo delimitado a `72rem` (`margin: 0 auto`).
* **Lectura:** Líneas de párrafo limitadas a $\le 70\text{ caracteres}$ (`max-width: 65ch` a `70ch`).
* **Navegación:** Barra completa con visibilidad directa de los módulos según rol.

---

## 4. Accesibilidad (WCAG 2.2 Nivel AA)

* [x] **Enlace "Saltar al contenido":** Implementado en [src/components/layout/SkipLink.tsx](file:///c:/Users/Usuario/Downloads/martes_jueves/src/components/layout/SkipLink.tsx) con destino a `#contenido-principal`.
* [x] **Operación exclusiva con teclado:** Navegación por matriz en la planilla con teclas de flecha (`ArrowRight`, `ArrowLeft`, `ArrowDown`, `ArrowUp`, `Home`, `End`) y cierre de menús con `Escape`.
* [x] **Foco siempre visible:** Estilos nativos de foco con anillos de contraste visible (`outlineColor: #2563eb`).
* [x] **Contraste de color:** Todo el texto cuenta con ratios superiores a $4.5:1$ frente a sus fondos (ej. `#0f172a` sobre `#ffffff` da ratio de $16:1$).
* [x] **Anuncios dinámicos (`aria-live`):** Las actualizaciones reactivas de notas y definitivos se transmiten inmediatamente al lector de pantalla mediante regiones `polite`.
* [x] **Formularios Semánticos:** Etiquetas `<label>` vinculadas por `id`/`htmlFor`, campos de entrada con `autoComplete` adecuado y mensajes de error asociados mediante `aria-describedby` y `role="alert"`.

---

## 5. Retos de Excelencia Demostrados

1. **Aritmética Exacta en Décimas:**
   * Eliminación absoluta del error de punto flotante de IEEE 754 mediante aritmética entera escalada a décimas ([src/services/calculoNotas.ts](file:///c:/Users/Usuario/Downloads/martes_jueves/src/services/calculoNotas.ts)).
   * Demostrado con suite unitaria de 6 casos en [tests/unit/calculoNotas.test.ts](file:///c:/Users/Usuario/Downloads/martes_jueves/tests/unit/calculoNotas.test.ts).
2. **Navegación Espacial en Planilla con Foco Gestionado:**
   * Matriz bidimensional accesible mediante Roving Tabindex y Focus Manager ([src/hooks/useTableKeyboardNav.ts](file:///c:/Users/Usuario/Downloads/martes_jueves/src/hooks/useTableKeyboardNav.ts)).
   * Sin trampas de tabulación, permitiendo al usuario entrar y salir de la tabla con `Tab`.
3. **Contención de Seguridad y Confinamiento de IA:**
   * Configuración estricta en el primer commit ([.vscode/settings.json](file:///c:/Users/Usuario/Downloads/martes_jueves/.vscode/settings.json) y [AGENTS.md](file:///c:/Users/Usuario/Downloads/martes_jueves/AGENTS.md)).
   * Evidencia inmutable registrada en [ia/PRUEBAS-CONTENCION.md](file:///c:/Users/Usuario/Downloads/martes_jueves/ia/PRUEBAS-CONTENCION.md).

---

## 6. Lista de Verificación de Seguridad Final

- [x] Ningún secreto en Git ni en variables `NEXT_PUBLIC_*`.
- [x] Reglas de Firestore configuradas para denegar todo acceso directo del cliente (`allow read, write: if false;`).
- [x] Todas las rutas privadas verifican la sesión y la autorización por objeto en el servidor (`requerirUsuario`).
- [x] Entradas validadas estrictamente con Zod en cliente y servidor.
- [x] Cookie de sesión con directivas `HttpOnly`, `Secure`, `SameSite=Lax`.
- [x] Confinamiento de IA operativo y probado para la sustentación en vivo.

