# Plan de integración con la BD oficial de Posgrados

> Análisis comparativo entre el esquema de nuestro módulo (`SQL_BD_Tramites_posgrados.txt`) y el esquema oficial de la plataforma de Posgrados (`base de datos oficial posgrados.md`). Establece qué adoptar, qué proponer y qué orden seguir para alinearnos sin romper lo que ya funciona.

---

## 1. Resumen ejecutivo

1. **Los dos esquemas son complementarios, no competidores.** La BD oficial es un sistema académico completo (programas, pensums, matrículas, notas, sincronización DIVISIT, proyectos de investigación, sustentaciones, evaluadores). Nuestro módulo cubre **lo que la oficial NO tiene**: paz y salvos, certificados académicos, pagos Wompi, convocatorias y workflows de aprobación director↔posgrados.

2. **La integración ya empezó silenciosamente.** Nuestra tabla `usuario` tiene **dos juegos de columnas duplicadas**: las "viejas" (`cedula`, `nombre`, `rol`, `contrasena`) y las "nuevas" alineadas a la oficial (`id`, `email`, `foto_url`, `google_id`, `moodle_id`, `nombre_completo`, `primer_apellido`, `primer_nombre`, `telefono`, `rol_id`). Alguien metió las columnas pero **no migró el código**. Es deuda activa que vamos a tener que pagar.

3. **La oficial gana en datos académicos; nosotros ganamos en trámites.** No hay que migrar todo lo nuestro a la oficial: hay que decidir qué tablas adoptamos de ellos (para no reinventar `programas`, `pensum`, `estudiantes`, `cohortes`) y qué tablas conservamos nuestras o proponemos como extensión oficial (`paz_y_salvo`, `solicitud_certificado`, `pagos`).

4. **DIVISIT es el premio gordo.** El esquema oficial sincroniza con DIVISIT (División de Sistemas UFPS) los datos académicos: notas, matrículas, profesores, materias. Si nos integramos, los `creditos_aprobados` dejan de ser un campo manual del seed y pasan a venir automáticamente. Lo mismo para validar prerrequisitos de Terminación de Materias.

---

## 2. Visión de alto nivel — qué cubre cada base

### 2.1 La BD oficial cubre (y nosotros NO)

| Dominio | Tablas clave |
|---|---|
| **Sincronización académica DIVISIT** | `estudiantes_divisit`, `notas_divisit`, `materias_matriculadas_divisit`, `grupos_divisit`, `profesores_divisit`, `materia_divisit` |
| **Estudiantes como entidad** | `estudiantes` (separada de `usuarios`), `estados_estudiantes` |
| **Matrículas y notas** | `matriculas`, `cambio_estado_matriculas`, `estados_matriculas`, `notas_pregrado` (×2) |
| **Programas académicos completos** | `programas`, `tipos_programas`, `pensum`, `semestres_programas`, `semestres_pensum`, `semestres`, `materias`, `linea_programa` |
| **Cohortes y grupos** | `cohortes`, `cohorte_grupos`, `grupos_cohortes`, `grupos`, `historico_grupos`, `historico_semestres` |
| **Proyectos de investigación / grado** | `proyecto`, `linea_investigacion`, `grupo_investigacion`, `objetivo_especifico`, `definitiva`, `usuario_proyecto`, `documento`, `retroalimentacion`, `sustentacion`, `sustentacion_documento`, `sustentacion_evaluador`, `criterio_evaluacion`, `meta_ods`, `proyecto_meta_ods`, `macro`, `macro_grupo` |
| **Coloquios y contraprestaciones** | `coloquio`, `coloquio_estudiante`, `contraprestaciones`, `tipos_contraprestaciones` |
| **Soportes genéricos** | `soportes` |
| **Históricos** | `historial_cierre_notas`, `trabajos_social` |
| **Administradores y sesiones** | `admins` (separada de `usuarios`), `sesiones_archivo` |

### 2.2 Nuestro módulo cubre (y la oficial NO)

| Dominio | Tablas | Estado en la oficial |
|---|---|---|
| **Paz y salvos por dependencia** | `paz_y_salvo` | No existe |
| **Catálogo y solicitud de certificados** | `tipo_certificado`, `solicitud_certificado` | No existe |
| **Pagos Wompi integrados** | `pagos` (con `monto_centavos`, `wompi_transaction_id`, `referencia`) | No existe |
| **Convocatorias para Terminación de Materias** | `convocatoria` | No existe |
| **Workflow de aprobación director→posgrados** | Campos en `solicitud` (`cedula_director`, `cedula_posgrados`, `decision`, `validacion_posgrados`, `acta_generada`, `radicado`, `modalidad_grado`) | No existe |
| **Documentos cargados por solicitud** | `documento_cargado`, `documento_solicitud` | Existe `documento` pero atado a `proyecto`, no a `solicitud` |
| **Catálogo de documentos requeridos** | `tipo_documento_requerido` (tabla muerta, sin uso) | No existe |
| **Detalle de proyecto de grado simplificado** | `detalle_grado` (resumen, titulo, tipo) | Versión más rica en `proyecto` |

### 2.3 Conclusión

**Ninguna de las dos cubre el dominio completo.** La oficial es el "sistema académico", la nuestra es el "sistema de trámites administrativos". El plan natural es que **nuestro módulo se vuelva una extensión de la oficial**, no un reemplazo.

---

## 3. Comparación tabla por tabla

### 3.1 Identidad de usuarios — el conflicto central

#### Esquema oficial
```
usuarios:
  id (PK)
  cedula, codigo
  foto_url, moodleid
  nombreCompleto, primerApellido, primerNombre,
  segundoApellido, segundoNombre, telefono
  grupo_id, rol_id

admins:
  id (PK)
  primer_nombre, segundo_nombre, primer_apellido, segundo_apellido
  email, password
  es_super_admin, active
```

**Observaciones:**
- `usuarios.id` es PK numérico autoincremental; `cedula` es solo un campo más.
- **`admins` es una tabla aparte** de `usuarios` con su propio password. Los administradores no son "usuarios con rol ADMIN", son entidades separadas.
- Los datos de contacto (email, telefono) están en `usuarios`. La contraseña vive en `admins` (los `usuarios` no se loguean con password sino probablemente con `moodleid` / SSO Moodle).

#### Esquema nuestro (actual, después de la "pre-integración" silenciosa)
```
usuario:
  cedula (PK)                          ← histórico
  id (IDENTITY)                        ← agregado pre-integración, sin usar en código
  codigo, contrasena, nombre, rol      ← histórico, todo el código depende de esto
  creditos_aprobados, programa_id,
  correo, estado_grado                 ← histórico
  email, foto_url, google_id,
  moodle_id, nombre_completo,
  primer_apellido, primer_nombre,
  telefono, rol_id (FK a roles)        ← agregado pre-integración, sin uso

roles:
  id (PK), nombre                      ← creada pre-integración, sin filas conocidas
```

**Conflictos identificados:**
1. **PK distinta:** ellos usan `id` autoincremental; nosotros usamos `cedula`. Todo nuestro código pasa la cédula como query param (`?cedula=...`). Migrar a `id` numérica obliga a tocar todos los controllers.
2. **Roles duplicados:** nuestro `usuario.rol` (string) y `usuario.rol_id` (FK) coexisten. La tabla `roles` está vacía en el seed. El código solo lee `rol`. Hay que decidir: ¿migramos el código a `rol_id`?
3. **Admins separados:** en la oficial, ADMIN no es un rol — es una entidad. Esto rompe nuestra suposición de "todos son usuarios con un rol".
4. **Columnas redundantes:** `correo` vs `email`, `nombre` vs `nombre_completo`, `nombre` vs `primer_nombre + primer_apellido`. El frontend lee `nombre`, no `nombreCompleto`.

#### Decisión propuesta
**Opción A (alineación blanda):** mantener `cedula` como PK por compatibilidad, dejar `id` para cuando la oficial referencie nuestros usuarios. Migrar progresivamente el código a leer de los nuevos campos (`email` en vez de `correo`, etc.).

**Opción B (alineación dura):** migrar a `id` como PK, dejar `cedula UNIQUE`, reescribir todos los controllers para usar `id`. Trabajo grande pero queda alineado.

**Opción C (recomendada):** **negociar con el equipo oficial** que en su esquema `usuarios.cedula` sea `UNIQUE NOT NULL` y aceptar que nuestras FKs apunten a `cedula` mientras la suya apunta a `id`. Ambos válidos, doble índice. Permite coexistencia sin reescribir nada.

### 3.2 Programas académicos

#### Oficial
- `programas` (id, es_pregrado, moodleid, nombre, semestre_actual, tipo_programa_id) + `tipos_programas` (id, nombre, moodle_id) + `pensum` (estructura curricular) + `semestres_programas` + `linea_programa` + `materias` (catálogo).
- Modelo rico que soporta plan de estudios, líneas de profundización, sincronización con Moodle.

#### Nuestro
- `programa_academico` (id, nombre UNIQUE, tipo, total_creditos).
- Modelo mínimo, solo lo necesario para validar créditos.

#### Mapeo
| Nuestro campo | Oficial equivalente |
|---|---|
| `programa_academico.nombre` | `programas.nombre` |
| `programa_academico.tipo` | `tipos_programas.nombre` (vía `programas.tipo_programa_id`) |
| `programa_academico.total_creditos` | Suma de `materias.creditos` agrupada por `pensum` (no es un campo directo) |

#### Decisión propuesta
**Migrar a `programas` de la oficial** cuando se integre. `programa_academico` debe convertirse en una vista o ser deprecada. El `total_creditos` se computa, no se persiste.

### 3.3 Estudiantes

#### Oficial
- Tabla `estudiantes` **separada de `usuarios`**, con FK a `estados_estudiantes` y `cohorte_id`.
- Un estudiante PUEDE estar en `usuarios` (para login Moodle) pero su perfil académico vive en `estudiantes`.

#### Nuestro
- "Estudiante" = `usuario` con `rol='ESTUDIANTE'`. Todo en una tabla.

#### Mapeo
Conceptualmente: nuestro `usuario` con rol estudiante = `usuarios + estudiantes` de la oficial.

#### Decisión propuesta
Cuando integremos, leer datos de identidad desde `usuarios` y datos académicos desde `estudiantes`. Nuestro `creditos_aprobados` se calcula desde `notas_pregrado` / DIVISIT, no se guarda.

### 3.4 Solicitudes

#### Oficial
- `solicitudes` (id, descripcion, fechaSolicitud, fechaAprobada, estado_id, estudiante_id, matricula_id, solicitud_aplazamiento_id, soporte_id, tipo_solicitud_id) + `tipos_solicitudes` (id, nombre).
- Modelo genérico: las solicitudes pueden ser de **aplazamiento de materia**, no necesariamente de grado. Tienen un `soporte_id` (archivo justificatorio).

#### Nuestro
- `solicitud` monolítica con ~25 columnas, mezcla:
  - Solicitud base (cedula, tipo, estado, fecha)
  - Workflow director (cedula_director, decision, fecha_decision, observaciones_director)
  - Workflow posgrados (cedula_posgrados, validacion_posgrados, fecha_validacion)
  - Proyecto de grado (titulo_proyecto, tipo_proyecto, resumen_proyecto)
  - Acta y radicado (acta_generada, radicado)
  - Pago de grado (estado_pago_grado, modalidad_grado, pago_modalidad_realizado)
  - Fecha de ceremonia (fecha_grado)

#### Mapeo
Nuestra `solicitud` cubre dos conceptos que la oficial separa:
1. **La solicitud académica** (oficial: `solicitudes`).
2. **El workflow de trámite con director y posgrados** (oficial: no existe directamente).

Y mete el detalle del proyecto de grado en la misma fila, mientras que la oficial tiene `proyecto` como entidad propia con muchas más columnas (`objetivos_especificos`, `metodologia`, etc.).

#### Decisión propuesta
- Adoptar `tipos_solicitudes` de la oficial (catálogo).
- Mover detalles de proyecto a nuestra `detalle_grado` o, mejor, a `proyecto` de la oficial si vamos a integrar a fondo.
- Conservar nuestros campos de workflow (decision, validacion_posgrados, acta_generada, radicado, modalidad_grado) **como extensión** — pueden vivir en una tabla `workflow_solicitud_posgrados` que apunte a `solicitudes.id`.

### 3.5 Documentos

#### Oficial
- `documento` (id, nombre, path, peso, tipo, tipoObjetivo, tipoDocumento, id_proyecto): atado a `proyecto`.
- `soportes` (extension, fecha_subida, mime_type, peso, ruta, tamano_bytes, tipo): genérico, lo usa `solicitudes.soporte_id` y `contraprestaciones.soporte_id`.

#### Nuestro
- `documento_solicitud` (content_type, nombre_original, nombre_almacenado, tamano, tipo, solicitud_id, fecha_subida): atado a `solicitud`.
- `documento_cargado` (fecha_carga, solicitud_id, tipo_documento_id, url_archivo): otra versión paralela, posiblemente para `tipo_documento_requerido`.
- `tipo_documento_requerido` (nombre, descripcion, obligatorio, orden): catálogo no usado.

#### Mapeo
- Nuestro `documento_solicitud` ≈ oficial `soportes` (más algunos metadatos).
- Nuestro `documento_cargado` ≈ oficial `documento` o también `soportes` según el caso.
- `tipo_documento_requerido` no tiene equivalente — es invento nuestro válido para definir "qué subir".

#### Decisión propuesta
- Unificar nuestras dos tablas en una: nos quedamos con `documento_solicitud` y deprecamos `documento_cargado`. Hoy hay confusión sobre cuál usar.
- Cuando integremos, mapear nuestro `documento_solicitud` al `soportes` de la oficial.
- Proponer `tipo_documento_requerido` como aporte al esquema oficial (les sirve para todos los flujos).

### 3.6 Roles

#### Oficial
- `roles` (id, nombre). Tabla simple. No vi qué filas tiene pero el nombre sugiere catálogo cerrado.
- **`admins` es entidad propia**, no es un rol.

#### Nuestro
- Mezcla incoherente: `usuario.rol` (string), `usuario.rol_id` (FK a `roles`), `roles` (tabla creada pero sin filas conocidas).
- Roles que usamos en código y en `data.sql`: `ESTUDIANTE`, `DIRECTOR`, `ADMIN`, `DEPENDENCIA`, `POSGRADOS`.

#### Decisión propuesta
- **Aplicar la aclaración del usuario:** unificar `ADMIN` y `POSGRADOS` en uno solo. Recomiendo conservar `POSGRADOS` porque refleja mejor la realidad institucional (la oficina de posgrados es el "administrador" en este contexto).
- Renombrar `COORDINADOR_PROGRAMA` (que aparece en `configuracion_admin.md`) a `DIRECTOR_PROGRAMA`, que ya existe de hecho como `DIRECTOR`. Confirmar con equipo si se necesita más granularidad (un programa puede tener Director + Coordinador, son cargos distintos a veces).
- Catálogo final propuesto (5 roles, ver §8 para detalle):
  - `ESTUDIANTE`
  - `DIRECTOR_PROGRAMA` (renombre de `DIRECTOR`)
  - `DEPENDENCIA`
  - `POSGRADOS` (absorbe `ADMIN`)
  - `SUPER_ADMIN` (técnico, equivalente al `admins.es_super_admin` de la oficial)
- Migrar definitivamente a leer de `rol_id`, no de `rol`. Poblar `roles` con esos 5 valores.

---

## 4. Lo que ganamos al integrarnos

### 4.1 DIVISIT — créditos automáticos
Hoy `usuario.creditos_aprobados` se llena a mano en el seed. Con DIVISIT, calcularlo es:

```sql
SELECT SUM(m.creditos)
FROM notas_divisit n
JOIN materias_matriculadas_divisit mm ON n.cod_alumno = mm.cod_alumno
JOIN materia_divisit m ON mm.cod_materia = m.cod_materia
WHERE n.cod_alumno = ?
  AND n.estado_nota = 'APROBADA';
```

Esto elimina la validación frágil de Terminación de Materias y permite verificar prerrequisitos en tiempo real.

### 4.2 Cohortes y semestres
Hoy no manejamos cohortes. La oficial sí. Esto nos permite:
- Filtrar bandejas por cohorte ("solicitudes pendientes de la cohorte 2024-2 de la Maestría en TIC").
- Convocatorias por cohorte (no solo por programa o globales).

### 4.3 Proyecto de grado rico
La oficial tiene `proyecto` con: `objetivo_general`, `pregunta`, `problema`, `metodologia`, líneas de investigación, ODS asociados, sustentaciones, evaluadores, criterios de evaluación. Nosotros solo tenemos `titulo_proyecto + tipo_proyecto + resumen_proyecto`. Migrar a `proyecto` nos permite cubrir el ciclo completo de tesis sin reinventar.

### 4.4 SSO con Moodle
`usuarios.moodleid` y `google_id` (que ya está en nuestra tabla pero sin usar) sugieren que la oficial planea SSO con Moodle / Google. Cuando se active, **el login real ya no necesita password en nuestro código** — basta delegar a Moodle/Google.

### 4.5 Catálogo de tipos de solicitud
La oficial ya tiene `tipos_solicitudes`. Cuando lo adoptemos, el Bloque D de `configuracion_admin.md` se reduce a editar filas de esa tabla en vez de crear una nueva `tipo_solicitud`.

---

## 5. Lo que aportamos a la integración

Funcionalidades nuestras que **NO existen** en la oficial y deben proponerse como módulo nuevo:

| Módulo | Por qué la oficial debería adoptarlo | Aporte |
|---|---|---|
| `paz_y_salvo` | Necesario para Solicitud de Grado, hoy no resuelto en la oficial. | Tabla + workflow por dependencia |
| `solicitud_certificado` + `tipo_certificado` | Constancias académicas configurables, no son trámites de grado pero los estudiantes los piden. | CRUD + flujo digital/físico, generación PDF, pago |
| `pagos` (Wompi) | La oficial no tiene integración de pasarela. Solo lo aprovechan los trámites de pago. | Integración Wompi con monto en centavos, referencia, redirect_url |
| `convocatoria` | Hoy solo existe la nuestra para Terminación de Materias. Debería extenderse a cualquier trámite. | Aporte directo a configuración admin |
| Workflow director→posgrados | Los campos `cedula_director`, `validacion_posgrados`, `radicado`, `acta_generada` modelan la aprobación de dos niveles. La oficial no lo tiene. | Proponer como `workflow_aprobacion` |

---

## 6. Estrategia de integración — 3 opciones

### Opción 1: Migración total a la BD oficial
Nuestro código pasa a leer/escribir directamente en las tablas oficiales. Nuestras tablas adicionales (paz_y_salvo, certificados, pagos, convocatoria) se mueven al esquema oficial como tablas nuevas dentro del mismo schema.

- **Pro:** una sola BD, sin duplicación, integración limpia.
- **Contra:** trabajo enorme. Hay que reescribir la mayoría de controllers, y depende de que el equipo oficial acepte agregar nuestras tablas.

### Opción 2: Coexistencia con sincronización
Mantenemos nuestra BD pero **sincronizamos**: copiamos `programas`, `estudiantes`, `usuarios` desde la oficial periódicamente (job nocturno o vía vistas materializadas). Nuestras tablas siguen vivas y nuestras FKs apuntan a copias locales.

- **Pro:** cero cambios en nuestro código actual. Bajo riesgo.
- **Contra:** datos pueden quedar desfasados unas horas. Duplicación de almacenamiento.

### Opción 3: BD compartida con tablas separadas por dominio (recomendada)
Una sola BD donde:
- Tablas académicas (`usuarios`, `programas`, `estudiantes`, `pensum`, ...) son **propiedad del equipo oficial**, nosotros las leemos.
- Tablas de trámites (`paz_y_salvo`, `solicitud_certificado`, `tipo_certificado`, `pagos`, `convocatoria`, nuestra `solicitud` extendida) son **propiedad nuestra**, ellos las leen si quieren.
- FKs cruzadas explícitas y bien documentadas.

- **Pro:** división de responsabilidades clara. Cada equipo dueño de su dominio. Sin duplicación.
- **Contra:** requiere acuerdo entre equipos sobre el esquema compartido y un proceso de cambios (migraciones coordinadas).

**Recomendación:** Opción 3. Es la práctica industrial estándar (multi-tenant con bounded contexts).

### Opción 3-C — Modelo híbrido de identidad (refinamiento de la Opción 3, recomendada)

La oficial separa de forma deliberada dos conceptos:

- **Tablas `usuarios` + `estudiantes` + `profesores_divisit`** — el dominio académico. Login probablemente vía Moodle/Google.
- **Tabla `admins`** — operadores del sistema. Login con email/password, con flag `es_super_admin` y `active`.

Esta separación **no es un accidente**, es un patrón institucional sólido: los administradores del sistema no son usuarios académicos, son perfiles operativos distintos. Por eso `admins` no tiene `cedula`, `moodleid` ni `programa_id`.

**Nuestra propuesta de identidad híbrida** aprovecha ese patrón:

| Quién | Vive en | Login | Acceso |
|---|---|---|---|
| Estudiantes (incl. graduados) | `usuarios` + `estudiantes` (oficial) | SSO Moodle/Google | Lectura de su perfil, trámites propios |
| Directores de programa, docentes, codirectores, jurados | `usuarios` + `profesores_divisit` (oficial) | SSO Moodle/Google | Bandejas de aprobación, sustentaciones |
| Coordinador de Posgrados | `admins` (oficial) con `tipo='POSGRADOS'` | email/password | Bandejas operativas de trámites del módulo |
| Funcionarios de dependencias (Biblioteca, Tesorería, etc.) | `admins` (oficial) con `tipo='DEPENDENCIA'` + `dependencia_id` | email/password | Solo su bandeja de paz y salvos / certificados físicos |
| Administrador del sistema | `admins` (oficial) con `es_super_admin=true` | email/password | Configuración completa: tipos, dependencias, convocatorias, plantillas |

**Cambios concretos al esquema oficial necesarios:**

```sql
-- Extender la tabla admins para soportar nuestros operadores
ALTER TABLE admins
  ADD COLUMN tipo VARCHAR(30)              -- 'SUPER' | 'POSGRADOS' | 'DEPENDENCIA'
              CHECK (tipo IN ('SUPER','POSGRADOS','DEPENDENCIA')),
  ADD COLUMN dependencia_id BIGINT         -- solo cuando tipo='DEPENDENCIA'
              REFERENCES dependencias(id);

-- Tabla nueva, propiedad del módulo trámites
CREATE TABLE dependencias (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre VARCHAR(100) UNIQUE NOT NULL,
  descripcion VARCHAR(255),
  activa BOOLEAN DEFAULT true
);
```

**Por qué esta opción es superior a meter todos los roles en la tabla `roles`:**

1. **Respeta la decisión arquitectónica del equipo oficial.** Ellos ya decidieron que admins ≠ usuarios. Forzar POSGRADOS y DEPENDENCIA como roles de `usuarios` rompería esa decisión.
2. **No contamina el dominio académico** con perfiles operativos. Una dependencia bibliotecaria no tiene `moodleid`, ni `cohorte`, ni `programa_academico`. Forzarla a vivir en `usuarios` deja todos esos campos NULL.
3. **Login distinto por naturaleza.** Estudiantes y profesores van a Moodle/Google. Funcionarios y admins usan credenciales internas. El patrón refleja esa diferencia.
4. **Permite extensibilidad.** Si mañana sale "Coordinador de Bienestar" o "Secretaría Académica" como otro perfil operativo, basta con agregar un `tipo` nuevo a `admins`.

**Implicaciones para JWT y autorización:**

- El token JWT debe contener un claim `principal_type` con valor `USUARIO` o `ADMIN`, y un claim `rol` con:
  - Para `USUARIO`: el nombre del rol desde `roles.nombre` (ESTUDIANTE, DOCENTE, DIRECTOR_PROGRAMA).
  - Para `ADMIN`: el campo `admins.tipo` (SUPER, POSGRADOS, DEPENDENCIA) o `'SUPER_ADMIN'` si `es_super_admin=true`.
- Los `@PreAuthorize` del backend usan ese claim `rol` directo: `hasRole('POSGRADOS')`, `hasRole('SUPER_ADMIN')`, etc.

**Implicaciones para los endpoints del módulo:**

- Endpoints de **lectura** que necesitan datos académicos (estudiantes, programas) hacen JOIN contra `usuarios`/`estudiantes`.
- Endpoints de **escritura administrativa** (CRUD de tipos de certificado, dependencias, convocatorias) chequean `admins.es_super_admin=true` o `admins.tipo IN ('SUPER','POSGRADOS')` según el caso.
- Endpoints **operativos** (aprobar/rechazar solicitud, marcar paz y salvo) chequean según el rol específico.

---

## 7. Plan por fases

Ordenado de menor a mayor disrupción. **Cada fase es un sprint independiente** y termina con valor entregable.

### Fase 0 — Higiene de datos (prerrequisito, días)
1. Decidir entre Opción 1, 2 o 3 con el equipo oficial → **Opción 3 propuesta**.
2. Limpiar la "pre-integración" silenciosa de `usuario`: o usamos los nuevos campos (`email`, `nombre_completo`, etc.) o los eliminamos. Hoy son confusión.
3. Poblar la tabla `roles` con el catálogo propuesto en §8.
4. Documentar en el repo (`.docs/`) el acuerdo de qué tablas son de quién.

### Fase 1 — Alineación de catálogo de roles (1 sprint)
- Crear los 5 roles en la tabla `roles`.
- Migrar el código de `usuario.rol` (string) a `usuario.rol_id` (FK).
- Renombrar `DIRECTOR` → `DIRECTOR_PROGRAMA`, fusionar `ADMIN` y `POSGRADOS` en `POSGRADOS`, agregar `SUPER_ADMIN`.
- Actualizar `data.sql` y todos los checks de rol en código.
- Frontend: actualizar `menuConfig.js`, `App.js`, demos.

### Fase 2 — Adoptar `tipos_solicitudes` oficial (1 sprint)
- Si la oficial ya está disponible: poblar nuestra tabla `solicitud.tipo` con FK a `tipos_solicitudes.id`.
- Sustituir el Bloque D del `configuracion_admin.md` (crear `tipo_solicitud` propia) por una sección que **lee y edita** la tabla oficial.
- Sirve como ensayo del modelo de coexistencia (Opción 3).

### Fase 3 — Integración con DIVISIT para créditos (2 sprints)
- Crear `DivisitService` que consulta las tablas `*_divisit`.
- Reemplazar el campo `usuario.creditos_aprobados` por una query a DIVISIT en tiempo real.
- Validación de prerrequisitos de Terminación de Materias y Solicitud de Grado pasa a usar DIVISIT.
- Permite quitar la validación manual del seed.

### Fase 4 — Adoptar `usuarios` y `estudiantes` oficiales (3 sprints, alto riesgo)
- Migrar nuestro `usuario` a leer de `usuarios` + `estudiantes` oficiales.
- Conservar nuestras columnas de extensión (`estado_grado`, `programa_id`) o mover a una tabla `estudiante_posgrados`.
- Reescribir el login: en vez de `loginDemo` con cédula, integrar SSO Moodle/Google usando `usuarios.moodleid` / `usuarios.google_id`.
- **Esta fase rompe `@RequestParam String cedula` definitivamente** — toca migrar a sesión real.

### Fase 5 — Proponer nuestros módulos a la oficial (continuo)
- Negociar la incorporación de `paz_y_salvo`, `solicitud_certificado`, `tipo_certificado`, `pagos`, `convocatoria` al esquema oficial bajo el mismo schema.
- Documentar como ADR (Architecture Decision Record).

### Fase 6 — Adoptar `proyecto` para Solicitudes de Grado (2 sprints)
- Migrar `solicitud.titulo_proyecto / tipo_proyecto / resumen_proyecto` y la tabla `detalle_grado` al modelo `proyecto` de la oficial.
- Habilita el flujo completo de tesis: objetivos específicos, sustentaciones, evaluadores, criterios.
- Vale la pena solo si el equipo va a cubrir el ciclo completo de tesis (no solo el grado).

---

## 8. Catálogo de roles propuesto para producción

> **Revisión 2:** se separan `ADMIN` y `POSGRADOS` después de aclaración del PO. La iteración anterior los había unificado pero la realidad operativa los distingue: POSGRADOS atiende solicitudes; ADMIN configura el catálogo del módulo. Son perfiles funcionales distintos aunque ambos sean "administrativos".

### 8.1 Catálogo final — 5 perfiles

| Código | Vive en (BD oficial) | Login | Acceso típico |
|---|---|---|---|
| `ESTUDIANTE` | `usuarios` + `estudiantes` | SSO Moodle/Google | Trámites propios, descargar certificados, ver historial. |
| `DIRECTOR_PROGRAMA` | `usuarios` + `profesores_divisit` | SSO Moodle/Google | Aprueba/rechaza solicitudes de su programa. Recibe paz y salvo institucional. |
| `DEPENDENCIA` | `admins` con `tipo='DEPENDENCIA'` + `dependencia_id` | email/password | **Solo bandeja de su dependencia**: paz y salvos y certificados físicos. Sin acceso a configuración. |
| `POSGRADOS` | `admins` con `tipo='POSGRADOS'` | email/password | Bandejas operativas de Posgrados (terminación, grado, certificados). Aprueba/rechaza a nivel posgrados. Genera actas. **Sin acceso a configuración del catálogo.** |
| `ADMIN` | `admins` con `es_super_admin=true` o `tipo='SUPER'` | email/password | **Configura todo el módulo**: crea/edita tipos de certificado, tipos de trámite, dependencias, convocatorias, plantillas de correo, precios, usuarios. Ve auditoría completa. |

### 8.2 Por qué `ADMIN` y `POSGRADOS` son distintos

- **POSGRADOS es operativo:** revisa solicitudes, las aprueba o rechaza, genera actas, atiende casos. No edita el catálogo del sistema.
- **ADMIN es configurador:** establece qué tipos de certificado existen, qué dependencias participan, qué precios se cobran, qué plantillas de correo se envían. No atiende solicitudes individuales.

Esta separación refleja el patrón de la BD oficial donde `admins.es_super_admin` distingue al super-administrador técnico de un administrador funcional con permisos acotados.

### 8.3 Implementación a corto plazo (sin la BD oficial)

Mientras vivimos solo con nuestra BD, la implementación es simple:

```sql
INSERT INTO roles (id, nombre) VALUES
  (1, 'ESTUDIANTE'),
  (2, 'DIRECTOR_PROGRAMA'),  -- migrar desde 'DIRECTOR'
  (3, 'DEPENDENCIA'),
  (4, 'POSGRADOS'),
  (5, 'ADMIN');
```

Los `@PreAuthorize` en el backend siguen este patrón:

- **Bandejas y aprobaciones de trámites:** `hasAnyRole('POSGRADOS', 'ADMIN')`.
- **CRUD de catálogos (tipos cert, dependencias, convocatorias, etc.):** `hasRole('ADMIN')` exclusivamente.
- **Bandeja de dependencia (paz y salvos físicos):** `hasRole('DEPENDENCIA')`.

### 8.4 Migración a la BD oficial (futuro)

Cuando se haga la integración, los roles 4 (POSGRADOS) y 5 (ADMIN), más el 3 (DEPENDENCIA), migran a la tabla `admins` de la oficial con el campo `tipo`. Los roles 1 (ESTUDIANTE) y 2 (DIRECTOR_PROGRAMA) se mapean a `usuarios.rol_id` de la oficial. Ver §3.1 y la Opción 3-C en §6.

### 8.5 Cambios en el frontend (a partir de esta revisión)

- `menuConfig.js`: separar el menú POSGRADOS (solo Bandeja de Solicitudes) del menú ADMIN (todas las pestañas de configuración).
- `App.js`: ruta de configuración solo accesible para `ADMIN`.
- `TramitesView.jsx`: renderizar la bandeja para POSGRADOS y el sidebar completo de configuración para ADMIN.
- `ProtectedRoute.js`: mantener el `DEMO_MODE` para que el cambio rápido entre roles en demo no rompa la experiencia.

---

## 9. Conflictos a discutir con el equipo de la BD oficial

Lista priorizada para llevar a la reunión de integración:

1. **¿Aceptarían que `usuarios.cedula` tenga `UNIQUE NOT NULL`?** Permite que nuestras FKs sigan apuntando a `cedula` sin reescribir todo (Opción C en §3.1).
2. **¿Los roles que ellos usan en `roles` coinciden con los nuestros?** ¿Tienen `DIRECTOR_PROGRAMA`? ¿Equivalente a `DEPENDENCIA`? ¿Su `admins` se trata como rol o como entidad separada?
3. **¿Cómo manejan las dependencias administrativas** (Biblioteca, Tesorería, Admisiones)? No vi una tabla equivalente. Posible que sea responsabilidad nuestra modelarlo.
4. **¿Aceptarían incorporar nuestras tablas** (`paz_y_salvo`, `solicitud_certificado`, `tipo_certificado`, `pagos`, `convocatoria`) al schema oficial?
5. **¿DIVISIT está realmente disponible** o es un sistema "planeado"? Las columnas `fecha_sincronizacion` sugieren que sí, pero confirmar.
6. **SSO Moodle / Google:** ¿está implementado o son campos prospectivos? Esto determina cuándo podemos quitar `loginDemo`.
7. **`programa_academico.total_creditos`:** ¿la oficial considera que este campo es derivado (suma de materias del pensum) o lo mantienen denormalizado?
8. **`estudiantes.cohorte_id`:** ¿cómo asignan los estudiantes a cohortes? ¿Manual, automático por matrícula?
9. **`pagos` Wompi:** ¿les interesa centralizar pagos para todo el sistema (no solo nuestros trámites)?
10. **Documentos:** ¿prefieren que migremos a `soportes` o que mantengamos `documento_solicitud` como módulo nuestro?

---

## 10. Impacto en `configuracion_admin.md`

El plan de admin escrito anteriormente debe revisarse a la luz de esta integración. Resumen de cambios necesarios:

| Bloque del plan admin | Cambio derivado de la integración |
|---|---|
| **A. Usuarios** | Ya no creamos `usuarios` desde nuestro admin — los lee de la oficial. Nuestra UI solo edita campos propios (estado_grado, asignación de dependencia). **Reducir alcance del bloque.** |
| **B. Programas académicos** | Ya no creamos programas desde nuestro admin — los lee de `programas` oficial. **Bloque eliminado.** |
| **C. Roles** | Adoptamos el catálogo de §8 directamente. Eliminar la opción "crear roles custom" — es responsabilidad del SUPER_ADMIN y debe coordinarse con la oficial. |
| **D. Tipos de trámite** | Adoptamos `tipos_solicitudes` oficial. Nuestro CRUD pasa a editar la tabla oficial (con permisos). |
| **E. Tipos de paz y salvo** | **Sin cambio.** Es módulo nuestro. |
| **F. Documentos requeridos** | **Sin cambio**, pero proponerlo como extensión al esquema oficial. |
| **G. Plantillas de correo** | **Sin cambio.** Es módulo nuestro. |
| **H. Convocatorias** | Adoptar el concepto de cohorte: convocatorias por cohorte además de por programa/trámite. **Ampliar alcance del bloque.** |
| **I. Reportes** | Aprovechar datos académicos oficiales para reportes más ricos (graduados por cohorte, tiempo promedio de tesis, etc.). |
| **J. Auditoría** | **Sin cambio.** |
| **K. Configuración global** | Agregar configs de integración: `divisit.url`, `divisit.sync.intervalo_horas`, `moodle.sso.client_id`, etc. |

---

## 11. Recomendación final

1. **Tomar contacto formal con el equipo oficial** antes de codear nada más. Llevar las 10 preguntas de §9 a la reunión.
2. **Elegir la Opción 3** (BD compartida con tablas separadas por dominio).
3. **Empezar por Fase 0 y Fase 1** este sprint o el próximo. Son baratas y desbloquean todo.
4. **Posponer la Fase 4 (migrar usuario)** hasta que SSO Moodle/Google esté listo. Romper el login en medio de un sprint sin reemplazo es suicidio.
5. **Después de Fase 1**, revisitar `configuracion_admin.md` y ajustar bloques A, B, C, D según la tabla de §10.
6. **No hacer nada irreversible** hasta tener acuerdo escrito con el equipo oficial sobre la división de responsabilidades. Los cambios silenciosos a `usuario` que ya están en nuestra BD son la mejor evidencia de por qué.
