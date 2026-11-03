# Plan · Alinear el estilo de Trámites con el Módulo de Matrícula

> Pasos 1 y 2 de `docs/prompt-estilo-matricula.md` (frontend #46): inventario y plan, aprobados el 3 nov 2026.
> **Referencia:** frontend de Matrícula, rama `prod` (`11cb872`; mismo árbol que su `main`, `678ec15`), clonado en solo lectura.
> **Base nuestra:** `tramites-frontend` `develop` (`2571204`).
> El análisis completo con conteos está en `docs/integracion-ui-plan.md`. Aquí va solo lo necesario para aprobar e implementar.
>
> **Citas:** `src/…` es nuestro repo; `ext:src/…` es el repo de Matrícula.

> **Estado (3 nov 2026): implementado** en la rama `feat/SC03-actualizacion-diseno`, creada desde `develop` después de sincronizarla con `main` (D4).
> Capturas: `docs/integracion-ui/capturas/antes/` (develop), `despues/` (rama) y `matricula/` (referencia).

## Decisiones aprobadas

| # | Decisión |
|---|---|
| D1 | Layout de Matrícula: sin header en escritorio; logo y sistema en la cabecera roja de la sidebar; mini-header blanco solo en móvil. |
| D2 | `@heroicons/react` 2.2.0 (24/outline), el mismo set que Matrícula. |
| D3 | Todo en una sola rama, sin PR. |
| D4 | `main` sincronizado en `develop` antes de empezar (trae las pruebas TP-195). |
| D5 | `alert()` y `window.confirm` se mantienen (cambiarlos altera el flujo). |
| D6 | El código sin ruta no se toca (7 `Seccion*`, `ContenidoAdmin`, `SeccionSolicitudes`, `TarjetaSolicitud`, `AvisoMockup`). |

## Diferencias respecto a este plan

- **Campana.** Va en el bloque "Sesión activa" de la sidebar en escritorio y en el mini-header en móvil (`src/components/layout/PanelLayout.jsx`). Se monta una sola vez, porque abre una conexión SSE. En la cabecera roja no cabía junto al título del sistema.
- **Cabeceras de tabla.** En `text-sm font-semibold`, sin mayúsculas, como `ext:src/components/Tabla.tsx`.
- **`TONOS.neutro`.** Se queda en `slate-100`, para que `EstadoBadge.test.jsx` (TP-195) pase sin cambios. El resto de neutros pasó de `slate` a `gray`.
- **Escalas de color.** Además de la roja, se fijaron en hex las escalas `green`, `amber` y `blue` de Tailwind 4. Los botones de aprobar pasaron de `green-500` a `green-700` (el texto blanco sobre `green-500` no pasa AA) y el banner de `ResultadoPago` a tonos 700.
- **Campana en Solicitud de Grado.** `SolicitudGradoPage` ahora también muestra la campana, porque usa el layout común.
- **Sin componente `Tabla`.** Las dos tablas existentes viven en tarjetas que también contienen la vista móvil; su estilo (cabecera `bg-gray-50`, `text-sm font-semibold`) se aplicó directamente.
- **Íconos.** Los tres `icons.jsx` existentes ahora envuelven heroicons y conservan sus nombres, así que quien los importa no cambia.

## Verificación hecha

- `CI=true npm run build`: sin avisos. `npm test`: 18 de 18.
- `npx eslint --ext .js,.jsx --max-warnings=0 src`: sin avisos.
- 360 px: sin scroll horizontal (estudiante, posgrados, admin).
- Teclado: el orden de foco empieza en "Saltar al contenido", luego campana y menú, con anillo visible. En móvil, el drawer recibe el foco al abrir y Esc lo cierra y devuelve el foco al botón.
- Sin cambios en `src/context`, `src/api`, `src/hooks`, `demoUsers.js` ni `appConfig.js`.

### Verificación E2E con Playwright (3 nov 2026)

Se corrió la misma batería contra `develop` (antes) y contra esta rama (después). Cada corrida usó el backend con perfil `h2` recién arrancado y el modo demo.

**Qué cubre la batería (32 pasos):**
- **Login:** clave incorrecta y clave correcta.
- **Menú completo de los 5 roles.**
- **Director:** abre la lista de pendientes y rechaza una solicitud con motivo obligatorio.
- **Dependencia:** responde un paz y salvo.
- **Estudiante:** genera el recibo de un certificado.
- **Posgrados:** abre la lista de aprobadas.
- **Móvil a 360 px y teclado.**

**Resultados:**

| Comprobación | `develop` | Rama |
|---|---|---|
| Pasos correctos | 32/32 | 32/32 |
| Llamadas al API por paso | — | Idénticas en los 32 pasos (mismo comportamiento) |
| Errores de consola | 0 | 0 |
| axe-core WCAG 2 A/AA (25 pantallas) | 25 pantallas con fallos: 214 elementos con poco contraste y 2 `select` sin etiqueta | **0 fallos** |
| 360 px sin scroll horizontal | 4 de 5 roles (admin desbordaba: 373 px) | 5 de 5 |
| Esc cierra el menú móvil y el modal de rechazo | No | Sí |
| Foco visible en los 10 primeros Tab | 10/10 | 10/10 (empieza en «Saltar al contenido») |

---

## 0. Antes de empezar: lo verificado y lo que cambia del prompt

| Punto del prompt | Verificación |
|---|---|
| "Matrícula no tiene tokens centralizados" | **Cierto.** `ext:src/index.css` solo tiene `@import "tailwindcss"`, la fuente y keyframes. No hay `@theme`, `:root` ni config. Usan la paleta por defecto de Tailwind 4 en clases sueltas (`bg-red-700` ×57, `hover:bg-red-800` ×35). |
| "Tienen el sidebar duplicado: 3 `Sidebar.tsx` + `AppSidebar`" | **Matizado.** Los tres `ext:src/vistas/{aspirante,programa,superadmin}/components/Sidebar.tsx` (65, 72 y 48 líneas) **no duplican el componente**: son envoltorios que pasan ítems y tema a `AppSidebar` (299 líneas). Lo que sí está mal: el tema va como prop por todos lados (`Select`, `DatePicker`) y el grupo abierto queda rojo fijo incluso en tema oscuro (`ext:src/components/AppSidebar.tsx:59`). Nosotros seguimos con un solo `AppSidebar` + `menuConfig.js`. |
| "`tramitesColors.js` (colores por rol)" | **Ya no.** En `develop`, los 5 roles apuntan al mismo `RED_THEME` (`src/constants/tramitesColors.js:17-30`). Siguiendo la decisión de rojo único, el archivo **se conserva** pero como **un solo juego de tokens, sin claves por rol** (§5, PR 1). |
| Correr su frontend contra la copia en Render | **Bloqueado.** La política de red de esta sesión rechaza `posgrados-api-d4yv.onrender.com`. Se puede permitir en la configuración del entorno (Network access → Allowed domains). Sin eso, sus capturas de referencia muestran el layout real pero con datos vacíos (tomadas con sesión simulada, sin backend). |
| Capturas nuestras en modo demo con h2 | **Hechas.** Backend `develop` con perfil `h2`, frontend `develop` con `REACT_APP_DEMO_MODE=true`: 16 capturas "antes" de los 5 roles en escritorio y móvil (lista en §6). |
| Su rama de referencia | `prod`. Desde el inventario solo cambiaron 2 archivos de paginación (`ValidacionCohorteDetalle.tsx`, `validacionCohorteService.ts`); ningún token de estilo. Tienen una rama `refactor/componentes-duplicados` sin movimiento desde el 29 de septiembre. |

**Dos riesgos de proceso:**

1. **`develop` y `main` divergieron.** `main` tiene las primeras pruebas (TP-195, `5170e5c`) y `develop` no. `src/components/bandeja-director/EstadoBadge.test.jsx:26,33` comprueba `bg-red-100` y `bg-slate-100`; `ProtectedRoute.test.jsx:35` comprueba el texto `Cargando...`. La CI solo compila (`npm run build` con `CI=true`), no corre pruebas, pero cada PR debe dejarlas pasando. **Propuesta:** sincronizar `main` → `develop` antes del PR 1.
2. **Prerrequisito del documento de pendientes del backend** (`integracion-matricula-pendientes.md` §2): confirmar con su PO o con el ing. Matías que su frontend es la referencia de toda la plataforma y si esto entra en SC-03. No bloquea el plan, pero sí el merge del PR 2, que es el que cambia la estructura visible.

---

## 1. Tabla de tokens

Sus valores son los hex de la paleta por defecto de **Tailwind 4.3**, convertidos desde OKLCH y comparados con píxeles medidos en sus capturas. Un mismo nombre de clase **no** da el mismo color en nuestro Tailwind 3 (su `red-700` es `#c10007`; el nuestro, `#b91c1c`), así que los valores se fijan en `tailwind.config.js`.

### 1.1 Color

| Uso en Matrícula | Su clase | Hex | `tailwind.config.js` (`theme.extend`) | `tramitesColors.js` |
|---|---|---|---|---|
| Primario: cabecera de sidebar, ítem activo, botón primario, badge de rol | `red-700` | `#c10007` | `colors.primario.DEFAULT` y `colors.red.700` | `UI.cabecera`, `UI.itemActivo`, `UI.badgeRol`, `UI.botonPrimario` |
| Hover del primario | `red-800` | `#9f0712` | `colors.primario.hover` y `red.800` | dentro de `UI.botonPrimario` |
| Grupo abierto, opción activa, hover de "Cerrar sesión" | `red-50` | `#fef2f2` | `colors.primario.suave` y `red.50` | `UI.grupoAbierto`, `UI.itemHoverSalir` |
| Seleccionado, badge rojo | `red-100` | `#ffe2e2` | `colors.primario.claro` y `red.100` | `TONOS.error` |
| Bordes rojos, anillo de foco | `red-200` | `#ffc9c9` | `colors.primario.borde` y `red.200` | `UI.foco` |
| Borde de input enfocado | `red-300` | `#ffa2a2` | `red.300` | `UI.campo` |
| Fondo de página | `gray-100` | `#f3f4f6` | `colors.fondo` (igual al `gray-100` de v3) | `UI.pagina` |
| Tarjetas | `white` | `#ffffff` | — | `UI.tarjeta` |
| Cabecera de tabla, bloque de sesión | `gray-50` | `#f9fafb` | — (igual en v3) | — |
| Bordes | `gray-200` | `#e5e7eb` | — (igual en v3) | `UI.tarjeta`, `UI.campo` |
| Títulos | `gray-900` | `#101828` | — (v3 `#111827`, diferencia imperceptible) | — |
| Texto | `gray-700` | `#364153` | — (v3 `#374151`) | — |
| Texto secundario | `neutral-400` | `#a1a1a1` | **No se copia**: 2.58:1, no pasa AA. Usar `gray-500` (4.84:1 sobre blanco) o `gray-600` sobre `fondo` (`gray-500` sobre `fondo` da 4.39:1) | — |
| Éxito | `green-100` / `green-700` | `#dcfce7` / `#008236` | `colors.green` (escala v4) | `TONOS.exito` (4.50:1, justo AA) |
| Advertencia | `amber-50…200` / `amber-800` | `#fffbeb` `#fef3c6` `#fee685` / `#973c00` | `colors.amber` (escala v4) | `TONOS.advertencia` (6.84:1) |
| Error (alerta) | `red-50` / `red-200` / `red-800` | `#fef2f2` `#ffc9c9` `#9f0712` | `colors.red` (escala v4) | `TONOS.error` (7.64:1) |
| Información | `blue-100` / `blue-700` | `#dbeafe` / `#1447e6` | `colors.blue` (escala v4) | `TONOS.info` (5.60:1) |
| Neutro | `neutral-200` / `neutral-600` | — | — (usar `gray-100` / `gray-600`) | `TONOS.neutro` |
| Tema oscuro de Superadmin | `slate-900` / `slate-800` | `#0f172b` / `#1d293d` | **No se copia** (decisión de rojo único) | — |

Al sobrescribir las escalas `red`, `green`, `amber` y `blue` con los valores de v4, **las ~380 clases rojas existentes adoptan el tono de Matrícula sin tocar los archivos**. Un efecto: nuestro `bg-red-600` pasa de `#dc2626` a `#e7000b` hasta que el PR 4 lo cambie por `bg-primario`.

### 1.2 Tipografía, forma, movimiento e íconos

| Token | Valor de Matrícula | Nuestro destino |
|---|---|---|
| Fuente | Pila efectiva `ext:src/index.css:10`: `'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, …, sans-serif`. Sin webfont | `fontFamily.sans` en config; una sola declaración (quitar la de `src/App.css:6-7` y la de CRA de `src/index.css:7-9`) |
| h1 de página | `text-xl font-bold text-gray-900` | `EncabezadoPagina` (hoy `text-3xl`) |
| Etiqueta de sección | `text-xs font-semibold uppercase tracking-wider` | Nuestro breadcrumb (`tracking-[0.18em]` → `tracking-wider`), con `text-gray-500` en vez de `neutral-400` |
| Cuerpo | `text-sm` (574 usos) | Igual |
| Radios | `rounded-lg` en tarjetas, botones, inputs, tablas y modales; `rounded-full` en avatares | Sin cambio de config (`rounded-lg` vale 0.5rem en v3 y v4). Cambiar `rounded-xl/2xl/3xl` → `rounded-lg` en PR 3 y PR 4 |
| Sombras | Tarjeta: `shadow-sm` v4 = **`shadow` v3**. Desplegables y alertas: `shadow-lg`. Modal: `shadow-xl` | Sin cambio de config; traducción v4 → v3: `shadow-xs` → `shadow-sm`, `shadow-sm` → `shadow`, `rounded-sm` → `rounded`, `bg-linear-to-r` → `bg-gradient-to-r` |
| Espaciado | Escala por defecto (igual en v3 y v4). Tarjetas `p-4/p-6`, botones `px-4 py-2.5`, inputs `px-3 py-2.5`, `gap-2/3` | Igual |
| Breakpoints | Por defecto (`sm` 640, `md` 768, `lg` 1024). Sidebar fija desde **`md`** | Nuestra sidebar pasa de `lg` a `md` (PR 2) |
| Ancho de sidebar | `w-64` (256 px) | `width.sidebar: '16rem'` (hoy `w-72 lg:w-80`) |
| Animaciones | 14 keyframes (`fade-in-up` 1.5 s, `slide-left`, `modal-in/out`, `overlay-in/out`, `dropdown-*`, `accordion-*`, `alert-in/out`) | `keyframes` + `animation` en config (bloque en el anexo A), con `motion-reduce:animate-none` |
| Retardos escalonados | Clases `.delay-*` propias (chocan con Tailwind) | `[animation-delay:100ms]` |
| Íconos | Heroicons `24/outline` + SVG propios de trazo, `h-4 w-4` / `h-5 w-5` | Ver decisión D2 (§4) |

---

## 2. Malas prácticas detectadas (no se copian)

**Del Módulo de Matrícula:**

| # | Práctica | Evidencia | Qué hacemos nosotros |
|---|---|---|---|
| 1 | Sin tokens: el primario está repetido en ~90 clases sueltas | `bg-red-700` ×57, `hover:bg-red-800` ×35 | Alias `primario-*` en config + `UI` en `tramitesColors.js` |
| 2 | Botones sin componente: 34 variantes inline del primario con distinto padding y radio. `BOTON_PRIMARIO` existe pero solo se usa en 2 archivos | `ext:src/components/Dialogo.tsx:3-11` | Componente `Boton` con variantes |
| 3 | Tema pasado como prop por todos lados (`tema="oscuro"`), y el grupo abierto queda rojo fijo aun en tema oscuro | `ext:src/components/AppSidebar.tsx:59,105-129`; `Select.tsx:26-45`; `DatePicker.tsx:23-44` | Un solo tema; nada de props de tema |
| 4 | Fuente declarada dos veces + `style={{ fontFamily }}` inline en 20 vistas (43 `style={{}}` en total) | `ext:src/index.css:10,19`; p. ej. `ext:src/vistas/aspirante/AspiranteInicio.tsx:151` | Una sola declaración en config |
| 5 | Texto secundario sin contraste AA: `text-neutral-400` (2.58:1) es su color de texto más usado (267) | — | `gray-500` / `gray-600` |
| 6 | Foco eliminado: 59 `outline-none` contra 11 `focus-visible`; 14 sin anillo de reemplazo en la misma línea | p. ej. `ext:src/components/InputField.tsx:40` | `focus-visible:ring-2 ring-primario-borde` en todo lo interactivo |
| 7 | 179 `<button>` sin `type` (13 lo tienen): dentro de un `<form>` envían el formulario | — | `Boton` con `type="button"` por defecto |
| 8 | Animaciones de 1.5 s en 99 elementos, sin `prefers-reduced-motion` | `ext:src/index.css:123-137` | `motion-reduce:animate-none` |
| 9 | Clases `.delay-*` propias que chocan con las de Tailwind | `ext:src/index.css:268-278` | Propiedad arbitraria |
| 10 | Clase `ufps-input` usada pero nunca definida | `ext:src/components/InputField.tsx:40` | — |
| 11 | Doble padding: el layout pone `p-6` y 22 vistas lo repiten | `ext:src/layouts/PanelLayout.tsx:53` | El padding solo lo pone el layout |
| 12 | Hamburguesa sin efecto: `mobileMenuOpen` nunca se usa | `ext:src/layouts/PosgradosLayout.tsx:8,27` | — |
| 13 | `<html lang="en">`, título por defecto, favicon de Vite; 2 `<img>` sin `alt` | `ext:index.html:2,7`; `ext:public/favicon.svg` | `lang="es"`, `alt` en todo |
| 14 | Dos fuentes de íconos con nombres repetidos (`XMarkIcon` propio y de heroicons) | `ext:src/assets/icons.tsx` (63 exports) | Un solo módulo de íconos |
| 15 | Assets sin uso (~1 MB) y `animate-scale-in` sin uso | `flujoabs2.jpg`, `logo-horizontal.jpg` | — |

**Nuestras, que se corrigen de paso (sin cambiar comportamiento):**
- **Shell copiado en 4 páginas:** `TramitesView.jsx:78-96`, `ProcesodeGrado.jsx:39-75`, `SolicitudGradoPage.jsx:61-110`, `Certificados.jsx:297-330`.
- **6 mapas de estado que se contradicen.** `EN_REVISION` es azul en `EstadoBadge.jsx:5` y amarillo en `Etapa2.jsx:8-10`.
- **Hex inline:** `Login.jsx:142-179`, `NoAutorizado.js:5`.
- **Spinner SVG copiado 11 veces.**
- **`TarjetaEstado` (KPI con gradientes) copiado 4 veces.**
- **40 emojis usados como ícono.**
- **Header sin `POSGRADOS` en `ROLE_LABELS`.**

---

## 3. Tabla de componentes

| Suyo | Nuestro equivalente hoy | Qué cambia | PR |
|---|---|---|---|
| `PanelLayout` | Shell copiado en 4 páginas | Nuevo `src/components/layout/PanelLayout.jsx` como **envoltorio**: las 4 páginas lo usan y **las rutas no cambian** | 2 |
| `AppSidebar` | `src/components/sidebar/AppSidebar.jsx` | `w-64`, fija desde `md`. Cabecera `bg-primario` con logo y "UFPS · Sistema de Posgrados". Bloque "Sesión activa" con badge de rol. Ítems con ícono, `rounded-lg`, activo con relleno `bg-primario text-white`. Mismo cálculo de activo (`selectedMenuId`); el selector demo solo cambia de estilo | 2 |
| Mini-header móvil de `PanelLayout` | `TramitesHeader.jsx` | Según D1 (§4). La campana se reubica sin cambiar `BellNotificaciones` por dentro | 2 |
| `Dialogo` (`BOTON_PRIMARIO`/`SECUNDARIO`) | ~28 primarios y ~39 secundarios inline | `src/components/ui/Boton.jsx`: variantes `primario`, `secundario`, `peligro`, `exito`; `type="button"` por defecto | 3 |
| `Badge` / `BadgeActiva` | `EstadoBadge.jsx` + 6 mapas | `ui/Badge.jsx` con `TONOS` de `tramitesColors.js` y `rounded-lg px-3 py-1`. Los mapas de estado conservan sus claves y textos; solo apuntan a un tono | 3 |
| `Modal` | `ModalRechazo` + 13 overlays inline | `ui/Modal.jsx`: overlay `bg-black/40 backdrop-blur-sm`, panel `rounded-lg shadow-xl`, `role="dialog"`, `aria-modal`, Esc, foco atrapado | 3 |
| `DialogoConfirmacion` | `window.confirm` ×2 y 2 modales propios | `ui/DialogoConfirmacion.jsx`. Reemplazar `window.confirm` cambia el flujo (de síncrono a asíncrono): **solo si se aprueba** (D5) | 3 |
| `Alerta` | `ToastNotificacion`, errores inline `bg-red-50` | `ui/Alerta.jsx` (error, éxito, advertencia, info) con `role="alert"`/`status` y `animate-alert-in`. Los 10 `alert()` se mantienen salvo D5 | 3 |
| `InputField` + patrón `CAMPO` | 27 `<input>`, 9 `<textarea>`, 7 `<select>` con 4 estilos de foco | Constantes `UI.campo` / `UI.foco` + `ui/Campo.jsx` (label, error, ayuda). Se mantienen los `<select>` nativos | 3 |
| `Select` / `DatePicker` / `TimePicker` propios | Nativos | **No se replican**: son pesados y su accesibilidad es parcial. Solo se estilizan los nativos | — |
| `Tabla` | Tabla en `BandejaListadoLayout.jsx:101-134` + 3 variantes inline | `ui/Tabla.jsx`: contenedor `rounded-lg border-gray-200`, cabecera `bg-gray-50`, celdas `px-6 py-4 text-sm` | 3 |
| `Paginacion` | No existe | **No se crea**: no tenemos listados paginados (crearlo sin uso sería código muerto) | — |
| `Cargando` | Spinner copiado ×11 + `<div>Cargando...</div>` | `ui/Cargando.jsx` (spinner `text-primario` + texto). Mantiene el texto "Cargando..." (lo comprueba `ProtectedRoute.test.jsx:35`) | 3 |
| Patrón de tarjeta (`bg-white border-gray-200 rounded-lg p-6`) | `TarjetaAccion` (`rounded-3xl`), patrón `rounded-2xl/3xl` | `ui/Tarjeta.jsx`; `TarjetaAccion` pasa a usarla | 3 |
| `TarjetasEstadisticas` | `TarjetaEstado` ×4 (gradiente, `text-7xl`, `rounded-3xl p-10`) | `ui/TarjetaEstadistica.jsx`: blanca, valor `text-2xl font-semibold`, ícono en círculo de color de estado | 3 |
| `EncabezadoVolver` | Breadcrumb inline (+12) + "Volver" en `BandejaListadoLayout` | `ui/EncabezadoPagina.jsx` (breadcrumb, h1 `text-xl`, acción, volver) | 3 |
| `BuscadorConFiltro` | Búsqueda en `EstadoEstudiantes.jsx` | Se estiliza con `UI.campo`; no se crea un componente para un solo uso | 4 |
| `PaginaAuth` + `LoginForm` | `Login.jsx` con estilos inline | Reescritura visual con Tailwind: cabecera roja, campos con ícono, botón `primario`, fondo `red-50` → `gray-100`. Misma lógica (`fetch`, Google, demo) | 4a |
| — | `BellNotificaciones` | Solo nosotros: se queda; cambia de sitio y de colores | 2 |

---

## 4. Decisiones que necesito antes de implementar

| # | Decisión | Opciones | Mi recomendación |
|---|---|---|---|
| D1 | **Encabezado** | **H1:** igual que su `PanelLayout`: sin header en escritorio; logo, título, sesión y campana en la cabecera roja de la sidebar; mini-header blanco solo en móvil. **H2:** header rojo como el de su `PosgradosLayout` (logo, usuario, salir) + campana. **H3:** sidebar como la suya + header blanco delgado con la campana y el título | **H1**: es el patrón de 3 de sus 4 layouts (Programa, Aspirante, Superadmin) y el de las pantallas de los usuarios que comparten ambos sistemas |
| D2 | **Íconos** | Agregar `@heroicons/react` (MIT, sin dependencias, se importa por ícono; es lo que usa Matrícula) **o** copiar los ~25 SVG de trazo necesarios a `src/components/ui/icons.jsx` | `@heroicons/react`: mismos íconos exactos, ~1–2 KB por ícono usado, y reemplaza 85 SVG inline + 40 emojis. Si no se aprueba, la copia funciona igual |
| D3 | **Ramas** | El prompt pide una rama por PR hacia `develop`; esta sesión tiene asignada `claude/gracious-allen-ofbwri` | Ramas `feat/SC03-estilo-1-tokens`, `-2-layout`, `-3-componentes`, `-4a-…`, con PR a `develop` (necesito tu visto bueno para crearlas) |
| D4 | **Sincronizar `main` → `develop`** antes del PR 1 (trae las pruebas TP-195) | Sí / no | Sí; si no, los PR no verán `EstadoBadge.test.jsx` hasta que alguien sincronice, y la prueba se rompería en `main` |
| D5 | **`alert()` y `window.confirm`** → `Alerta` / `DialogoConfirmacion` | Incluir (cambia el flujo: confirmación asíncrona) / dejar para después | Dejar para después, fuera de esta tarea: el prompt dice "sin cambiar comportamiento" |
| D6 | **Código sin ruta**: 7 `src/pages/posgrados/Seccion*.jsx` sin enrutar, `ContenidoAdmin`, `SeccionSolicitudes`, `TarjetaSolicitud` | Reestilizar / no tocar / borrar en una tarea aparte | No tocar aquí; borrarlo en una tarea aparte |

---

## 5. Orden de PRs

Cada PR: rama propia desde `develop`, `CI=true npm run build` sin warnings, `npm test` en verde, y capturas antes/después de los 5 roles (§6) en la descripción.

### PR 1 · Tokens y fuente (~0.5–1 día)
- **`tailwind.config.js`:** `theme.extend` del anexo A.
- **`src/constants/tramitesColors.js`:**
  - `ROLE_COLORS`/`RED_THEME` → `UI` (anexo B), un solo objeto sin claves por rol.
  - Se agrega `TONOS` (éxito, advertencia, error, info, neutro).
  - Se agrega `POSGRADOS` a `ROLE_LABELS`.
  - `ROLE_USER_LABELS` sigue igual.
- **Los 3 importadores** cambian `ROLE_COLORS[rol].x` → `UI.x`, sin tocar la lógica:
  - `AppSidebar.jsx:37,135,192,205`
  - `TramitesHeader.jsx:10`
  - `BellNotificaciones.jsx:54,94,139`
- **Fuente:**
  - `src/index.css` queda solo con `@tailwind` + `body { @apply bg-fondo font-sans text-gray-900 }`.
  - Se borra el boilerplate de CRA en `src/App.css`; ya no quedan imports sin uso.
- **`public/index.html`:** `lang="es"`, `theme-color` `#c10007`, título "Trámites de Posgrado · UFPS".
- **Resultado visible:** cabecera, activo y badge en `#c10007`; rojos suaves de Matrícula; fondo `#f3f4f6`.
- **Riesgo:** bajo. La prueba de `EstadoBadge` sigue pasando (las clases no cambian de nombre).

### PR 2 · Layout, sidebar y encabezado (~2–3 días)
- **Nuevo** `src/components/layout/PanelLayout.jsx` (envoltorio). Lo usan `TramitesView.jsx`, `ProcesodeGrado.jsx`, `SolicitudGradoPage.jsx` y `Certificados.jsx`. **Sin cambios en `App.js` ni en rutas.**
- **`AppSidebar.jsx`:**
  - Ancho y forma: `w-sidebar`, fija desde `md`.
  - Cabecera roja con logo y "Sesión activa" + badge.
  - Ítems: con ícono, `rounded-lg`, activo con relleno.
  - Drawer móvil con overlay `bg-black/40 backdrop-blur-sm`, cierre con Esc y foco devuelto; `aria-current="page"` en el ítem activo.
  - El selector demo y su lógica (TP-147) no se tocan, solo su estilo.
- **`menuConfig.js`:** campo `icon` por ítem (dato, no lógica).
- **`TramitesHeader.jsx`:** según D1. Con H1 pasa a ser el mini-header móvil.
  - Se elimina el header repetido en las 3 páginas de estudiante (`ProcesodeGrado.jsx:49,61`, `Certificados.jsx:307,319`, `SolicitudGradoPage.jsx:71,83`).
- **`BellNotificaciones.jsx`:**
  - Se reubica y pasa a `UI.*`.
  - Los emojis de tipo (`:8-12`) se cambian por íconos.
- **Riesgo:** medio. Es el PR más visible. Hay que verificarlo en 360 px y con teclado.

### PR 3 · Componentes base (~2–3 días)
- **Nuevos componentes** en `src/components/ui/`: `Boton`, `Badge`, `Modal`, `Alerta`, `Campo`, `Tabla`, `Cargando`, `Tarjeta`, `TarjetaEstadistica`, `EncabezadoPagina` e íconos (según D2).
- **Adopción mínima, para no dejar código sin uso:**
  - `EstadoBadge` usa `Badge`, y los 6 mapas de estado usan `TONOS`. Se actualiza `EstadoBadge.test.jsx:33` si el neutro pasa de `slate-100` a `gray-100`.
  - `ModalRechazo` usa `Modal`.
  - `ProtectedRoute` usa `Cargando`.
  - `TarjetaAccion` usa `Tarjeta` + `Boton`.
  - `BandejaListadoLayout` usa `Tabla` + `EncabezadoPagina`.
  - `ToastNotificacion` usa el estilo de `Alerta`.
- **Riesgo:** bajo-medio. Los componentes son nuevos; la adopción toca 6 archivos.

### PR 4 · Páginas por rol (5 PR pequeños, ~1 día cada uno)
- **4a · Comunes:**
  - `Login.jsx` (sin estilos inline; misma lógica).
  - `NoAutorizado.js` (Tailwind, sin ❌).
  - `VerificarCertificado.jsx` (header público con la cabecera de la sidebar).
  - `ResultadoPago.jsx`.
- **4b · Estudiante:**
  - `ProcesodeGrado`, `SolicitudGradoPage`, `Certificados`.
  - `proceso-grado/*`: `ConfirmacionGrado` (29 líneas rojas), `DetalleEtapa1`, `Etapa2`, `ModalPagoPSE`, `TarjetaLiquidacion`.
  - El HTML del recibo impreso (`Certificados.jsx:204-216`) necesita hex, porque se abre en otra ventana sin Tailwind: esos valores se toman de `COLORES_IMPRESION` en `tramitesColors.js`.
- **4c · Director:** `BandejaDirector`, `BandejaGrado`, las listas, `DetalleSolicitudDirector`/`Grado`, `PazYSalvoDirector`, `EstadoEstudiantes`.
- **4d · Dependencia:** `BandejaDependencia`.
- **4e · Posgrados y Admin:**
  - `BandejaPosgrados`, `BandejaCertificadosPosgrados`, `ListaSolicitudesPosgrados`.
  - Secciones enrutadas de `pages/posgrados/`: sus `bg-slate-800` (21 en total contando las no enrutadas) → `Boton primario` o pastilla activa `UI.itemActivo`.
  - `PosgradosHeader` pasa a `EncabezadoPagina`.
- **En todos:**
  - `bg-red-600/500` → `primario`.
  - `rounded-2xl/3xl` → `rounded-lg`, `shadow-2xl` → `shadow-xl`.
  - h1 → `text-xl`.
  - `text-slate-400` con significado → `gray-500/600`.
  - `slate` → `gray` en lo que se toca.
  - Emojis → íconos.
- **Criterio de terminado de la serie:** `grep` sin `#[0-9a-f]{6}` en `src/**/*.jsx` (salvo `COLORES_IMPRESION` y las plantillas de certificado, que son datos), sin `bg-red-600`, sin `bg-slate-800` primario, sin `rounded-3xl`.

**Total estimado:** 8–12 días-persona, sin contar la revisión.

---

## 6. Verificación por PR

**Capturas "antes" ya tomadas** (`develop`, demo + h2), para `docs/integracion-ui/capturas/antes/`:

| Rol | Escritorio (1440 px) | Móvil (390 px) |
|---|---|---|
| — | `login` | `login` |
| Estudiante | `estudiante-tramites`, `estudiante-proceso-de-grado`, `estudiante-certificados` | `estudiante-tramites` |
| Director | `director-tramites`, `director-tramites_bandeja-director` | `director-tramites`, `director-menu-abierto` |
| Posgrados | `posgrados-tramites` | `posgrados-tramites` |
| Admin | `admin-tramites` | `admin-tramites` |
| Dependencia | `dependencia-tramites` | `dependencia-tramites` |

**Referencia de Matrícula**, para `docs/integracion-ui/capturas/matricula/`:
- Pantallas: login de programa y de aspirante, inicio de programa, aspirante y posgrados (escritorio y móvil).
- Tomadas sin backend: el shell es real y los datos están vacíos. Si se habilita `posgrados-api-d4yv.onrender.com` en la red del entorno, se repiten con datos.

**Por PR:**
- Mismo guion de Playwright (`scripts` fuera del repo) en 1440, 390 y **360 px**.
- Comparación lado a lado con Matrícula.

**Contraste AA** (calculado):

| Par | Contraste | Resultado |
|---|---|---|
| Blanco sobre `#c10007` | 6.42 | Cumple |
| Blanco sobre `#9f0712` | 8.36 | Cumple |
| `#c10007` sobre `#fef2f2` | 5.87 | Cumple |
| Verde de estado | 4.50 | Justo |
| `gray-500` sobre blanco | 4.84 | Cumple |
| `gray-500` sobre `#f3f4f6` | 4.39 | **No cumple**: usar `gray-600` sobre el fondo |
| Deshabilitado `red-400` | 2.89 | Solo con `cursor-not-allowed` y `disabled` |

**Teclado y accesibilidad:**
- Foco visible en todo lo interactivo (`focus-visible:ring-2 ring-primario-borde`).
- Drawer y modales: Esc y foco atrapado/devuelto; `aria-current`.
- `alt` en logos.
- `motion-reduce`.

**Regresión:**
- `CI=true npm run build`, `npm test`.
- Recorrido de los 5 roles en modo demo.
- `DEMO_USERS` / `demoUsers.js` y `AuthContext` sin cambios de lógica (`git diff --stat` del PR lo muestra).

---

## Anexo A · `theme.extend` propuesto (Tailwind 3)

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Escalas de Tailwind 4.3 (las del Módulo de Matrícula), en hex.
        red:   { 50: '#fef2f2', 100: '#ffe2e2', 200: '#ffc9c9', 300: '#ffa2a2', 400: '#ff6467', 500: '#fb2c36', 600: '#e7000b', 700: '#c10007', 800: '#9f0712', 900: '#82181a', 950: '#460809' },
        green: { 50: '#f0fdf4', 100: '#dcfce7', 200: '#b9f8cf', 300: '#7bf1a8', 400: '#05df72', 500: '#00c950', 600: '#00a63e', 700: '#008236', 800: '#016630', 900: '#0d542b', 950: '#032e15' },
        amber: { 50: '#fffbeb', 100: '#fef3c6', 200: '#fee685', 300: '#ffd230', 400: '#ffb900', 500: '#fe9a00', 600: '#e17100', 700: '#bb4d00', 800: '#973c00', 900: '#7b3306', 950: '#461901' },
        blue:  { 50: '#eff6ff', 100: '#dbeafe', 200: '#bedbff', 300: '#8ec5ff', 400: '#51a2ff', 500: '#2b7fff', 600: '#155dfc', 700: '#1447e6', 800: '#193cb8', 900: '#1c398e', 950: '#162456' },
        // Alias semánticos: el código nuevo usa estos.
        primario: { DEFAULT: '#c10007', hover: '#9f0712', suave: '#fef2f2', claro: '#ffe2e2', borde: '#ffc9c9' },
        fondo: '#f3f4f6',
      },
      fontFamily: {
        sans: ['"Segoe UI"', '-apple-system', 'BlinkMacSystemFont', 'Roboto', 'Oxygen', 'Ubuntu',
               'Cantarell', '"Fira Sans"', '"Droid Sans"', '"Helvetica Neue"', 'sans-serif'],
      },
      width: { sidebar: '16rem' },
      keyframes: {
        'fade-in-up':     { from: { opacity: '0', transform: 'translateY(36px)' },  to: { opacity: '1', transform: 'translateY(0)' } },
        'fade-in':        { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-left':     { from: { opacity: '0', transform: 'translateX(-48px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        'modal-in':       { from: { opacity: '0', transform: 'translateY(12px)' },  to: { opacity: '1', transform: 'translateY(0)' } },
        'modal-out':      { from: { opacity: '1', transform: 'translateY(0)' },     to: { opacity: '0', transform: 'translateY(8px)' } },
        'overlay-in':     { from: { opacity: '0' }, to: { opacity: '1' } },
        'overlay-out':    { from: { opacity: '1' }, to: { opacity: '0' } },
        'dropdown-in':    { from: { opacity: '0', transform: 'translateY(-6px)' },  to: { opacity: '1', transform: 'translateY(0)' } },
        'dropdown-out':   { from: { opacity: '1', transform: 'translateY(0)' },     to: { opacity: '0', transform: 'translateY(-6px)' } },
        'accordion-open': { from: { opacity: '0', transform: 'translateY(-8px)', maxHeight: '0' }, to: { opacity: '1', transform: 'translateY(0)', maxHeight: '10000px' } },
        'alert-in':       { from: { opacity: '0', transform: 'translateY(-16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'alert-out':      { from: { opacity: '1', transform: 'translateY(0)' },     to: { opacity: '0', transform: 'translateY(-12px)' } },
      },
      animation: {
        'fade-in-up':     'fade-in-up 1.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in':        'fade-in 1.5s ease both',
        'slide-left':     'slide-left 1.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'modal-in':       'modal-in 0.22s cubic-bezier(0.22, 1, 0.36, 1) both',
        'modal-out':      'modal-out 0.17s cubic-bezier(0.4, 0, 1, 1) both',
        'overlay-in':     'overlay-in 0.2s ease both',
        'overlay-out':    'overlay-out 0.17s ease both',
        'dropdown-in':    'dropdown-in 0.15s cubic-bezier(0.22, 1, 0.36, 1) both',
        'dropdown-out':   'dropdown-out 0.12s cubic-bezier(0.4, 0, 1, 1) both',
        'accordion-open': 'accordion-open 0.32s cubic-bezier(0.22, 1, 0.36, 1) both',
        'alert-in':       'alert-in 0.22s cubic-bezier(0.22, 1, 0.36, 1) both',
        'alert-out':      'alert-out 0.25s cubic-bezier(0.4, 0, 0.2, 1) both',
      },
    },
  },
  plugins: [],
};
```

Respecto a su `index.css` se omiten `scale-in` y `dropdown-*-up` (no se usan en su código) y `accordion-close` (no tenemos acordeones que cerrar con animación). Se agregan si algún PR los necesita.

## Anexo B · `tramitesColors.js` propuesto

```js
// Etiquetas por rol (texto, no color). Se agrega POSGRADOS, que faltaba.
export const ROLE_LABELS = { ESTUDIANTE: 'ESTUDIANTES', DIRECTOR: 'DIRECTOR DE PROGRAMA', ADMIN: 'ADMINISTRADOR', DEPENDENCIA: 'DEPENDENCIA', POSGRADOS: 'POSGRADOS' };
export const ROLE_USER_LABELS = { /* sin cambios */ };

// Rojo institucional único para todos los roles (mismos tonos que el Módulo de Matrícula).
// Los valores viven en tailwind.config.js; aquí solo se combinan en clases reutilizables.
export const UI = {
  pagina:        'bg-fondo text-gray-900',
  cabecera:      'bg-primario text-white',
  itemActivo:    'bg-primario text-white shadow',
  itemInactivo:  'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
  grupoAbierto:  'bg-primario-suave text-primario',
  itemHoverSalir:'hover:bg-primario-suave hover:text-primario',
  badgeRol:      'bg-primario text-white text-[10px] font-bold uppercase tracking-wider rounded px-2 py-0.5',
  botonPrimario: 'bg-primario text-white hover:bg-primario-hover disabled:cursor-not-allowed disabled:bg-red-400',
  tarjeta:       'rounded-lg border border-gray-200 bg-white shadow',
  campo:         'rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm hover:border-gray-300 focus:border-red-300',
  foco:          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primario-borde',
};

// Tonos de estado: los mapas de estado (EstadoBadge, procesodeGrado, Certificados…) apuntan aquí.
export const TONOS = {
  exito:       'bg-green-100 text-green-700',
  advertencia: 'bg-amber-100 text-amber-800',
  error:       'bg-red-100 text-red-700',
  info:        'bg-blue-100 text-blue-700',
  neutro:      'bg-gray-100 text-gray-600',
};

// Solo para HTML que se abre en otra ventana sin Tailwind (recibo impreso).
export const COLORES_IMPRESION = { primario: '#c10007', texto: '#101828', borde: '#e5e7eb' };
```
