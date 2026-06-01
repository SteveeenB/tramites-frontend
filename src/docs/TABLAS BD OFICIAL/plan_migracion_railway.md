# Plan de migración a Railway (MySQL) — experimento de alineamiento con la BD oficial

> **Estado:** propuesta de experimento. Documento vivo.  
> **Fuente del esquema oficial:** [`bd_tablas_completas.md`](bd_tablas_completas.md) — 56 tablas en 9 dominios.  
> **Esquema actual del módulo:** [`base de datos actual modulo.sql`](../../../../.docs/base%20de%20datos%20actual%20modulo.sql) — Supabase PostgreSQL ya en producción.  
> **Plan de roles cerrado:** [`plan_roles_v3.md`](../plan_roles_v3.md) §9 explica por qué pivotamos a este experimento.

---

## 0. Resumen ejecutivo

**Qué es este documento.** El plan de un experimento: montar una BD MySQL en Railway que **simula al máximo el esquema oficial de Posgrados**, levantar el backend de trámites apuntando a ella, y validar que los flujos del MVP funcionan sobre esa BD.

**Por qué no migramos Supabase.** Lo que tenemos hoy en Supabase es nuestra simulación temprana del esquema oficial (PostgreSQL, tablas `programa_academico`, `usuario`, `paz_y_salvo`, etc.). Funciona, está pulida tras los Bloques 0-4 + Sprint A/B del refactor de identidad, pero el esquema diverge del oficial en estructura. Pulir más Supabase es invertir en una base que no es la objetivo a largo plazo.

**Por qué Railway + MySQL.** El sistema oficial usa MySQL. Railway permite levantar un MySQL gratis con conexión externa, sin afectar la infra actual. Si el experimento funciona, se presenta como **prueba de concepto** al equipo oficial: "miren, ya corremos sobre su esquema, integrarnos es solo conectar a su BD".

**Qué NO es este documento.** No es un cronograma. No es una declaración de que migramos. Es un plan de experimento. El alcance es: *demostrar viabilidad*, no entregar producción.

**Resultado esperado.** Un backend funcional corriendo contra MySQL/Railway con un schema que el equipo oficial reconoce como "casi el suyo + nuestras extensiones de trámites". Frontend sin cambios (consume las mismas APIs REST).

---

## 1. Contexto y decisiones de partida

### 1.1 Lo que tenemos hoy (Supabase, producción)

- 6 logins funcionando (5 admins en `admins`, 4 académicos en `usuario`).
- Refactor de identidad híbrida completo (Bloques 0-4 + Sprint A + Sprint B).
- Flujos del MVP probados: certificados, paz y salvos, terminación, grado.
- **Deuda conocida** documentada en [`plan_roles_v3.md`](../plan_roles_v3.md) §8: huérfanos, duplicados, seeds inconsistentes.
- 17 tablas propias: `usuario`, `estudiante`, `programa_academico`, `roles`, `admins`, `dependencias`, `solicitud`, `solicitud_certificado`, `tipo_certificado`, `paz_y_salvo`, `pagos`, `convocatoria`, `documento_solicitud`, `documento_cargado`, `tipo_documento_requerido`, `detalle_grado`, `historial_estado_tramite`, `estados_estudiantes` (nueva).

### 1.2 Lo que tiene la BD oficial (Railway, experimento)

- **56 tablas** organizadas en 9 dominios (ver [`bd_tablas_completas.md`](bd_tablas_completas.md)).
- Identidad clara: `usuarios` separada de `admins`, con `roles` global.
- Modelo académico completo: `programas` → `pensums` → `materias` → `semestres`.
- Estudiantes con FK a `usuarios`, con `esPosgrado`, `cohorte_id`, `pensum_id`, `programa_id`.
- Matrículas + notas (`matriculas`, `notas_pregrado`, `notas_posgrado`).
- Solicitudes genéricas (`solicitudes`, `tipos_solicitudes`, `soportes`).
- Proyectos de investigación/grado ricos (`proyecto`, `objetivo_especifico`, `sustentacion`, `usuario_proyecto`).
- Sincronización con DIVISIT (sistema legacy externo).

### 1.3 Decisiones de partida (no se reabren a menos que el experimento falle)

| # | Decisión | Razón |
|---|---|---|
| 1 | **Adoptamos el esquema oficial al máximo** | Si el objetivo es alinearnos con producción real de UFPS, queremos hablar su mismo lenguaje. Cada tabla nuestra que tenga equivalente oficial se mapea a la oficial. |
| 2 | **Mantenemos nuestras tablas propias** (paz y salvos, certificados, pagos, convocatoria, dependencias) | El equipo oficial no tiene estos dominios. Son aportes del módulo de trámites. Se adjuntan al esquema con FKs cruzadas. |
| 3 | **Importamos cohortes y grupos** (mínimo viable) | En el plan v3 §3 decisión #9 dijimos "no importar cohortes ahora". Ahora SÍ porque es Railway/MySQL y el experimento permite tener TODO el dominio académico. |
| 4 | **Director del programa se resuelve vía `cohorte_grupos.usuario_id`** | Patrón oficial documentado. Reemplaza nuestra solución "usuario con rol DIRECTOR + programa_id". |
| 5 | **Adoptamos `proyecto` oficial para Solicitudes de Grado** | Los campos `titulo_proyecto`, `tipo_proyecto`, `resumen_proyecto` que estaban en `solicitud` migran a `proyecto`. Habilita el ciclo completo de tesis. |
| 6 | **Adoptamos `tipos_solicitudes` oficial** | El Bloque 5c del plan v3 se realiza aquí naturalmente. |
| 7 | **Adoptamos `soportes` oficial para documentos** | Reemplaza `documento_solicitud` y `documento_cargado` por la tabla genérica. |
| 8 | **Mantenemos JWT stateless + BCrypt para auth** | Ver `plan_roles_v3.md` §3 decisión #3. No se cambia para el experimento (sin SSO disponible). `sesiones_activas` opcional. |
| 9 | **Créditos: snapshot + cómputo desde notas** | Idea del PO: el campo persiste como cache pero se calcula desde `notas_pregrado`/`notas_posgrado`. Detalle en §5. |
| 10 | **Cero cambios en el frontend** | El frontend consume APIs REST. Si las APIs devuelven el mismo shape, el frontend sigue funcionando idéntico. |

---

## 2. Estrategia de ejecución del experimento

### 2.1 Ramificación

**Opción recomendada:** rama paralela en el repo `tramites-backend` actual, llamada `feature/railway-mysql-experimento`. Razones:
- Permite reutilizar todo el código actual como punto de partida.
- Mantiene historial unificado (commits del experimento son fácilmente diffeables).
- Si el experimento gana, se hace PR a `main`. Si pierde, la rama queda como evidencia del intento.

**Opción alternativa:** repo nuevo `tramites-backend-mysql`. Solo si el alcance crece tanto que se sienta como un fork (poco probable).

### 2.2 Aislamiento de producción

- **Sin afectar Supabase.** El backend Railway lee otras env vars (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD` apuntan a Railway).
- **Sin afectar el frontend en producción.** Mientras el frontend siga apuntando a `https://tramites-frontend-r08z.onrender.com/`, no ve el experimento.
- **Mismo frontend, distinto entorno.** Para probar el experimento se levanta una segunda instancia del backend (local o Railway) y se apunta el frontend local a ella vía `REACT_APP_API_URL`.

### 2.3 Definition of Done del experimento

El experimento se considera **exitoso** si se cumple lo siguiente sobre Railway/MySQL:

1. Backend arranca sin errores de mapeo Hibernate.
2. Las 6 credenciales de prueba hacen login.
3. Los flujos críticos pasan:
   - Estudiante solicita certificado → paga → dependencia gestiona → entrega.
   - Estudiante solicita Grado → director aprueba → paz y salvos → posgrados aprueba → acta.
   - Admin crea tipo de certificado con dependencia asignada.
4. La estructura de la BD coincide con el esquema oficial en las tablas adoptadas (sin renombres divergentes en columnas críticas).

Si falla algún punto, el experimento sigue siendo útil — documenta exactamente dónde está la fricción al alinear con la oficial.

---

## 3. Schema propuesto para Railway

Esta sección lista las tablas que vamos a tener en Railway, agrupadas por origen. Es la **referencia exacta** de lo que se va a crear.

### 3.1 Tablas adoptadas tal cual de la oficial (sin modificar)

Estas tablas se copian del esquema oficial sin cambios estructurales (solo conversión de tipos PostgreSQL → MySQL).

**Identidad y acceso (Dominio 2):**
- `usuarios` — PK `id`, todos los campos del modelo oficial. **Mantiene `cedula`, `codigo`, `email`, `moodle_id`, `google_id`, etc.**
- `roles` — catálogo global.
- `admins` — operadores con email/password. ⚠️ **Extensión nuestra:** ver §3.2.
- `sesiones_activas` — opcional para el experimento. Se crea pero no se usa (mantenemos JWT stateless).

**Estructura académica (Dominio 3):**
- `programas` — todos los campos oficiales (id, codigo, es_posgrado, nombre, etc.).
- `tipos_programas` — catálogo.
- `pensums` — plan curricular.
- `semestres_pensums` — relación pensum↔semestre.
- `semestres` — catálogo de semestres.
- `materias` — catálogo con créditos.
- `linea_programa` — opcional para MVP (sin uso inmediato).

**Estudiantes (Dominio 4):**
- `estudiantes` — todos los campos oficiales (incluyendo `usuario_id`, `pensum_id`, `programa_id`, `cohorte_id`, `estado_estudiante_id`, `esPosgrado`).
- `estados_estudiantes` — catálogo (ya creado en Sprint A).
- `cohortes` — agrupación anual de estudiantes.
- `cohorte_grupos` — relaciona cohorte con programa/pensum + usuario_id del director.

**Matrículas y notas (Dominio 5, mínimo para MVP):**
- `matriculas` — vincula estudiante con grupo_cohorte.
- `estados_matriculas` — catálogo.
- `notas_posgrado` — notas del estudiante (más relevante que pregrado).
- `notas_pregrado` — incluida por compatibilidad si el equipo lo requiere.

**Grupos y cohortes (Dominio 6, mínimo):**
- `grupos_cohortes` — vincula cohorte con docente (FK a `usuarios`).
- `grupos` — agrupación de materia.

**Solicitudes (Dominio 7):**
- `solicitudes` — la solicitud genérica oficial (id, descripcion, fechaCreacion, estaAprobada, estudiante_id, tipo_solicitud_id).
- `tipos_solicitudes` — catálogo. Sembrar: `TERMINACION_MATERIAS`, `GRADO`, y nuestros tipos extras si los hay.
- `soportes` — archivos genéricos (reemplaza `documento_solicitud` y `documento_cargado`).

**Proyectos (Dominio 8, para Solicitudes de Grado):**
- `proyecto` — reemplaza `detalle_grado` + campos `titulo_proyecto`/`tipo_proyecto`/`resumen_proyecto` de `solicitud`.
- `documento` — adjuntos del proyecto.
- `linea_investigacion` — opcional.
- `grupo_investigacion` — opcional.

### 3.2 Tablas oficiales con extensiones nuestras

Estas tablas existen en la oficial pero les añadimos columnas necesarias para nuestros workflows.

**`admins`** — ya tiene los campos oficiales. Le añadimos:
```
+ tipo VARCHAR(30) CHECK (tipo IN ('SUPER','POSGRADOS','DEPENDENCIA'))
+ dependencia_id INT REFERENCES dependencias(id)
+ codigo VARCHAR(20) UNIQUE
+ nombre_completo VARCHAR(150)
```
Justificación: lo que el oficial llama `admins` cubre solo "operadores del sistema". Nosotros necesitamos discriminar POSGRADOS vs DEPENDENCIA y vincular DEPENDENCIA con su dependencia.

**`solicitudes`** — base oficial. Le añadimos un campo para fácilmente saber tipo de workflow:
```
(sin cambios estructurales — las extensiones de workflow van en tabla separada §3.3)
```

### 3.3 Tablas propias del módulo (no existen en oficial)

Estas tablas son aporte del módulo. Tienen FKs a tablas oficiales (`usuarios`, `estudiantes`, `solicitudes`).

**Workflow de aprobación director→posgrados:**
- `workflow_solicitud` — extensión de `solicitudes` para nuestros campos de workflow:
  ```
  PK id
  FK solicitud_id → solicitudes.id (UNIQUE)
  decision VARCHAR(20)               -- APROBADA | RECHAZADA
  fechaDecision DATETIME
  director_usuario_id INT FK → usuarios.id     -- ANTES era `cedula_director`
  observacionesDirector TEXT
  validacion_posgrados VARCHAR(20)
  fechaValidacion DATETIME
  posgrados_admin_id INT FK → admins.id        -- ANTES era `cedula_posgrados`
  observacionesPosgrados TEXT
  acta_generada BOOLEAN
  radicado VARCHAR(50) UNIQUE
  estado_pago_grado VARCHAR(30)
  modalidad_grado VARCHAR(30)
  pago_modalidad_realizado BOOLEAN
  fecha_grado DATE
  estado_estudiante_id INT FK → estados_estudiantes.id  -- snapshot del estado tras la decisión
  ```
  **Esto formaliza el Sprint C del plan v3 (5b + 5d) en el esquema nuevo, sin tener que ejecutarlo sobre Supabase.**

**Paz y salvos:**
- `paz_y_salvo` — igual que ahora pero con FKs alineadas:
  ```
  PK id
  FK solicitud_id → solicitudes.id
  FK estudiante_id → estudiantes.id            -- en vez de cedula_estudiante
  FK responsable_admin_id → admins.id          -- DEPENDENCIA / POSGRADOS
  FK responsable_usuario_id → usuarios.id      -- DIRECTOR
  FK dependencia_id → dependencias.id
  tipo_dependencia VARCHAR(50)
  estado VARCHAR(30)
  observaciones TEXT
  fecha_solicitud DATETIME
  fecha_respuesta DATETIME
  ```

**Certificados:**
- `tipo_certificado` — catálogo nuestro con FK a `dependencias`.
- `solicitud_certificado` — solicitud específica de constancia (separada de `solicitudes` oficial que es para aplazamientos/grado):
  ```
  PK id
  FK estudiante_id → estudiantes.id
  FK tipo_certificado_id → tipo_certificado.id
  modalidad_envio, estado, fechas, costo, urlPdf, hashPdf, etc.
  ```
  ⚠️ Decisión abierta: **¿`solicitud_certificado` también podría ir bajo `solicitudes` oficial con `tipo_solicitud_id` apuntando a un tipo "CERTIFICADO"?** Para el experimento mantenemos tabla separada por simplicidad; se evalúa al final si conviene unificar.

**Pagos (Wompi):**
- `pagos` — sin equivalente oficial. Tabla propia con FK a `solicitudes` o a `solicitud_certificado`.

**Convocatorias:**
- `convocatoria` — propia.

**Dependencias administrativas:**
- `dependencias` — Biblioteca, Tesorería, Admisiones. No existe en oficial.

**Historial de estados:**
- `historial_estado_tramite` — auditoría propia.

### 3.4 Tablas omitidas (con justificación)

Estas tablas de la oficial NO se incluyen en el experimento. Si el equipo oficial pide después, se añaden.

| Tabla oficial | Razón de omisión |
|---|---|
| Todas las `*_divisit` (7 tablas) | Sincronización legacy externa. Se mockea con seeds manuales en `notas_posgrado` para el cálculo de créditos. |
| `cambio_estado_matriculas` | Auditoría avanzada de matrículas. No usada por trámites. |
| `historial_cierre_notas`, `historico_grupos`, `historico_semestres` | Históricos académicos. Fuera del scope del MVP. |
| `coloquio`, `coloquio_estudiante` | Funcionalidad académica no relacionada con trámites. |
| `contraprestaciones`, `tipos_contraprestaciones` | Fuera del scope del MVP. |
| `sustentacion`, `sustentacion_documento`, `sustentacion_evaluador`, `criterio_evaluacion` | El MVP no maneja sustentación de tesis aún. Se crean las tablas vacías para futura extensión. |
| `usuario_proyecto`, `retroalimentacion`, `definitiva` | Idem investigación, fuera del MVP. |
| `meta_ods`, `proyecto_meta_ods`, `macro`, `macro_grupo`, `trabajos_orcid` | Catálogos académicos avanzados. Fuera del MVP. |
| `objetivo_especifico` | Si se usa `proyecto` simple para Solicitud de Grado, podemos prescindir de objetivos específicos inicialmente. Se añade si se quiere mostrar ciclo completo de tesis. |

**Total experimento:** ~25 tablas oficiales adoptadas + ~8 tablas propias = **~33 tablas en Railway**.

---

## 4. Mapeo tabla actual → tabla del nuevo esquema

Esta tabla es el plan de migración concreto: cada fila documenta dónde termina cada tabla actual del módulo.

| Tabla actual (Supabase) | Destino en Railway | Acción |
|---|---|---|
| `usuario` | `usuarios` (oficial) | Renombrar tabla, mapear columnas (`primer_nombre` → `primerNombre`, `nombre_completo` → `nombreCompleto`, etc.). Drop `programa_id`, `creditos_aprobados`, `estado_grado`, `correo`, `nombre`, `rol` (campos que la oficial no tiene en `usuarios`). |
| `estudiante` | `estudiantes` (oficial) | Renombrar tabla. Las FKs `usuario_id`, `programa_id`, `pensum_id`, `cohorte_id`, `estado_estudiante_id` ya están alineadas. |
| `estados_estudiantes` | `estados_estudiantes` (oficial) | Sin cambio. |
| `programa_academico` | `programas` (oficial) + `tipos_programas` | Migrar `nombre` y `tipo` (tipo se desnormaliza vía FK a `tipos_programas`). El `total_creditos` deja de persistirse — se computa de las materias del pensum. |
| `roles` | `roles` (oficial) | Sin cambio. Mantenemos catálogo: ESTUDIANTE, DIRECTOR, DOCENTE, EVALUADOR. Notar que POSGRADOS/DEPENDENCIA/ADMIN ya NO van acá (viven en `admins.tipo`). |
| `admins` | `admins` (extendida — §3.2) | Mantener con extensiones `tipo`, `dependencia_id`, `codigo`, `nombre_completo`. |
| `dependencias` | `dependencias` (propia) | Sin cambio. |
| `solicitud` | `solicitudes` (oficial) + `workflow_solicitud` (propia) + `proyecto` (oficial, solo para tipo=GRADO) | **Split en 3:** los campos base van a `solicitudes`, los de workflow a `workflow_solicitud`, y los de proyecto (titulo_proyecto, tipo_proyecto, resumen_proyecto) a `proyecto` con FK desde workflow_solicitud. |
| `detalle_grado` | `proyecto` (oficial) | Reemplazar — la oficial tiene un modelo más rico. |
| `tipo_certificado` | `tipo_certificado` (propia) | Sin cambio. |
| `solicitud_certificado` | `solicitud_certificado` (propia) | Mantener como tabla separada por ahora. Sus FKs se actualizan: cedula → estudiante_id. |
| `paz_y_salvo` | `paz_y_salvo` (propia, refactorizada) | Renombrar columnas a alineadas con la oficial. Mantener FKs polimórficas. |
| `pagos` | `pagos` (propia) | Sin cambio. Las FKs a solicitudes/solicitud_certificado se actualizan. |
| `convocatoria` | `convocatoria` (propia) | Sin cambio. |
| `documento_solicitud` | `soportes` (oficial) | Migrar. Adoptar `soportes`. |
| `documento_cargado` | `soportes` (oficial) | Idem — consolidar las dos tablas en `soportes`. |
| `tipo_documento_requerido` | `tipo_documento_requerido` (propia) | Mantener tal cual o eliminar si no se usa. |
| `historial_estado_tramite` | `historial_estado_tramite` (propia) | Sin cambio. Actualizar FKs si referencian columnas renombradas. |

**Nuevas tablas oficiales que se crean (no existían en Supabase):**

- `tipos_solicitudes`
- `pensums`, `semestres_pensums`, `semestres`, `materias`, `linea_programa`
- `cohortes`, `cohorte_grupos`, `grupos_cohortes`, `grupos`
- `matriculas`, `estados_matriculas`, `notas_pregrado`, `notas_posgrado`
- `documento` (de proyectos)
- `sesiones_activas` (opcional)
- `linea_investigacion`, `grupo_investigacion` (opcional)

---

## 5. Propuesta sobre créditos: snapshot + cómputo

El PO planteó la idea de dejar el campo persistido pero también poder computarlo desde notas. Es viable y deseable. Detalle:

### 5.1 Persistencia (snapshot)

`estudiantes.creditos_aprobados` (INT, nullable) se mantiene como hoy. Es el valor que se lee para validar prerrequisitos rápidamente (sin JOIN a `notas_*`).

### 5.2 Cómputo (servicio)

Crear `CreditosService.calcular(estudianteId)` que ejecuta:

```sql
SELECT COALESCE(SUM(m.creditos), 0) AS total_creditos_aprobados
FROM matriculas mat
JOIN grupos_cohortes gc   ON mat.grupo_cohorte_id = gc.id
JOIN grupos g             ON gc.grupo_id = g.id
JOIN materias m           ON g.materia_id = m.id
JOIN notas_posgrado n     ON n.matricula_id = mat.id
WHERE mat.estudiante_id = ?
  AND n.nota >= 3.0;          -- nota aprobatoria (ajustable)
```

(Para estudiantes de pregrado se usa `notas_pregrado` con su lógica específica — `estudiante_codigo` en lugar de `matricula_id`.)

### 5.3 Sincronización

Tres formas posibles, no excluyentes:

| Estrategia | Cuándo | Costo |
|---|---|---|
| **On-demand al solicitar trámite** | Antes de validar prerrequisito | Mínimo — solo query, no actualiza BD |
| **Sync periódico (job nocturno)** | Cron nocturno | Bajo |
| **Sync inmediato (trigger BD o evento aplicación)** | Cuando se registra una `notas_posgrado` nueva | Cero latencia, complejidad media |

Para el experimento recomiendo **on-demand al validar prerrequisito** + actualizar el snapshot. Así nunca está desfasado en el momento que importa.

```java
public boolean tieneCreditosSuficientes(Long estudianteId) {
    int calculado = creditosService.calcular(estudianteId);
    Estudiante est = estudianteRepository.findById(estudianteId).orElseThrow();
    est.setCreditosAprobados(calculado);
    estudianteRepository.save(est);   // actualiza snapshot
    int requeridos = est.getPrograma().getTotalCreditos();
    return calculado >= requeridos;
}
```

### 5.4 Beneficios

- Validamos siempre con datos frescos.
- El snapshot queda al día para queries que lo lean sin querer recalcular.
- Cuando la integración con DIVISIT real exista, el servicio se reemplaza por una llamada a su API/tablas, sin tocar el resto del código.

---

## 6. Adaptaciones técnicas (PostgreSQL → MySQL)

Para que el backend Spring Boot apunte a MySQL en lugar de PostgreSQL hay que cambiar:

### 6.1 `application.properties`

```properties
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
spring.datasource.url=jdbc:mysql://<railway-host>:3306/<db>?useSSL=true&serverTimezone=UTC
```

### 6.2 `pom.xml`

Añadir dependencia MySQL Connector y quitar (o dejar) PostgreSQL driver:

```xml
<dependency>
  <groupId>com.mysql</groupId>
  <artifactId>mysql-connector-j</artifactId>
</dependency>
```

### 6.3 Diferencias de tipos a revisar en entities

| PostgreSQL | MySQL |
|---|---|
| `BIGINT GENERATED ALWAYS AS IDENTITY` | `BIGINT AUTO_INCREMENT` |
| `BYTEA` (para archivos en `paz_y_salvo.archivo_contenido` si existe) | `LONGBLOB` |
| `TEXT` | `TEXT` o `LONGTEXT` (según tamaño) |
| `BOOLEAN` | `TINYINT(1)` (Hibernate lo abstrae bien) |
| `TIMESTAMP` | `DATETIME` |
| `VARCHAR` con `UNIQUE` | igual, sintaxis compatible |

Las anotaciones JPA Hibernate `@Column` y `@Id` mayormente son agnósticas. Lo único que típicamente requiere ajuste son:

- `GenerationType.IDENTITY` funciona en ambos pero con sintaxis interna diferente.
- Defaults de columna (`DEFAULT CURRENT_TIMESTAMP`) son idénticos en ambos.

### 6.4 Hash de contraseñas

Se mantiene BCrypt. Mismo hash `$2a$10$TCpV633Sg7xBIMP/VpL80uQw9YHjSPvk5iFmk6aFs.yxQwVq5eSBq` para `123456` funciona tal cual.

### 6.5 `data.sql`

Se reescribe completamente para MySQL respetando el schema nuevo. Más detalle en §7.4.

---

## 7. Plan de ejecución del experimento

> Sin tiempos. Cada fase termina con un commit en la rama `feature/railway-mysql-experimento`.

### Fase 1 — Setup Railway

1. Crear cuenta o usar existente en Railway.
2. Crear servicio MySQL en Railway. Anotar credenciales (host, port, user, password, db).
3. Verificar conexión desde un cliente local (`mysql` CLI o DBeaver).
4. Crear branch `feature/railway-mysql-experimento` en `tramites-backend`.

### Fase 2 — Schema SQL completo

1. Escribir `tramites-backend/.docs/sql/railway/01_schema.sql` con todas las CREATE TABLE de §3. **No tocar Supabase.**
2. Aplicarlo en Railway (`mysql -h host -u user -p db < 01_schema.sql`).
3. Verificar que las 33 tablas existen y los FKs están definidos.

### Fase 3 — Seeds

1. Escribir `tramites-backend/.docs/sql/railway/02_seeds.sql` con datos mínimos para el MVP:
   - Roles (ESTUDIANTE, DIRECTOR, DOCENTE, EVALUADOR).
   - Tipos de programas (Maestría, Doctorado, Especialización).
   - Programas (Maestría en Gerencia de Empresas, Maestría en TIC, etc.).
   - Pensum + materias + créditos suficientes para que un estudiante pueda graduarse.
   - Cohortes + cohorte_grupos con directores asignados.
   - Estados de estudiantes (ACTIVO, PAGO_GRADO_PENDIENTE, GRADUADO).
   - Tipos de solicitudes (TERMINACION_MATERIAS, GRADO).
   - Estados de matrículas.
   - 6 usuarios + perfiles de estudiante + matrículas + notas suficientes.
   - 5 admins (POS001, ADMIN1, DEP001-3).
   - Dependencias (Biblioteca, Financiera, Admisiones).
   - Tipos de certificado de ejemplo.

   **Los 7 huérfanos identificados en Supabase NO se incluyen.** El experimento es BD limpia.

2. Aplicarlo en Railway.

### Fase 4 — Refactor del backend

1. Adaptar `application.properties` y `pom.xml` para MySQL (§6).
2. Renombrar tablas en entities:
   - `Usuario` (@Table `usuarios`) — eliminar campos no oficiales.
   - `Estudiante` (@Table `estudiantes`).
   - `Programa` (@Table `programas`) — reemplaza `ProgramaAcademico`.
   - `Solicitud` (@Table `solicitudes`) — adelgaza columnas; los campos de workflow a `WorkflowSolicitud` nuevo.
   - Crear entities nuevas para `Pensum`, `Materia`, `Cohorte`, `CohorteGrupo`, `Matricula`, `Soporte`, `TipoSolicitud`, `Proyecto`, etc.
3. Refactor de repositorios y servicios para reflejar las FKs nuevas y los nombres de tabla nuevos.
4. Crear `CreditosService` con cómputo + snapshot (§5).
5. Verificar compilación local + arranque local apuntando a Railway.

### Fase 5 — Smoke test E2E sobre Railway

Mismo checklist que `plan_roles_v3.md §6`, ejecutado contra Railway. Los flujos a validar:

- 6 logins funcionan.
- Estudiante solicita certificado → DEP marca listo → estudiante descarga PDF.
- Estudiante solicita Grado → Director aprueba → paz y salvos creados → DEP responde → POS aprueba → acta.
- Estado del estudiante cambia correctamente (ACTIVO → PAGO_GRADO_PENDIENTE → GRADUADO).
- Cálculo de créditos por `CreditosService` cuadra con la suma de materias aprobadas.

### Fase 6 — Documentación y presentación

1. Capturar evidencia (logs, screenshots, esquema de tablas).
2. Documentar las decisiones de diseño que surgieron durante la migración.
3. Preparar slide o demo para presentar al equipo oficial: "corremos sobre vuestra estructura + nuestras extensiones".

---

## 8. Riesgos y decisiones abiertas

### 8.1 Riesgos

| Riesgo | Mitigación |
|---|---|
| El equipo oficial tiene matices del schema que no están en `bd_tablas_completas.md` | El experimento es deliberadamente "best-effort" — al presentar las divergencias se descubren. |
| MySQL no soporta features de PostgreSQL que usamos (FKs polimórficas, `COALESCE`, etc.) | Verificar al pasar cada query y entity. Probable que no haya bloqueos serios. |
| `solicitud_certificado` no encaja en el modelo oficial sin forzar | Decisión abierta: mantener como tabla propia o adoptar `solicitudes` con tipo "CERTIFICADO" + extensión. |
| Cohortes y grupos exigen seeds complejos | Crear seeds mínimos pero realistas (1 cohorte por programa, 1 grupo por materia). |
| Notas_posgrado seed: hay que escribirlo a mano para que el cálculo de créditos cuadre | Aceptable para experimento. |

### 8.2 Decisiones abiertas

| Decisión | Opciones | Recomendación inicial |
|---|---|---|
| ¿`solicitud_certificado` unifica con `solicitudes`? | (a) tabla separada; (b) integrar con `tipo_solicitud_id` = CERTIFICADO + tabla de extensión | (a) por simplicidad. Reevaluar al final. |
| ¿Importamos `linea_investigacion` y `grupo_investigacion`? | Sí / no | No para MVP, sí si queremos demo de "ciclo completo de tesis". |
| ¿`sesiones_activas` se usa? | Sí / no | No (mantenemos JWT). Crear tabla vacía como gesto de alineamiento. |
| ¿Quitamos campo `cedula_director` definitivamente? | Sí / no | Sí. Reemplazado por `workflow_solicitud.director_usuario_id` (FK). |
| ¿Cómo gestionamos seeds de notas? | Seed manual / script generador | Seed manual para los 5-6 estudiantes del demo. |
| ¿Cambiamos el repo o usamos rama? | Rama / repo nuevo | Rama. Más simple. |

---

## 9. Próximos pasos

1. **Validar este plan con el equipo / PO.** Especialmente las decisiones abiertas de §8.2.
2. **Ejecutar Fase 1** (setup Railway, branch).
3. **Ejecutar Fase 2 y 3** (schema + seeds en Railway). Termina con BD lista para apuntar el backend.
4. **Ejecutar Fase 4** (refactor backend). Esta es la fase más grande.
5. **Smoke test** (Fase 5) — punto de control: experimento exitoso o no.
6. **Presentar al equipo oficial** los resultados (Fase 6).

---

## 10. Documentos relacionados

- [`bd_tablas_completas.md`](bd_tablas_completas.md) — esquema oficial completo (56 tablas, fuente de verdad para §3 y §4).
- [`../base_de_datos_oficial_posgrados.md`](../base_de_datos_oficial_posgrados.md) — esquema oficial sintetizado por módulos.
- [`../clientes_finales_sistema.md`](../clientes_finales_sistema.md) — análisis de identidad/roles oficiales.
- [`../plan_roles_v3.md`](../plan_roles_v3.md) — plan vivo del módulo de identidad. §9 documenta el pivot que dio origen a este plan.
- [`../plan_roles_v2.md`](../plan_roles_v2.md) — referencia histórica de decisiones (Bloques 0-5).
- [`../plan_integracion_bd_oficial.md`](../plan_integracion_bd_oficial.md) — plan macro de integración con BD oficial. Este experimento Railway implementa naturalmente las Fases 1, 2 y parte de la 4 de ese plan en un solo paso.
- [`../../../../.docs/base%20de%20datos%20actual%20modulo.sql`](../../../../.docs/base%20de%20datos%20actual%20modulo.sql) — schema actual en Supabase (origen de la migración).

---

**Versión:** 1.0  
**Última actualización:** 2026-05-31  
**Estado:** plan vivo del experimento.  
**Autor:** módulo Trámites de Posgrado UFPS.
