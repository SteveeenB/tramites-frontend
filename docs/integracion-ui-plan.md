# Plan de integración visual: Trámites de Posgrado ↔ Matrícula / Admisiones

> Épica **TP-138 (SC-03)**. Documento de análisis y plan: no aplica cambios.
> Base analizada: nuestro `tramites-frontend` en `main` (`edf1463`) y el frontend del módulo de Matrícula/Admisiones del equipo de desarrollo (`main`, `7e6cf77`), clonado en solo lectura en `../externos/Proyecto-PosgradosUFPS-frontend`.
>
> **Convención de citas:** `src/...` es nuestro repo; `ext:src/...` es el repo del equipo de desarrollo.

> **Seguimiento:** el plan de implementación aprobado y su estado están en `docs/plan-estilo-matricula.md` (implementado el 3 nov 2026).

**Decisión tomada (no se evalúan alternativas):** el rojo es el color institucional UFPS y se usa en **todos los roles**. Se abandona cualquier color por rol. El tono exacto se toma del frontend del equipo de desarrollo (`red-700` primario, `red-800` hover, `red-50/100/200` suaves).

---

## Resumen

1. **El color por rol ya no existe en nuestro `main`.** Desde el commit `11f5ad5`, `src/constants/tramitesColors.js:17-30` asigna a los cinco roles el mismo `RED_THEME`, con `bg-red-600`. `bg-blue-700` no aparece en `src/`. Quedan dos restos:
   - el **tono**: nuestro `#dc2626` frente a su `#c10007`;
   - **25 botones `bg-slate-800`** en las secciones de administración.
2. **El mismo nombre de clase no da el mismo color.** El equipo de desarrollo usa Tailwind v4, cuya paleta está en OKLCH. Su `red-700` es `#c10007`; el `red-700` de nuestro Tailwind 3 es `#b91c1c`. Para igualarlos hay que fijar los hex en `tailwind.config.js` (ver «Propuesta de tokens»). Medido sobre las capturas: su header es `#c10007` y el nuestro `#dc2626`.
3. **La diferencia más visible es el layout, no el color.** Ellos no tienen header en escritorio: el logo, la sesión, el rol y "Cerrar sesión" van en una sidebar de 256 px. Nosotros tenemos un header rojo con título del rol, campana y avatar, y una sidebar de 288–320 px sin logo ni íconos.
4. **Su rojo no cubre todos los roles.** Superadmin usa un tema oscuro `slate-900` (`ext:src/components/AppSidebar.tsx:121-128`, `ext:src/layouts/SuperadminLayout.tsx:24`). La decisión de rojo único aplica a nuestro repo; queda como pregunta abierta si su Superadmin se mantendrá oscuro.
5. **Recomendación:** A (reskin con tokens) + C1 (enlace entre sistemas), con E (CRA → Vite) como fase opcional. Detalle en «Recomendación».

---

## 1. Inventario visual

### 1.1 Stack

| | Equipo de desarrollo | Nosotros |
|---|---|---|
| Build | Vite 8.2 + React 19.2 + **TypeScript 6** (`ext:package.json`) | CRA `react-scripts 5.0.1` + React 19.2 + JavaScript |
| Tailwind | **4.3** vía `@tailwindcss/vite` (`ext:vite.config.ts:4,10`). `@import "tailwindcss"` en `ext:src/index.css:1`. Sin config, sin `@theme`, sin `:root` | **3.4.19**. `tailwind.config.js:4-6` con `extend: {}`. `src/index.css:1-3` |
| Router | `react-router` 7.18 en modo declarativo (`ext:src/main.tsx:79-160`) | `react-router-dom` 7.14 (`src/App.js:29-176`) |
| Íconos | SVG propios (`ext:src/assets/icons.tsx`, 63 exports, 50 archivos) + `@heroicons/react` 2.2 `24/outline` (21 archivos) | 85 `<svg>` inline (23 en tres `icons.jsx`) + 40 emojis. Sin librería |
| Librerías de UI | Ninguna | Ninguna |
| Despliegue | Vercel, rewrite SPA (`ext:vercel.json`) | `public/_redirects` (Netlify/serve) |
| Modo oscuro | No | No |
| Tests | No | No. El CI corre `npm run build` con `CI=true` (`.github/workflows/ci.yml:27-30`): un warning de ESLint rompe el build |

### 1.2 Tokens de color (conteo de clases en `src/`)

**Primario**

| Rol del token | Equipo de desarrollo | Nosotros |
|---|---|---|
| Primario | `bg-red-700` ×57 (`#c10007`) | `bg-red-600` ×25 (`#dc2626`) y `bg-red-500` ×17 |
| Hover primario | `hover:bg-red-800` ×35 (`#9f0712`) | `hover:bg-red-700` ×17 y `hover:bg-red-600` ×11 |
| Texto acento | `text-red-700` ×153 | `text-red-700` ×51 y `text-red-600` ×48 |
| Suaves | `bg-red-50` ×26, `bg-red-100` ×29, `border-red-200` ×52 | `bg-red-50` ×49, `bg-red-100` ×33, `border-red-200` ×21 |
| Foco de input | `focus:border-red-300 focus:ring-2 focus:ring-red-200` (18) | 4 variantes distintas (`focus:border-red-500 focus:ring-red-100`, `focus:border-slate-500`…) |
| Primario de otro tema | Superadmin: `bg-slate-900` ×25, `hover:bg-slate-800` ×20 | Admin y Posgrados: `bg-slate-800` ×23, `hover:bg-slate-700` ×16 |

**Neutros**

| | Equipo de desarrollo | Nosotros |
|---|---|---|
| Escala | `gray` y `neutral` | `slate` ×927, con `gray` ×56 en 3 archivos |
| Fondo de página | `bg-gray-100` (`#f3f4f6`) | `bg-slate-100` (`#f1f5f9`) |
| Tarjeta | `bg-white` ×180 | `bg-white` ×88 |
| Título | `text-gray-900` ×220 | `text-slate-900` ×84 |
| Texto | `text-gray-700` ×123 | `text-slate-600/700` |
| Texto secundario | `text-neutral-400` ×267 (contraste 2.58:1, **no pasa AA**) | `text-slate-400/500` ×131 cada uno |
| Borde | `border-gray-200` ×217 | `border-slate-200` ×89, `border-slate-300` ×46 |

**Estados**

| Estado | Equipo de desarrollo | Nosotros |
|---|---|---|
| Éxito | `green-50/100/700` | `green` y `emerald` mezclados |
| Advertencia | `amber-50/100/200/800`; `yellow` en Badge | `amber-50/100/700/800` |
| Error | `red-50/200/800` (Alerta), `red-100/700` (Badge) | `red-50/100/600/700` |
| Info | `blue-100/700`, solo en Agenda | `blue-100/700` en estados (EN_REVISION, PAGADO) |

- En nuestro repo hay **6 mapas de estado que se contradicen**. Por ejemplo, `EN_REVISION` es azul en `src/components/bandeja-director/EstadoBadge.jsx:5` y amarillo en `src/components/proceso-grado/Etapa2.jsx:8-10`.
- El azul de nuestro repo **no está ligado a ningún rol**: sus 24 usos son estados o etiquetas de tipo.

### 1.3 Tipografía, radios, sombras, espaciado

| Token | Equipo de desarrollo | Nosotros |
|---|---|---|
| Fuente | Fuente de sistema, sin webfont. La regla efectiva es `ext:src/index.css:10` (`'Segoe UI', -apple-system, …`); la de `@layer base` (`:19`) pierde. Además hay `style={{fontFamily}}` inline en 20 vistas | Fuente de sistema. `src/App.css:6-7` (`'Segoe UI','Roboto',…`) gana a `src/index.css:7-9` |
| Tamaños | `text-sm` 574, `text-xs` 242, `text-xl` 37, `text-3xl` **0** | `text-xs` 316, `text-sm` 316, `text-3xl` 14, `text-7xl` en los KPI |
| h1 de página | `text-xl font-bold text-gray-900` | `text-3xl font-bold text-slate-900` (inline) |
| Etiqueta de sección | `text-xs font-semibold uppercase tracking-wider text-neutral-400` | `text-xs font-semibold uppercase tracking-[0.18em] text-slate-400/500` |
| Radios | `rounded-lg` **396**, `rounded-full` 34, `rounded-xl` **3** | `rounded-xl` 109, `rounded-full` 98, `rounded-lg` 95, `rounded-2xl` 69, `rounded-3xl` 39 |
| Sombras | `shadow-sm` 32, `shadow-lg` 5 (alertas), `shadow-xl` 2 (modales) | `shadow-sm` 63, `shadow-2xl` 13 (modales), sombras de color (`shadow-red-200`…) |
| Espaciado | `p-6`, `px-3/4/6`, `py-2.5`, `gap-2/3` | `px-4`, `py-3`, `gap-2/3`, `p-6 md:p-8` |
| Gradientes | 2, solo en login | 21, en las tarjetas KPI (`from-red-400 to-rose-600`…) |
| Animaciones | 11 keyframes propios (`ext:src/index.css:25-264`): `fade-in-up` (×99, 1.5 s), `fade-in`, `slide-left`, `modal-in/out`, `overlay-in/out`, `dropdown-*`, `accordion-*`, `alert-in/out`. `.delay-*` como `animation-delay` (`:268-278`), que choca con `delay-*` de Tailwind | Solo `animate-spin` ×11 y `transition`. `@keyframes App-logo-spin` sin uso (`src/App.css:45`) |

> **Escalas en Tailwind v4.** v4 corrió un paso las escalas: v4 `shadow-sm` = v3 `shadow`, v4 `shadow-xs` = v3 `shadow-sm`, v4 `rounded-sm` = v3 `rounded`, v4 `rounded-xs` = v3 `rounded-sm`. `rounded-lg/xl/2xl`, `shadow-lg/xl/2xl` son iguales en ambas versiones. **Las sombras de sus tarjetas (`shadow-sm` v4) se escriben `shadow` en nuestro Tailwind 3.**

### 1.4 Layout

| Elemento | Equipo de desarrollo | Nosotros |
|---|---|---|
| Shell | `PanelLayout` compartido (`ext:src/layouts/PanelLayout.tsx:32`), `h-screen bg-gray-100` | **Sin layout compartido.** El shell está copiado en 4 páginas: `TramitesView.jsx:78-96`, `ProcesodeGrado.jsx:39-75`, `SolicitudGradoPage.jsx:61-110`, `Certificados.jsx:297-330` |
| Header en escritorio | **No hay** (salvo Posgrados: barra `bg-red-700` con logo, usuario y "Cerrar sesión", `ext:src/layouts/PosgradosLayout.tsx:23-46`) | Barra `bg-red-600` de ~72 px: hamburguesa, título del rol en mayúsculas con `tracking-[0.18em]`, campana, avatar y nombre (`src/components/tramites/TramitesHeader.jsx:9-38`). Sin logo |
| Header en móvil | Mini-header blanco `md:hidden` con hamburguesa, logo y título (`ext:.../PanelLayout.tsx:38-49`) | El mismo header rojo |
| Ancho de sidebar | `w-64` (256 px), `bg-white border-r shadow-sm` (`ext:src/components/AppSidebar.tsx:161`) | `w-72 lg:w-80` (288/320 px), `bg-white border-r` (`src/components/sidebar/AppSidebar.jsx`) |
| Cabecera de sidebar | Bloque `bg-red-700` con logo `logoufps.png` `h-9`, "UFPS" y el título del sistema (`ext:.../AppSidebar.tsx:105-129,167-173`) | Tarjeta de usuario `rounded-2xl bg-slate-50` con avatar de iniciales, rol y programa (`:134-147`) |
| Sesión | Bloque "Sesión activa" `bg-gray-50`: nombre y **badge de rol** `text-[10px] uppercase` blanco sobre `bg-red-700` (`ext:.../AppSidebar.tsx:188-200`) | En el header (nombre) y en la tarjeta de la sidebar (rol en texto) |
| Ítems | `px-3 py-2.5 rounded-lg text-sm font-medium` **con ícono** (`:233`) | `rounded-xl px-4 py-2.5 text-sm font-medium` **sin ícono** (`:19-21`), dentro de un bloque `rounded-2xl bg-slate-50` |
| Ítem activo | **Relleno**: `bg-red-700 text-white shadow-sm` (`:118`) | **Suave**: `bg-red-50 text-red-700 ring-1 ring-red-200` (`tramitesColors.js:20`) |
| Cómo se decide el activo | Por URL (`NavLink`) | Por un `id` en estado (`useTramitesData.js:16,24-27`), no por URL |
| Grupos colapsables | Sí: `bg-red-50 text-red-700` abierto, subitems con `border-l-2 border-red-100` y punto (`:36-99`) | El código los soporta pero no son colapsables (`:56-63`), y ningún ítem de `menuConfig` los usa |
| Ítems bloqueados | Candado + tooltip (`:219-225`) | No hay |
| Cerrar sesión | Al pie, `hover:bg-red-50 hover:text-red-700` (`:250-258`) | Al pie, `hover:bg-red-50 hover:text-red-600` (`:175`) |
| Responsive | Fija desde `md`; en móvil drawer con overlay `bg-black/40 backdrop-blur-sm` (`:266-296`) | Fija desde `lg`; en móvil drawer `-translate-x-full` con overlay `bg-black/40` (`:121`) |
| Breadcrumbs | No hay (`EncabezadoVolver` es lo más cercano) | Texto en mayúsculas repetido en más de 12 sitios; no es componente |
| Contenido | `main p-6` sin `max-w`. 22 vistas repiten `p-6` (doble padding) | `main p-6 md:p-8` sin `max-w` global |
| Pie | No | No |
| Logo | `logoufps.png` en sidebar, login y Posgrados | `UFPS_Logo.png` solo en login; `LOGO.png` como favicon |
| Favicon | Favicon por defecto de Vite (`ext:public/favicon.svg`) | `LOGO.png` |

Capturas de comparación en `docs/integracion-ui/capturas/` (`matricula/` es la referencia; `antes/` y `despues/` son las de esta implementación), tomadas con Playwright y una sesión simulada en `localStorage`, sin backend:

| Pantalla | Equipo de desarrollo | Nosotros |
|---|---|---|
| Login | `matricula/login-programa-escritorio.png`, `matricula/login-aspirante-escritorio.png`, `matricula/login-programa-movil.png` | `antes/login-escritorio.png`, `antes/login-movil.png` |
| Vista interna | `matricula/programa-inicio-*.png`, `matricula/aspirante-inicio-*.png`, `matricula/posgrados-inicio-escritorio.png` | `antes/{estudiante,director,posgrados,admin,dependencia}-tramites-*.png` |

Las vistas internas muestran estados vacíos o "Failed to fetch" por falta de backend; el shell sí es representativo. En el contenedor de pruebas no hay Segoe UI, así que ambos se ven con la fuente de respaldo.

### 1.5 Íconos

- **Equipo de desarrollo:**
  - SVG propios en `ext:src/assets/icons.tsx` (1442 líneas, 63 exports, usados en 50 archivos). Varios llevan el mismo nombre que heroicons (`XMarkIcon`, `CheckCircleIcon`).
  - `@heroicons/react/24/outline` en 21 archivos. No usan solid ni 20/.
  - Tamaños más usados: `h-4 w-4` ×152 y `h-5 w-5` ×111.
- **Nosotros:**
  - 85 `<svg>` inline mezclando dos estilos: Material de relleno y heroicons de trazo.
  - 23 exportados en `src/components/{bandeja-director,proceso-grado,tramites}/icons.jsx`.
  - 40 emojis usados como ícono (🎓 📄 📋 ⏰ 🔔 ✕ ❌), por ejemplo en `BellNotificaciones.jsx:8-12` y `NoAutorizado.js:6`.

### 1.6 Rutas, roles y sesión

| | Equipo de desarrollo | Nosotros |
|---|---|---|
| Login | Fábrica `createAuthService` (`ext:src/services/authService.ts`). `POST /auth/login` con `{username, password, requestedRole}` (`:137-141`). Una pantalla de login por rol | `fetch` directo en `src/pages/Login.jsx:70-73` con `{codigo, contrasena}`, más Google (`:25-48`) y demo (`AuthContext.js:83-95`). **No existe `authService`** |
| Token | `localStorage` con una clave por rol: `ufps_{aspirante,programa,superadmin,posgrados}_{access_token,refresh_token,session}` (`ext:.../authService.ts:104-117`) | `localStorage['auth_token']` (`AuthContext.js:8`). JWT decodificado en cliente (`:10-37`) |
| Refresh | Sí: un reintento con `POST /auth/refresh` ante 401/403 (`ext:.../authService.ts:174`) | No. Ante 401 borra el token y redirige a `/login` (`src/api/apiClient.js:22-25`) |
| Guarda | Cada layout comprueba que exista la sesión de su rol; `session.roles` nunca se lee | `<ProtectedRoute rolesPermitidos>` (`src/components/ProtectedRoute.js`). No comprueba el rol cuando `DEMO_MODE` está activo (`:17`) |
| URL base | `VITE_API_URL` | `REACT_APP_API_URL`, repetida en 6 archivos |
| Backend | Propio | Propio (Spring). JWT firmado con `jwt.secret` (`tramites-backend/src/main/resources/application.properties:91`); CORS con un único `cors.allowed-origin` (`.../config/CorsConfig.java:14`) |

**Correspondencia de roles.** Los literales salen de `requestedRole` en su frontend y de `menuConfig.js` en el nuestro.

| Equipo de desarrollo | Nosotros | Comentario |
|---|---|---|
| `"Aspirante"` (`ext:src/services/aspirante/aspiranteService.ts:64`) | `ESTUDIANTE` | **Supuesto:** el aspirante admitido y matriculado pasa a ser nuestro ESTUDIANTE. No es el mismo momento del ciclo: no hay usuario que use ambos roles a la vez |
| `"Director de programa"` (`ext:src/services/programa/programaService.ts:58`) | `DIRECTOR` | Equivalencia directa. Es el usuario que más se beneficia de navegar entre los dos sistemas |
| `"POSGRADOS"` (`ext:src/services/posgrados/posgradosService.ts:18`) | `POSGRADOS` (`menuConfig.js:15-22`) | Mismo nombre. Ellos: elige un programa y entra como Director, copiando el token (`ext:src/vistas/posgrados/Posgrados.tsx:32-56`). Nosotros: perfil operativo (trámites de grado, paz y salvos, tarifas). **No equivale a nuestro ADMIN** |
| `"Super Administrador"` (`ext:src/services/superadmin/superadminService.ts:20`) | `ADMIN` (`menuConfig.js:26-31`, "es_super_admin en el modelo objetivo") | Ambos configuran catálogos. Ellos usan tema oscuro; nosotros, por decisión, rojo |
| — | `DEPENDENCIA` | Sin equivalente |

---

## 2. Tabla de equivalencias de componentes

| Función | Equipo de desarrollo | Nosotros | Estado |
|---|---|---|---|
| Tabla | `Tabla` (`ext:src/components/Tabla.tsx`): `bg-white border-gray-200 rounded-lg`, cabecera `bg-gray-50`, celdas `px-6 py-4` | Parcial: tabla dentro de `BandejaListadoLayout.jsx:101-134`, más 3 variantes inline en 15 archivos | **Nos falta** un componente genérico |
| Badge de estado | `Badge` (verde/rojo/amarillo/gris, `rounded-lg px-3 py-1`) y `BadgeActiva` | `EstadoBadge.jsx` (`rounded-full px-2.5 py-0.5`) + 6 mapas paralelos | Equivalente, con forma distinta (`rounded-lg` frente a `rounded-full`) |
| Modal | `Modal` (sm/md/lg, `rounded-lg shadow-xl`) | Solo `ModalRechazo` (`rounded-3xl shadow-2xl`) + 13 overlays inline | **Nos falta** un componente genérico |
| Diálogo de confirmación | `Dialogo` / `DialogoConfirmacion` (rojo/verde/neutro) | `window.confirm` (2 usos) + 2 modales propios | **Nos falta** |
| Alerta / toast | `Alerta` (error/éxito/advertencia, arriba al centro, `animate-alert-in`) + `useNotificaciones` en layout | `ToastNotificacion` (abajo a la derecha, solo notificaciones) + 10 `alert()` + errores inline | **Nos falta** para mensajes de la aplicación |
| Botón primario | Constante `BOTON_PRIMARIO` (`ext:src/components/Dialogo.tsx:3-10`); 34 inline `bg-red-700 hover:bg-red-800` | 28 inline `bg-red-600/500` (`rounded-xl px-5 py-3`) | Ninguno de los dos tiene componente `Boton` |
| Botón secundario | `BOTON_SECUNDARIO` (`:11`) | ~39 inline `border-slate-200/300 hover:bg-slate-50` | Igual |
| Input | `InputField` (con mostrar/ocultar contraseña) + patrón `CAMPO` | 27 `<input>` inline con 4 estilos de foco | **Nos falta** |
| Select | `Select` propio con portal, búsqueda y temas | 7 `<select>` nativos | **Nos falta** (opcional) |
| DatePicker / TimePicker | Propios, en español | `<input type="date">` en 1 sitio | Ellos tienen, nosotros no; baja prioridad |
| Buscador con filtro | `BuscadorConFiltro` | Búsqueda en `EstadoEstudiantes.jsx:104-110`; pastillas de filtro inline | **Nos falta** |
| Paginación | `Paginacion` | **No existe** | **Nos falta** |
| Loader | `Cargando` (spinner `text-red-700` + texto) | Spinner SVG copiado 11 veces; `<div>Cargando...</div>` en `ProtectedRoute.js:13` | **Nos falta** |
| Tarjeta | Patrón `bg-white border-gray-200 rounded-lg p-4/5/6` (106 usos) | `TarjetaAccion` (`rounded-3xl … shadow-sm`) + patrón `rounded-2xl/3xl` | Forma distinta (`rounded-lg` frente a `rounded-3xl`) |
| Encabezado con "Volver" | `EncabezadoVolver` | Dentro de `BandejaListadoLayout.jsx:62-69`; enlaces sueltos | Parcial |
| KPI / estadísticas | `TarjetasEstadisticas`, `BarraProgreso`, `TarjetaProgreso` | `TarjetaEstado` copiado 4 veces (gradiente, `text-7xl`) | Estilos muy distintos |
| Sidebar | `AppSidebar` | `AppSidebar` | Equivalente, con estilo distinto |
| Header | Solo en Posgrados | `TramitesHeader` | **Solo nosotros** |
| Campana de notificaciones (SSE) | — | `BellNotificaciones` | **Solo nosotros** |
| Breadcrumb | — | Texto en mayúsculas repetido | Solo nosotros, sin componente |
| Agenda, Catálogo | `Agenda`, `Catalogo` | — | Específicos de su dominio; no los necesitamos |
| Página de login | `PaginaAuth` + `LoginForm` + `SelectorTipoUsuario` | `Login.jsx` con estilos inline | Equivalente; el nuestro no usa Tailwind |

---

## 3. Brechas visuales

### 3.1 Migración al rojo único (inventario)

**`src/constants/tramitesColors.js`**
- `ROLE_COLORS` ya apunta al mismo `RED_THEME` en los cinco roles (`:17-30`). Lo usan 3 archivos, con 8 usos:
  - `src/components/sidebar/AppSidebar.jsx:37,135,192,205`
  - `src/components/tramites/TramitesHeader.jsx:10`
  - `src/components/notificaciones/BellNotificaciones.jsx:54,94,139`
- Lo pendiente es **el tono** (`bg-red-600` → primario `#c10007`) y quitar las claves por rol.

**Rojo primario `bg-red-600/500` + hover: 28 líneas**
- `src/components/bandeja-director/`: `ModalRechazo.jsx:79`, `TarjetaSolicitud.jsx:127`
- `src/components/proceso-grado/`: `ConfirmacionGrado.jsx:40,237,354`, `DetalleEtapa1.jsx:152`, `Etapa2.jsx:102,143`, `ModalPagoPSE.jsx:134`, `TarjetaLiquidacion.jsx:75`
- `src/components/tramites/TarjetaAccion.jsx:24`
- `src/pages/`:
  - `BandejaCertificadosPosgrados.jsx:206`
  - `BandejaDependencia.jsx:100,225,254`
  - `Certificados.jsx:283`
  - `ListaSolicitudesDirector.jsx:118,169`
  - `ListaSolicitudesGrado.jsx:163,222`
  - `ListaSolicitudesPosgrados.jsx:90,238,273`
  - `PazYSalvoDirector.jsx:69,158`
  - `ResultadoPago.jsx:132`
  - `SolicitudGradoPage.jsx:208`
  - `VerificarCertificado.jsx:75`

**Headers con `bg-red-600` escrito a mano, sin `ROLE_COLORS`**
- `src/pages/ProcesodeGrado.jsx:49,61`
- `src/pages/Certificados.jsx:307,319`
- `src/pages/SolicitudGradoPage.jsx:71,83`
- `src/pages/VerificarCertificado.jsx:35-52`

**Hex inline**
- `src/pages/Login.jsx:142-179` (`#dc2626`, `#fecaca`, `#f0f4f8`…)
- `src/pages/NoAutorizado.js:5`

**Slate como primario en vistas de ADMIN y POSGRADOS: 25 ocurrencias de `bg-slate-800` en 14 archivos**
- `src/pages/posgrados/` (21):
  - `SeccionDependencias.jsx:111,274,346`
  - `SeccionFechasGrado.jsx:76,132`
  - `SeccionTiposCertificado.jsx:91,220`
  - `SeccionTiposTramite.jsx:56`
  - `SeccionPlantillasCertificado.jsx:196,230`
  - `SeccionDocumentosRequeridos.jsx:38,51`
  - `SeccionPlantillasCorreo.jsx:52,102`
  - `SeccionAuditoria.jsx:40,54`
  - `SeccionUsuarios.jsx:46,64`
  - `SeccionReportes.jsx:41`
  - `SeccionConfiguracionGlobal.jsx:80`
  - `SeccionProgramas.jsx:32`
- `src/components/proceso-grado/ConfirmacionGrado.jsx:354,385`. Es la vista ESTUDIANTE (opción "secretaría" frente a "ceremonia"): **no está ligado al rol**, pero conviene revisarlo con el resto de botones.
- 7 de esas secciones **no se enrutan** (código muerto): `SeccionUsuarios`, `SeccionProgramas`, `SeccionPlantillasCorreo`, `SeccionDocumentosRequeridos`, `SeccionReportes`, `SeccionAuditoria` y `SeccionConfiguracionGlobal`. Hay que decidir si se migran o se borran.
- Se excluye `ModalRechazo.jsx:27` (`bg-slate-900/50`): es el overlay, no un primario.

**Azul (`*-blue-*`): 24 ocurrencias en 12 archivos.** Ninguna ligada a DIRECTOR o ADMIN: son estados (`EN_REVISION`, `PAGADO`, `REQUISITOS_COMPLETOS`) o tipos (`MAESTRIA`, `INT`). Se conservan como color de estado "info". Única dudosa: `src/pages/DetalleSolicitudDirector.jsx:55`, el código de solicitud en `text-blue-700 font-mono`; es bajo impacto.

### 3.2 Cómo indicar el rol sin color

Así lo resuelve el equipo de desarrollo:
- **Badge de rol** en el bloque "Sesión activa" de la sidebar: `text-[10px] uppercase`, blanco sobre `bg-red-700` (`ext:src/components/AppSidebar.tsx:188-200`).
  - Los textos son "Director" en `ProgramaLayout`, "Aspirante" y "Administrador".
- **Título del panel** en la cabecera de la sidebar y en el mini-header móvil:
  - "Sistema de Posgrados" en `ext:src/layouts/ProgramaLayout.tsx:21`.
  - "Administrativo" en `ext:src/layouts/SuperadminLayout.tsx:22`.
  - "Usuario Posgrados" en el header de `ext:src/layouts/PosgradosLayout.tsx:33-46`.
- **Menú propio por rol.**

Propuesta para nosotros, siguiendo ese patrón:
1. **Badge de rol** en un bloque "Sesión activa" de la sidebar, con el mismo estilo que el suyo y el texto de `ROLE_USER_LABELS`.
2. **Título del sistema** en la cabecera roja de la sidebar: "UFPS · Sistema de Posgrados", con el subtítulo "Trámites". Así el usuario ve el mismo encabezado en ambos módulos y sabe en cuál está.
3. **Título de página** (h1) con el nombre de la vista, no del rol. Hoy el header muestra "DIRECTOR DE PROGRAMA" en mayúsculas espaciadas (`TramitesHeader.jsx:24`).
4. Completar `ROLE_LABELS` con `POSGRADOS`. Hoy falta, y el header muestra el literal crudo (`tramitesColors.js:1-6`).

### 3.3 Diferencias concretas

| Elemento | Equipo de desarrollo | Nosotros | Impacto | Esfuerzo de igualar |
|---|---|---|---|---|
| Tono primario | `#c10007` / hover `#9f0712` | `#dc2626` / hover `#b91c1c` | **Alto**: se nota al pasar de un sistema al otro | Bajo con tokens + reemplazo de ~45 líneas |
| Header en escritorio | No hay; todo va en la sidebar | Barra roja de 72 px con título de rol, campana y avatar | **Alto**: es lo primero que delata dos sistemas | Medio (ver opciones en 3.4) |
| Cabecera de sidebar con logo | Bloque rojo con logo UFPS y nombre del sistema | Tarjeta gris de usuario, sin logo | **Alto** | Bajo |
| Ítem activo | Relleno `bg-red-700 text-white` | Suave `bg-red-50 text-red-700 ring` | **Alto** | Bajo (`AppSidebar.jsx:19-21` + token) |
| Íconos en el menú | Sí | No | Medio | Bajo-medio (hay que elegir 15 íconos) |
| Ancho de sidebar | 256 px | 288/320 px | Medio | Bajo |
| Grupos colapsables | Sí | No | Bajo (nuestros menús son cortos) | Medio |
| Breakpoint de sidebar fija | `md` | `lg` | Bajo | Bajo |
| Fondo de página | `gray-100` `#f3f4f6` | `slate-100` `#f1f5f9` | Bajo | Bajo (el `slate` está en 927 clases: se puede cambiar solo en el shell) |
| Radios | `rounded-lg` dominante | `rounded-xl/2xl/3xl` | **Medio-alto**: nuestras tarjetas se ven más "infladas" | Medio (~250 clases) |
| Sombras | Planas (`shadow-sm` v4 / `shadow-lg` en flotantes) | `shadow-2xl` en modales, sombras de color | Medio | Bajo-medio |
| Escala de gris | `gray`/`neutral` | `slate` (azulado) | Bajo-medio | Alto si se hace completo; no recomendado al principio |
| h1 de página | `text-xl font-bold` | `text-3xl font-bold` | Medio | Bajo |
| KPI | Tarjetas blancas `text-2xl` | Gradientes, `text-7xl font-black`, `rounded-3xl p-10` | **Alto** en las bandejas | Medio |
| Login | Tarjeta con cabecera de degradado rojo, íconos, selector de tipo de usuario y fondo decorativo | Tarjeta blanca simple, estilos inline | **Alto**: es la puerta de entrada | Medio |
| Toasts y alertas | Arriba al centro, colores por tipo | `alert()` nativo y errores inline | Medio | Medio |
| Botones | `rounded-lg px-4–6 py-2–2.5` | `rounded-xl px-5 py-3` | Medio | Bajo con componente `Boton` |
| Animaciones | Entrada `fade-in-up` en tarjetas y `slide-left` en el menú | Ninguna | Bajo-medio | Bajo (keyframes en config) |
| Íconos | Heroicons outline + SVG propios en el mismo estilo de trazo | Mezcla de relleno y trazo, más emojis | Medio | Medio |
| Favicon | El de Vite (morado) | Logo UFPS | Bajo (problema de ellos) | — |

### 3.4 Header y sidebar: opciones (decisión de diseño del equipo)

- **H1. Quitar nuestro header de escritorio y adoptar su `PanelLayout`.** Cabecera roja con logo en la sidebar, bloque "Sesión activa", y mini-header blanco solo en móvil.
  - Pros: idéntico a Programa, Aspirante y Superadmin.
  - Contras: la campana de notificaciones necesita otro sitio. Se puede poner en la cabecera roja de la sidebar o en el bloque de sesión. **Supuesto:** el Figma no cubre la campana.
- **H2. Mantener un header superior, pero como el de `PosgradosLayout`.** Fondo `#c10007`, logo `h-8`, "Usuario …", nombre y "Cerrar sesión", más la campana.
  - Pros: menos cambio; conserva la campana.
  - Contras: solo se parece a una de sus cuatro vistas, y esa vista no tiene sidebar.
- **H3. Híbrido.** Sidebar como la suya (logo, sesión, badge, activo relleno) y un header blanco delgado solo con la campana y el título de página.
  - Pros: conserva la funcionalidad.
  - Contras: es un tercer patrón que no existe en ninguno de los dos sistemas.

---

## 4. Estrategias evaluadas

| Criterio | A. Reskin | B. Tokens compartidos | C. Navegación | D. Migrar a su stack | E. CRA → Vite |
|---|---|---|---|---|---|
| Consistencia visual lograda | Alta (~90 %; el resto depende del Figma) | Igual que A en tokens; mayor si se comparten componentes | No aporta consistencia por sí sola; la hace perceptible | Máxima | Ninguna directa |
| Esfuerzo (nuestro equipo) | 6–9 días-persona *(estimado)* | +2–4 días sobre A para un archivo de tokens sincronizado. Paquete npm: +5 días y CI de publicación | C1: 1–4 días según la sesión. C2: 3–5. C3: 10+ | 25–40 días-persona *(estimado, ver abajo)* | 1–2 días-persona |
| Riesgo de romper | Bajo-medio: solo clases; sin tests, pero el CI valida el build | Bajo (archivo de tokens) a medio (paquete) | C1 bajo; C2 medio; C3 alto | Alto | Medio-bajo: variables `REACT_APP_*` → `import.meta.env.VITE_*` en 6+ archivos, `index.html`, CI |
| Dependencia del otro equipo | Ninguna (solo leer su código; el Figma ayuda) | Alta: deben aceptar importar o sincronizar | Alta: un enlace en su sidebar y, opcionalmente, un endpoint de sesión | Muy alta: trabajo en su repo | Ninguna |
| Mantenimiento | Hay que re-sincronizar a mano si ellos cambian | Mejor: una fuente de verdad | C1 trivial; C3 costoso (dos builds acoplados) | Un solo código | Mejor: CRA está deprecado y sin mantenimiento |
| Impacto en despliegue | Ninguno | Archivo copiado: ninguno. Paquete: registro npm o dependencia git en ambos builds | C1: solo URLs por entorno. C2: CSP/`X-Frame-Options`. C3: orquestar los dos despliegues | Nuestro despliegue desaparece; Vercel de ellos | Cambia el comando de build y la carpeta de salida (`build/` → `dist/`) |
| Compatibilidad técnica | Total: Tailwind 3 admite hex en `theme.extend` | Ver nota B | Ver nota C | TS 6 + Tailwind 4 + `react-router` | Habilita Tailwind 4 y Module Federation más adelante |

**Nota B: compartir entre JS/Tailwind 3 y TS/Tailwind 4.**
- Tailwind 4 lee tokens de CSS (`@theme { --color-… }`); Tailwind 3 los lee de `tailwind.config.js`. **No hay un formato que ambos consuman sin adaptación.**
- Opciones viables:
  - (i) un `tokens.json` como fuente, del que se generan `@theme` y `theme.extend` con un script de ~30 líneas, sin dependencias;
  - (ii) variables CSS en `:root` que ambos importan; nosotros las referenciamos con `colors: { primario: 'var(--ufps-primario)' }`. En Tailwind 3 eso **pierde los modificadores de opacidad** (`bg-primario/50`) salvo con el formato `rgb(var(--x) / <alpha-value>)`.
- TS frente a JS no importa para los tokens. Sí importa para componentes compartidos: un paquete en TS necesita compilarse a JS para nuestro CRA, porque CRA no transpila `node_modules`.
- **Compartir componentes no es viable sin un paquete compilado**: sus componentes dependen de clases Tailwind 4 (`bg-linear-to-r`, escala `shadow` corrida) que nuestro Tailwind 3 no genera.

**Nota C: navegación entre sistemas.** Los dos frontends viven en orígenes distintos, así que `localStorage` no se comparte, y cada backend firma su propio JWT.
- **C1. Enlace con sesión.** Un ítem "Trámites de grado" en su sidebar que abre nuestra app, y uno "Matrícula y admisiones" en la nuestra. Tres niveles de sesión:
  - **C1a. Re-login.** Sin cambios de backend. Defendible en un proyecto académico, pero el usuario nota el cambio.
  - **C1b. Intercambio de token.** Su frontend llama a nuestro backend con su JWT (`POST /api/auth/exchange`); nuestro backend lo valida contra el suyo (endpoint de introspección o clave pública) y devuelve un `auth_token` nuestro. Ese token viaja en el **fragmento** de la URL (`/sso#token=…`, que no llega a logs ni a `Referer`) a una ruta nuestra `/sso` que llama a `AuthContext.login`.
    - Es el patrón que ellos ya usan internamente para pasar de Posgrados a Programa (`ext:src/vistas/posgrados/Posgrados.tsx:32-56`).
    - Requiere acordar la correspondencia de identidad: su `username` frente a nuestra `cedula`/`codigo`. **Supuesto:** no verificado, depende de su backend.
  - **C1c. Secreto JWT compartido** con los mismos claims. Es simple, pero acopla la seguridad de ambos sistemas y obliga a unificar claims (`rol`, `cedula`) que hoy difieren. No recomendado.
- **C2. iframe** de nuestra app dentro de su layout.
  - Duplica sidebars, a menos que añadamos un modo "embebido".
  - Requiere permitir el framing (`frame-ancestors`).
  - Los navegadores particionan el almacenamiento de terceros, así que la sesión sigue necesitando C1b.
  - La experiencia en móvil es mala. Poco defendible.
- **C3. Micro-frontend** (Module Federation o similar).
  - CRA no lo soporta sin eyectar o usar craco, así que exige E primero.
  - Choque de Tailwind 3 y 4 (dos preflights) y dos routers.
  - Costoso y frágil para el alcance académico. No recomendado.

**Nota D: números de la migración.**
- **Nuestro repo:** 82 archivos JS/JSX con ~9 900 líneas: 27 componentes, 34 páginas (incluidas 15 de `pages/posgrados/`), 8 módulos `api`, 6 hooks y `AuthContext`.
- **Su repo:** 120 archivos TS/TSX con ~24 000 líneas.
- Migrar supone:
  - tipar ~9 900 líneas;
  - reescribir las clases a la escala de Tailwind 4;
  - unificar dos modelos de sesión (`auth_token` frente a claves por rol) y dos routers;
  - adaptar el SSE de notificaciones;
  - que su equipo revise e integre todo en su repo.
- Estimado: **25–40 días-persona**, más coordinación. Es desproporcionado frente a A + C1 a estas alturas del semestre.

**Nota E: CRA → Vite.** No hace falta para A ni para C1. Sí facilita B en la variante "mismo formato": con Vite podríamos subir a Tailwind 4 e importar literalmente su CSS de tokens. También es requisito para C3. Como CRA está deprecado, conviene hacerlo en algún momento, pero **no en el camino crítico de TP-138**.

---

## 5. Recomendación

**A + C1, con C1a ya y C1b como meta. E queda opcional, después de la fase 3.**

1. A da el ~90 % de la percepción de "un solo sistema" con riesgo bajo y sin depender de que el otro equipo cambie nada. Los colores se fijan en hex, así que el tono queda idéntico aunque usemos Tailwind 3.
2. Que el usuario sienta que es un solo sistema depende sobre todo del shell (sidebar con logo, sesión y activo relleno), del tono y del login, y los tres se resuelven en las fases 1 y 2.
3. C1a (enlace + re-login) es inmediato y solo pide al otro equipo un ítem de menú. C1b sigue un patrón que ellos ya usan entre Posgrados y Programa, y es defendible académicamente: intercambio de token validado por el backend, sin secretos compartidos.
4. B no compensa hoy: Tailwind 3 y 4 no comparten formato de configuración y su paleta es la de Tailwind por defecto. Con copiar unos 20 valores hex en nuestro `theme.extend` basta.
5. D cuesta 25–40 días-persona. C2 y C3 añaden fragilidad sin mejorar lo que el usuario percibe.

---

## 6. Propuesta de tokens

> **Propuesta, no aplicada.** Los valores son los hex de la paleta por defecto de Tailwind v4.3 (convertidos desde OKLCH de `node_modules/tailwindcss/theme.css`). Coinciden con lo medido en las capturas (`#c10007` en su sidebar, `#f3f4f6` de fondo).
>
> **Supuesto:** el Figma usa estos mismos valores. No hay acceso para confirmarlo; si el Figma define otro rojo (por ejemplo el del logo, ≈`#E2001A` estimado visualmente), basta con cambiar `primario` en un solo lugar.

### 6.1 Tailwind 3: `tailwind.config.js` (nuestro repo)

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta roja de Tailwind v4 (la que usa el módulo de Matrícula).
        // Sobrescribe la roja de Tailwind 3 para que red-50…red-950 rindan igual en ambos sistemas.
        red: {
          50: '#fef2f2', 100: '#ffe2e2', 200: '#ffc9c9', 300: '#ffa2a2', 400: '#ff6467',
          500: '#fb2c36', 600: '#e7000b', 700: '#c10007', 800: '#9f0712', 900: '#82181a', 950: '#460809',
        },
        // Alias semánticos: usar estos en código nuevo.
        primario: {
          DEFAULT: '#c10007', // red-700 v4: botones, activo de sidebar, cabecera
          hover:   '#9f0712', // red-800 v4
          suave:   '#fef2f2', // red-50 v4: fondos de grupo abierto y opción seleccionada
          claro:   '#ffe2e2', // red-100 v4: badges
          borde:   '#ffc9c9', // red-200 v4: bordes y anillos de foco
        },
        // Fondo de página de su PanelLayout (gray-100 v4 = gray-100 v3).
        fondo: '#f3f4f6',
      },
      fontFamily: {
        // Misma pila efectiva que ext:src/index.css:10
        sans: ['"Segoe UI"', '-apple-system', 'BlinkMacSystemFont', 'Roboto', 'Oxygen', 'Ubuntu',
               'Cantarell', '"Fira Sans"', '"Droid Sans"', '"Helvetica Neue"', 'sans-serif'],
      },
      width: { sidebar: '16rem' }, // w-64, el ancho de su AppSidebar
      // Radios y sombras: NO se redefinen. Se usa la tabla de equivalencias de abajo
      // para no alterar las ~250 clases rounded-*/shadow-* existentes.
      keyframes: {
        'fade-in-up':      { from: { opacity: '0', transform: 'translateY(36px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'fade-in':         { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-left':      { from: { opacity: '0', transform: 'translateX(-48px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        'scale-in':        { from: { opacity: '0', transform: 'scale(0.92)' }, to: { opacity: '1', transform: 'scale(1)' } },
        'modal-in':        { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'modal-out':       { from: { opacity: '1', transform: 'translateY(0)' }, to: { opacity: '0', transform: 'translateY(8px)' } },
        'overlay-in':      { from: { opacity: '0' }, to: { opacity: '1' } },
        'overlay-out':     { from: { opacity: '1' }, to: { opacity: '0' } },
        'dropdown-in':     { from: { opacity: '0', transform: 'translateY(-6px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'dropdown-out':    { from: { opacity: '1', transform: 'translateY(0)' }, to: { opacity: '0', transform: 'translateY(-6px)' } },
        'accordion-open':  { from: { opacity: '0', transform: 'translateY(-8px)', maxHeight: '0' }, to: { opacity: '1', transform: 'translateY(0)', maxHeight: '10000px' } },
        'accordion-close': { from: { opacity: '1', transform: 'translateY(0)', maxHeight: '10000px' }, to: { opacity: '0', transform: 'translateY(-8px)', maxHeight: '0' } },
        'alert-in':        { from: { opacity: '0', transform: 'translateY(-16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'alert-out':       { from: { opacity: '1', transform: 'translateY(0)' }, to: { opacity: '0', transform: 'translateY(-12px)' } },
      },
      animation: {
        'fade-in-up':      'fade-in-up 1.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in':         'fade-in 1.5s ease both',
        'slide-left':      'slide-left 1.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'scale-in':        'scale-in 1.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'modal-in':        'modal-in 0.22s cubic-bezier(0.22, 1, 0.36, 1) both',
        'modal-out':       'modal-out 0.17s cubic-bezier(0.4, 0, 1, 1) both',
        'overlay-in':      'overlay-in 0.2s ease both',
        'overlay-out':     'overlay-out 0.17s ease both',
        'dropdown-in':     'dropdown-in 0.15s cubic-bezier(0.22, 1, 0.36, 1) both',
        'dropdown-out':    'dropdown-out 0.12s cubic-bezier(0.4, 0, 1, 1) both',
        'accordion-open':  'accordion-open 0.32s cubic-bezier(0.22, 1, 0.36, 1) both',
        'accordion-close': 'accordion-close 0.32s cubic-bezier(0.22, 1, 0.36, 1) both',
        'alert-in':        'alert-in 0.22s cubic-bezier(0.22, 1, 0.36, 1) both',
        'alert-out':       'alert-out 0.25s cubic-bezier(0.4, 0, 0.2, 1) both',
      },
    },
  },
  plugins: [],
};
```

**Notas:**
- **Retardos escalonados.** No copiar sus clases `.delay-*` (`ext:src/index.css:268-278`), porque chocan con `delay-*` de Tailwind. Usar la propiedad arbitraria de Tailwind 3: `[animation-delay:100ms]`.
- **Accesibilidad.** Respetar `motion-reduce:animate-none` en las animaciones de 1.5 s.
- **Gris y neutral.** No se sobrescriben. La diferencia v3/v4 es imperceptible (p. ej. `gray-500` `#6b7280` frente a `#6a7282`).
- **Sombra coloreada.** Si se mantiene alguna, cambiar `shadow-red-200` por `shadow-primario/20`.

**Equivalencia de escalas (para traducir sus clases a las nuestras)**

| Clase en Tailwind 4 (ellos) | Equivale en Tailwind 3 (nosotros) |
|---|---|
| `shadow-xs` | `shadow-sm` |
| `shadow-sm` / `shadow` | `shadow` |
| `rounded-xs` | `rounded-sm` |
| `rounded-sm` | `rounded` |
| `bg-linear-to-r` | `bg-gradient-to-r` |
| `rounded-lg`, `rounded-xl`, `shadow-lg`, `shadow-xl`, `shadow-2xl` | iguales |

### 6.2 Tailwind 4: `@theme` (por si se comparte)

```css
/* tokens-ufps.css — mismo contenido semántico para el frontend de Matrícula (Tailwind 4) */
@import "tailwindcss";

@theme {
  /* Alias semánticos sobre la paleta por defecto de v4 (que ya usan) */
  --color-primario: var(--color-red-700);       /* #c10007 */
  --color-primario-hover: var(--color-red-800); /* #9f0712 */
  --color-primario-suave: var(--color-red-50);
  --color-primario-claro: var(--color-red-100);
  --color-primario-borde: var(--color-red-200);
  --color-fondo: var(--color-gray-100);

  --font-sans: "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, Oxygen, Ubuntu,
               Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  --width-sidebar: 16rem;

  --animate-fade-in-up: fade-in-up 1.5s cubic-bezier(0.22, 1, 0.36, 1) both;
  --animate-modal-in:   modal-in 0.22s cubic-bezier(0.22, 1, 0.36, 1) both;
  --animate-alert-in:   alert-in 0.22s cubic-bezier(0.22, 1, 0.36, 1) both;
  /* …resto de --animate-* igual que 6.1; los @keyframes se declaran dentro de @theme */
  @keyframes fade-in-up { from { opacity: 0; transform: translateY(36px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes modal-in   { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes alert-in   { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: translateY(0); } }
}
```

Si ambos equipos adoptan los alias `primario-*`, un cambio de tono definido en el Figma se aplica en un solo lugar de cada repo. Si en el futuro migramos a Vite + Tailwind 4 (E), este archivo se podría importar tal cual.

---

## 7. Mapa de cambios (nuestro repo)

| Archivo | Cambio |
|---|---|
| `tailwind.config.js` | Añadir `theme.extend` (sección 6.1) |
| `src/index.css` / `src/App.css` | Dejar una sola pila de fuentes (o delegarla a `font-sans` en `body`). Borrar el boilerplate de CRA (`.App`, `.App-logo`, `@keyframes App-logo-spin`, `App.css:45`). `bg-fondo` en `body` |
| **Nuevo** `src/components/layout/PanelLayout.jsx` | Shell único: sidebar + (header según H1/H2/H3) + `main p-6`, con `<Outlet>`. Sustituye el shell copiado en `TramitesView.jsx:78-96`, `ProcesodeGrado.jsx:39-75`, `SolicitudGradoPage.jsx:61-110` y `Certificados.jsx:297-330`. Se envuelve con `<ProtectedRoute rolesPermitidos>` en `App.js` |
| `src/App.js` | Anidar `/proceso-de-grado`, `/certificados` y `/proceso-de-grado/solicitud-grado` bajo el nuevo layout. Revisar las 3 rutas sueltas sin layout (`:150-173`). Añadir `/sso` si se hace C1b. Añadir catch-all 404 |
| `src/components/sidebar/AppSidebar.jsx` | Ancho `w-sidebar` (`w-64`). Cabecera `bg-primario` con logo (`UFPS_Logo.png` o el logo cuadrado) y "Sistema de Posgrados · Trámites". Bloque "Sesión activa" + badge de rol. Ítems con ícono, `rounded-lg`, activo `bg-primario text-white shadow-sm`, inactivo `text-gray-600 hover:bg-gray-100`. Activo por URL (`NavLink`) en lugar de `selectedMenuId`. Breakpoint `md`. Opcional: grupos colapsables |
| `src/components/tramites/TramitesHeader.jsx` | Según la opción de 3.4: eliminar en escritorio (H1), reestilizar como el header de Posgrados (H2) o reducir a barra blanca (H3). En todos los casos, `ROLE_LABELS` deja de ser el título principal |
| `src/components/notificaciones/BellNotificaciones.jsx` | Quitar `ROLE_COLORS` (`:54,94,139`) → `bg-primario`. Reubicar según H1/H2/H3. Cambiar los emojis de tipo (`:8-12`) por íconos |
| `src/components/notificaciones/ToastNotificacion.jsx` | Alinear con su `Alerta` (`rounded-lg shadow-lg`, `animate-alert-in`). Cambiar el ✕ (`:53`) por un ícono |
| `src/constants/tramitesColors.js` | Ver 7.1 |
| `src/config/menuConfig.js` | Añadir `icon` a cada ítem. Añadir el ítem externo "Matrícula y admisiones" (C1) con `externo: true` y una URL configurable (`REACT_APP_MATRICULA_URL`) |
| **Nuevos** componentes base en `src/components/ui/` | `Boton.jsx` (primario/secundario/peligro/éxito), `Badge.jsx` (con mapas de estado unificados), `Modal.jsx`, `DialogoConfirmacion.jsx`, `Alerta.jsx` (+ `useAlerta`), `InputField.jsx`, `Tabla.jsx`, `Paginacion.jsx`, `Cargando.jsx`, `Tarjeta.jsx`, `EncabezadoPagina.jsx` (breadcrumb + h1 + volver). La API sigue la suya, traducida a JS (ver sección 2) |
| **Nuevo** `src/components/ui/icons.jsx` | Unificar los 3 `icons.jsx` y los SVG sueltos en estilo heroicons outline de trazo, `h-4/h-5`. Hay dos caminos: SVG copiados (sin dependencia) o `@heroicons/react` (+1 dependencia, que ellos ya usan; justificable por la consistencia). Decisión del equipo |
| `src/constants/procesodeGrado.js`, `EstadoBadge.jsx`, `Etapa2.jsx:8-10`, `Certificados.jsx:10-15`, `BandejaCertificadosPosgrados.jsx:13-17`, `PazYSalvoDirector.jsx:7-9`, `EstadoEstudiantes.jsx:6-13` | Unificar en un único `constants/estados.js` que consuma `Badge` |
| 28 líneas de primario rojo (lista en 3.1) | `bg-red-600/500 hover:bg-red-700/600` → `<Boton>` o `bg-primario hover:bg-primario-hover` |
| 21 ocurrencias `bg-slate-800` en `src/pages/posgrados/Seccion*.jsx` + `ConfirmacionGrado.jsx:354,385` | Botones → `bg-primario`. Pastillas de filtro activas → `bg-primario-suave text-primario`, o relleno como su activo. Antes, decidir qué hacer con las 7 secciones sin ruta |
| `src/pages/Login.jsx` | Reescribir sin estilos inline, con Tailwind, siguiendo `ext:src/components/auth/PaginaAuth.tsx` y `LoginForm.tsx`: cabecera roja, campos con ícono, botón `bg-primario` |
| `src/pages/NoAutorizado.js` | Pasar a `.jsx` con Tailwind; quitar el emoji ❌ |
| `src/pages/BandejaDirector.jsx:36`, `BandejaGrado.jsx:36`, `BandejaPosgrados.jsx:52`, `BandejaDependencia.jsx:110` | Sustituir `TarjetaEstado` (gradientes, `text-7xl`) por una tarjeta estilo `TarjetasEstadisticas` |
| `src/pages/VerificarCertificado.jsx:35-52` | Header público con el mismo estilo que la cabecera de la sidebar |
| `public/index.html` | `lang="es"`, `theme-color` `#c10007` |
| Varias páginas | `rounded-3xl/2xl` → `rounded-lg` en tarjetas; `shadow-2xl` → `shadow-xl` en modales; h1 `text-3xl` → `text-xl` (fase 3, pantalla por pantalla) |

### 7.1 `tramitesColors.js`: eliminar o convertir en tokens rojos sin claves por rol

- **Propuesta 1, eliminarlo** (preferida si se crean los componentes base).
  - Borrar `ROLE_COLORS` y `RED_THEME`.
  - Los 8 usos (`AppSidebar.jsx:37,135,192,205`, `TramitesHeader.jsx:10`, `BellNotificaciones.jsx:54,94,139`) pasan a clases semánticas `bg-primario`, `bg-primario-suave text-primario`, etc.
  - Mover `ROLE_LABELS` y `ROLE_USER_LABELS` (son textos, no colores) a `src/constants/roles.js`, y añadir la etiqueta que falta para `POSGRADOS`.
- **Propuesta 2, convertirlo en un único conjunto de tokens.** Renombrarlo a `src/constants/uiClasses.js` y exportar un solo objeto, sin claves por rol:
  ```js
  export const UI = {
    cabecera:   'bg-primario text-white',
    itemActivo: 'bg-primario text-white shadow-sm',
    grupoAbierto: 'bg-primario-suave text-primario',
    badgeRol:   'bg-primario text-white text-[10px] font-semibold uppercase',
  };
  ```
  Los 3 importadores cambian `ROLE_COLORS[rol].x` por `UI.x`.

En ambos casos, CI exige que no queden imports sin usar: verificar con `npm run build` usando `CI=true`.

---

## 8. Plan por fases

Hay dos columnas de responsables: «Nuestro equipo» y «Equipo de desarrollo (Matrícula)». Cada subtarea propuesta lleva un código para crearla bajo **TP-138**.

### Fase 1: tokens y layout

| Código | Responsable | Subtarea |
|---|---|---|
| UI-01 | Nuestro equipo | Añadir `theme.extend` (6.1); limpiar `index.css`/`App.css` |
| UI-02 | Nuestro equipo | Refactorizar `tramitesColors.js` (7.1) y sus 3 importadores |
| UI-03 | Nuestro equipo | Crear `PanelLayout.jsx` y retirar los 4 shells copiados |
| UI-04 | Nuestro equipo | Reestilizar `AppSidebar` (logo, sesión, badge de rol, activo relleno, ancho, íconos, activo por URL) |
| UI-05 | Nuestro equipo | Aplicar la opción de header elegida (H1/H2/H3) y reubicar la campana |
| UI-06 | Equipo de desarrollo | Confirmar paleta, Figma y su decisión sobre el tema oscuro de Superadmin (preguntas 1 y 5) |

**Terminado cuando:**
- No queda `bg-red-600` ni `ROLE_COLORS` en el shell.
- Las capturas del shell (escritorio y móvil, 3 roles) muestran cabecera `#c10007`, sidebar de 256 px y activo relleno.
- `CI=true npm run build` pasa.
- La revisión lado a lado con su `ProgramaLayout` no muestra diferencias de estructura.

### Fase 2: componentes base

| Código | Responsable | Subtarea |
|---|---|---|
| UI-07 | Nuestro equipo | `Boton`, `Badge` + `constants/estados.js` unificado |
| UI-08 | Nuestro equipo | `Modal`, `DialogoConfirmacion`, `Alerta` + `useAlerta` (reemplaza `alert()`/`window.confirm`) |
| UI-09 | Nuestro equipo | `InputField`, `Tabla`, `Paginacion`, `Cargando`, `Tarjeta`, `EncabezadoPagina` |
| UI-10 | Nuestro equipo | `icons.jsx` unificado (decisión: SVG copiados o `@heroicons/react`) |
| UI-11 | Equipo de desarrollo | (Opcional) Revisar que nuestras APIs de componentes sigan las suyas |

**Terminado cuando:**
- Cada componente tiene una página de muestra temporal o una captura comparada con su equivalente.
- Los colores y radios coinciden con la sección 6.
- No hay emojis usados como íconos en los componentes base.

### Fase 3: pantallas

| Código | Responsable | Subtarea |
|---|---|---|
| UI-12 | Nuestro equipo | Login y `NoAutorizado` al estilo `PaginaAuth`/`LoginForm` |
| UI-13 | Nuestro equipo | Pantallas de ESTUDIANTE (proceso de grado, certificados, solicitud) |
| UI-14 | Nuestro equipo | Pantallas de DIRECTOR y DEPENDENCIA (bandejas, listas, detalle, paz y salvo, estado de estudiantes) |
| UI-15 | Nuestro equipo | Secciones de ADMIN y POSGRADOS: `slate-800` → primario; decidir sobre las 7 secciones sin ruta |
| UI-16 | Nuestro equipo | KPI de las bandejas, `VerificarCertificado`, `ResultadoPago` |

**Terminado cuando:**
- `grep` devuelve 0 en `src/` para `bg-red-600`, `bg-red-500 hover`, `bg-slate-800` (como primario), `rounded-3xl` y `style={{` con color.
- Todas las capturas del checklist se han tomado y revisado.

### Fase 4: navegación entre sistemas

| Código | Responsable | Subtarea |
|---|---|---|
| UI-17 | Nuestro equipo | Ítem externo "Matrícula y admisiones" en `menuConfig` con URL por entorno |
| UI-18 | Equipo de desarrollo | Ítem "Trámites de grado" en su sidebar (Programa, Aspirante admitido, Posgrados), con enlace externo |
| UI-19 | Ambos | Acordar el mecanismo de sesión: C1a (re-login) ya; C1b como meta |
| UI-20 | Nuestro equipo (backend + frontend) | C1b: `POST /api/auth/exchange` en nuestro backend + ruta `/sso` que lee `#token` y llama a `AuthContext.login` |
| UI-21 | Equipo de desarrollo (backend) | C1b: endpoint de validación o introspección de su JWT, o publicar su clave pública |
| UI-22 | Nuestro equipo | (Opcional) Migrar CRA → Vite (E) |

**Terminado cuando:**
- Un DIRECTOR puede ir de Programa a Trámites y volver desde la sidebar. Con C1a, el login es la única costura visible; con C1b, no hay ninguna.
- El token nunca viaja en query string.
- El cierre de sesión en un sistema no deja una sesión huérfana visible en el otro, o el comportamiento queda documentado.

---

## 9. Checklist de verificación visual

**Capturas antes y después**
- [ ] Tomar las mismas pantallas de `docs/integracion-ui/capturas/` (login, inicio por rol) en 1440×900 y 390×844, antes y después de cada fase.
- [ ] Poner una captura de su `ProgramaLayout` junto a la nuestra: el header o la cabecera debe coincidir en color (`#c10007`, medido con cuentagotas), en logo y en ancho de sidebar.
- [ ] Medir con cuentagotas el primario, el hover, el ítem activo y el fondo en ambos sistemas: ΔE < 2.

**Contraste AA (WCAG 2.1)**
- [ ] Blanco sobre `#c10007`: 6.42:1, cumple (hoy, blanco sobre `#dc2626`: 4.83:1).
- [ ] Blanco sobre `#9f0712` (hover): 8.36:1, cumple.
- [ ] `#c10007` sobre `#fef2f2` (grupo abierto): 5.87:1, cumple. Sobre `#ffe2e2` (badge): 5.27:1, cumple.
- [ ] **No copiar** su `text-neutral-400` (`#a1a1a1`, 2.58:1) para texto con significado; usar `gray-500` o más oscuro. Aplica también a nuestros `text-slate-400` actuales (131 usos).
- [ ] Deshabilitado `disabled:bg-red-400` con texto blanco: 2.89:1. Es aceptable solo si va acompañado de `cursor-not-allowed` y no es la única señal.

**Responsive**
- [ ] 360, 390, 768, 1024 y 1440 px: sin scroll horizontal y con la sidebar en drawer por debajo de `md`.
- [ ] Las tablas en móvil hacen scroll dentro de su contenedor (`overflow-x-auto`) o pasan a tarjetas, como hoy en `BandejaListadoLayout`.
- [ ] El mini-header móvil (si se elige H1) muestra el logo y el título como el suyo.

**Teclado y accesibilidad**
- [ ] Tab recorre la sidebar, los grupos y el contenido en orden lógico, con foco visible (`focus-visible:ring-2 ring-primario-borde`).
- [ ] El drawer móvil se cierra con Esc y devuelve el foco a la hamburguesa.
- [ ] `Modal` y `DialogoConfirmacion` tienen `role="dialog"`, `aria-modal`, foco atrapado y cierre con Esc.
- [ ] `Alerta` tiene `role="alert"` (error) o `role="status"` (éxito).
- [ ] El ítem activo de la sidebar tiene `aria-current="page"`.
- [ ] `motion-reduce` desactiva `fade-in-up` y `slide-left`.
- [ ] `<html lang="es">`.

**Regresión**
- [ ] `CI=true npm run build` sin warnings.
- [ ] Recorrido manual por rol (ESTUDIANTE, DIRECTOR, POSGRADOS, ADMIN, DEPENDENCIA) con `ProtectedRoute` y `DEMO_MODE` desactivado.

---

## 10. Preguntas abiertas para el equipo de desarrollo

1. **Figma.** ¿Nos comparten acceso al Figma enlazado en `ext:docs/REGLAS.md:57-61`? Todo lo que hay aquí se basa en el código; en especial, ¿el rojo del Figma es `#c10007` (red-700 de Tailwind v4) o el del logo?
2. **Enlace a Trámites.** ¿Aceptan un ítem "Trámites de grado" en su sidebar? ¿Para qué roles: Programa, Posgrados, Aspirante admitido?
3. **Sesión compartida.** ¿Cómo la compartiríamos?
   - ¿Pueden exponer un endpoint de validación o introspección de su JWT, o publicar su clave pública?
   - ¿Qué identificador común tienen sus usuarios con los nuestros (cédula, código, correo institucional)?
   - ¿Aceptan empezar con re-login (C1a)?
4. **Tokens compartidos.** ¿Les interesa adoptar los alias `primario-*` (sección 6.2) en su `index.css`, para que un cambio de tono se haga en un solo lugar de cada repo?
5. **Tema de Superadmin.** Su Superadmin usa un tema oscuro `slate-900` (`ext:src/components/AppSidebar.tsx:121-128`). Nosotros usaremos rojo también en ADMIN. ¿Su tema oscuro se mantendrá? Es solo para saber si ADMIN se verá distinto entre los dos sistemas; no cambia nuestra decisión.
6. **Header.** Programa y Aspirante no tienen header en escritorio, pero Posgrados sí. ¿Cuál es el patrón objetivo en el Figma? Esto define la opción H1, H2 o H3 de la sección 3.4.
7. **Notificaciones.** Nosotros tenemos una campana con notificaciones en tiempo real. ¿Tienen previsto algo equivalente y dónde lo ubicarían?
