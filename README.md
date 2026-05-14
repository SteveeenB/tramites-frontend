[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/SteveeenB/tramites-frontend)
# tramites-frontend

Documentación técnica del frontend del sistema **GROWEB — TposgradosUFPS**.  
SPA desarrollada con React.js que consume la API REST del backend para la gestión de trámites académicos de posgrado de la Universidad Francisco de Paula Santander (UFPS).

**Equipo:** Raúl David Báez Suárez · Johan Steven Bueno Rojas · Kevin David Arias Villamizar · Santiago Danilo Cepeda Galeano · Diego Alexander Bermúdez Flores · Bryan Alexander Niño López  
**Asignatura:** Análisis y Diseño de Sistemas — Mayo 2026

---

## Tabla de Contenidos

1. [Visión General](#1-visión-general)
2. [Estructura del Proyecto](#2-estructura-del-proyecto)
3. [Capa de Comunicación con el Backend](#3-capa-de-comunicación-con-el-backend)
4. [Autenticación y Estado Global](#4-autenticación-y-estado-global)
5. [Páginas de la Aplicación](#5-páginas-de-la-aplicación)
6. [Componentes Principales](#6-componentes-principales)
7. [Instalación y Ejecución Local](#7-instalación-y-ejecución-local)
8. [Flujos de Usuario](#8-flujos-de-usuario)

---

## 1. Visión General

El frontend permite a estudiantes, directores y administradores interactuar con los trámites académicos de posgrado de forma digital. Se conecta al backend vía HTTP/JSON y recibe actualizaciones en tiempo real mediante Server-Sent Events (SSE).

### Stack Tecnológico

| Componente | Tecnología | Detalle |
|---|---|---|
| Framework UI | React.js | SPA, hooks, Context API |
| Estilos | Tailwind CSS | Clases utilitarias, diseño responsivo |
| Enrutamiento | React Router DOM | Rutas protegidas por rol |
| Cliente HTTP | `fetch` nativo | Wrappers en `src/api/` |
| Notificaciones RT | `EventSource` (SSE) | Suscripción a `/api/notificaciones/subscribe` |
| Gestión de estado | React Context + Hooks | `AuthContext` + hooks por módulo |
| Variables de entorno | `REACT_APP_API_URL` | Archivo `.env` en la raíz |

### Variable de Entorno

| Variable | Valor por defecto | Descripción |
|---|---|---|
| `REACT_APP_API_URL` | `http://localhost:8080/api` | URL base de la API REST del backend |

### Usuarios Demo (`src/config/menuConfig.js`)

El sistema incluye cinco perfiles demo con cédulas registradas en Supabase:

| Clave demo | Nombre | Cédula | Rol | Notas |
|---|---|---|---|---|
| `ESTUDIANTE` | Juan Perez | `1098765432` | `ESTUDIANTE` | 40/56 créditos — etapa 1 bloqueada |
| `ESTUDIANTE_CON_CREDITOS` | Laura Gomez | `1098765435` | `ESTUDIANTE` | 56/56 créditos — solicitud APROBADA |
| `ESTUDIANTE_TIC` | Ana Torres | `1098765440` | `ESTUDIANTE` | 77/77 créditos — puede crear solicitud |
| `DIRECTOR` | Maria Director | `1098765433` | `DIRECTOR` | Maestría en Educación Matemáticas |
| `ADMIN` | Admin User | `1098765434` | `ADMIN` | Especialización en Estructuras |

Para cambiar de usuario demo: usar el selector en el sidebar o agregar `?rol=DIRECTOR` a la URL.

---

## 2. Estructura del Proyecto

```
tramites-frontend/
├── public/
├── src/
│   ├── api/                          Clientes HTTP hacia el backend
│   │   ├── apiClient.js              Funciones base: apiClient, uploadApiClient, downloadApiClient
│   │   ├── convocatoriasApi.js
│   │   ├── solicitudesApi.js
│   │   └── tramitesApi.js
│   ├── components/
│   │   ├── bandeja-director/         Componentes de la bandeja del Director
│   │   │   ├── BandejaListadoLayout.jsx
│   │   │   ├── DirectorSidebar.jsx
│   │   │   ├── EstadoBadge.jsx
│   │   │   ├── ModalRechazo.jsx
│   │   │   ├── SeccionSolicitudes.jsx
│   │   │   └── TarjetaSolicitud.jsx
│   │   ├── proceso-grado/            Wizard multi-etapa del proceso de grado
│   │   │   ├── ConfirmacionGrado.jsx
│   │   │   ├── DetalleEtapa1.jsx
│   │   │   ├── DragDropZone.jsx
│   │   │   ├── Etapa2.jsx
│   │   │   ├── EtapasResumen.jsx
│   │   │   ├── FileSlot.jsx
│   │   │   ├── ModalPagoPSE.jsx
│   │   │   ├── ProcesoPGSidebar.jsx
│   │   │   └── TarjetaLiquidacion.jsx
│   │   └── tramites/                 Componentes de la vista principal
│   │       ├── ContenidoAdmin.jsx
│   │       ├── ContenidoDirector.jsx
│   │       ├── ContenidoEstudiante.jsx
│   │       ├── TarjetaAccion.jsx
│   │       ├── TramitesHeader.jsx
│   │       └── TramitesSidebar.jsx
│   ├── config/
│   │   └── menuConfig.js             Menús por rol, usuarios demo, rutas
│   ├── context/
│   │   └── AuthContext.js            Contexto de autenticación global
│   ├── hooks/
│   │   ├── useAuth.js                Consume AuthContext
│   │   ├── useBandejaDirector.js
│   │   ├── useBandejaGrado.js
│   │   ├── useProcesodeGrado.js
│   │   └── useTramitesData.js
│   ├── pages/
│   │   ├── BandejaDirector.jsx
│   │   ├── BandejaGrado.jsx
│   │   ├── BandejaSolicitudes.jsx
│   │   ├── Certificados.jsx
│   │   ├── ConfiguracionAdmin.jsx
│   │   ├── DetalleSolicitudGrado.jsx
│   │   ├── ListaSolicitudesDirector.jsx
│   │   ├── ListaSolicitudesGrado.jsx
│   │   ├── NoAutorizado.js
│   │   ├── ProcesodeGrado.jsx
│   │   ├── SolicitudGradoPage.jsx
│   │   └── TramitesView.jsx
│   ├── App.js                        Configuración de rutas React Router
│   └── index.js                      Punto de entrada, envuelve con AuthProvider
├── .env                              Variables de entorno (no subir a Git)
└── package.json
```

---

## 3. Capa de Comunicación con el Backend (`src/api/`)

### 3.1 `apiClient.js` — Funciones Base

URL base: `process.env.REACT_APP_API_URL || 'http://localhost:8080/api'`

| Función | Método HTTP | Uso | Retorna |
|---|---|---|---|
| `apiClient(path, options)` | GET / POST / PUT | Peticiones JSON estándar. Incluye `credentials: 'include'` para mantener sesión. | `Promise<JSON>` — lanza `ApiError` si `!res.ok` |
| `uploadApiClient(path, formData)` | POST (multipart) | Subida de archivos. No establece `Content-Type` para que el browser lo infiera. | `Promise<JSON>` — lanza `ApiError` si `!res.ok` |
| `downloadApiClient(path)` | GET | Descarga de archivos binarios (PDF, TXT). | `Promise<{blob, contentDisposition}>` |

### 3.2 `solicitudesApi.js`

| Método | Endpoint | Parámetros | Descripción |
|---|---|---|---|
| `getMias(cedula)` | `GET /solicitudes?cedula=` | `cedula` | Lista todas las solicitudes del estudiante |
| `crearTerminacion(cedula)` | `POST /solicitudes/terminacion-materias?cedula=` | `cedula` | Crea solicitud de terminación de materias |
| `crearSolicitudGrado(cedula, datos)` | `POST /solicitudes/grado` (multipart) | `cedula` + `{tituloProyecto, resumen, tipoProyecto, foto, actaSustentacion, [certificadoIngles]}` | Crea solicitud de grado con documentos |
| `getBandejaDirector(cedula)` | `GET /solicitudes/bandeja?cedula=` | `cedula` del Director | Solicitudes de terminación del programa |
| `getBandejaGrado(cedula)` | `GET /solicitudes/bandeja-grado?cedula=` | `cedula` del Director | Solicitudes de grado del programa |
| `obtenerDetalleGrado(id)` | `GET /solicitudes/grado/{id}` | `id` | Detalle de una solicitud de grado |
| `aprobar(id, cedula)` | `POST /solicitudes/{id}/aprobar?cedula=` | `id` + `cedula` Director | Aprueba la solicitud |
| `rechazar(id, cedula, motivo)` | `POST /solicitudes/{id}/rechazar` | `id` + `cedula` + `motivo` (opcional) | Rechaza la solicitud con motivo |
| `descargarActa(id)` | `GET /solicitudes/{id}/acta` | `id` | Descarga el acta de grado en PDF |
| `subirDocumento(id, file)` | `POST /solicitudes/{id}/documentos` (multipart) | `id` + `File` | Sube un documento de soporte |
| `getDocumentos(id, cedula)` | `GET /solicitudes/{id}/documentos` | `id` + `cedula` | Lista documentos de la solicitud |

### 3.3 `tramitesApi.js`

| Método | Endpoint | Descripción |
|---|---|---|
| `getModulo(cedula)` | `GET /tramites?cedula=` | Módulo de trámites disponibles según rol |
| `getProcesoGrado(cedula)` | `GET /tramites/proceso-grado?cedula=` | Estado, créditos y etapas del proceso de grado |

### 3.4 `convocatoriasApi.js`

| Método | Endpoint | Descripción |
|---|---|---|
| `getActiva()` | `GET /convocatorias/activa` | Obtiene la convocatoria activa (`fechaInicio`, `fechaFin`) |
| `actualizar(fechaInicio, fechaFin)` | `PUT /convocatorias` (body JSON) | Solo `ADMIN`. Actualiza el período habilitado |

---

## 4. Autenticación y Estado Global

### `AuthContext` (`src/context/AuthContext.js`)

Contexto React que provee el usuario activo y la función para cambiar de rol demo. Se inicializa leyendo el parámetro `?rol=` de la URL; si no existe, usa `ESTUDIANTE` por defecto.

| Valor del contexto | Tipo | Descripción |
|---|---|---|
| `usuario` | `Object` | `{ cedula, nombre, programaAcademico, rol }` |
| `cargando` | `Boolean` | `true` mientras resuelve el usuario inicial |
| `cambiarRol(demoKey)` | `Function` | Cambia el usuario activo a cualquier perfil demo |

### `useAuth` (`src/hooks/useAuth.js`)

Hook de conveniencia que retorna el valor de `AuthContext`. Todos los componentes que necesiten el usuario actual lo consumen a través de este hook.

### Hooks de Datos por Módulo

| Hook | Módulo | Qué hace |
|---|---|---|
| `useTramitesData` | `TramitesView` | Carga el módulo de trámites del backend y gestiona la selección del menú lateral por rol |
| `useProcesodeGrado` | `ProcesodeGrado` | Carga en paralelo el proceso de grado y las solicitudes del estudiante; expone `solicitarTerminacion()`, `porcentaje` y `faltantes` de créditos |
| `useBandejaDirector` | `BandejaDirector` / `ListaSolicitudesDirector` | Carga la bandeja de terminación del Director, expone `aprobar()` y `rechazar()` |
| `useBandejaGrado` | `BandejaGrado` / `ListaSolicitudesGrado` | Carga la bandeja de solicitudes de grado del Director |

---

## 5. Páginas de la Aplicación

| Página | Ruta | Rol | Descripción |
|---|---|---|---|
| `TramitesView.jsx` | `/tramites` | Todos | Vista principal. Renderiza `ContenidoEstudiante`, `ContenidoDirector` o `ContenidoAdmin` según el rol. |
| `ProcesodeGrado.jsx` | `/proceso-de-grado` | `ESTUDIANTE` | Wizard que muestra créditos, terminación de materias (Etapa 1) y solicitud de grado (Etapa 2). |
| `SolicitudGradoPage.jsx` | `/solicitud-grado` | `ESTUDIANTE` | Formulario con carga de foto, acta de sustentación y certificado de inglés usando `DragDropZone` y `FileSlot`. |
| `BandejaDirector.jsx` | `/tramites/bandeja-solicitudes` | `DIRECTOR` | Bandeja de solicitudes de terminación del programa del Director. |
| `ListaSolicitudesDirector.jsx` | (sub-vista) | `DIRECTOR` | Listado detallado con botones de aprobar/rechazar y `ModalRechazo`. |
| `BandejaGrado.jsx` | `/bandeja-grado` | `DIRECTOR` | Bandeja de solicitudes de grado del programa. |
| `ListaSolicitudesGrado.jsx` | (sub-vista) | `DIRECTOR` | Listado detallado de solicitudes de grado. |
| `DetalleSolicitudGrado.jsx` | `/solicitudes/grado/:id` | `DIRECTOR` | Detalle de una solicitud de grado con documentos adjuntos descargables. |
| `BandejaSolicitudes.jsx` | `/tramites/bandeja-posgrados` | `ADMIN` | Solicitudes de grado pendientes de validación para la Unidad de Posgrados. |
| `ConfiguracionAdmin.jsx` | `/tramites/admin/configuracion` | `ADMIN` | Panel para actualizar las fechas de la convocatoria activa. |
| `Certificados.jsx` | `/certificados` | `ESTUDIANTE` | Solicitud y descarga de certificados académicos. |
| `NoAutorizado.js` | `*` | — | Página de acceso denegado para rutas no permitidas según el rol. |

---

## 6. Componentes Principales

### `src/components/proceso-grado/`

| Componente | Descripción |
|---|---|
| `ProcesoPGSidebar` | Sidebar del wizard con avatar del estudiante y navegación |
| `EtapasResumen` | Tarjetas de resumen con estado visual (completada / pendiente / bloqueada) |
| `DetalleEtapa1` | Barra de créditos, liquidación y botón de solicitar terminación |
| `Etapa2` | Estado de la solicitud de grado o enlace al formulario |
| `TarjetaLiquidacion` | Resumen del costo del trámite y botón de pago |
| `ModalPagoPSE` | Modal de pago simulado PSE |
| `DragDropZone` | Zona de arrastrar y soltar para seleccionar archivos |
| `FileSlot` | Slot individual para un archivo requerido (foto, acta, certificado de inglés) |
| `ConfirmacionGrado` | Pantalla de confirmación posterior al envío del formulario |

### `src/components/bandeja-director/`

| Componente | Descripción |
|---|---|
| `BandejaListadoLayout` | Layout contenedor de la bandeja del Director |
| `DirectorSidebar` | Sidebar con navegación entre bandeja e historial |
| `EstadoBadge` | Badge de color por estado (`EN_REVISION`, `APROBADA`, `RECHAZADA`...) |
| `ModalRechazo` | Modal para ingresar el motivo de rechazo |
| `SeccionSolicitudes` | Sección colapsable que agrupa solicitudes por estado |
| `TarjetaSolicitud` | Tarjeta individual de solicitud con acciones rápidas |

### `src/components/tramites/`

| Componente | Descripción |
|---|---|
| `TramitesHeader` | Header con nombre del usuario y selector de rol demo |
| `TramitesSidebar` | Sidebar con ítems de menú según el rol activo |
| `TarjetaAccion` | Tarjeta de un trámite disponible |
| `ContenidoEstudiante` | Vista principal para el rol `ESTUDIANTE` |
| `ContenidoDirector` | Vista principal para el rol `DIRECTOR` |
| `ContenidoAdmin` | Vista principal para el rol `ADMIN` |

---

## 7. Instalación y Ejecución Local

### Requisitos Previos

- Node.js 18 o superior
- npm 9+ (incluido con Node.js)
- Backend `tramites-backend` ejecutándose en `http://localhost:8080`

### Instalar Dependencias

```bash
cd tramites-frontend
npm install
```

### Configurar Variable de Entorno (opcional)

Crear archivo `.env` en la raíz del proyecto (no subir a Git):

```env
REACT_APP_API_URL=http://localhost:8080/api
```

Si no existe el archivo, usa `http://localhost:8080/api` por defecto.

### Ejecutar en Modo Desarrollo

```bash
npm start
```

La aplicación queda disponible en: `http://localhost:3000`

### Construir para Producción

```bash
npm run build
```

El directorio `build/` contiene los archivos estáticos listos para desplegar.

### Actualizar desde el Repositorio Remoto

```bash
# Traer todo del remoto descartando cambios locales
git fetch origin
git reset --hard origin/main

# Si quieres conservar cambios locales primero
git stash
git pull origin main
git stash pop
```

---

## 8. Flujos de Usuario

### Estudiante — Proceso de Grado

| Paso | Acción en UI | Llamada al backend |
|---|---|---|
| 1 | Ingresar con cédula de estudiante | `POST /api/usuarios/login-demo?cedula=...` |
| 2 | Ir a "Proceso de Grado" | `GET /api/tramites/proceso-grado?cedula=...` |
| 3 | Ver barra de créditos y etapas | Datos incluidos en la respuesta anterior |
| 4 | Solicitar terminación de materias (Etapa 1) | `POST /api/solicitudes/terminacion-materias?cedula=...` |
| 5 | Ver liquidación y simular pago | *(flujo de pago pendiente — TP-37)* |
| 6 | Completar formulario de grado (Etapa 2) | `POST /api/solicitudes/grado` (multipart) |
| 7 | Recibir notificación SSE cuando Director decide | `GET /api/notificaciones/subscribe?cedula=...` |
| 8 | Descargar acta de grado cuando está `APROBADA` | `GET /api/solicitudes/{id}/acta` |

### Director — Gestión de Solicitudes

| Paso | Acción en UI | Llamada al backend |
|---|---|---|
| 1 | Ingresar con cédula de Director | `POST /api/usuarios/login-demo?cedula=...` |
| 2 | Ir a "Bandeja de Solicitudes" (terminación) | `GET /api/solicitudes/bandeja?cedula=...` |
| 3 | Aprobar solicitud | `POST /api/solicitudes/{id}/aprobar?cedula=...` |
| 4 | Rechazar solicitud con motivo | `POST /api/solicitudes/{id}/rechazar?cedula=...&motivo=...` |
| 5 | Ir a Bandeja Grado | `GET /api/solicitudes/bandeja-grado?cedula=...` |
| 6 | Ver detalle de solicitud de grado | `GET /api/solicitudes/grado/{id}` |

### Admin — Configuración y Validación

| Paso | Acción en UI | Llamada al backend |
|---|---|---|
| 1 | Ingresar con cédula de Admin | `POST /api/usuarios/login-demo?cedula=...` |
| 2 | Actualizar fechas de convocatoria | `PUT /api/convocatorias?cedula=...` (body JSON) |
| 3 | Ver solicitudes de grado pendientes | `GET /api/solicitudes/posgrados/pendientes?cedula=...` |
| 4 | Aprobar o rechazar validación | `POST /api/solicitudes/{id}/validar-grado` |
