# Plan de migración a Railway (MySQL) — experimento de alineamiento con la BD oficial

> **Estado:** propuesta de experimento. Documento vivo.
> **Fuente de verdad del esquema oficial:** [`bd_tablas_completas.md`](bd_tablas_completas.md) — 56 tablas en 9 dominios. **Cuando este plan y `bd_tablas_completas.md` digan cosas distintas, gana `bd_tablas_completas.md`.**
> **Esquema actual del módulo:** [`base de datos actual modulo.sql`](../../../../.docs/base%20de%20datos%20actual%20modulo.sql) — Supabase PostgreSQL en producción.
> **Plan de roles cerrado:** [`plan_roles_v3.md`](../plan_roles_v3.md) §9 explica por qué pivotamos a este experimento.

---

## 0. Resumen ejecutivo

**Qué es este documento.** El plan de un experimento personal en la rama `migracion-railway`: montar una BD MySQL en Railway con el esquema oficial al pie de la letra, levantar el backend del módulo apuntando ahí, y validar que los flujos del MVP funcionan. Si funciona, se mergea a `main` sin más drama. No es una propuesta de entrega de código al equipo oficial.

**Qué se entrega al equipo oficial si el experimento sale bien.** Un único artefacto: **el script SQL** con dos bloques claramente separados — (1) `CREATE TABLE` para las tablas que aporta el módulo de trámites; (2) `ALTER TABLE` para las oficiales que el módulo necesita extender, cada uno con justificación inline. Nada más. El backend y el frontend se mergean a `main`, no se entregan como adjuntos.

**Por qué no migramos Supabase ni tocamos nada de producción.** Lo de Supabase funciona. Esta rama no afecta `main` ni la BD productiva. Si el experimento falla, la rama queda como evidencia y nada más.

**Resultado esperado.** Backend funcional contra MySQL/Railway con un schema que es ~95% el oficial sin tocar, ~5% extensiones bien justificadas, más las tablas nuevas del módulo. Frontend ~95% intacto (consume las mismas APIs REST; el lookup interno cédula→id queda en el backend); los ~5% de cambios son formularios admin que asignaban usuarios por cédula y ahora envían `id` numérico (ver §1.3 decisión #12).

---

## 1. Contexto y decisiones de partida

### 1.1 Lo que tenemos hoy (Supabase, producción)

- 6 logins funcionando (5 admins en `admins`, 4 académicos en `usuario`).
- Refactor de identidad híbrida completo (Bloques 0-4 + Sprint A + Sprint B).
- Flujos del MVP probados: certificados, paz y salvos, terminación, grado.
- **Deuda conocida** documentada en [`plan_roles_v3.md`](../plan_roles_v3.md) §8.
- 17 tablas propias: `usuario`, `estudiante`, `programa_academico`, `roles`, `admins`, `dependencias`, `solicitud`, `solicitud_certificado`, `tipo_certificado`, `paz_y_salvo`, `pagos`, `convocatoria`, `documento_solicitud`, `documento_cargado`, `tipo_documento_requerido`, `detalle_grado`, `historial_estado_tramite`, `estados_estudiantes`.

### 1.2 Lo que tiene la BD oficial (Railway, experimento)

Resumen tomado de [`bd_tablas_completas.md`](bd_tablas_completas.md):

- **56 tablas** organizadas en 9 dominios.
- Identidad: `usuarios` (PK `id`, con `cedula` como columna no UNIQUE), `admins` separada con su propio `email`/`password`, `roles` global, `sesiones_activas`.
- Académico: `programas`, `tipos_programas`, `pensums`, `materias`, `semestres`, `semestres_pensums`, `linea_programa`.
- Estudiantes: `estudiantes` (con `cedula` como columna text, `usuario_id` FK), `estados_estudiantes`, `cohortes`, `cohorte_grupos`.
- Matrículas y notas: `matriculas`, `estados_matriculas`, `notas_pregrado`, `notas_posgrado`.
- Solicitudes "delgadas": `solicitudes` (solo `id`, `descripcion`, `estaAprobada`, `fechaAprobacion`, `fechaCreacion`, `estudiante_id`, `matricula_id`, `solicitud_aplazamiento_id`, `soporte_id`, `tipo_solicitud_id`) + `tipos_solicitudes` + `soportes`.
- Proyectos: `proyecto`, `objetivo_especifico`, `sustentacion`, etc.
- DIVISIT: 7 tablas de sincronización con sistema legacy externo.

**Patrón de nombres:** la oficial mezcla camelCase (`nombreCompleto`, `fechaCreacion`, `estaAprobada`) y snake_case (`fecha_sincronizacion`, `primer_nombre`, `cohorte_id`). **No la normalizamos.** Las entities Java mapean exactamente con `@Column(name="nombreCompleto")` cuando aplique.

**Lo que la oficial NO tiene** (y el módulo sí necesita):
- Tabla equivalente a `paz_y_salvo`.
- Tabla equivalente a `tipo_certificado` ni `solicitud_certificado` (certificados académicos administrativos, no contraprestaciones).
- Tabla de `pagos` con integración Wompi.
- Tabla de `convocatoria` para ventanas de tiempo en trámites.
- Tabla de `dependencias` administrativas (Biblioteca, Tesorería, Admisiones).
- Workflow director→posgrados en las solicitudes.
- Discriminación de tipos de operador en `admins` (SUPER vs POSGRADOS vs DEPENDENCIA).

### 1.3 Decisiones de partida

| # | Decisión | Razón |
|---|---|---|
| 1 | **Esquema oficial al pie de la letra.** `bd_tablas_completas.md` es la fuente. Donde el módulo necesite columnas extra, se propone vía `ALTER TABLE` y se documenta. | Lo que el equipo nos pidió textualmente: *"un script de tablas incluidas las que toca corregir oficiales, ejemplo `ALTER TABLE estudiantes...`"*. |
| 2 | **Identidad por `id` numérico, no por cédula.** Todas las FKs propias apuntan a `usuarios.id` / `estudiantes.id` / `admins.id`. Cédula queda como dato de búsqueda (sin UNIQUE, igual que en la oficial). | Evita conflicto con el modelo del equipo, no requiere proponer UNIQUE en `usuarios.cedula`. El lookup cédula→id se hace en el backend. |
| 3 | **Mantenemos las tablas propias del módulo** (`paz_y_salvo`, `solicitud_certificado`, `tipo_certificado`, `pagos`, `convocatoria`, `dependencias`, `solicitudes_grado` (renombre de `solicitud`), `historial_estado_tramite`) con FKs alineadas a la oficial. | El equipo oficial no tiene estos dominios. Son aportes del módulo. Van como `CREATE TABLE` en el script de entrega. |
| 4 | **La tabla `solicitud` propia se conserva con sus campos de workflow, renombrada a `solicitudes_grado`.** No se crea ninguna `workflow_solicitud` nueva. Los campos `decision`, `validacion_posgrados`, `acta_generada`, etc. ya viven ahí. | No tiene sentido inventar tabla nueva. Renombrar a `solicitudes_grado` deja claro que el dominio es el camino al grado (cubre TERMINACION_MATERIAS y GRADO) y la distingue de `solicitudes` oficial. Cambian: FKs (cédulas → ids) y el nombre. |
| 5 | **Adoptamos `tipos_solicitudes` oficial.** Nuestros tipos (`TERMINACION_MATERIAS`, `GRADO`, etc.) se siembran ahí. `solicitud.tipo` (string) pasa a `solicitudes_grado.tipo_solicitud_id` (FK). | El catálogo oficial existe — usarlo es la opción más limpia. Si necesita una columna `codigo` UNIQUE para identificarlos por slug estable, va como ALTER mínimo. |
| 6 | **Adoptamos `soportes` oficial para documentos.** Reemplaza `documento_solicitud` y `documento_cargado`. | Tabla genérica de archivos. Adoptarla elimina duplicación interna del módulo. |
| 7 | **Adoptamos `proyecto` oficial para el detalle de Solicitudes de Grado.** Los campos `titulo_proyecto`, `tipo_proyecto`, `resumen_proyecto` que hoy están duplicados en `solicitud` y `detalle_grado` migran a `proyecto`. | La oficial tiene modelo más rico. Elimina `detalle_grado` (tabla huérfana). |
| 8 | **Importamos `cohortes` y `grupos`** (mínimo viable). | Necesario para validar prerrequisitos contra `notas_posgrado`. Plan v3 §3 decisión #9 se actualiza acá. |
| 9 | **Director del programa se resuelve vía `cohorte_grupos.usuario_id` (patrón oficial).** Reemplaza el modelo "usuario con rol DIRECTOR + programa_id". | Es el patrón documentado por el equipo. Eliminar `cedula_director` (string) y migrar a FK. |
| 10 | **JWT stateless + BCrypt para auth.** Sin SSO. `sesiones_activas` se crea pero no se usa. | Plan v3 §3 decisión #3. Para el experimento no necesitamos SSO. |
| 11 | **Créditos: snapshot + cómputo desde notas.** Detalle en §5. | Mantiene cache rápido + valor siempre frescable. |
| 12 | **Cambios menores en el frontend, no estructurales.** ~95% intacto: las APIs siguen recibiendo `?cedula=` y el backend hace lookup interno cédula→id. ~5% sí cambia: **formularios de admin que asignaban usuarios por cédula** (selector "asignar director del programa", "asignar responsable de paz y salvo", "asignar admin posgrados") ahora envían `id` numérico al backend porque las FKs ahora son a `usuarios.id` / `admins.id` / `estudiantes.id`. Son 3-5 formularios. Listados, dashboards y typeaheads no cambian. | Reduce riesgo en flujos del estudiante. Los formularios admin se ajustan caso por caso durante Fase 5. |

---

## 2. Estrategia de ejecución del experimento

### 2.1 Ramificación

**Rama paralela en el repo `tramites-backend` actual**, llamada `migracion-railway`. Razones:
- Permite reutilizar todo el código actual como punto de partida.
- Mantiene historial unificado (commits del experimento son fácilmente diffeables).
- Si el experimento gana, se hace PR a `main`. Si pierde, la rama queda como evidencia.

### 2.2 Aislamiento de producción

- **Sin afectar Supabase.** El perfil `railway` lee otras env vars y apunta a otra URL.
- **Sin afectar el frontend desplegado.** Mientras el frontend siga apuntando a la API actual, no ve el experimento.
- **Doble perfil de Spring.** El perfil `default` apunta a Supabase como hasta ahora; el perfil `railway` apunta al MySQL del experimento. Se activa con `--spring.profiles.active=railway`.

### 2.3 Definition of Done del experimento

Se considera **exitoso** si sobre Railway/MySQL:

1. Backend arranca sin errores de mapeo Hibernate.
2. Las 6 credenciales de prueba hacen login.
3. Los flujos críticos pasan:
   - Estudiante solicita certificado → paga → dependencia gestiona → entrega.
   - Estudiante solicita Grado → director aprueba → paz y salvos → posgrados aprueba → acta + radicado.
   - Estudiante solicita Terminación de Materias → director aprueba → posgrados valida.
   - Admin crea tipo de certificado con dependencia asignada.
4. La estructura de la BD coincide con `bd_tablas_completas.md` en las tablas adoptadas, sin renombres ni cambios divergentes de columnas críticas.
5. **El script SQL final corre limpio en una BD MySQL recién creada y vacía.** Esto es el entregable.

Si falla algún punto, el experimento sigue siendo útil — documenta exactamente dónde está la fricción al alinear con la oficial.

---

## 3. Schema propuesto para Railway

Esta sección lista las tablas que van a estar en Railway, agrupadas por origen. Es la **referencia exacta** de lo que se va a crear.

### 3.1 Tablas adoptadas tal cual de la oficial (sin tocar)

Estas tablas se crean idénticas a [`bd_tablas_completas.md`](bd_tablas_completas.md) (solo conversión de tipos PostgreSQL → MySQL).

**Identidad y acceso (Dominio 2):**
- `usuarios` — PK `id`, todos los campos del modelo oficial. `cedula` queda como columna TEXT sin UNIQUE.
- `roles` — catálogo global.
- `sesiones_activas` — se crea pero no se usa (mantenemos JWT stateless).

**Estructura académica (Dominio 3):**
- `programas` — todos los campos oficiales.
- `tipos_programas` — catálogo.
- `pensums` — plan curricular.
- `semestres_pensums` — relación pensum↔semestre.
- `semestres` — catálogo.
- `materias` — catálogo con créditos.
- `linea_programa` — opcional para MVP.

**Estudiantes (Dominio 4):**
- `estudiantes` — con `cedula` como columna text (existe en el oficial según `bd_tablas_completas.md` L294), `usuario_id` FK, `pensum_id`, `programa_id`, `cohorte_id`, `estado_estudiante_id`, `esPosgrado`.
- `estados_estudiantes` — catálogo.
- `cohortes` — agrupación anual.
- `cohorte_grupos` — relaciona cohorte con docente vía `usuario_id` (patrón director).

**Matrículas y notas (Dominio 5):**
- `matriculas` — vincula estudiante con grupo_cohorte.
- `estados_matriculas` — catálogo.
- `notas_posgrado` — notas (campo `nota`, `fechaNota`, `matricula_id`).
- `notas_pregrado` — incluida por compatibilidad si el equipo lo requiere.

**Grupos (Dominio 6, mínimo):**
- `grupos_cohortes` — vincula cohorte con docente.
- `grupos` — agrupación de materia.

**Solicitudes (Dominio 7):**
- `solicitudes` — la solicitud académica oficial (delgada: `id`, `descripcion`, `estaAprobada`, `fechaAprobacion`, `fechaCreacion`, `estudiante_id`, `matricula_id`, `tipo_solicitud_id`, `soporte_id`, `solicitud_aplazamiento_id`).
- `tipos_solicitudes` — catálogo. Se siembra con los tipos del módulo (`TERMINACION_MATERIAS`, `GRADO`, etc.).
- `soportes` — archivos genéricos (reemplaza `documento_solicitud` y `documento_cargado`).

**Proyectos (Dominio 8):**
- `proyecto` — reemplaza `detalle_grado` y los campos `titulo_proyecto`/`tipo_proyecto`/`resumen_proyecto` que estaban en `solicitud`.
- `documento` — adjuntos del proyecto (oficial).

### 3.2 Tablas oficiales con ALTER (extensiones del módulo)

**Esta es la sección más sensible políticamente.** Cada ALTER va al script de entrega con un comentario `-- JUSTIFICACIÓN:` explicando *por qué* el módulo lo necesita. Lista corta y conservadora — no se proponen ALTER en `usuarios`, `estudiantes`, `programas`, `pensums`, `materias`, `cohortes`.

**`admins`** — base oficial conservada. Se añaden:
```sql
-- JUSTIFICACIÓN: el módulo distingue 3 tipos operativos. SUPER configura el módulo,
-- POSGRADOS opera bandejas de trámites, DEPENDENCIA solo atiende su bandeja.
ALTER TABLE admins ADD COLUMN tipo VARCHAR(30) NOT NULL DEFAULT 'POSGRADOS'
  CHECK (tipo IN ('SUPER','POSGRADOS','DEPENDENCIA'));

-- JUSTIFICACIÓN: cuando tipo='DEPENDENCIA', identifica a qué dependencia administrativa
-- pertenece (Biblioteca, Tesorería, etc.). dependencias es tabla nueva del módulo.
ALTER TABLE admins ADD COLUMN dependencia_id INT NULL;
ALTER TABLE admins ADD FOREIGN KEY (dependencia_id) REFERENCES dependencias(id);

-- JUSTIFICACIÓN: código institucional estable para el operador (POS001, DEP001).
-- Útil para login alternativo y para mostrar en bandejas de auditoría.
ALTER TABLE admins ADD COLUMN codigo VARCHAR(20) UNIQUE NULL;

-- JUSTIFICACIÓN: nombre concatenado para UI sin tener que juntar los 4 campos.
-- Redundante con primer_nombre + ... pero pragmático.
ALTER TABLE admins ADD COLUMN nombre_completo VARCHAR(150) NULL;
```

**`tipos_solicitudes`** — base oficial conservada. Se añaden:
```sql
-- JUSTIFICACIÓN: el módulo identifica tipos por código estable (TERMINACION_MATERIAS,
-- GRADO) y no solo por id, porque la lógica de negocio depende del tipo.
ALTER TABLE tipos_solicitudes ADD COLUMN codigo VARCHAR(40) UNIQUE NULL;

-- JUSTIFICACIÓN: permite desactivar un tipo sin borrar histórico de solicitudes.
ALTER TABLE tipos_solicitudes ADD COLUMN activo BOOLEAN NOT NULL DEFAULT TRUE;
```

**`solicitudes`** — sin ALTER. Los datos de workflow del módulo viven en la tabla `solicitudes_grado` propia (sección 3.3), no en la oficial.

**`estudiantes`** — base oficial conservada. Se añade un campo necesario para validar prerrequisitos del módulo:
```sql
-- JUSTIFICACIÓN: créditos acumulados aprobados por el estudiante. Necesario para validar
-- prerrequisitos del módulo (Terminación de Materias exige tener todos los créditos del programa
-- aprobados antes de poder solicitar). Cache mantenido por backend del módulo, alimentado desde
-- notas_posgrado/notas_pregrado vía CreditosService (ver §5). Se propone como ALTER porque:
--   (a) no sabemos si el equipo oficial ya tiene su propio cálculo y queremos coordinar;
--   (b) sin este campo, romperíamos el MVP actual del módulo que valida contra él.
-- Alternativa: si el equipo prefiere computar siempre on-demand sin cache, este ALTER se omite
-- y el módulo asume el costo del cómputo. Decisión a confirmar en la mesa de integración.
ALTER TABLE estudiantes ADD COLUMN creditos_aprobados INT NULL DEFAULT 0;
```

**`usuarios`** — sin ALTER de columnas. Solo un índice no único opcional para acelerar el lookup cédula→id:
```sql
-- JUSTIFICACIÓN: lookup frecuente desde el módulo. No es UNIQUE para respetar el modelo oficial.
CREATE INDEX idx_usuarios_cedula ON usuarios(cedula);
```

### 3.3 Tablas propias del módulo (CREATE TABLE en el script de entrega)

Estas tablas no existen en la oficial. Van como `CREATE TABLE` en el script. Todas usan `id` numérico como PK y FKs a la oficial.

**`dependencias`** — catálogo administrativo. Sin equivalente oficial.
```
PK id
nombre VARCHAR(100) UNIQUE NOT NULL
descripcion VARCHAR(255)
activa BOOLEAN DEFAULT TRUE
```

**`solicitudes_grado`** — la solicitud del módulo de trámites, con su workflow director→posgrados. **Renombrada desde `solicitud` actual** para dejar claro que es un dominio distinto de `solicitudes` oficial (esa es para aplazamientos académicos; ésta es para trámites administrativos del camino al grado: cubre `tipo='TERMINACION_MATERIAS'` y `tipo='GRADO'`, no solo el grado final).

Se conserva la estructura actual con FKs alineadas a la oficial:
```
PK id
estudiante_id INT FK → estudiantes.id            (antes: cedula string)
tipo_solicitud_id INT FK → tipos_solicitudes.id  (antes: tipo string)
estado VARCHAR(30)
fecha_solicitud DATETIME
costo DECIMAL
observaciones TEXT

-- Workflow director
director_id INT NULL FK → usuarios.id            (antes: cedula_director string)
decision VARCHAR(20)                              -- APROBADA | RECHAZADA | PENDIENTE
fecha_decision DATETIME
observaciones_director TEXT
fecha_en_revision DATETIME

-- Workflow posgrados
posgrados_admin_id INT NULL FK → admins.id       (ya existe en el módulo)
validacion_posgrados VARCHAR(20)
fecha_validacion DATETIME
observaciones_posgrados TEXT

-- Datos de cierre (solo para tipo=GRADO)
proyecto_id INT NULL FK → proyecto.id            (antes: titulo/tipo/resumen inline)
acta_generada BOOLEAN
radicado VARCHAR(50) UNIQUE
modalidad_grado VARCHAR(30)
pago_modalidad_realizado BOOLEAN
estado_pago_grado VARCHAR(30)
fecha_grado DATE
```

**Costo del renombre `solicitud` → `solicitudes_grado`:** trivial en SQL (un CREATE distinto), mediano en código Java:
- Renombrar entity `Solicitud` → `SolicitudGrado` (o mantener `Solicitud` con `@Table(name="solicitudes_grado")`).
- Repos: `SolicitudRepository` → `SolicitudGradoRepository`.
- Services y controllers: actualizar imports y nombres de variables.
- Frontend: revisar si los paths de API (`/api/solicitudes/*`) se renombran — recomendable mantenerlos para minimizar cambios.
- `historial_estado_tramite.solicitud_id` → `solicitudes_grado_id`.

**Campos zombie a eliminar de la `solicitud` actual** (no se incluyen en el CREATE del experimento):
- `cedula` (string) → reemplazado por `estudiante_id` (FK).
- `cedula_director` (string) → reemplazado por `director_id` (FK).
- `cedula_posgrados` (string) → ya estaba zombie, eliminado definitivamente.
- `tipo` (string) → reemplazado por `tipo_solicitud_id` (FK).
- `titulo_proyecto`, `tipo_proyecto`, `resumen_proyecto` (inline) → reemplazados por `proyecto_id` (FK).

**`paz_y_salvo`** — paz y salvo por dependencia. Sin equivalente oficial.
```
PK id
solicitudes_grado_id INT FK → solicitudes_grado.id (del módulo)
estudiante_id INT FK → estudiantes.id            (antes: cedula_estudiante)
responsable_admin_id INT NULL FK → admins.id     (DEPENDENCIA o POSGRADOS)
responsable_usuario_id INT NULL FK → usuarios.id (DIRECTOR cuando aplique)
tipo_dependencia VARCHAR(50)
dependencia_id INT FK → dependencias.id          (antes: dependencia string)
estado VARCHAR(30)
observaciones TEXT
fecha_solicitud DATETIME
fecha_respuesta DATETIME
soporte_id INT NULL FK → soportes.id             (en vez de archivo_contenido/nombre/tipo inline)
```

**Campos zombie a eliminar de `paz_y_salvo` actual:**
- `cedula_responsable`, `cedula_estudiante` → reemplazados por FKs.
- `archivo_contenido`, `archivo_nombre`, `archivo_tipo`, `fecha_carga`, `fecha_creacion`, `token` → nunca mapeados, eliminados. Si hace falta archivo, va a `soportes` con FK.
- `dependencia` (string), `nombre_dependencia` → reemplazados por `dependencia_id` (FK).

**`tipo_certificado`** — catálogo. Sin equivalente oficial.
```
PK id
codigo VARCHAR(40) UNIQUE
label VARCHAR(150)
descripcion VARCHAR(255)
precio_digital DECIMAL
costo_logistica_fisica DECIMAL
dependencia_id INT FK → dependencias.id          (antes: dependencia_cedula)
direccion_oficina VARCHAR(255)
tiempo_entrega_dias INT
activo BOOLEAN
```

**`solicitud_certificado`** — solicitud de constancia. **Tabla separada de `solicitudes` oficial.**
```
PK id
estudiante_id INT FK → estudiantes.id            (antes: cedula string)
tipo_certificado_id INT FK → tipo_certificado.id (antes: tipo_certificado string)
modalidad_envio VARCHAR(20)
estado VARCHAR(30)
fecha_solicitud, fecha_vencimiento_pago, fecha_pago, fecha_generacion, fecha_entrega
costo DECIMAL
observaciones TEXT
destinatario VARCHAR(255)
url_pdf TEXT
hash_pdf VARCHAR(255)
```

**Campos zombie a eliminar de `solicitud_certificado` actual:**
- `cedula`, `cedula_dependencia` → reemplazados por FKs.
- `tipo_certificado` (string) → reemplazado por `tipo_certificado_id` (FK).

**`pagos`** — pagos Wompi. Sin equivalente oficial. **Crear la entity Java por fin** — hoy se accede vía SQL directo.
```
PK id
solicitudes_grado_id INT NULL FK → solicitudes_grado.id
solicitud_certificado_id INT NULL FK → solicitud_certificado.id
cedula_estudiante VARCHAR(20)                    -- snapshot, no FK
estado VARCHAR(30)
monto_centavos BIGINT
referencia VARCHAR(100) UNIQUE
wompi_transaction_id VARCHAR(100)
redirect_url TEXT
fecha_creacion DATETIME
fecha_actualizacion DATETIME
```

**`convocatoria`** — ventanas de tiempo para trámites. Sin equivalente oficial.
```
PK id
tipo_solicitud_id INT FK → tipos_solicitudes.id
programa_id INT NULL FK → programas.id
cohorte_id INT NULL FK → cohortes.id
fecha_inicio DATE
fecha_fin DATE
```

**`historial_estado_tramite`** — auditoría. Sin equivalente oficial. **Crear la entity Java por fin.**
```
PK id
solicitudes_grado_id INT NULL FK → solicitudes_grado.id
solicitud_certificado_id INT NULL FK → solicitud_certificado.id
tipo_tramite VARCHAR(40)
actor_usuario_id INT NULL FK → usuarios.id
actor_admin_id INT NULL FK → admins.id
rol_actor VARCHAR(30)
estado_anterior VARCHAR(30)
estado_nuevo VARCHAR(30)
fecha_cambio DATETIME
observaciones TEXT
```

### 3.4 Tablas a ELIMINAR del módulo (no van al CREATE del script)

| Tabla actual del módulo | Razón |
|---|---|
| `usuario` | Reemplazada por `usuarios` oficial. |
| `estudiante` (la propia) | Reemplazada por `estudiantes` oficial. |
| `programa_academico` | Reemplazada por `programas` oficial. `total_creditos` se computa. |
| `roles` (la del módulo) | `roles` oficial cubre el caso. Solo se siembran los roles académicos: ESTUDIANTE, DIRECTOR_PROGRAMA, DOCENTE, EVALUADOR. POSGRADOS / DEPENDENCIA / SUPER viven en `admins.tipo`. |
| `documento_solicitud` | Reemplazada por `soportes` oficial. |
| `documento_cargado` | Huérfana. Reemplazada por `soportes` oficial. |
| `detalle_grado` | Reemplazada por `proyecto` oficial (modelo más rico). |
| `tipo_documento_requerido` | Nunca usada. Eliminar. |

### 3.5 Tablas oficiales omitidas del experimento

Estas tablas de la oficial NO se incluyen en el experimento. Si el equipo pide después, se añaden.

| Tabla oficial | Razón de omisión |
|---|---|
| Todas las `*_divisit` (7 tablas) | Sincronización legacy externa. Se mockea con seeds manuales en `notas_posgrado`. |
| `cambio_estado_matriculas` | Auditoría avanzada de matrículas. No usada por trámites. |
| `historial_cierre_notas`, `historico_grupos`, `historico_semestres` | Históricos académicos fuera del scope. |
| `coloquio`, `coloquio_estudiante` | No relacionados con trámites. |
| `contraprestaciones`, `tipos_contraprestaciones` | Fuera del MVP. |
| `sustentacion`, `sustentacion_documento`, `sustentacion_evaluador`, `criterio_evaluacion` | MVP no maneja sustentación aún. |
| `usuario_proyecto`, `retroalimentacion`, `definitiva`, `objetivo_especifico` | Idem investigación. |
| `meta_ods`, `proyecto_meta_ods`, `macro`, `macro_grupo`, `trabajos_orcid` | Catálogos académicos avanzados. |

**Total experimento:** ~22 tablas oficiales adoptadas + 7 ALTER mínimos sobre oficiales (4 en `admins`, 2 en `tipos_solicitudes`, 1 en `estudiantes`) + 1 índice sobre `usuarios.cedula` + 8 tablas propias del módulo = **~30 tablas en Railway**.

---

## 4. Mapeo tabla actual → tabla del nuevo esquema

| Tabla actual (Supabase) | Destino en Railway | Acción |
|---|---|---|
| `usuario` | `usuarios` (oficial) | Renombrar tabla. Drop `programa_id`, `creditos_aprobados`, `estado_grado`, `correo`, `nombre`, `rol` (zombies o movidos). Las entities Java mapean con `@Column(name="nombreCompleto")` exacto. |
| `estudiante` | `estudiantes` (oficial) | Renombrar tabla. FKs `usuario_id`, `programa_id`, `pensum_id`, `cohorte_id`, `estado_estudiante_id` ya alineadas. Mantiene `cedula` (text, sin UNIQUE) según oficial. |
| `estados_estudiantes` | `estados_estudiantes` (oficial) | Sin cambio. |
| `programa_academico` | `programas` (oficial) + `tipos_programas` | Migrar `nombre` y `tipo` (vía `tipos_programas.id`). Drop `total_creditos` — se computa. |
| `roles` (módulo) | `roles` (oficial) | Sin cambio estructural. Sembrar solo roles académicos: ESTUDIANTE, DIRECTOR_PROGRAMA, DOCENTE, EVALUADOR. |
| `admins` (módulo) | `admins` (oficial + ALTER §3.2) | Mantener con extensiones `tipo`, `dependencia_id`, `codigo`, `nombre_completo`. |
| `dependencias` (módulo) | `dependencias` (módulo, sin cambio) | CREATE TABLE en el script. |
| `solicitud` (módulo) | `solicitudes_grado` (módulo, renombrada y refactorizada §3.3) | **Renombrada** para dejar claro su dominio (camino al grado: cubre TERMINACION_MATERIAS y GRADO). NO se mueve a `solicitudes` oficial. Refactor de FKs: cédulas → ids. |
| `detalle_grado` (módulo) | `proyecto` (oficial) | Datos migrados a `proyecto`. Tabla huérfana eliminada. |
| `tipo_certificado` (módulo) | `tipo_certificado` (módulo) | CREATE en el script. FK `dependencia_id` (drop `dependencia_cedula` zombie). |
| `solicitud_certificado` (módulo) | `solicitud_certificado` (módulo) | CREATE en el script. FKs: `estudiante_id`, `tipo_certificado_id`. Drop `cedula`, `cedula_dependencia`. |
| `paz_y_salvo` (módulo) | `paz_y_salvo` (módulo, refactorizada §3.3) | CREATE en el script. FKs nuevas. Drop 7 zombies (`cedula_responsable`, archivo_*, token, fecha_carga, fecha_creacion). Archivos vía `soporte_id` → `soportes`. |
| `pagos` (módulo) | `pagos` (módulo) | CREATE en el script. **Crear entity Java por fin.** |
| `convocatoria` (módulo) | `convocatoria` (módulo) | CREATE en el script. FKs nuevas (`tipo_solicitud_id`, `programa_id`, `cohorte_id`). |
| `documento_solicitud` (módulo) | `soportes` (oficial) | Consolidar en `soportes`. |
| `documento_cargado` (módulo) | `soportes` (oficial) | Idem. |
| `tipo_documento_requerido` (módulo) | (eliminado) | Tabla huérfana, nunca usada. |
| `historial_estado_tramite` (módulo) | `historial_estado_tramite` (módulo) | CREATE en el script. **Crear entity Java por fin.** Refactor de FKs. |

**Nuevas tablas oficiales que se crean (no existían en Supabase):**

- `tipos_solicitudes`
- `pensums`, `semestres_pensums`, `semestres`, `materias`, `linea_programa`
- `cohortes`, `cohorte_grupos`, `grupos_cohortes`, `grupos`
- `matriculas`, `estados_matriculas`, `notas_pregrado`, `notas_posgrado`
- `proyecto`, `documento` (de proyectos)
- `sesiones_activas` (opcional)

---

## 5. Créditos aprobados — flujo completo

Esta sección es **crítica** para la propuesta de integración porque es el corazón de la validación de Terminación de Materias y Solicitud de Grado. La oficial NO documenta cómo calcula este dato, así que el módulo lo propone explícitamente.

### 5.1 Lógica de negocio

> Un estudiante solo puede solicitar **Terminación de Materias** si ha aprobado *todos* los créditos del pensum de su programa.
> Una vez aprobada la Terminación, el estado del estudiante cambia y queda habilitado para solicitar **Grado**.

Esa regla está implementada hoy en el backend del módulo. Para que funcione en el esquema oficial, necesitamos saber:
- **Cuántos créditos requiere el programa del estudiante** (lo "esperado").
- **Cuántos créditos ha aprobado el estudiante** (lo "actual").

### 5.2 Cuántos créditos requiere el programa (lo "esperado")

**`programas` oficial NO tiene `total_creditos`.** Su modelo es: `programas → pensums → materias`, donde cada materia tiene `creditos`. El total requerido se computa derivado:

```sql
-- Total de créditos del pensum vigente del programa del estudiante:
SELECT COALESCE(SUM(m.creditos), 0) AS total_requerido
FROM materias m
WHERE m.pensum_id = (
    SELECT e.pensum_id
    FROM estudiantes e
    WHERE e.id = ?
);
```

**Decisión:** este valor se computa cada vez, no se persiste. Es estable mientras no cambien las materias del pensum; cambio raro.

**Implicación:** la `programa_academico.total_creditos` actual del módulo se elimina (era un campo redundante).

### 5.3 Cuántos créditos ha aprobado el estudiante (lo "actual")

Aquí está la propuesta al equipo oficial — **ALTER `estudiantes` con `creditos_aprobados INT NULL DEFAULT 0`** (ver §3.2).

El campo es un **cache** mantenido por backend del módulo. Tres opciones para alimentarlo, no excluyentes:

| Estrategia | Cuándo se actualiza | Costo |
|---|---|---|
| **On-demand antes de validar prerrequisito** | Cuando el estudiante intenta crear Solicitud de Terminación | Cero impacto en escritura; cálculo se hace solo cuando importa |
| **Sync periódico (job nocturno)** | Cron nocturno | Bajo, el dato está al día por la mañana |
| **Sync inmediato** | Cada vez que se inserta en `notas_posgrado`/`notas_pregrado` | Cero latencia en la lectura; complejidad media (trigger BD o evento de aplicación) |

**Recomendado para el experimento:** opción 1 (on-demand antes de validar). La query de cómputo es:

```sql
-- Suma de créditos de materias con nota aprobatoria del estudiante:
SELECT COALESCE(SUM(m.creditos), 0) AS creditos_aprobados
FROM matriculas mat
JOIN grupos_cohortes gc ON mat.grupo_cohorte_id = gc.id
JOIN grupos g           ON gc.grupo_id = g.id
JOIN materias m         ON g.materia_id = m.id
JOIN notas_posgrado n   ON n.matricula_id = mat.id
WHERE mat.estudiante_id = ?
  AND n.nota >= 3.0;
```

```java
public boolean puedeSolicitarTerminacion(Long estudianteId) {
    int aprobados = creditosService.calcular(estudianteId);            // SUM de notas
    estudianteRepository.actualizarCreditosAprobados(estudianteId, aprobados);  // refresca cache
    int requeridos = creditosService.totalRequerido(estudianteId);     // SUM de pensum
    return aprobados >= requeridos;
}
```

### 5.4 Por qué proponer ALTER y no solo computar siempre

1. **No rompe el MVP actual.** El módulo lee `estudiantes.creditos_aprobados` hoy. Si quitamos el campo, hay que reescribir validaciones, repos, services, controllers.
2. **No sabemos qué calcula el equipo oficial.** Quizás ya tienen un proceso propio (importación desde DIVISIT, importación desde Moodle, registro manual al cerrar semestre). Si lo tienen, *ellos llenan el campo* y nuestro `CreditosService` se vuelve solo lectura. Si no lo tienen, *el módulo lo llena* desde notas. Tener el campo permite ambos escenarios sin reescribir.
3. **Performance en reportes.** Una bandeja de "estudiantes próximos a graduarse" hace `WHERE creditos_aprobados >= X`. Sin cache, ese filtro requiere computar para cada estudiante.

**Justificación inline en el ALTER (la que va al script de entrega):** ya está documentada en §3.2.

### 5.5 Implicación para seeds del experimento

Como el campo persiste, **los seeds de notas son opcionales** para validar el flujo de Terminación. Basta con sembrar:
- Estudiante con `creditos_aprobados = N` directo.
- Programa con pensum cuyas materias sumen `N` créditos.
- La validación funcionará sin tocar `matriculas` ni `notas_posgrado`.

**Cuándo sí sembrar matrículas + notas:** solo si quieres probar end-to-end que el `CreditosService.calcular()` funciona contra la BD oficial. Recomendado para uno de los estudiantes del demo (el resto con `creditos_aprobados` seedado directo).

### 5.6 Camino futuro con DIVISIT real

Cuando exista integración con DIVISIT, el `CreditosService.calcular()` se reemplaza por una llamada a su API/tablas (`notas_divisit`, `materias_matriculadas_divisit`), sin tocar el resto del código. El campo `estudiantes.creditos_aprobados` sigue siendo el contrato estable que lee el resto del módulo.

---

## 6. Adaptaciones técnicas (PostgreSQL → MySQL)

### 6.1 `application-railway.properties` (nuevo)

```properties
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
spring.datasource.url=jdbc:mysql://<railway-host>:3306/<db>?useSSL=true&serverTimezone=UTC
spring.datasource.username=${RAILWAY_DB_USERNAME}
spring.datasource.password=${RAILWAY_DB_PASSWORD}
spring.jpa.hibernate.ddl-auto=validate
```

`spring.jpa.hibernate.ddl-auto=validate` para asegurar que el schema lo crea solo el script SQL, no Hibernate.

El perfil `default` queda apuntando a Supabase (sin cambios). Se activa el experimento con `--spring.profiles.active=railway`.

### 6.2 `pom.xml`

Añadir dependencia MySQL Connector:

```xml
<dependency>
  <groupId>com.mysql</groupId>
  <artifactId>mysql-connector-j</artifactId>
</dependency>
```

PostgreSQL driver se queda (lo necesita el perfil default).

### 6.3 Diferencias de tipos

| PostgreSQL | MySQL |
|---|---|
| `BIGINT GENERATED ALWAYS AS IDENTITY` | `BIGINT AUTO_INCREMENT` |
| `BYTEA` | `LONGBLOB` |
| `TEXT` | `TEXT` o `LONGTEXT` |
| `BOOLEAN` | `TINYINT(1)` (Hibernate lo abstrae) |
| `TIMESTAMP` | `DATETIME` |
| `CHECK (col IN (...))` | Soportado en MySQL 8.0.16+ |

### 6.4 Hash de contraseñas

BCrypt sin cambios. El hash `$2a$10$TCpV633Sg7xBIMP/VpL80uQw9YHjSPvk5iFmk6aFs.yxQwVq5eSBq` para `123456` funciona tal cual.

### 6.5 Lookup cédula→id en backend

Para no romper el frontend, los repos del módulo exponen helpers:

```java
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByCedula(String cedula);
}
public interface EstudianteRepository extends JpaRepository<Estudiante, Long> {
    Optional<Estudiante> findByCedula(String cedula);
}
```

Los controllers que reciben `?cedula=` hacen el lookup al inicio y trabajan con `id` internamente.

---

## 7. Plan de ejecución del experimento

> Sin cronograma. Cada fase termina con un commit en la rama `migracion-railway`.

### Fase 1 — Setup Railway

1. Crear cuenta/servicio MySQL en Railway. Anotar credenciales.
2. Verificar conexión desde un cliente local (`mysql` CLI o DBeaver).
3. Crear branch `migracion-railway` en `tramites-backend`.
4. Añadir dependencia MySQL Connector en `pom.xml`.
5. Crear `application-railway.properties`.

### Fase 2 — Schema oficial limpio

1. Escribir `tramites-backend/.docs/sql/railway/01_schema_oficial.sql` con las ~22 tablas oficiales adoptadas (§3.1), respetando nombres exactos de `bd_tablas_completas.md`.
2. Aplicarlo en Railway.
3. Verificar que las tablas y FKs se crean correctamente.

### Fase 3 — Tablas nuevas del módulo

1. Escribir `tramites-backend/.docs/sql/railway/02_tablas_modulo.sql` con las 8 tablas propias (§3.3).
2. Aplicarlo en Railway.

### Fase 4 — ALTERs sobre oficiales

1. Escribir `tramites-backend/.docs/sql/railway/03_alteraciones_oficiales.sql` con los 4-6 ALTER de §3.2, **cada uno con su comentario `-- JUSTIFICACIÓN`**.
2. Aplicarlo en Railway.
3. Este es el archivo más sensible — corto y bien argumentado.

### Fase 5 — Refactor del backend

1. Renombrar entities:
   - `Usuario` (@Table `usuarios`) — eliminar campos zombie, alinear `@Column` con nombres oficiales.
   - `Estudiante` (@Table `estudiantes`) — alinear con oficial. `cedula` se conserva (existe en oficial).
   - `Programa` (@Table `programas`) — reemplaza `ProgramaAcademico`. Drop `total_creditos`.
   - `SolicitudGrado` (@Table `solicitudes_grado`) — renombre desde `Solicitud`, refactor de FKs (cédulas → ids), drop campos inline de proyecto. Actualiza repos, services, controllers.
2. Crear entities nuevas: `Pensum`, `Materia`, `Cohorte`, `CohorteGrupo`, `Matricula`, `Soporte`, `TipoSolicitud`, `Proyecto`, `NotaPosgrado`.
3. **Crear entities faltantes del módulo**: `Pago`, `HistorialEstadoTramite`.
4. **Eliminar entities huérfanas**: `DetalleGrado`, `DocumentoCargado`, `TipoDocumentoRequerido`.
5. Adaptar repos y servicios. Añadir `findByCedula` como helpers donde haga falta.
6. Crear `CreditosService` con cómputo + snapshot (§5).
7. Verificar compilación local + arranque local apuntando a Railway con `--spring.profiles.active=railway`.

### Fase 6 — Seeds

1. Escribir `tramites-backend/.docs/sql/railway/04_seeds.sql` con datos mínimos:
   - Roles académicos (ESTUDIANTE, DIRECTOR_PROGRAMA, DOCENTE, EVALUADOR).
   - Tipos de programas (Maestría, Doctorado, Especialización).
   - 1-2 programas + pensum + materias **cuyos créditos sumen un total conocido (ej. 90 créditos)**. Este total es el "requerido" computado del pensum.
   - 1 cohorte + cohorte_grupos con docente asignado.
   - Estados (ACTIVO, PAGO_GRADO_PENDIENTE, GRADUADO).
   - Tipos de solicitudes (TERMINACION_MATERIAS, GRADO) con `codigo` UNIQUE.
   - Estados de matrículas (mínimo MATRICULADO, APROBADO).
   - 6 usuarios para los 6 logins + perfiles de estudiante donde aplique. **`estudiantes.creditos_aprobados` se seedea directo** (ej. estudiante1=90 → habilitado para Terminación; estudiante2=45 → bloqueado).
   - 5 admins (POS001, ADMIN1, DEP001-3) con `tipo` correspondiente.
   - Dependencias (Biblioteca, Financiera, Admisiones).
   - Tipos de certificado de ejemplo.
   - **Opcional, solo para 1 estudiante:** matrículas + notas_posgrado que sumen los créditos. Sirve para validar que `CreditosService.calcular()` funciona end-to-end contra la oficial. El resto de estudiantes usan el campo seedeado directo.
2. Aplicarlo en Railway.

### Fase 7 — Smoke test E2E

Mismo checklist que `plan_roles_v3.md §6`, contra Railway:

- 6 logins funcionan.
- Estudiante solicita certificado → DEP marca listo → estudiante descarga PDF.
- Estudiante solicita Grado → Director aprueba → paz y salvos creados → DEP responde → POS aprueba → acta + radicado.
- Estado del estudiante cambia (ACTIVO → PAGO_GRADO_PENDIENTE → GRADUADO).
- Cálculo de créditos por `CreditosService` cuadra con la suma de materias aprobadas.

### Fase 8 — Empaquetar el script de entrega

Cuando el experimento esté verde, generar el **único entregable**:

`tramites-backend/.docs/sql/railway/script_final_integracion.sql` con tres bloques:

```sql
-- ================================================================
-- SCRIPT DE INTEGRACIÓN — Módulo Trámites de Posgrado sobre BD oficial
-- ================================================================
-- Fecha: <YYYY-MM-DD>
-- Motor target: MySQL 8.x (compatible con PostgreSQL 13+ adaptando AUTO_INCREMENT → IDENTITY)
-- Fuente del esquema oficial: bd_tablas_completas.md
--
-- Este script asume que las tablas oficiales ya existen en la BD destino.
-- ================================================================

-- SECCIÓN 1: ALTERACIONES PROPUESTAS A TABLAS OFICIALES
-- Cada ALTER lleva su JUSTIFICACIÓN.
-- ================================================================
<contenido de 03_alteraciones_oficiales.sql>

-- ================================================================
-- SECCIÓN 2: TABLAS NUEVAS DEL MÓDULO DE TRÁMITES
-- 8 tablas: dependencias, solicitud, paz_y_salvo, tipo_certificado,
-- solicitud_certificado, pagos, convocatoria, historial_estado_tramite.
-- ================================================================
<contenido de 02_tablas_modulo.sql>

-- ================================================================
-- SECCIÓN 3: ÍNDICES RECOMENDADOS (NO ALTERS de columnas)
-- ================================================================
CREATE INDEX idx_usuarios_cedula ON usuarios(cedula);
-- (otros índices útiles que surjan durante el experimento)
```

**Eso es lo único que se entrega al equipo oficial.** El backend y el frontend se mergean a `main` directamente.

Acompañar el script con un breve `INTEGRACION_README.md` (no más de una página) que explique:
- Qué dominio cubre el módulo.
- Por qué cada ALTER.
- Plan B si rechazan los ALTER de `admins` (ver §8.1).

---

## 8. Riesgos y decisiones abiertas

### 8.1 Riesgos

| Riesgo | Mitigación |
|---|---|
| El equipo oficial tiene matices del schema que no están en `bd_tablas_completas.md` | Al levantar el script contra su BD real, se descubrirán divergencias. El experimento es "best-effort" sobre lo documentado. |
| MySQL no soporta features de PostgreSQL que usamos (FKs polimórficas, `COALESCE`, etc.) | Verificar al pasar cada query. Probablemente sin bloqueos serios. |
| El equipo rechaza los ALTER de `admins` | **Plan B:** crear tabla puente `admin_extension` propia con FK a `admins.id` que guarda `tipo`, `dependencia_id`, `codigo`, `nombre_completo`. Menos elegante pero respeta totalmente la oficial. Tener el SQL listo desde el inicio. |
| El equipo rechaza ALTER en `tipos_solicitudes` | **Plan B:** usar solo `id` para identificar tipos (sin `codigo` UNIQUE). Mapear desde código con un `switch` o un Map estático. Pierde elegancia pero funciona. |
| `notas_posgrado` requiere seeds manuales para que créditos cuadre | Aceptable. Documentar el seed con comentarios para que sea reproducible. |
| Wompi sandbox no funciona desde Railway | Mockear el cliente Wompi con perfil de pruebas; usar ngrok para webhooks si hace falta. |
| El experimento sale bien pero al mergear a `main` rompe el perfil Supabase | Mantener el perfil `default` apuntando a Supabase intocado. Hibernate `ddl-auto=update` en Supabase puede crear columnas conflictivas — verificar antes de mergear. |

### 8.2 Decisiones tomadas (v2.1)

| Decisión | Resolución |
|---|---|
| Snapshot `creditos_aprobados` en `estudiantes` | **Se propone ALTER** (§3.2). No rompe el MVP y permite que el equipo elija quién alimenta el cache. Detalle completo en §5. |
| Importar `linea_investigacion` y `grupo_investigacion` | **No.** Fuera del scope del MVP. El módulo solo usa `proyecto` porque Solicitud de Grado requiere los datos del proyecto; las líneas y grupos son del dominio académico, no del trámite. |
| Uso de `sesiones_activas` | **CREATE de la tabla, sin uso.** Mantenemos JWT stateless. La tabla queda como gesto de alineamiento. |
| Renombre `solicitud` → `solicitudes_grado` | **Sí.** Refleja correctamente el dominio (camino al grado: cubre TERMINACION_MATERIAS y GRADO). |
| Cambios en el frontend | **Sí, mínimos.** ~95% intacto. Formularios admin que asignaban usuarios por cédula (selector director, selector responsable paz y salvo) cambian a enviar `id`. |

### 8.3 Decisiones que quedan abiertas

| Decisión | Opciones | Recomendación inicial |
|---|---|---|
| ¿`solicitud_certificado` unifica con `solicitudes` oficial? | (a) tabla separada del módulo; (b) integrar con `tipo_solicitud_id` = CERTIFICADO + tabla de extensión | (a) por simplicidad. Reevaluar al final. |
| ¿Cómo gestionamos seeds de notas para el estudiante demo del cómputo? | Manual / script generador | Manual para 1 estudiante demo. Resto con `creditos_aprobados` seedado directo (§5.5). |
| ¿La columna `proyecto_id` en `solicitudes_grado` es FK NOT NULL para tipo=GRADO? | Sí / nullable | Nullable. Validación a nivel de servicio cuando `tipo='GRADO'`. |

---

## 9. Próximos pasos

1. **Validar este plan con el PO.** Especialmente las decisiones abiertas de §8.2.
2. **Ejecutar Fase 1** (setup Railway, branch, dependencias, perfil).
3. **Ejecutar Fases 2-4** (schemas + ALTERs en Railway).
4. **Ejecutar Fase 5** (refactor backend) — la fase más grande.
5. **Ejecutar Fase 6** (seeds).
6. **Smoke test E2E** (Fase 7) — punto de control.
7. **Empaquetar el script de entrega** (Fase 8).
8. Si todo verde → PR a `main`.

---

## 9b. Trabajo en `main` que el experimento debe absorber

El experimento `migracion-railway` corre en paralelo a otras tareas que siguen en `main`. Cuando esas tareas mergeen a `main`, hay que traerlas a `migracion-railway` (merge o rebase) y ajustar este plan.

### 9b.1 Cambio venidero: Certificados solo en POSGRADOS

**Tarea en curso en rama `certificados-David`** (ver [`../Certificados/certificados_posgrados.md`](../Certificados/certificados_posgrados.md)):
- Se elimina la pestaña Certificados del rol DEPENDENCIA.
- Se elimina el selector "Dependencia encargada" del formulario de tipos de certificado.
- La columna `tipo_certificado.dependencia_id` (FK a `dependencias.id`) se elimina de la BD del módulo.
- La columna `tipo_certificado.dependencia_cedula` (zombie del esquema anterior) se elimina definitivamente del seed.
- La bandeja de gestión de certificados físicos pasa de DEPENDENCIA → POSGRADOS.

**Impacto en este plan cuando se mergee a `main` y luego a `migracion-railway`:**

| Sección de este plan | Ajuste necesario |
|---|---|
| §3.3 tabla `tipo_certificado` | Eliminar la FK `dependencia_id → dependencias.id`. Eliminar `direccion_oficina` si solo aplicaba a dependencias externas; mantenerlo si POSGRADOS también lo usa. |
| §3.3 tabla `solicitud_certificado` | El campo `cedula_dependencia` ya estaba marcado como zombie; con este cambio queda confirmado eliminarlo. |
| §1.3 decisión #12 (frontend) | Un formulario admin menos que migra (el selector "Dependencia encargada" deja de existir antes de la migración). |
| §3.5 Total experimento | Recuento de tablas igual; conteo de columnas eliminadas aumenta. |
| Roles operativos | DEPENDENCIA pierde acceso a certificados. Solo conserva paz y salvos. POSGRADOS gana la bandeja de impresión/entrega. |

**Orden recomendado:**
1. Terminar el cambio de certificados sobre Supabase en `main`.
2. Mergear `main` → `migracion-railway`.
3. Actualizar §3.3 de este plan para reflejar el `tipo_certificado` ya sin `dependencia_id`.
4. Seguir con las fases pendientes del experimento.

---

## 10. Documentos relacionados

- [`bd_tablas_completas.md`](bd_tablas_completas.md) — **esquema oficial completo (fuente de verdad)**.
- [`../base_de_datos_oficial_posgrados.md`](../base_de_datos_oficial_posgrados.md) — esquema oficial sintetizado por módulos (v1, contexto histórico).
- [`../clientes_finales_sistema.md`](../clientes_finales_sistema.md) — análisis de identidad/roles oficiales.
- [`../plan_roles_v3.md`](../plan_roles_v3.md) — plan vivo del módulo de identidad. §9 documenta el pivot que dio origen a este plan.
- [`../plan_roles_v2.md`](../plan_roles_v2.md) — referencia histórica de decisiones (Bloques 0-5).
- [`../plan_integracion_bd_oficial.md`](../plan_integracion_bd_oficial.md) — plan macro de integración. Este experimento implementa naturalmente las Fases 1, 2 y parte de la 4 de ese plan.
- [`../../../../.docs/base%20de%20datos%20actual%20modulo.sql`](../../../../.docs/base%20de%20datos%20actual%20modulo.sql) — schema actual en Supabase (origen de la migración).

---

**Versión:** 2.1
**Última actualización:** 2026-06-01
**Estado:** plan vivo del experimento (rama `migracion-railway`, personal).

**Cambios v2.1 vs v2.0:**
- **Renombre `solicitud` → `solicitudes_grado`** en el módulo, para dejar claro su dominio (camino al grado: TERMINACION_MATERIAS + GRADO) y distinguirlo de `solicitudes` oficial. Costo asumido (entity, repos, services, controllers).
- **ALTER `estudiantes ADD COLUMN creditos_aprobados`** añadido a §3.2. Antes era "no proponer ALTER, cómputo on-demand"; ahora se propone formalmente con justificación inline para no romper el MVP y permitir que el equipo decida quién alimenta el cache.
- **§5 reescrita** explicando el flujo de créditos: contra qué valida (total del pensum, computado), de dónde sale el aprobado (cache en `estudiantes`), por qué los seeds de notas son opcionales, y el camino futuro con DIVISIT.
- **Decisión #12 actualizada**: frontend tiene cambios menores (formularios admin que asignaban usuarios por cédula → ahora por `id`). No es "cero cambios" como decía v2.0.
- Decisiones cerradas en §8.2: sí ALTER de `creditos_aprobados`, no importar líneas/grupos de investigación, `sesiones_activas` solo CREATE, renombre confirmado.
- Conteo de ALTERs ajustado: 7 ALTERs + 1 índice (antes "4-6").

**Cambios v2.0 vs v1.0:**
- Fuente de verdad: `bd_tablas_completas.md` (no la doc textual v1).
- Eliminada la tabla `workflow_solicitud` propuesta — el workflow vive en la tabla `solicitud` existente del módulo, refactorizada.
- Entregable único al equipo: el script SQL. Backend y frontend se mergean a `main`, no se entregan.
- Identidad por `id` numérico (no por cédula); FKs propias apuntan a ids de la oficial.
- ALTERs sobre oficiales reducidos a `admins` y `tipos_solicitudes` (sin tocar `usuarios`, `estudiantes`, `programas`, etc.).
- Plan B explícito si el equipo rechaza los ALTER.
- Lista completa de campos zombie del módulo a eliminar en el rediseño.
