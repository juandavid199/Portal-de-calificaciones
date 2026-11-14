# Bitácora de Configuración de IA, Seguridad y Evidencias

**Proyecto:** `50-portal-de-calificaciones`  
**Fecha:** 2026-11-14  
**Estado:** Todos los hitos (1, 2, 3 y 4) completados satisfactoriamente.

---

## 1. Reglas del Proyecto e Instrucciones (`AGENTS.md`)
El archivo [AGENTS.md](file:///c:/Users/Usuario/Downloads/martes_jueves/AGENTS.md) rige el comportamiento estricto del asistente de IA:
- **Stack:** Next.js (App Router), React, TypeScript estricto, Firebase Auth (cookie HttpOnly), Firestore (servidor vía Admin SDK), Zod y Vitest.
- **Seguridad:** Prohibición absoluta de leer credenciales `.env*`, salir del directorio raíz o ejecutar comandos no autorizados sin confirmación.
- **Calidad:** TDD (Red $\to$ Green), WCAG 2.2 AA, Mobile-first (360px, 768px, 1024px).

---

## 2. Barreras de Seguridad y Contención del Sandbox
Configuradas en [.vscode/settings.json](file:///c:/Users/Usuario/Downloads/martes_jueves/.vscode/settings.json) y [.gemini/settings.json](file:///c:/Users/Usuario/Downloads/martes_jueves/.gemini/settings.json):
- **Precedencia Deny:** Bloqueo automático para `.env*`, `*.pem`, `*.key` y `vercel env pull`.
- **Precedencia Ask:** Confirmación requerida para red (`curl`, `wget`), instalación de paquetes (`npm install`) y `git push`.
- **Evidencia Registrada:** En [ia/PRUEBAS-CONTENCION.md](file:///c:/Users/Usuario/Downloads/martes_jueves/ia/PRUEBAS-CONTENCION.md) se verificó el bloqueo exitoso del intento de lectura de `.env.local`.

---

## 3. Resumen Consolidado por Hitos

### Hito 1: Planilla de Notas Accesible y Aritmética Exacta
* **Aritmética en Décimas:** [src/services/calculoNotas.ts](file:///c:/Users/Usuario/Downloads/martes_jueves/src/services/calculoNotas.ts) resuelve el problema de coma flotante de IEEE 754 operando en enteros escalados. Suite de 6 casos en [tests/unit/calculoNotas.test.ts](file:///c:/Users/Usuario/Downloads/martes_jueves/tests/unit/calculoNotas.test.ts).
* **Validación Zod:** [src/schemas/notas.schema.ts](file:///c:/Users/Usuario/Downloads/martes_jueves/src/schemas/notas.schema.ts) (0.0 a 5.0, 1 decimal, suma 100%).
* **Navegación espacial por teclado:** [src/hooks/useTableKeyboardNav.ts](file:///c:/Users/Usuario/Downloads/martes_jueves/src/hooks/useTableKeyboardNav.ts) con flechas sin trampas de foco.
* **Componentes de Planilla:** [src/components/planilla/PlanillaNotas.tsx](file:///c:/Users/Usuario/Downloads/martes_jueves/src/components/planilla/PlanillaNotas.tsx) con `useMemo`, `aria-live` y estados de carga/error/vacío.

### Hito 2: Aplicación Next.js Modular y Navegable
* **Landmarks Semánticos:** [app/layout.tsx](file:///c:/Users/Usuario/Downloads/martes_jueves/app/layout.tsx) con `<header>`, `<nav>`, `<main id="contenido-principal">`, `<footer>` y skip-link accesible [src/components/layout/SkipLink.tsx](file:///c:/Users/Usuario/Downloads/martes_jueves/src/components/layout/SkipLink.tsx).
* **Árbol de Rutas:**
  - `/` (Dashboard Mis cursos): [app/page.tsx](file:///c:/Users/Usuario/Downloads/martes_jueves/app/page.tsx)
  - `/estudiante/notas`: [app/estudiante/notas/page.tsx](file:///c:/Users/Usuario/Downloads/martes_jueves/app/estudiante/notas/page.tsx)
  - `/docente/cursos/[id]`: [app/docente/cursos/[id]/page.tsx](file:///c:/Users/Usuario/Downloads/martes_jueves/app/docente/cursos/[id]/page.tsx)
  - `/docente/cursos/[id]/actividades`: [app/docente/cursos/[id]/actividades/page.tsx](file:///c:/Users/Usuario/Downloads/martes_jueves/app/docente/cursos/[id]/actividades/page.tsx)
  - `/admin/cursos`: [app/admin/cursos/page.tsx](file:///c:/Users/Usuario/Downloads/martes_jueves/app/admin/cursos/page.tsx)
* **Mobile-First:** Menú colapsable con tecla `Escape` y objetivos táctiles $\ge 44\text{ px}$. Pruebas en [tests/components/RootLayout.test.tsx](file:///c:/Users/Usuario/Downloads/martes_jueves/tests/components/RootLayout.test.tsx).

### Hito 3: API REST por Capas y Persistencia en Firestore
* **Infraestructura y Envoltorio:** [src/lib/http.ts](file:///c:/Users/Usuario/Downloads/martes_jueves/src/lib/http.ts) (`manejar(handler)`), [src/lib/errores.ts](file:///c:/Users/Usuario/Downloads/martes_jueves/src/lib/errores.ts) y [src/lib/auth.ts](file:///c:/Users/Usuario/Downloads/martes_jueves/src/lib/auth.ts).
* **Transacción Atómica:** [src/repositories/notasRepository.ts](file:///c:/Users/Usuario/Downloads/martes_jueves/src/repositories/notasRepository.ts) con verificación de curso cerrado (409) y auditoría inmutable de notas.
* **Documentación:** Especificación en [openapi.yaml](file:///c:/Users/Usuario/Downloads/martes_jueves/openapi.yaml) y colección completa en [bruno/](file:///c:/Users/Usuario/Downloads/martes_jueves/bruno).
* **Pruebas de API:** [tests/api/cursosNotasRoute.test.ts](file:///c:/Users/Usuario/Downloads/martes_jueves/tests/api/cursosNotasRoute.test.ts) (casos 400, 403, 409).

### Hito 4: Integración de Auth, Seguridad y Calidad
* **SDK Web y Contexto:** [src/lib/firebaseClient.ts](file:///c:/Users/Usuario/Downloads/martes_jueves/src/lib/firebaseClient.ts) y [src/context/AuthContext.tsx](file:///c:/Users/Usuario/Downloads/martes_jueves/src/context/AuthContext.tsx) con `credentials: 'include'`.
* **Inicio de Sesión Accesible:** [app/login/page.tsx](file:///c:/Users/Usuario/Downloads/martes_jueves/app/login/page.tsx). Pruebas en [tests/auth/loginFlow.test.tsx](file:///c:/Users/Usuario/Downloads/martes_jueves/tests/auth/loginFlow.test.tsx).
* **Protección de Rutas (Proxy/Middleware):** [proxy.ts](file:///c:/Users/Usuario/Downloads/martes_jueves/proxy.ts) y [middleware.ts](file:///c:/Users/Usuario/Downloads/martes_jueves/middleware.ts) redirigiendo a `/login` ante ausencia de cookie `sesion`.
* **Navegación Dinámica por Roles:** [src/components/layout/Navigation.tsx](file:///c:/Users/Usuario/Downloads/martes_jueves/src/components/layout/Navigation.tsx) adaptando la interfaz según `docente`, `estudiante` o `admin`.
* **Evidencias de Calidad:** Consolidación de métricas de rendimiento, accesibilidad WCAG y retos en [calidad/CALIDAD.md](file:///c:/Users/Usuario/Downloads/martes_jueves/calidad/CALIDAD.md).

---

## 4. Guía para Demostración en Vivo en la Sustentación
1. **Prueba de Seguridad y Contención:**
   - Intentar pedir a la IA que lea `.env.local` $\to$ La IA rechaza la solicitud citando la política `deny` de [.vscode/settings.json](file:///c:/Users/Usuario/Downloads/martes_jueves/.vscode/settings.json).
2. **Prueba de Aritmética Exacta:**
   - Mostrar el cálculo ponderado en [src/services/calculoNotas.ts](file:///c:/Users/Usuario/Downloads/martes_jueves/src/services/calculoNotas.ts) y ejecutar los 6 casos de prueba unitarios en [tests/unit/calculoNotas.test.ts](file:///c:/Users/Usuario/Downloads/martes_jueves/tests/unit/calculoNotas.test.ts).
3. **Prueba de Accesibilidad:**
   - Navegar la planilla en [app/docente/cursos/[id]/page.tsx](file:///c:/Users/Usuario/Downloads/martes_jueves/app/docente/cursos/[id]/page.tsx) utilizando únicamente las flechas del teclado, comprobando el recálculo en vivo y los anuncios `aria-live`.
4. **Prueba de Transacción de Notas y Curso Cerrado:**
   - Demostrar el endpoint `PUT /api/cursos/:id/notas` vía Bruno o Vitest confirmando que la edición en curso cerrado sin justificación devuelve código `409 Conflict`.
