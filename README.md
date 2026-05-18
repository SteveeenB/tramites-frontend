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

El frontend permite a estudiantes, directores, coordinadores de posgrados y dependencias institucionales interactuar con los trámites académicos de posgrado de forma completamente digital. Se conecta al backend vía HTTP/JSON y recibe actualizaciones en tiempo real mediante Server-Sent Events (SSE).

### Stack Tecnológico

| Componente | Tecnología | Detalle |
|---|---|---|
| Framework UI | React.js 19 | SPA, hooks, Context API |
| Estilos | Tailwind CSS 3 | Clases utilitarias, diseño responsivo |
| Enrutamiento | React Router DOM 7 | Rutas protegidas por rol |
| Cliente HTTP | `fetch` nativo | Wrappers en `src/api/` |
| Notificaciones RT | `EventSource` (SSE) | Suscripción a `/api/notificaciones/subscribe` |
| Gestión de estado | React Context + Hooks | `AuthContext` + hooks por módulo |
| Variables de entorno | `REACT_APP_API_URL` | Archivo `.env` en la raíz |

### Variable de Entorno

| Variable | Valor por defecto | Descripción |
|---|---|---|
| `REACT_APP_API_URL` | `http://localhost:8080/api` | URL base de la API REST del backend |

### Usuarios Demo (`src/config/menuConfig.js`)

| Clave demo | Nombre | Cédula | Rol | Notas |
|---|---|---|---|---|
| `ESTUDIANTE` | Juan Perez | `1098765432` | `ESTUDIANTE` | 40/56 créditos — etapa 1 bloqueada |
| `ESTUDIANTE_CON_CREDITOS` | Laura Gomez | `1098765435` | `ESTUDIANTE` | 56/56 créditos — solicitud APROBADA |
| `ESTUDIANTE_TIC` | Ana Torres | `1098765440` | `ESTUDIANTE` | 77/77 créditos — puede crear solicitud y certificados |
| `ESTUDIANTE_KEDARVI` | Kevin Estudiante | `2000000011` | `ESTUDIANTE` | 56 créditos — perfil de prueba certificados |
| `ESTUDIANTE_GRADO` | Andrea Prueba Grado | `2000000010` | `ESTUDIANTE` | Solicitud de grado activa — prueba paz y salvos |
| `DIRECTOR` | Maria Director | `1098765433` | `DIRECTOR` | Maestría en Educación Matemáticas |
| `POSGRADOS` | Coordinador Posgrados | `1098765434` | `POSGRADOS` | Coordinación de la Unidad de Posgrados |
| `DEPENDENCIA_BIBLIOTECA` | Biblioteca Central | `3000000001` | `DEPENDENCIA` | Gestiona paz y salvos y certificados de buena conducta |
| `DEPENDENCIA_TESORERIA` | Tesorería | `3000000002` | `DEPENDENCIA` | Gestiona paz y salvos y certificados de parqueadero |
| `DEPENDENCIA_ADMISIONES` | Admisiones y Registro | `3000000003` | `DEPENDENCIA` | Gestiona paz y salvos y certificados de registro calificado |

Para cambiar de usuario demo: usar el selector en el sidebar o agregar `?rol=DIRECTOR` a la URL.

---

## 2. Estructura del Proyecto

```
tramites-frontend/
├── public/
├── src/
│   ├── api/
│   │   ├── apiClient.js                  Funciones base: apiClient, uploadApiClient, downloadApiClient
│   │   ├── convocatoriasApi.js
│   │   ├── pazYSalvoApi.js               Endpoints de paz y salvos y estado de estudiantes
│   │   ├── solicitudesApi.js
│   │   └── tramitesApi.js
│   ├── components/
│   │   ├── bandeja-director/
│   │   │   ├── BandejaListadoLayout.jsx
│   │   │   ├── DirectorSidebar.jsx
│   │   │   ├── EstadoBadge.jsx
│   │   │   ├── ModalRechazo.jsx
│   │   │   ├── SeccionSolicitudes.jsx
│   │   │   └── TarjetaSolicitud.jsx
│   │   ├── proceso-grado/
│   │   │   ├── ConfirmacionGrado.jsx
│   │   │   ├── DetalleEtapa1.jsx
│   │   │   ├── DragDropZone.jsx
│   │   │   ├── Etapa2.jsx
│   │   │   ├── EtapasResumen.jsx
│   │   │   ├── FileSlot.jsx
│   │   │   ├── ModalPagoPSE.jsx
│   │   │   ├── ProcesoPGSidebar.jsx
│   │   │   └── TarjetaLiquidacion.jsx
│   │   └── tramites/
│   │       ├── BotonActaTerminacion.jsx
│   │       ├── ContenidoAdmin.jsx
│   │       ├── ContenidoDirector.jsx
│   │       ├── ContenidoEstudiante.jsx
│   │       ├── TarjetaAccion.jsx
│   │       ├── TramitesHeader.jsx
│   │       └── TramitesSidebar.jsx
│   ├── config/
│   │   └── menuConfig.js                 Menús por rol, usuarios demo, rutas y ALLOWED_ROLES
│   ├── constants/
│   │   ├── procesodeGrado.js
│   │   └── tramitesColors.js
│   ├── context/
│   │   └── AuthContext.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useBandejaDirector.js
│   │   ├── useBandejaGrado.js
│   │   ├── useProcesodeGrado.js
│   │   └── useTramitesData.js
│   ├── pages/
│   │   ├── BandejaCertificadosDependencia.jsx  Gestión de certificados físicos (DEPENDENCIA)
│   │   ├── BandejaDependencia.jsx              Bandeja de paz y salvos (DEPENDENCIA)
│   │   ├── BandejaDirector.jsx
│   │   ├── BandejaGrado.jsx
│   │   ├── BandejaPosgrados.jsx
│   │   ├── BandejaSolicitudes.jsx
│   │   ├── Certificados.jsx                    Solicitud, pago y descarga de certificados (ESTUDIANTE)
│   │   ├── ConfiguracionAdmin.jsx
│   │   ├── DetalleSolicitudGrado.jsx
│   │   ├── EstadoEstudiantes.jsx               Estado del proceso de grado por estudiante (DIRECTOR)
│   │   ├── ListaSolicitudesDirector.jsx
│   │   ├── ListaSolicitudesGrado.jsx
│   │   ├── NoAutorizado.js
│   │   ├── PazYSalvoDirector.jsx               Gestión de paz y salvos del Director
│   │   ├── ProcesodeGrado.jsx
│   │   ├── SolicitudGradoPage.jsx
│   │   └── TramitesView.jsx
│   ├── App.js
│   └── index.js
├── .env
└── package.json
```

---

## 3. Capa de Comunicación con el Backend (`src/api/`)

### 3.1 `apiClient.js` — Funciones Base

URL base: `process.env.REACT_APP_API_URL || 'http://localhost:8080/api'`

| Función | Método HTTP | Uso | Retorna |
|---|---|---|---|
| `apiClient(path, options)` | GET / POST / PUT | Peticiones JSON estándar con `credentials: 'include'`. | `Promise<JSON>` — lanza `ApiError` si `!res.ok` |
| `uploadApiClient(path, formData)` | POST (multipart) | Subida de archivos sin `Content-Type` explícito. | `Promise<JSON>` |
| `downloadApiClient(path)` | GET | Descarga de archivos binarios (PDF, TXT). | `Promise<{blob, contentDisposition}>` |

### 3.2 `solicitudesApi.js`

| Método | Endpoint | Descripción |
|---|---|---|
| `getMias(cedula)` | `GET /solicitudes?cedula=` | Lista todas las solicitudes del estudiante |
| `crearTerminacion(cedula)` | `POST /solicitudes/terminacion-materias?cedula=` | Crea solicitud de terminación |
| `crearSolicitudGrado(cedula, datos)` | `POST /solicitudes/grado` (multipart) | Crea solicitud de grado con documentos |
| `getBandejaDirector(cedula)` | `GET /solicitudes/bandeja?cedula=` | Bandeja de terminación del Director |
| `getBandejaGrado(cedula)` | `GET /solicitudes/bandeja-grado?cedula=` | Bandeja de grado del Director |
| `obtenerDetalleGrado(id)` | `GET /solicitudes/grado/{id}` | Detalle de solicitud de grado |
| `aprobar(id, cedula)` | `POST /solicitudes/{id}/aprobar?cedula=` | Aprueba la solicitud |
| `rechazar(id, cedula, motivo)` | `POST /solicitudes/{id}/rechazar` | Rechaza con motivo |
| `descargarActa(id)` | `GET /solicitudes/{id}/acta` | Descarga acta de grado en PDF |
| `subirDocumento(id, file)` | `POST /solicitudes/{id}/documentos` (multipart) | Sube documento de soporte |
| `getDocumentos(id, cedula)` | `GET /solicitudes/{id}/documentos` | Lista documentos de la solicitud |

### 3.3 `tramitesApi.js`

| Método | Endpoint | Descripción |
|---|---|---|
| `getModulo(cedula)` | `GET /tramites?cedula=` | Módulo de trámites según rol |
| `getProcesoGrado(cedula)` | `GET /tramites/proceso-grado?cedula=` | Estado, créditos y etapas del proceso de grado |

### 3.4 `convocatoriasApi.js`

| Método | Endpoint | Descripción |
|---|---|---|
| `getActiva()` | `GET /convocatorias/activa` | Convocatoria activa actual |
| `actualizar(fechaInicio, fechaFin)` | `PUT /convocatorias` | Actualiza el período habilitado (ADMIN/POSGRADOS) |

### 3.5 `pazYSalvoApi.js`

| Método | Endpoint | Descripción |
|---|---|---|
| `getMisSolicitudesPazYSalvo(cedula)` | `GET /paz-y-salvo/mis-solicitudes?cedula=` | Todos los paz y salvos del responsable |
| `getPendientesPazYSalvo(cedula)` | `GET /paz-y-salvo/pendientes?cedula=` | Solo los pendientes del responsable |
| `responderPazYSalvo(id, cedula, decision, obs)` | `POST /paz-y-salvo/{id}/responder` | Responder: `APROBADO` o `RECHAZADO` |
| `getEstadoPazYSalvos(solicitudId)` | `GET /paz-y-salvo/solicitud/{solicitudId}` | Estado de todos los paz y salvos de una solicitud |
| `getEstadoEstudiantes(cedula)` | `GET /paz-y-salvo/estado-estudiantes?cedula=` | Etapas de todos los estudiantes del programa |

---

## 4. Autenticación y Estado Global

### `AuthContext` (`src/context/AuthContext.js`)

| Valor | Tipo | Descripción |
|---|---|---|
| `usuario` | `Object` | `{ cedula, nombre, programaAcademico, rol }` |
| `cargando` | `Boolean` | `true` mientras resuelve el usuario inicial |
| `cambiarRol(demoKey)` | `Function` | Cambia al perfil demo indicado |

### Rutas Protegidas

`ProtectedRoute` verifica el rol antes de renderizar. Redirige a `/no-autorizado` si el rol no está permitido. Roles válidos definidos en `ALLOWED_ROLES`: `ESTUDIANTE`, `DIRECTOR`, `POSGRADOS`, `DEPENDENCIA`.

### Menús por Rol (`src/config/menuConfig.js`)

| Rol | Ítems del menú |
|---|---|
| `ESTUDIANTE` | Proceso de Grado, Certificados |
| `DIRECTOR` | Bandeja de Solicitudes, Historial, Mis Paz y Salvos, Estado Estudiantes |
| `POSGRADOS` | Bandeja de Solicitudes, Configuración |
| `DEPENDENCIA` | Paz y Salvos, Certificados |

### Hooks de Datos por Módulo

| Hook | Módulo | Qué hace |
|---|---|---|
| `useTramitesData` | `TramitesView` | Carga trámites del backend y gestiona el menú lateral |
| `useProcesodeGrado` | `ProcesodeGrado` | Carga proceso de grado; expone `solicitarTerminacion()`, `porcentaje` y `faltantes` |
| `useBandejaDirector` | `BandejaDirector` | Carga bandeja de terminación; expone `aprobar()` y `rechazar()` |
| `useBandejaGrado` | `BandejaGrado` | Carga bandeja de solicitudes de grado |

---

## 5. Páginas de la Aplicación

### Estudiante

| Página | Ruta | Descripción |
|---|---|---|
| `TramitesView.jsx` | `/tramites` | Vista principal según rol activo |
| `ProcesodeGrado.jsx` | `/proceso-de-grado` | Wizard: barra de créditos, Etapa 1 (terminación), Etapa 2 (grado) |
| `SolicitudGradoPage.jsx` | `/proceso-de-grado/solicitud-grado` | Formulario con carga de foto, acta y certificado de inglés |
| `Certificados.jsx` | `/certificados` | Solicitud por tipo/modalidad, pago simulado PSE, descarga de PDF e historial completo. Modal de confirmación antes de generar el recibo. Advertencias de vigencia (3 días) y restricción de una solicitud vigente por tipo. |

### Director

| Página | Ruta | Descripción |
|---|---|---|
| `BandejaSolicitudes.jsx` | `/tramites/bandeja-solicitudes` | Solicitudes de terminación agrupadas por estado |
| `BandejaDirector.jsx` | `/tramites/bandeja-director` | Vista principal con navegación lateral |
| `ListaSolicitudesDirector.jsx` | `/tramites/bandeja-director/:estado` | Listado con aprobar/rechazar y `ModalRechazo` |
| `BandejaGrado.jsx` | `/tramites/bandeja-director/grado` | Solicitudes de grado del programa |
| `ListaSolicitudesGrado.jsx` | `/tramites/bandeja-director/grado/:estado` | Listado detallado por estado |
| `DetalleSolicitudGrado.jsx` | `/tramites/bandeja-director/grado/:estado/:id` | Detalle con documentos descargables |
| `PazYSalvoDirector.jsx` | `/tramites/paz-y-salvo-director` | Paz y salvos asignados al Director. Filtros por estado. `ModalRespuesta` con decisión y observaciones. |
| `EstadoEstudiantes.jsx` | `/tramites/estado-estudiantes` | Panel de seguimiento con etapa actual, barra de créditos y buscador por nombre/cédula/código para todos los estudiantes del programa. Tarjetas resumen por etapa con contador. |

### Posgrados / Admin

| Página | Ruta | Descripción |
|---|---|---|
| `BandejaPosgrados.jsx` | `/tramites/bandeja-posgrados` | Solicitudes de grado en `PENDIENTE_VALIDACION` |
| `ConfiguracionAdmin.jsx` | `/tramites/admin/configuracion` | Actualiza fechas de convocatoria (ADMIN y POSGRADOS) |

### Dependencia

| Página | Ruta | Descripción |
|---|---|---|
| `BandejaDependencia.jsx` | `/tramites/bandeja-dependencia` | Paz y salvos asignados. Filtros + contador de pendientes. `ModalRespuesta` integrado. |
| `BandejaCertificadosDependencia.jsx` | *(desde TramitesView)* | Certificados físicos asignados. Pestañas: Por imprimir, Listos, Entregados, Todos. Descarga PDF, marcar listo y confirmar entrega. Buscador por cédula/nombre. |

---

## 6. Componentes Principales

### `src/components/proceso-grado/`

| Componente | Descripción |
|---|---|
| `ProcesoPGSidebar` | Sidebar del wizard con avatar y navegación |
| `EtapasResumen` | Tarjetas de estado visual (completada / pendiente / bloqueada) |
| `DetalleEtapa1` | Barra de créditos, liquidación y botón solicitar terminación |
| `Etapa2` | Estado de la solicitud de grado o enlace al formulario |
| `TarjetaLiquidacion` | Resumen del costo y botón de pago |
| `ModalPagoPSE` | Modal de pago simulado PSE |
| `DragDropZone` | Zona de arrastrar y soltar archivos |
| `FileSlot` | Slot individual para archivo requerido (foto, acta, certificado inglés) |
| `ConfirmacionGrado` | Pantalla de confirmación tras enviar el formulario |

### `src/components/bandeja-director/`

| Componente | Descripción |
|---|---|
| `BandejaListadoLayout` | Layout contenedor de la bandeja |
| `DirectorSidebar` | Navegación: bandeja, historial, paz y salvos, estado estudiantes |
| `EstadoBadge` | Badge de color por estado |
| `ModalRechazo` | Modal para ingresar motivo de rechazo |
| `SeccionSolicitudes` | Sección colapsable por estado |
| `TarjetaSolicitud` | Tarjeta de solicitud con acciones rápidas |

### `src/components/tramites/`

| Componente | Descripción |
|---|---|
| `TramitesHeader` | Header con nombre del usuario y selector de rol demo |
| `TramitesSidebar` | Menú lateral según rol activo |
| `TarjetaAccion` | Tarjeta de un trámite disponible |
| `ContenidoEstudiante` | Vista principal rol `ESTUDIANTE` |
| `ContenidoDirector` | Vista principal rol `DIRECTOR` |
| `ContenidoAdmin` | Vista principal rol `ADMIN` / `POSGRADOS` |
| `BotonActaTerminacion` | Descarga acta de terminación cuando está disponible |

---

## 7. Instalación y Ejecución Local

### Requisitos Previos

- Node.js 18 o superior
- npm 9+
- Backend `tramites-backend` en `http://localhost:8080`

### Instalar Dependencias

```bash
cd tramites-frontend
npm install
```

### Configurar Variable de Entorno (opcional)

```env
REACT_APP_API_URL=http://localhost:8080/api
```

### Ejecutar en Modo Desarrollo

```bash
npm start
```

Disponible en `http://localhost:3000`

### Construir para Producción

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

### Estudiante — Terminación de Materias

| Paso | Acción | Endpoint |
|---|---|---|
| 1 | Ingresar con cédula | `POST /api/usuarios/login-demo?cedula=...` |
| 2 | Ir a Proceso de Grado | `GET /api/tramites/proceso-grado?cedula=...` |
| 3 | Solicitar terminación | `POST /api/solicitudes/terminacion-materias?cedula=...` |
| 4 | Simular pago PSE | *(TP-37 pendiente)* |
| 5 | Recibir notificación SSE | `GET /api/notificaciones/subscribe?cedula=...` |
| 6 | Descargar acta | `GET /api/solicitudes/{id}/acta` |

### Estudiante — Solicitud de Grado

| Paso | Acción | Endpoint |
|---|---|---|
| 1 | Verificar Etapa 2 habilitada | `GET /api/tramites/proceso-grado?cedula=...` |
| 2 | Completar formulario con documentos | `POST /api/solicitudes/grado` (multipart) |
| 3 | Recibir notificación de decisión | `GET /api/notificaciones/subscribe?cedula=...` |
| 4 | Descargar acta de grado | `GET /api/solicitudes/{id}/acta` |

### Estudiante — Certificados Académicos

| Paso | Acción | Endpoint |
|---|---|---|
| 1 | Ver tipos disponibles | `GET /api/certificados/tipos` |
| 2 | Seleccionar tipo y modalidad | *(filtrado automático)* |
| 3 | Confirmar y generar recibo | `POST /api/certificados/solicitar` |
| 4 | Simular pago | `POST /api/certificados/{id}/pagar?cedula=...` |
| 5 | Descargar PDF con QR y radicado | `GET /api/certificados/{id}/pdf?cedula=...` |
| 6 | Consultar historial | `GET /api/certificados?cedula=...` |

### Director — Solicitudes de Terminación

| Paso | Acción | Endpoint |
|---|---|---|
| 1 | Ver bandeja | `GET /api/solicitudes/bandeja?cedula=...` |
| 2 | Aprobar | `POST /api/solicitudes/{id}/aprobar?cedula=...` |
| 3 | Rechazar con motivo | `POST /api/solicitudes/{id}/rechazar` |

### Director — Paz y Salvos

| Paso | Acción | Endpoint |
|---|---|---|
| 1 | Ver mis paz y salvos | `GET /api/paz-y-salvo/mis-solicitudes?cedula=...` |
| 2 | Responder con decisión | `POST /api/paz-y-salvo/{id}/responder` |

### Director — Estado de Estudiantes

| Paso | Acción | Endpoint |
|---|---|---|
| 1 | Ver panel de etapas | `GET /api/paz-y-salvo/estado-estudiantes?cedula=...` |
| 2 | Filtrar por etapa o buscar | *(filtrado en cliente)* |

### Posgrados — Validación y Configuración

| Paso | Acción | Endpoint |
|---|---|---|
| 1 | Ver pendientes de validación | `GET /api/solicitudes/posgrados/pendientes?cedula=...` |
| 2 | Validar solicitud de grado | `POST /api/solicitudes/{id}/validar-grado` |
| 3 | Actualizar convocatoria | `PUT /api/convocatorias?cedula=...` |

### Dependencia — Paz y Salvos

| Paso | Acción | Endpoint |
|---|---|---|
| 1 | Ver todos los paz y salvos | `GET /api/paz-y-salvo/mis-solicitudes?cedula=...` |
| 2 | Responder con observaciones | `POST /api/paz-y-salvo/{id}/responder` |

### Dependencia — Certificados Físicos

| Paso | Acción | Endpoint |
|---|---|---|
| 1 | Ver bandeja de certificados | `GET /api/certificados/dependencia/{cedula}` |
| 2 | Descargar PDF para imprimir | `GET /api/certificados/{id}/pdf?cedula=...` |
| 3 | Marcar listo para retiro | `POST /api/certificados/{id}/marcar-listo` |
| 4 | Confirmar entrega al estudiante | `POST /api/certificados/{id}/marcar-entregado` |
