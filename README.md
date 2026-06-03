[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/SteveeenB/tramites-frontend)
# tramites-frontend

Documentación técnica del frontend del sistema **GROWEB — TposgradosUFPS**.  
SPA desarrollada con React.js para la gestión de trámites académicos de posgrado de la Universidad Francisco de Paula Santander (UFPS).

**Equipo:** Raúl David Báez Suárez · Johan Steven Bueno Rojas · Kevin David Arias Villamizar · Santiago Danilo Cepeda Galeano · Diego Alexander Bermúdez Flores · Bryan Alexander Niño López  
**Asignatura:** Análisis y Diseño de Sistemas — Junio 2026

---

## Tabla de Contenidos

1. [Visión General](#1-visión-general)
2. [Estructura del Proyecto](#2-estructura-del-proyecto)
3. [Autenticación JWT](#3-autenticación-jwt)
4. [Capa de Comunicación con el Backend](#4-capa-de-comunicación-con-el-backend)
5. [Páginas de la Aplicación](#5-páginas-de-la-aplicación)
6. [Componentes Principales](#6-componentes-principales)
7. [Instalación y Ejecución Local](#7-instalación-y-ejecución-local)
8. [Flujos de Usuario](#8-flujos-de-usuario)

---

## 1. Visión General

El frontend permite a estudiantes, directores, coordinadores de posgrados, administradores y dependencias interactuar con los trámites académicos de forma completamente digital, con autenticación JWT, pagos reales vía Wompi y notificaciones en tiempo real.

### Stack Tecnológico

| Componente | Tecnología | Detalle |
|---|---|---|
| Framework UI | React.js 19 | SPA, hooks, Context API |
| Estilos | Tailwind CSS 3 | Clases utilitarias, diseño responsivo |
| Enrutamiento | React Router DOM 7 | Rutas protegidas por rol con JWT |
| Autenticación | JWT Bearer + Google OAuth | Token en `localStorage`, Google Identity Services |
| Cliente HTTP | `fetch` nativo | Headers `Authorization: Bearer <token>` |
| Notificaciones RT | `EventSource` (SSE) | Campana, panel y toasts en tiempo real |
| Pasarela de Pagos | Wompi | Checkout real + página de resultado |
| Variables de entorno | `.env` | `REACT_APP_API_URL`, `REACT_APP_GOOGLE_CLIENT_ID` |

### Variables de Entorno

| Variable | Valor por defecto | Descripción |
|---|---|---|
| `REACT_APP_API_URL` | `http://localhost:8080/api` | URL base de la API REST del backend |
| `REACT_APP_GOOGLE_CLIENT_ID` | `''` | Client ID de Google OAuth (opcional) |
| `REACT_APP_DEMO_MODE` | `'true'` | Si es `'false'`, oculta el selector de rol demo |

### Usuarios Demo

| Clave demo | Nombre | Cédula/Código | Rol |
|---|---|---|---|
| `ESTUDIANTE` | Juan Perez | `1098765432` | `ESTUDIANTE` |
| `ESTUDIANTE_CON_CREDITOS` | Laura Gomez | `1098765435` | `ESTUDIANTE` |
| `ESTUDIANTE_TIC` | Ana Torres | `1098765440` | `ESTUDIANTE` |
| `DIRECTOR` | Maria Director | `1098765433` | `DIRECTOR` |
| `POSGRADOS` | Oficina Posgrados | `POS001` | `POSGRADOS` |
| `ADMIN` | Administrador | `ADMIN1` | `ADMIN` |
| `DEPENDENCIA_BIBLIOTECA` | Biblioteca Central | `DEP001` | `DEPENDENCIA` |
| `DEPENDENCIA_TESORERIA` | División Financiera | `DEP002` | `DEPENDENCIA` |
| `DEPENDENCIA_ADMISIONES` | Admisiones y Registro | `DEP003` | `DEPENDENCIA` |

---

## 2. Estructura del Proyecto

```
tramites-frontend/src/
├── api/
│   ├── apiClient.js                  fetch con Bearer JWT; apiClient, uploadApiClient, downloadApiClient
│   ├── convocatoriasApi.js
│   ├── dependenciasApi.js
│   ├── notificacionesApi.js          getNotificaciones, conteo, marcarLeida, crearEventSource
│   ├── pazYSalvoApi.js
│   ├── solicitudesApi.js
│   └── tramitesApi.js
├── components/
│   ├── ProtectedRoute.js             Verifica JWT y rol antes de renderizar
│   ├── Sidebar.jsx                   Sidebar genérico reutilizable
│   ├── bandeja-director/
│   │   ├── BandejaListadoLayout.jsx
│   │   ├── DirectorSidebar.jsx
│   │   ├── EstadoBadge.jsx
│   │   ├── ModalRechazo.jsx
│   │   ├── SeccionSolicitudes.jsx
│   │   ├── TarjetaSolicitud.jsx
│   │   └── icons.jsx
│   ├── notificaciones/
│   │   ├── BellNotificaciones.jsx    Campana con badge, panel desplegable y navegación por enlace
│   │   └── ToastNotificacion.jsx     Toast flotante con auto-dismiss
│   ├── posgrados/
│   │   ├── AvisoMockup.jsx
│   │   └── PosgradosHeader.jsx
│   ├── proceso-grado/
│   │   ├── ConfirmacionGrado.jsx
│   │   ├── DetalleEtapa1.jsx
│   │   ├── DragDropZone.jsx
│   │   ├── Etapa2.jsx
│   │   ├── EtapasResumen.jsx
│   │   ├── FileSlot.jsx
│   │   ├── ModalPagoPSE.jsx
│   │   ├── ProcesoPGSidebar.jsx
│   │   ├── TarjetaLiquidacion.jsx
│   │   └── icons.jsx
│   └── tramites/
│       ├── BotonActaTerminacion.jsx
│       ├── ContenidoAdmin.jsx
│       ├── ContenidoDirector.jsx
│       ├── ContenidoEstudiante.jsx
│       ├── TarjetaAccion.jsx
│       ├── TramitesHeader.jsx
│       ├── TramitesSidebar.jsx
│       └── icons.jsx
├── config/
│   └── menuConfig.js                 Menús por rol (ESTUDIANTE, DIRECTOR, POSGRADOS, ADMIN, DEPENDENCIA)
├── constants/
│   ├── procesodeGrado.js
│   └── tramitesColors.js             ROLE_COLORS por rol
├── context/
│   └── AuthContext.js                JWT en localStorage; login(), logout(), usuario
├── hooks/
│   ├── useAuth.js
│   ├── useBandejaDirector.js
│   ├── useBandejaGrado.js
│   ├── useNotificaciones.js          SSE + lista + conteo + toasts
│   ├── useProcesodeGrado.js
│   └── useTramitesData.js
└── pages/
    ├── Login.jsx                     Login manual (código+contraseña) + Google OAuth + demo
    ├── TramitesView.jsx
    ├── ProcesodeGrado.jsx
    ├── SolicitudGradoPage.jsx
    ├── Certificados.jsx
    ├── ResultadoPago.jsx             Página de retorno tras checkout Wompi
    ├── VerificarCertificado.jsx      Verificación pública de certificados por QR/código
    ├── BandejaDependencia.jsx
    ├── BandejaCertificadosDependencia.jsx
    ├── BandejaDirector.jsx
    ├── BandejaGrado.jsx
    ├── BandejaPosgrados.jsx
    ├── BandejaSolicitudes.jsx
    ├── DetalleSolicitudGrado.jsx
    ├── EstadoEstudiantes.jsx
    ├── ListaSolicitudesDirector.jsx
    ├── ListaSolicitudesGrado.jsx
    ├── NoAutorizado.js
    ├── PazYSalvoDirector.jsx
    └── posgrados/
        ├── index.js
        ├── SeccionAuditoria.jsx
        ├── SeccionConfiguracionGlobal.jsx
        ├── SeccionConvocatoria.jsx
        ├── SeccionDependencias.jsx
        ├── SeccionDocumentosRequeridos.jsx
        ├── SeccionPlantillasCorreo.jsx
        ├── SeccionProgramas.jsx
        ├── SeccionReportes.jsx
        ├── SeccionTiposCertificado.jsx
        ├── SeccionTiposTramite.jsx
        └── SeccionUsuarios.jsx
```

---

## 3. Autenticación JWT

### `AuthContext` (`src/context/AuthContext.js`)

El token JWT se almacena en `localStorage` bajo la clave `token`. El contexto lo provee globalmente.

| Valor | Tipo | Descripción |
|---|---|---|
| `usuario` | `Object` | Datos del usuario: `{ cedula, codigo, nombre, rol, programaAcademico, dependenciaNombre, token, ... }` |
| `cargando` | `Boolean` | `true` mientras se resuelve el estado inicial |
| `login(data)` | `Function` | Guarda el `LoginResponseDTO` en localStorage y estado |
| `logout()` | `Function` | Limpia localStorage y redirige a `/login` |

### `ProtectedRoute` (`src/components/ProtectedRoute.js`)

Verifica que exista un token válido y que el rol del usuario esté en `rolesPermitidos`. Si no, redirige a `/login` o `/no-autorizado`.

### `apiClient` — Autenticación Automática

Todas las llamadas al backend incluyen automáticamente el header `Authorization: Bearer <token>`:

```javascript
// src/api/apiClient.js
const token = localStorage.getItem('token');
headers['Authorization'] = `Bearer ${token}`;
```

### Página de Login (`src/pages/Login.jsx`)

Soporta tres métodos de autenticación:

| Método | Descripción |
|---|---|
| **Manual** | Formulario con código institucional + contraseña → `POST /api/auth/login` |
| **Google OAuth** | Botón de Google Identity Services → `POST /api/auth/google` |
| **Demo** | Selector de perfiles demo (solo si `REACT_APP_DEMO_MODE !== 'false'`) → `POST /api/auth/login-demo` |

---

## 4. Capa de Comunicación con el Backend (`src/api/`)

### 4.1 `apiClient.js`

| Función | Método | Uso |
|---|---|---|
| `apiClient(path, options)` | GET/POST/PUT | Peticiones JSON con `Authorization: Bearer <token>` |
| `uploadApiClient(path, formData)` | POST (multipart) | Subida de archivos |
| `downloadApiClient(path)` | GET | Descarga de archivos binarios (PDF) |

### 4.2 `solicitudesApi.js`

| Método | Endpoint | Descripción |
|---|---|---|
| `getMias(cedula)` | `GET /solicitudes` | Lista solicitudes del estudiante |
| `crearTerminacion(cedula)` | `POST /solicitudes/terminacion-materias` | Crea solicitud de terminación |
| `crearSolicitudGrado(cedula, datos)` | `POST /solicitudes/grado` (multipart) | Crea solicitud de grado |
| `getBandejaDirector(cedula)` | `GET /solicitudes/bandeja` | Bandeja de terminación del Director |
| `getBandejaGrado(cedula)` | `GET /solicitudes/bandeja-grado` | Bandeja de grado del Director |
| `aprobar(id, cedula)` | `POST /solicitudes/{id}/aprobar` | Aprueba la solicitud |
| `rechazar(id, cedula, motivo)` | `POST /solicitudes/{id}/rechazar` | Rechaza la solicitud |
| `descargarActa(id)` | `GET /solicitudes/{id}/acta` | Descarga acta en PDF |
| `verificarCertificado(codigo)` | `GET /solicitudes/verificar?codigo=` | Verificación pública |

### 4.3 `notificacionesApi.js` (Sprint 4 — TP-131)

| Función | Endpoint | Descripción |
|---|---|---|
| `getNotificaciones()` | `GET /notificaciones/mias` | Lista notificaciones del usuario autenticado |
| `getConteoNoLeidas()` | `GET /notificaciones/no-leidas/count` | Conteo de no leídas |
| `marcarLeida(id)` | `PUT /notificaciones/{id}/leer` | Marca una notificación como leída |
| `crearEventSource(identificador)` | `GET /notificaciones/subscribe?cedula=` | Abre conexión SSE |

### 4.4 `pazYSalvoApi.js`

| Función | Endpoint | Descripción |
|---|---|---|
| `getMisSolicitudesPazYSalvo(cedula)` | `GET /paz-y-salvo/mis-solicitudes` | Todos los paz y salvos del responsable |
| `getPendientesPazYSalvo(cedula)` | `GET /paz-y-salvo/pendientes` | Solo los pendientes |
| `responderPazYSalvo(id, cedula, decision, obs)` | `POST /paz-y-salvo/{id}/responder` | Responder |
| `getEstadoEstudiantes(cedula)` | `GET /paz-y-salvo/estado-estudiantes` | Etapas de estudiantes del programa |

### 4.5 `convocatoriasApi.js`

| Función | Endpoint | Descripción |
|---|---|---|
| `getActiva()` | `GET /convocatorias/activa` | Convocatoria activa actual |
| `actualizar(fechaInicio, fechaFin)` | `PUT /convocatorias` | Actualiza período (ADMIN/POSGRADOS) |

---

## 5. Páginas de la Aplicación

### Páginas Públicas (sin JWT)

| Página | Ruta | Descripción |
|---|---|---|
| `Login.jsx` | `/login` | Login manual, Google OAuth y modo demo |
| `VerificarCertificado.jsx` | `/verificar` | Portal público de verificación de certificados por código QR o radicado |
| `ResultadoPago.jsx` | `/pago/resultado` | Página de retorno tras checkout de Wompi. Consulta el estado del pago por referencia |

### Estudiante

| Página | Ruta | Descripción |
|---|---|---|
| `TramitesView.jsx` | `/tramites` | Vista principal según rol |
| `ProcesodeGrado.jsx` | `/proceso-de-grado` | Wizard: barra de créditos, Etapa 1 (terminación), Etapa 2 (grado) |
| `SolicitudGradoPage.jsx` | `/proceso-de-grado/solicitud-grado` | Formulario con foto, acta y certificado de inglés |
| `Certificados.jsx` | `/certificados` | Solicitud por tipo/modalidad, pago Wompi, descarga de PDF e historial |

### Director

| Página | Ruta | Descripción |
|---|---|---|
| `BandejaSolicitudes.jsx` | `/tramites/bandeja-solicitudes` | Solicitudes de terminación |
| `BandejaDirector.jsx` | `/tramites/bandeja-director` | Vista principal del Director |
| `ListaSolicitudesDirector.jsx` | `/tramites/bandeja-director/:estado` | Listado con aprobar/rechazar |
| `BandejaGrado.jsx` | `/tramites/bandeja-director/grado` | Solicitudes de grado |
| `ListaSolicitudesGrado.jsx` | `/tramites/bandeja-director/grado/:estado` | Listado por estado |
| `DetalleSolicitudGrado.jsx` | `/tramites/bandeja-director/grado/:estado/:id` | Detalle con documentos |
| `PazYSalvoDirector.jsx` | `/tramites/paz-y-salvo-director` | Paz y salvos asignados al Director |
| `EstadoEstudiantes.jsx` | `/tramites/estado-estudiantes` | Panel de seguimiento con etapas y barra de créditos |

### Posgrados / Admin (HU-15 — TP-121)

La administración vive como pestañas del sidebar en `/tramites` cuando el rol es `POSGRADOS` o `ADMIN`. La ruta `/tramites/admin/configuracion` fue eliminada en Sprint 4.

| Sección | Descripción |
|---|---|
| `SeccionReportes.jsx` | Reportes e indicadores del sistema (POSGRADOS y ADMIN) |
| `SeccionTiposCertificado.jsx` | CRUD de tipos de certificado |
| `SeccionTiposTramite.jsx` | Configuración de tipos de trámite |
| `SeccionDependencias.jsx` | Gestión de dependencias y paz y salvos |
| `SeccionDocumentosRequeridos.jsx` | Documentos requeridos por trámite |
| `SeccionUsuarios.jsx` | Gestión de usuarios del sistema |
| `SeccionProgramas.jsx` | Gestión de programas académicos |
| `SeccionConvocatoria.jsx` | Actualización de fechas de convocatoria activa |
| `SeccionPlantillasCorreo.jsx` | Plantillas de correo para notificaciones |
| `SeccionAuditoria.jsx` | Registro de auditoría del sistema |
| `SeccionConfiguracionGlobal.jsx` | Parámetros globales del sistema |

### Dependencia

| Página | Ruta | Descripción |
|---|---|---|
| `BandejaDependencia.jsx` | `/tramites/bandeja-dependencia` | Paz y salvos con filtros y `ModalRespuesta` |
| `BandejaCertificadosDependencia.jsx` | *(desde TramitesView)* | Certificados físicos: imprimir, marcar listo, confirmar entrega |

---

## 6. Componentes Principales

### `src/components/notificaciones/` (Sprint 4 — TP-131)

| Componente | Descripción |
|---|---|
| `BellNotificaciones` | Campana con badge de conteo de no leídas. Panel desplegable con historial de notificaciones. Navega al `enlace` de la notificación al hacer clic. Toasts SSE mediante portal. Usa `useNotificaciones`. |
| `ToastNotificacion` | Toast flotante con auto-dismiss (5 seg), animación de entrada y botón de cierre. Se renderiza como portal en `document.body`. |

### `src/hooks/useNotificaciones.js` (Sprint 4 — TP-131)

Hook que centraliza toda la lógica de notificaciones:

| Propiedad | Descripción |
|---|---|
| `notificaciones` | Lista completa de notificaciones del usuario |
| `noLeidas` | Conteo de notificaciones no leídas |
| `toasts` | Notificaciones recientes para mostrar como toasts |
| `marcar(id)` | Marca una notificación como leída |
| `dismissToast(toastId)` | Elimina un toast de la lista |

Abre automáticamente una conexión SSE al montar, escucha `notificacion-nueva` y `estado-actualizado`, y se reconecta automáticamente si se pierde la conexión.

### `src/pages/ResultadoPago.jsx` (Sprint 4 — TP-39)

Página de retorno tras el checkout de Wompi. Lee `?reference=` y `?status=` de la URL, consulta `GET /api/pagos/estado/{referencia}` y muestra el resultado. Si el backend no responde, usa el `status` de la URL como fallback.

### `src/pages/VerificarCertificado.jsx`

Portal público de verificación. Lee `?codigo=` de la URL y llama a `GET /api/solicitudes/verificar?codigo=`. Si el código viene en la URL, verifica automáticamente al cargar. Accesible sin login.

### `src/components/proceso-grado/`

| Componente | Descripción |
|---|---|
| `ProcesoPGSidebar` | Sidebar del wizard |
| `EtapasResumen` | Tarjetas con estado visual |
| `DetalleEtapa1` | Barra de créditos y botón de terminación |
| `Etapa2` | Estado de la solicitud de grado |
| `TarjetaLiquidacion` | Resumen del costo y botón de pago Wompi |
| `ModalPagoPSE` | Modal de pago (ahora redirige a Wompi) |
| `DragDropZone` | Zona de arrastrar y soltar archivos |
| `FileSlot` | Slot individual para cada archivo |
| `ConfirmacionGrado` | Pantalla de confirmación |

---

## 7. Instalación y Ejecución Local

### Requisitos

- Node.js 18+
- npm 9+
- Backend `tramites-backend` en `http://localhost:8080`

### Instalar y Ejecutar

```bash
cd tramites-frontend
npm install
npm start
```

Disponible en `http://localhost:3000`

### Archivo `.env` (no subir a Git)

```env
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
REACT_APP_DEMO_MODE=true
```

### Build de Producción

```bash
npm run build
```

### Actualizar desde el Remoto

```bash
git stash
git pull origin main
git stash pop
```

---

## 8. Flujos de Usuario

### Login

| Paso | Acción | Endpoint |
|---|---|---|
| 1 | Ingresar código + contraseña | `POST /api/auth/login` |
| 1b | O hacer clic en "Iniciar con Google" | `POST /api/auth/google` |
| 2 | JWT guardado en `localStorage` | — |
| 3 | Redirige a `/tramites` | — |

### Estudiante — Terminación de Materias

| Paso | Acción | Endpoint |
|---|---|---|
| 1 | Ir a Proceso de Grado | `GET /api/tramites/proceso-grado` |
| 2 | Solicitar terminación | `POST /api/solicitudes/terminacion-materias` |
| 3 | Iniciar pago Wompi | `POST /api/pagos/crear` |
| 4 | Completar checkout en Wompi | *(externo)* |
| 5 | Retornar a `/pago/resultado?reference=...` | `GET /api/pagos/estado/{referencia}` |
| 6 | Recibir notificación SSE cuando Director decide | SSE `notificacion-nueva` |
| 7 | Descargar acta | `GET /api/solicitudes/{id}/acta` |

### Estudiante — Solicitud de Grado

| Paso | Acción | Endpoint |
|---|---|---|
| 1 | Verificar Etapa 2 habilitada | `GET /api/tramites/proceso-grado` |
| 2 | Completar formulario con documentos | `POST /api/solicitudes/grado` (multipart) |
| 3 | Iniciar pago Wompi | `POST /api/pagos/crear` |
| 4 | Recibir notificaciones de estado | SSE `notificacion-nueva` + `estado-actualizado` |
| 5 | Descargar acta de grado | `GET /api/solicitudes/{id}/acta` |

### Estudiante — Certificados

| Paso | Acción | Endpoint |
|---|---|---|
| 1 | Ver tipos disponibles | `GET /api/certificados/tipos` |
| 2 | Generar recibo y confirmar | `POST /api/certificados/solicitar` |
| 3 | Simular/confirmar pago | `POST /api/certificados/{id}/pagar` |
| 4 | Descargar PDF con QR | `GET /api/certificados/{id}/pdf` |
| 5 | Consultar historial | `GET /api/certificados` |

### Director — Gestión de Solicitudes

| Paso | Acción | Endpoint |
|---|---|---|
| 1 | Ver bandeja de terminación | `GET /api/solicitudes/bandeja` |
| 2 | Aprobar o rechazar | `POST /api/solicitudes/{id}/aprobar` o `/rechazar` |
| 3 | Ver paz y salvos pendientes | `GET /api/paz-y-salvo/pendientes` |
| 4 | Responder paz y salvo | `POST /api/paz-y-salvo/{id}/responder` |
| 5 | Ver panel de estado de estudiantes | `GET /api/paz-y-salvo/estado-estudiantes` |

### Posgrados / Admin — Configuración y Validación

| Paso | Acción | Endpoint |
|---|---|---|
| 1 | Ver solicitudes de grado pendientes | `GET /api/solicitudes/posgrados/pendientes` |
| 2 | Validar solicitud | `POST /api/solicitudes/{id}/validar-grado` |
| 3 | Actualizar convocatoria (ADMIN) | `PUT /api/convocatorias` |
| 4 | Gestionar catálogos (ADMIN) | Secciones en TramitesView |

### Dependencia — Paz y Salvos y Certificados

| Paso | Acción | Endpoint |
|---|---|---|
| 1 | Ver paz y salvos asignados | `GET /api/paz-y-salvo/mis-solicitudes` |
| 2 | Responder con observaciones | `POST /api/paz-y-salvo/{id}/responder` |
| 3 | Ver bandeja de certificados | `GET /api/certificados/dependencia/{cedula}` |
| 4 | Descargar PDF para imprimir | `GET /api/certificados/{id}/pdf` |
| 5 | Marcar listo para retiro | `POST /api/certificados/{id}/marcar-listo` |
| 6 | Confirmar entrega | `POST /api/certificados/{id}/marcar-entregado` |

### Verificación Pública de Certificados

| Paso | Acción | Endpoint |
|---|---|---|
| 1 | Escanear QR del certificado → `/verificar?codigo=UFPS-CERT-43-5440` | — |
| 2 | Sistema verifica automáticamente | `GET /api/solicitudes/verificar?codigo=UFPS-CERT-43-5440` |
| 3 | Muestra datos del certificado o error de validación | — |
