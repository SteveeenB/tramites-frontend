# Plan de roles — estado actual y Bloque 5 (v3)

> **Plan vivo del equipo.** Refleja el estado real de `main` en producción y enfoca el trabajo restante (Bloque 5). Las versiones anteriores ([`plan_roles.md`](plan_roles.md) v1 y [`plan_roles_v2.md`](plan_roles_v2.md) v2) quedan como **referencia histórica** del análisis y las decisiones que llevaron al estado actual.
>
> **Si solo lees un documento del módulo de identidad, lee este.**

---

## 0. Cómo usar este documento

| Si quieres… | Lee… |
|---|---|
| Saber **qué está hecho hoy** y qué falta | §1 y §2 de este archivo |
| Saber **qué decisiones ya están cerradas** (no se reabren) | §3 |
| **Ejecutar** el Bloque 5 | §4 + §5 |
| Entender **por qué** se tomó cada decisión | [`plan_roles_v2.md`](plan_roles_v2.md) §10, §11 |
| Entender el **plan macro de integración** con BD oficial | [`plan_integracion_bd_oficial.md`](plan_integracion_bd_oficial.md) |
| Ver los **campos oficiales** referenciados | [`base_de_datos_oficial_posgrados.md`](base_de_datos_oficial_posgrados.md) y [`clientes_finales_sistema.md`](clientes_finales_sistema.md) |

---

## 1. Estado actual del `main` (2026-05-31)

### 1.1 Refactor de identidad híbrida — **COMPLETADO Y EN PRODUCCIÓN**

| Componente | Estado | Commit | Validación |
|---|---|---|---|
| Tabla `admins` separada de `usuario` (DDL + 5 seeds: ADMIN1, POS001, DEP001/2/3) | ✅ Producción | backend `4387691` | 6 logins funcionando con `123456` |
| JWT con `principalType` (USUARIO/ADMIN) + `dependenciaId` + `esSuperAdmin` | ✅ Producción | backend `4387691` | Verificado en DevTools post-login |
| Doble búsqueda en `/auth/login` (admins → usuario) | ✅ Producción | backend `4387691` | POS001 y 20261003 ambos entran |
| `PrincipalResolver` polimórfico con fallback Usuario↔Admin | ✅ Producción | backend `4387691` + fix `685dea4` | Coordinador Posgrados (20261003) entra a su bandeja |
| `tipo_certificado.dependencia_cedula` → `dependencia_id` (FK formal a `Dependencia`) | ✅ Producción | backend `4387691` | Dropdown del sprint anterior corregido |
| `solicitud.cedula_posgrados` → `posgrados_admin_id` (FK a `admins`) | ✅ Producción | backend `4387691` | Aprobar/rechazar como POS001 funciona |
| `paz_y_salvo.cedula_responsable` → FK polimórfica (`responsable_admin_id` o `responsable_usuario_id`) | ✅ Producción | backend `4387691` | Flujo paz y salvos con DEP001 y director responde OK |
| Frontend: `AuthContext` con `principalType`, `BandejaCertificadosDependencia` con `dependenciaId`, etc. | ✅ Producción | frontend `e151e3b` | Smoke test E2E pasó |
| Estudiante.usuario_id FK formal a usuario.id | ✅ Producción | backend `4387691` (Bug C fix) | Hibernate sin stacktrace al arrancar |
| **Cleanup Bloque 4**: drop columnas zombie + Usuario.dependencia + UsuarioService dead code | ✅ Producción | backend `685dea4` | SQL `migracion_admins_bloque4.sql` aplicado |
| **Sprint A — Bloque 5e**: catálogo `estados_estudiantes` + entidad `EstadoEstudiante` + FK formal + refactor servicios | ✅ Producción | backend `b0a3005` + fix `64885af` | SQL `migracion_bloque5e_estados_estudiantes.sql` aplicado; 5 estudiantes en `ACTIVO` |
| **Sprint B — Bloque 5a**: `solicitud`/`solicitud_certificado`/`paz_y_salvo` con FK `estudiante_id` (doble-write) | ✅ Producción | backend `7ae0111` | SQL `migracion_bloque5a_estudiante_id.sql` aplicado; backfill parcial (ver §8) |

### 1.2 SQLs aplicados en Supabase

Ejecutados en orden:
1. [`migracion_admins_bloque0.sql`](../../../tramites-backend/.docs/sql/migracion_admins_bloque0.sql) — DDL tabla `admins`
2. [`migracion_admins_bloque1.sql`](../../../tramites-backend/.docs/sql/migracion_admins_bloque1.sql) — `tipo_certificado.dependencia_id`
3. [`migracion_admins_bloque2_3.sql`](../../../tramites-backend/.docs/sql/migracion_admins_bloque2_3.sql) — INSERT admins + DELETE viejos + ALTER solicitud + ALTER paz_y_salvo + FKs
4. [`migracion_admins_bloque4.sql`](../../../tramites-backend/.docs/sql/migracion_admins_bloque4.sql) — DROP columnas zombie + DROP usuario.dependencia_id
5. [`migracion_bloque5e_estados_estudiantes.sql`](../../../tramites-backend/.docs/sql/migracion_bloque5e_estados_estudiantes.sql) — catálogo `estados_estudiantes` + backfill desde `estado_grado`
6. [`migracion_bloque5a_estudiante_id.sql`](../../../tramites-backend/.docs/sql/migracion_bloque5a_estudiante_id.sql) — FK `estudiante_id` en 3 tablas + backfill por cédula

### 1.3 Credenciales de prueba en producción

Todas con contraseña `123456`. Hash BCrypt único: `$2a$10$TCpV633Sg7xBIMP/VpL80uQw9YHjSPvk5iFmk6aFs.yxQwVq5eSBq`.

| Código | Quién | Vive en | Rol |
|---|---|---|---|
| `20261005` | Laura Gomez | `usuario` | ESTUDIANTE |
| `20261002` | Maria Director | `usuario` | DIRECTOR |
| `20261003` | Coordinador Posgrados | `usuario` | POSGRADOS (caso transicional) |
| `DIR001` | Carlos Director Grado | `usuario` | DIRECTOR |
| `EST010` | Andrea Prueba Grado | `usuario` | ESTUDIANTE |
| `POS001` | Oficina Posgrados | `admins` | POSGRADOS |
| `ADMIN1` | Administrador | `admins` | SUPER (rol → ADMIN) |
| `DEP001` | Biblioteca Central | `admins` | DEPENDENCIA |
| `DEP002` | División Financiera | `admins` | DEPENDENCIA |
| `DEP003` | Admisiones y Registro | `admins` | DEPENDENCIA |

---

## 2. Estado del Bloque 5 (actualizado 2026-05-31)

| Sub-bloque | Alcance | Estado | Notas |
|---|---|---|---|
| **5a** | `cedula` → `estudiante_id` FK en `solicitud`, `solicitud_certificado`, `paz_y_salvo` | ✅ **En producción** (Sprint B) | Doble-write; backfill parcial (ver §8 huérfanos) |
| **5e** | Catálogo `estados_estudiantes` | ✅ **En producción** (Sprint A) | 5 estudiantes en `ACTIVO`; nuevos flujos escriben FK |
| **5b** | `cedulaDirector` → FK `directorUsuario` | 🛑 **Diferido — ver §9** | No se ejecuta en este plan |
| **5c** | Adoptar `tipos_solicitudes` oficial | 🛑 **Diferido — ver §9** | Movido a plan de migración Railway |
| **5d** | Cleanup denormalización en `usuario` | 🛑 **Diferido — ver §9** | Movido a plan de migración Railway |
| **5f** | Auth con SSO + `sesiones_activas` | 🛑 **Diferido — ver §9** | Sigue esperando SSO Moodle/Google |

**Lo que se ejecutó (Sprints A + B) no rompe nada del funcionamiento actual.** Ver §8 abajo para el detalle de huérfanos detectados y por qué no son bloqueantes.

**Lo que falta del Bloque 5 (sub-bloques 5b/5c/5d/5f)** se decidió **no ejecutar** sobre la BD actual de Supabase. La razón está en §9: se pivota a un experimento de migración a Railway con MySQL siguiendo el esquema oficial completo. Ese plan está en [`TABLAS BD OFICIAL/plan_migracion_railway.md`](TABLAS%20BD%20OFICIAL/plan_migracion_railway.md).

---

## 3. Decisiones cerradas (no se reabren)

Estas decisiones se discutieron, validaron y están registradas en [`plan_roles_v2.md`](plan_roles_v2.md). Las repito acá para evitar que el equipo las reabra en sprints futuros.

| # | Decisión | Razón resumida | Detalle en v2 |
|---|---|---|---|
| 1 | **Adoptar modelo híbrido** `admins` ≠ `usuarios` | Patrón oficial confirmado; admins son entidad, no rol | §1, §10 |
| 2 | **NO crear tabla `programa_director`** | La oficial no la tiene; director se modela como `usuario` con rol DIRECTOR + `programa_id` | §11.2, §11.3 |
| 3 | **Mantener JWT stateless + password BCrypt** para MVP | Cambiar a `sesiones_activas` sin SSO es lo peor de ambos mundos | §11.2, §11.5 |
| 4 | **`Estudiante.creditos_aprobados` como snapshot/caché** | La oficial lo calcula desde DIVISIT; nosotros lo guardamos como cache y al integrar un job lo sincroniza | §11.7 |
| 5 | **`Estudiante.estadoGrado` migra a catálogo** `estados_estudiantes` | Alinea con patrón oficial sin romper flujos (solo 2 valores en código) | §11.4 (Bloque 5e) |
| 6 | **NO eliminar campos duplicados deliberadamente por la oficial** (`cedula`, `codigo`, `email`, `moodleId`, `telefono` viven en `usuarios` Y `estudiantes`) | La oficial los duplica para trazabilidad cruzada — no es deuda | §11.6 |
| 7 | **Eliminar de `usuario` lo que NO está en `usuarios` oficial** (`programa_id`, `creditos_aprobados`, `estado_grado`, `correo`, `nombre`, `rol`) | Es deuda preexistente del repo, no del modelo | §11.6 |
| 8 | **Director es `usuario` con rol DIRECTOR + `programa_id`** (asignación implícita 1:1) | Suficiente para MVP con directores inventados. Al integrar pasa a `cohorte_grupos.usuario_id`. | §11.3 |
| 9 | **NO importar el dominio cohortes** ahora | Es propiedad del equipo oficial. Importarlo es Fase 4 del [`plan_integracion`](plan_integracion_bd_oficial.md) | §11.2 |

---

## 4. Bloque 5 — detalle ejecutable

### 4.1 Bloque 5a — `cedula` → `estudiante_id` FK

**Objetivo:** reemplazar las FKs lógicas por string-cédula con FKs formales Long a `estudiante.id`.

**Cambios de schema:**
```sql
-- Solicitud
ALTER TABLE solicitud
  ADD COLUMN IF NOT EXISTS estudiante_id BIGINT REFERENCES estudiante(id);
UPDATE solicitud s
SET estudiante_id = e.id
FROM estudiante e
WHERE e.cedula = s.cedula
  AND s.estudiante_id IS NULL;

-- SolicitudCertificado
ALTER TABLE solicitud_certificado
  ADD COLUMN IF NOT EXISTS estudiante_id BIGINT REFERENCES estudiante(id);
UPDATE solicitud_certificado sc
SET estudiante_id = e.id
FROM estudiante e
WHERE e.cedula = sc.cedula
  AND sc.estudiante_id IS NULL;

-- PazYSalvo
ALTER TABLE paz_y_salvo
  ADD COLUMN IF NOT EXISTS estudiante_id BIGINT REFERENCES estudiante(id);
UPDATE paz_y_salvo ps
SET estudiante_id = e.id
FROM estudiante e
WHERE e.cedula = ps.cedula_estudiante
  AND ps.estudiante_id IS NULL;

-- Drop columnas zombie SOLO tras refactor de código completo (siguiente sprint)
-- ALTER TABLE solicitud            DROP COLUMN cedula;
-- ALTER TABLE solicitud_certificado DROP COLUMN cedula;
-- ALTER TABLE paz_y_salvo          DROP COLUMN cedula_estudiante;
```

**Cambios de entities:**
- `Solicitud.java`: añadir `@ManyToOne Estudiante estudiante`; deprecar `cedula`.
- `SolicitudCertificado.java`: idem.
- `PazYSalvo.java`: idem para `cedulaEstudiante`.
- Repositorios: nuevas queries `findByEstudiante_Id`, `findByEstudiante_IdAndEstado`, etc.

**Cambios de servicios:**
- `SolicitudService`, `CertificadoService`, `PazYSalvoService`: cuando guardan solicitudes nuevas, setean `estudiante` (lookup en `EstudianteRepository`) en vez de pasar la cédula como string.
- Lectura: cambiar `findByCedula` por `findByEstudiante_Id`.

**Verificación E2E:**
1. Laura solicita certificado → guarda `solicitud_certificado.estudiante_id` con el ID de Laura.
2. Andrea solicita grado → Maria aprueba → se crean paz y salvos con `estudiante_id` de Andrea.
3. DEP001 ve bandeja con la cédula de Andrea en la solicitud.

**Tiempo:** 4-5h.

### 4.2 Bloque 5b — `Solicitud.cedulaDirector` → `directorUsuario` (FK)

**Objetivo:** formalizar la auditoría "quién aprobó esta solicitud" con FK Long.

**No** se crea tabla nueva. No se cambia el modelo del director (sigue siendo `usuario` con rol DIRECTOR + `programa_id`).

**SQL:**
```sql
ALTER TABLE solicitud
  ADD COLUMN IF NOT EXISTS director_usuario_id BIGINT REFERENCES usuario(id);
UPDATE solicitud s
SET director_usuario_id = u.id
FROM usuario u
WHERE u.cedula = s.cedula_director
  AND s.director_usuario_id IS NULL;
-- DROP COLUMN cedula_director cuando código nuevo esté en prod.
```

**Cambios de código:**
- `Solicitud.java`: añadir `@ManyToOne Usuario directorUsuario`.
- `SolicitudService.aprobarSolicitudConDirector(Long id, String cedulaDirector)` → setear el `directorUsuario` haciendo lookup en `UsuarioRepository`.
- Deprecar campo `cedulaDirector` (mantener como zombie hasta sprint siguiente).

**Tiempo:** 2-3h.

### 4.3 Bloque 5d — Cleanup denormalización `usuario`

**Prerequisito:** Bloque 5a hecho (porque `Solicitud` y `PazYSalvo` ya no leen `Usuario.programa_id` ni `creditos_aprobados`).

Detalle exacto de columnas a eliminar de `usuario` en [`plan_roles_v2.md` §11.6](plan_roles_v2.md).

**SQL:**
```sql
ALTER TABLE usuario
  DROP COLUMN IF EXISTS programa_id,
  DROP COLUMN IF EXISTS creditos_aprobados,
  DROP COLUMN IF EXISTS estado_grado,
  DROP COLUMN IF EXISTS correo,
  DROP COLUMN IF EXISTS nombre,
  DROP COLUMN IF EXISTS rol;
```

**Cambios de entities:**
- `Usuario.java`: drop campos `programa_id`, `creditos_aprobados`, `estado_grado`, `correo`, `nombre`, `rol` y sus getters/setters/helpers.

**Cambios de servicios:**
- Cualquier código que lea `usuario.getNombre()` debe leer `usuario.getNombreCompleto()`.
- Cualquier código que lea `usuario.getCorreo()` debe leer `usuario.getEmail()`.
- Cualquier código que lea `usuario.getRol()` (string) debe leer `usuario.getRolNombre()` (que ya pasa por rol_id → Rol).
- Cualquier código que lea `usuario.getProgramaAcademico()` o `usuario.getCreditosAprobados()` debe leer del `Estudiante` correspondiente.

**Tiempo:** 2-3h.

### 4.4 Bloque 5e — Catálogo `estados_estudiantes`

Detalle completo de migración + análisis de uso en [`plan_roles_v2.md` §11.4](plan_roles_v2.md). Resumen:

**SQL:**
```sql
CREATE TABLE IF NOT EXISTS estados_estudiantes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE NOT NULL
);
INSERT INTO estados_estudiantes (nombre) VALUES
  ('ACTIVO'), ('PAGO_GRADO_PENDIENTE'), ('GRADUADO')
ON CONFLICT (nombre) DO NOTHING;

ALTER TABLE estudiante
  ADD COLUMN IF NOT EXISTS estado_estudiante_id BIGINT REFERENCES estados_estudiantes(id);
UPDATE estudiante SET estado_estudiante_id = (SELECT id FROM estados_estudiantes WHERE nombre = COALESCE(estado_grado, 'ACTIVO'));
```

**Código:** crear entidad `EstadoEstudiante` + repo + actualizar `SolicitudService.aprobarSolicitudConDirector`/`generarActa` + `PazYSalvoService.calcularEstadoEstudiante`.

**Tiempo:** 3-4h.

### 4.5 Bloque 5c — Adoptar `tipos_solicitudes` oficial (diferido)

**Cuando:** el equipo oficial confirme acceso de lectura/escritura a `tipos_solicitudes`.

**Trabajo:** migrar `Solicitud.tipo` (String enum) a FK a `tipos_solicitudes.id`. ~2-3h.

### 4.6 Bloque 5f — Auth con SSO + `sesiones_activas` (diferido)

**Cuando:** SSO Moodle/Google esté operativo en infra UFPS.

**Trabajo:** ver [`plan_roles_v2.md` §11.5](plan_roles_v2.md). ~6-10h.

---

## 5. Plan de ejecución recomendado del Bloque 5

> Para el sprint de alineamiento académico cuando se priorice.

### Sprint A — Catálogo de estados (3-4h)
1. **Bloque 5e**: crear catálogo `estados_estudiantes`, entidad + repo, refactor 3 servicios, smoke test.
2. Commit + push.

### Sprint B — Estudiante como FK (4-5h)
1. **Bloque 5a**: refactor `Solicitud`, `SolicitudCertificado`, `PazYSalvo` para usar `estudiante_id`.
2. Smoke test E2E completo (Laura solicita certificado, Andrea solicita grado, etc.).
3. Commit + push.

### Sprint C — Director + Cleanup denormalización (4-6h)
1. **Bloque 5b**: refactor `Solicitud.cedulaDirector` → `directorUsuario`.
2. **Bloque 5d**: drop columnas redundantes de `usuario`, refactor de getters en servicios.
3. Smoke test E2E.
4. Drop columnas zombie de Bloque 5a (cedula en solicitud/solicitud_certificado/paz_y_salvo).
5. Commit + push.

### Sprint D — `tipos_solicitudes` (cuando equipo oficial confirme, 2-3h)
1. **Bloque 5c**: migrar a tabla oficial.

### Sprint E — SSO (cuando esté disponible, 6-10h)
1. **Bloque 5f**: SSO Moodle/Google + decisión sobre `sesiones_activas`.

**Total con dependencias externas:** 19-28h distribuidas en 5 sprints.

**Total ejecutable hoy mismo (A+B+C):** 11-15h en 3 sprints.

---

## 6. Cómo verificar progreso del Bloque 5

Después de cada sprint, ejecutar:

1. **Compilación limpia:** `./mvnw -DskipTests clean compile` en backend (debe terminar BUILD SUCCESS con 69+ archivos).
2. **6 logins funcionan:** todas las credenciales de §1.3 entran sin error.
3. **Flujos críticos no regresionan:**
   - Laura solicita y paga certificado → DEP003 lo ve en bandeja → marca listo → Laura descarga PDF.
   - Andrea solicita grado → Maria aprueba → paz y salvos se crean para DEP001/2/3 + POS001 + Maria.
   - DEP001 responde paz y salvo → estado actualizado.
   - POS001 aprueba terminación → estudiante pasa a GRADUADO.
   - ADMIN1 crea nuevo tipo de certificado con dependencia asignada.
4. **Logs del backend al arrancar:** sin stacktraces de Hibernate sobre FKs incompatibles.

Si alguno falla, revertir el commit del sprint con `git revert HEAD` y diagnosticar.

---

## 7. Glosario de documentos relacionados

```
plan_roles_v3.md          ← ESTÁS AQUÍ. Plan vivo, estado actual, Bloque 5.
plan_roles_v2.md          ← Histórico de análisis y decisiones (referencia detallada).
plan_roles.md             ← v1 histórica (visión original, cronograma optimista).

plan_integracion_bd_oficial.md  ← Plan macro de integración con BD oficial. 
                                  Fases 0-6. Marca cohortes/SSO/DIVISIT como
                                  responsabilidad del equipo oficial.

base_de_datos_oficial_posgrados.md  ← Esquema de la BD oficial (referencia
                                       de campos). Actualizado 2026-05-31 con
                                       campos añadidos de clientes_finales.

clientes_finales_sistema.md  ← Análisis de las entidades de identidad/roles
                                de la BD oficial. Compartido por el equipo
                                oficial.

Roles_bd_oficial.docx     ← Documento original del equipo oficial sobre el
                            modelo de identidad/roles.
```

### ¿Cuál de estos toco?

- **Si modificas estado actual o avanzas Bloque 5:** actualiza este v3.
- **Si descubres una decisión nueva o invalida una vieja:** documenta en v2 (sección nueva) y referencia desde aquí.
- **Si cambias estrategia macro de integración:** actualiza `plan_integracion_bd_oficial.md`.
- **NO toques** v1 (`plan_roles.md`) — es histórico.

---

## 8. Deuda de datos identificada (2026-05-31)

> Al ejecutar la verificación post-Sprint B detectamos inconsistencias **preexistentes en la BD de Supabase**. No son bugs del refactor — son datos sucios de seeds históricos y pruebas iterativas. Se documentan acá para que el equipo no se sorprenda y como insumo del plan de migración a Railway (§9).

### 8.1 Huérfanos: usuarios con rol ESTUDIANTE sin perfil en `estudiante`

El backfill del Sprint B reveló que hay solicitudes con `cedula` que NO tiene contraparte en la tabla `estudiante`:

```
solicitud:             29 total · 15 con FK · 14 sin FK
solicitud_certificado: 25 total · 13 con FK · 12 sin FK
paz_y_salvo:           12 total · 12 con FK ·  0 sin FK
```

Las **7 cédulas huérfanas** identificadas son usuarios que existen en `usuario` con `rol='ESTUDIANTE'` pero nunca tuvieron su fila correspondiente en `estudiante`:

| Cédula | Código | Nombre |
|---|---|---|
| 1098765440 | 20261010 | Ana Torres |
| 1098765438 | 20261008 | Ana Torres |
| 1098765439 | 20261009 | Luis Mora |
| 1098765441 | 1152381  | Angel Vesga |
| 9999999999 | 20261099 | Estudiante Prueba |
| 5000000001 | EST020   | Roberto Demo Posgrados |
| 2000000011 | EST011   | Kevin Estudiante |

### 8.2 Otras inconsistencias observadas

- **Solicitudes de grado duplicadas:** Carlos Director (DIR001) ve 2 solicitudes "En revisión" del mismo estudiante (Laura Gomez, CC 1098765435). La validación de "ya existe activa" del backend asume que solo hay una en estado activo; probablemente la primera quedó en un estado distinto y se creó otra.
- **Datos de seed inconsistentes:** algunos usuarios fueron pensados como "el estudiante de pruebas" (Kevin) pero realmente no se usan en los flujos demo del frontend.
- **Sin mapeo coherente Usuario↔Estudiante:** la tabla `estudiante` no se actualizó cada vez que se añadía un nuevo usuario estudiante al seed.

### 8.3 ¿Esto rompe algo del funcionamiento actual?

**No.** La estrategia de doble-write garantiza que:

- Las columnas string viejas (`cedula`, `cedula_estudiante`, `estado_grado`) siguen pobladas igual que antes.
- Todas las queries existentes (`findByCedula`, `findFirstByCedulaAndTipo`, etc.) **siguen funcionando idéntico** — el código del Bloque 0-4 no fue alterado, solo se le añadió escritura adicional al FK.
- Los flujos críticos del MVP funcionan: login, solicitar certificado, pagar, generar acta, paz y salvos.
- Las filas huérfanas tienen `estudiante_id = NULL` pero la cédula sigue allí. Las queries que necesitan el estudiante pueden caer al lookup viejo.

### 8.4 ¿Cuándo importa la deuda?

Esto importa **solo en el momento del DROP futuro** de las columnas `cedula` zombie (Sprint posterior, originalmente planeado como Sprint C). En ese momento hay que:

- O bien crear los perfiles de `estudiante` faltantes para esos usuarios.
- O bien purgar las filas huérfanas si son de pruebas obsoletas.

**Decisión:** no resolvemos los huérfanos sobre Supabase porque pivotamos a Railway con BD limpia (§9).

---

## 9. Cierre del plan v3 — pivot a migración Railway

### 9.1 Decisión (2026-05-31)

**No se ejecutan los sub-bloques 5b, 5c, 5d, 5f sobre la BD actual de Supabase.**

Razón: la deuda de datos descrita en §8 y la duplicidad de "es nuestra BD" vs "queremos imitar la oficial" sugieren que pulir más Supabase es invertir en una base que no es la objetivo. La integración real apunta a un esquema MySQL alineado con el oficial.

### 9.2 Qué reemplaza lo que falta

Un **experimento documentado** de montar una BD MySQL en Railway que:

- Sigue el esquema oficial al máximo (las 56 tablas analizadas en [`TABLAS BD OFICIAL/bd_tablas_completas.md`](TABLAS%20BD%20OFICIAL/bd_tablas_completas.md), con omisiones justificadas).
- Cumple con la decisión #9 del plan v3 (importar el dominio cohortes cuando exista la integración) — porque ahora SÍ se importa.
- Permite revalidar el flujo completo del MVP sobre un esquema fiel al oficial.
- Se ejecuta **en rama paralela o repo nuevo** para no tocar `main` actual.
- Si funciona, se propone como la BD oficial del MVP.

Detalle completo en [`TABLAS BD OFICIAL/plan_migracion_railway.md`](TABLAS%20BD%20OFICIAL/plan_migracion_railway.md).

### 9.3 Qué se mantiene del refactor Bloques 0-5 (A+B)

Todo lo desplegado en Supabase queda como está. El refactor de identidad híbrida, los FKs nuevos, el catálogo de estados y los doble-writes **siguen siendo válidos como modelo** y se trasladan al esquema Railway con muy poca adaptación (cambio de dialecto Hibernate, conversión PostgreSQL → MySQL).

### 9.4 Lo que sí sigue ejecutable sobre Supabase (si surge la necesidad)

Si en algún momento se decide que el experimento Railway no avanza y hay que limpiar Supabase, los sub-bloques 5b/5c/5d quedan **especificados en §4 de este documento** y se pueden ejecutar tal cual. La planeación no se pierde. Pero no son la dirección prioritaria.

### 9.5 Pasos inmediatos

1. **Cerrar el v3 con este estado.** (← lo que estás leyendo ahora.)
2. **Diseñar el plan Railway** en [`plan_migracion_railway.md`](TABLAS%20BD%20OFICIAL/plan_migracion_railway.md): qué tablas adoptamos, qué tablas nuestras se mantienen, cómo se mapea el modelo actual al esquema oficial, cómo se gestiona créditos como snapshot + cómputo, etc.
3. **Ejecutar el experimento Railway** en rama o repo paralelo. Sin tiempos.

---

**Versión:** 3.1  
**Última actualización:** 2026-05-31 — añadidos Sprints A y B en §1.1 y §1.2; §2 actualizado (5a/5e en producción, resto diferido); §8 nueva con deuda de datos; §9 nueva con cierre y pivot a plan de migración Railway.  
**Revisión anterior:** 2026-05-31 v3.0 — versión inicial como plan vivo.  
**Estado:** plan cerrado a nivel de ejecución. Las decisiones documentadas siguen siendo referencia. La actividad de alineamiento académico continúa en [`TABLAS BD OFICIAL/plan_migracion_railway.md`](TABLAS%20BD%20OFICIAL/plan_migracion_railway.md).  
**Reemplaza como referencia operativa:** [`plan_roles_v2.md`](plan_roles_v2.md) (queda como detalle histórico de decisiones) y [`plan_roles.md`](plan_roles.md) v1 (queda como visión original).
