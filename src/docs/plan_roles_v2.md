# Plan de refactor — Modelo híbrido de identidad (v2)

> **Versión 2** del plan original [`plan_roles.md`](plan_roles.md). Se reescribe tras un inventario exhaustivo del código real que reveló que la estimación de la v1 (~19h, "Fases 2 y 3 cuestan ~5h juntas") subestimaba significativamente el costo. Esta versión separa el alcance en lo que **realmente se puede hacer en una sesión** vs lo que requiere sprints dedicados con QA real.

---

## 1. Por qué v2

La v1 asumió, en §3.3, que el refactor real estaba concentrado en `AuthController`, `JwtService`, `JwtAuthFilter` y "unas pocas consultas en `UsuarioService`". El inventario muestra otra cosa:

- **5 controllers** llaman a `resolverUsuario(auth)` y asumen que el resultado es siempre `Usuario` (33 sitios). Cuando el actor sea `Admin`, ninguno funciona.
- **4 tablas** persisten cédulas como FK lógica a `usuario.cedula`: `paz_y_salvo.cedula_responsable`, `tipo_certificado.dependencia_cedula`, `solicitud.cedula_director`, `solicitud.cedula_posgrados`. Los admins en la nueva tabla `admins` (§4.2 del plan v1) no tienen `cedula` — ese campo no está en la DDL.
- **`PazYSalvoService.iniciarProcesoPazYSalvo`** ([línea 52-53](../../../tramites-backend/src/main/java/com/ufps/tramites/service/PazYSalvoService.java#L52-L53)) materializa la lista de responsables a partir de `usuarioRepository.findByRol_Nombre("DEPENDENCIA"|"POSGRADOS")`. Si los admins migran a `admins`, esta función produce 0 paz y salvos.
- **Frontend** depende de `usuario.cedula` para llamar `/certificados/dependencia/{cedula}`, `/certificados/{id}/marcar-listo?cedulaDependencia=`, etc. Cambia el contrato de varios endpoints.

La v1 declaró "67 ocurrencias en 13 archivos, pero la mayoría son `@PreAuthorize` strings que NO cambian". Eso es cierto: las `@PreAuthorize` no cambian. Pero **los 33 `resolverUsuario(auth)` que sí cambian no estaban en la cuenta**.

**Estimación real:** entre 30 y 50 horas de trabajo bien hecho (con QA E2E entre fases). No 19 horas. La v1 es viable solo si Fase 1 se ejecuta estrictamente (tabla `admins` queda vacía y los admins reales siguen viviendo en `usuario`).

---

## 2. Hallazgos del inventario (vs v1)

### 2.1 Backend — referencias que asumen "actor = Usuario con cédula"

| Componente | Líneas | Asume | Rompe si admin viene de `admins` |
|---|---|---|---|
| [`CertificadoController.resolverUsuario`](../../../tramites-backend/src/main/java/com/ufps/tramites/controller/CertificadoController.java#L135) | 135-138 | `auth.getName()` = cédula en `usuario` | Sí — toda la bandeja de DEPENDENCIA |
| [`SolicitudController.resolverUsuario`](../../../tramites-backend/src/main/java/com/ufps/tramites/controller/SolicitudController.java#L329) | 329-332 | Idem | Sí — todos los endpoints POSGRADOS |
| [`PazYSalvoController.resolverUsuario`](../../../tramites-backend/src/main/java/com/ufps/tramites/controller/PazYSalvoController.java#L82) | 82-85 | Idem | Sí — paz y salvos de DEPENDENCIA |
| [`TramiteController.resolverUsuario`](../../../tramites-backend/src/main/java/com/ufps/tramites/controller/TramiteController.java#L37) | 37-40 | Idem | Bajo impacto (ESTUDIANTE) |
| [`UsuarioController`](../../../tramites-backend/src/main/java/com/ufps/tramites/controller/UsuarioController.java#L24) | 24-25 | Idem | Sí — `/api/usuarios/me` |

### 2.2 Backend — servicios que iteran admins por rol

| Componente | Línea | Comportamiento |
|---|---|---|
| [`PazYSalvoService.iniciarProcesoPazYSalvo`](../../../tramites-backend/src/main/java/com/ufps/tramites/service/PazYSalvoService.java#L52) | 52-53 | `usuarioRepository.findByRol_Nombre("DEPENDENCIA"\|"POSGRADOS")` — base del flujo de paz y salvo |
| [`DependenciaController.listar`](../../../tramites-backend/src/main/java/com/ufps/tramites/controller/DependenciaController.java#L39) | 39 | Idem para poblar dropdown de tipos de certificado |
| [`DependenciaController.listarUsuariosDependencia`](../../../tramites-backend/src/main/java/com/ufps/tramites/controller/DependenciaController.java#L93) | 93 | Idem para CRUD de responsables |

### 2.3 BD — campos que persisten cédulas de admin

| Tabla.Columna | Definición | Migración necesaria |
|---|---|---|
| `paz_y_salvo.cedula_responsable` | `String` — FK lógica a `usuario.cedula` | `→ responsable_admin_id BIGINT REFERENCES admins(id)` + UPDATE de datos existentes |
| `tipo_certificado.dependencia_cedula` | `String` — FK lógica a `usuario.cedula` (DEPENDENCIA) | Ya documentado en v1 como deuda: `→ dependencia_id BIGINT REFERENCES dependencias(id)` |
| `solicitud.cedula_director` | `String` | Queda igual — DIRECTOR es académico, sigue en `usuario` |
| `solicitud.cedula_posgrados` | `String` — FK lógica a `usuario.cedula` (POSGRADOS) | `→ posgrados_admin_id BIGINT REFERENCES admins(id)` |

### 2.4 Frontend — usos de `usuario.cedula` que esperan que el actor sea académico

| Archivo | Línea | Uso |
|---|---|---|
| [`AuthContext.js`](../../src/context/AuthContext.js#L22) | 22 | `cedula: claims.cedula` — payload del JWT, usado en todos los demás archivos |
| [`BandejaCertificadosDependencia.jsx`](../../src/pages/BandejaCertificadosDependencia.jsx#L45) | 45, 60, 74 | `/certificados/dependencia/${usuario.cedula}` y similares |
| [`SeccionTiposCertificado.jsx`](../../src/pages/posgrados/SeccionTiposCertificado.jsx#L210) | 210-218 | dropdown usa `d.cedula` como value, contrato espera `dependenciaCedula` (string) |
| [`menuConfig.js`](../../src/config/menuConfig.js#L49) | 49-61 | `DEMO_USERS` mapea claves a cédulas — incluye `POSGRADOS`, `ADMIN`, `DEPENDENCIA_*` |

---

## 3. Estrategia revisada — tres líneas posibles

Con el inventario en la mano, hay tres maneras de proceder. La v1 las mezclaba.

### Línea A — Solo arquitectura (Fase 1 estricta)

**Objetivo:** dejar la infraestructura lista pero no migrar nada todavía. Sirve para sprint review como demostración de viabilidad.

**Estado final:** tabla `admins` existe pero está vacía. Los admins siguen viviendo en `usuario`. El sistema funciona idéntico a hoy. La doble búsqueda del login está implementada pero no se ejerce porque `admins` no tiene filas.

**Costo:** 3–5 horas.

**Riesgo:** muy bajo. Compatible 100% con todo el código existente.

**Lo que demuestra al equipo oficial:** "tenemos JWT con `principalType`, entidad `Admin`, repositorio listo, y un endpoint `/login` que sabe distinguir. Migrar los datos es un INSERT más adelante."

### Línea B — Coexistencia parcial (admins reales solo para perfiles nuevos)

**Objetivo:** la tabla `admins` recibe **solo admins nuevos**, no los 5 actuales. Los 5 admins viejos siguen en `usuario` para no romper paz y salvo / certificados / solicitudes. El frontend muestra ambos tipos en el sidebar.

**Estado final:** doble fuente de verdad — útil solo para piloto.

**Costo:** ~10 horas (Línea A + endpoints CRUD de admins en `admins` + UI mínima para crear).

**Riesgo:** medio. Duplicación de concepto puede confundir al equipo.

**Cuándo conviene:** solo si el equipo oficial pide ver un admin "nuevo formato" funcional antes del refactor real.

### Línea C — Refactor completo (Fase 1 + 2 + 3 + 4 del plan v1)

**Objetivo:** lo que v1 prometía. Admins migran a `admins`, se borran de `usuario`, todo el código se refactoriza, la BD queda alineada con la oficial.

**Costo real:** 30–50 horas distribuidas en 4–5 sesiones, con QA entre fases.

**Riesgo:** alto si se hace en una sola sesión sin QA. Bajo si se distribuye.

**Bloques internos:** ver §4 abajo.

---

## 4. Si se elige Línea C — desglose por bloques

Cada bloque es **independientemente desplegable** y deja el sistema funcional. No se pasa al siguiente sin smoke test E2E.

### Bloque 0 — Arquitectura (Línea A) · 3–5h

Idéntico a "Línea A" arriba. Es prerrequisito de los siguientes bloques.

**Entregables:**
- DDL de `admins` en Supabase (vacía)
- `Admin.java`, `AdminRepository.java`
- `JwtService` con `CLAIM_PRINCIPAL_TYPE`, `generateToken(Admin)`
- `JwtAuthFilter` polimórfico (lee `principalType`, decide cómo poblar SecurityContext)
- `AuthController.login` con doble búsqueda (admins vacía → cae a usuario)
- `LoginResponseDTO` extendido con `principalType`, `dependenciaId`, `esSuperAdmin`
- Frontend `AuthContext` lee `principalType` (no afecta UI)

**Punto de control:** todos los logins actuales funcionan. JWT nuevo incluye `principalType='USUARIO'`. La tabla `admins` está vacía.

### Bloque 1 — Refactor `dependencia_cedula` → `dependencia_id` · 5–7h

Resuelve la deuda preexistente del sprint anterior (dropdown de tipos de certificado) y **deja `tipo_certificado` listo para apuntar a `admins` indirectamente** vía la entidad `Dependencia`. **No requiere Bloque 2 todavía.**

**Backend:**
- `ALTER TABLE tipo_certificado ADD COLUMN dependencia_id BIGINT REFERENCES dependencias(id)` en Supabase
- Backfill: `UPDATE tipo_certificado SET dependencia_id = (SELECT u.dependencia_id FROM usuario u WHERE u.cedula = tipo_certificado.dependencia_cedula)`
- `TipoCertificado.java`: añadir `@ManyToOne Dependencia dependencia` (mantener `dependenciaCedula` por ahora como `@Deprecated` con `@Column(insertable=false, updatable=false)`)
- `SolicitudCertificadoRepository.findByDependencia`: cambiar la query JPQL a comparar por `dependencia.id`
- `AdminTipoCertificadoController.toMap/aplicar`: usar `dependenciaId`/`dependenciaNombre` derivados de la entidad
- `CertificadoController.bandejaDependencia`: aceptar `dependenciaId` (Long) en el path, no cédula
- `CertificadoService.obtenerPorDependencia`: aceptar `dependenciaId`

**Frontend:**
- `SeccionTiposCertificado.jsx`: dropdown usa `d.id` como value, contrato `dependenciaId`
- `BandejaCertificadosDependencia.jsx`: usar `usuario.dependenciaId` en lugar de `usuario.cedula`
- `AuthContext` ya expone `dependenciaId` (lo añade Bloque 0)

**Punto de control:** dropdown de tipos de certificado muestra dependencias correctamente. Bandeja de DEPENDENCIA sigue funcionando con los usuarios actuales en `usuario`.

**Migración de datos al final:** `ALTER TABLE tipo_certificado DROP COLUMN dependencia_cedula` (opcional, cuando se confirme que el código nuevo no lo lee).

### Bloque 2 — Migración de POSGRADOS y ADMIN · 6–8h

Los admins POSGRADOS y ADMIN no participan en paz y salvo de dependencia (operativamente sí, pero como `tipoDependencia="POSGRADOS"`, no como FK fuerte). Migrarlos primero es más simple.

**Backend:**
- `solicitud.cedula_posgrados → posgrados_admin_id BIGINT REFERENCES admins(id)`
- `Solicitud.java`: añadir `@ManyToOne Admin posgradosAdmin`
- `SolicitudService.aprobarPosgrados`, `rechazarPosgrados`: setear `posgradosAdmin` en lugar de `cedulaPosgrados`
- `SolicitudController`: `resolverUsuario` y `resolverPrincipal` polimórfico — devuelve `Object` que puede ser `Usuario` o `Admin`. Refactor de los 13 sitios donde se llama
- INSERT en `admins` de POS001 y ADMIN1
- DELETE de POS001 y ADMIN1 en `usuario`
- Actualizar `data.sql`

**Frontend:**
- `menuConfig.js` `DEMO_USERS`: `POSGRADOS` y `ADMIN` cambian a usar `codigo` para login (ya lo hacían, solo cambia el endpoint demo)
- `AuthContext.cambiarRol`: para admins demo, llamar `/auth/admin-login-demo` (nuevo endpoint)

**Punto de control:** logins POSGRADOS y ADMIN funcionan, sus operaciones (validar grado, bandeja posgrados) funcionan, sus tokens tienen `principalType='ADMIN'`.

### Bloque 3 — Migración de DEPENDENCIAs · 8–10h

Las dependencias son el caso más entrelazado por `paz_y_salvo` y `tipo_certificado`.

**Backend:**
- `paz_y_salvo.cedula_responsable → responsable_admin_id BIGINT REFERENCES admins(id)` + `responsable_usuario_id BIGINT REFERENCES usuario(id)` (uno de los dos no nulo, según el tipo de responsable: DIRECTOR es Usuario, DEPENDENCIA es Admin)
- `PazYSalvo.java`: refactor de `cedulaResponsable` a dos campos opcionales
- `PazYSalvoRepository`: nuevas queries `findByResponsableAdmin_Id`, `findByResponsableUsuario_Id`
- `PazYSalvoService.iniciarProcesoPazYSalvo`: iterar sobre `AdminRepository.findByTipo("DEPENDENCIA")` + `findByTipo("POSGRADOS")` en vez de `usuarioRepository.findByRol_Nombre`
- `PazYSalvoController`: `resolverPrincipal` polimórfico, usa la rama correcta del repo según `principalType`
- INSERT en `admins` de DEP001, DEP002, DEP003
- DELETE de los mismos en `usuario`

**Frontend:**
- `BandejaCertificadosDependencia.jsx`: ya migrado en Bloque 1
- `BandejaDependencia.jsx` (paz y salvos): usar `usuario.id` con el endpoint nuevo
- `menuConfig.js` `DEMO_USERS`: claves `DEPENDENCIA_*` cambian su forma de demo

**Punto de control:** las 5 credenciales de prueba del checklist v1 §8 funcionan al 100%.

### Bloque 4 — Limpieza, cleanup roles, validación E2E · 3–4h

- Eliminar `cedulaResponsable`, `cedulaPosgrados`, `dependenciaCedula` de los entities y migrar `DROP COLUMN` en BD
- (Opcional) eliminar filas POSGRADOS/DEPENDENCIA/ADMIN del catálogo `roles` (v1 §3.5 punto 5)
- Documentar el patrón implementado en `plan_integracion_bd_oficial.md` revisión 3
- Smoke test full del checklist v1 §8
- Deploy a Render

---

## 5. Estrategia de coexistencia

Mientras se ejecutan los bloques, el sistema debe seguir funcional. Reglas:

- **Cualquier columna que se "renombre" (ej. `dependencia_cedula` → `dependencia_id`) se agrega como columna NUEVA y se borra solo después de que todo el código nuevo la lee.** Nunca se elimina antes.
- **Cualquier entity con campo "viejo" mantiene los getters/setters viejos hasta el bloque 4.** Permite que código aún no migrado siga compilando.
- **Doble lectura en repositorios:** `PazYSalvoRepository.findByCedulaResponsable` y `findByResponsableAdmin_Id` coexisten durante bloques 1–3. El primero se elimina en bloque 4.
- **El método `resolverPrincipal` nuevo coexiste con `resolverUsuario` viejo.** Cada controller refactorizado pasa al nuevo de a uno; el viejo se borra en bloque 4.

---

## 6. Recomendación

> Hacer **Bloque 0 ahora** (3–5h) en una sesión enfocada. Termina con commit en `main`, sprint review puede mostrarlo. Los bloques 1–4 se programan según prioridad real del proyecto (¿es la integración con BD oficial inminente? entonces se aceleran; si no, se distribuyen en sprints).

**Bloque 0 deja al equipo en posición de:**
- Demostrar la arquitectura al equipo oficial.
- Saber que el costo real de los bloques 1–4 está dimensionado (no es una incógnita).
- Empezar a crear admins nuevos en la tabla nueva si surge la necesidad (CRUD simple).
- No romper ninguna funcionalidad existente.

---

## 7. Inventario de archivos a tocar — vista rápida

### Backend, Bloque 0

**Crear:**
- `tramites-backend/src/main/java/com/ufps/tramites/model/Admin.java`
- `tramites-backend/src/main/java/com/ufps/tramites/repository/AdminRepository.java`
- `tramites-backend/.docs/sql/migracion_admins_bloque0.sql` (DDL `admins` vacía)

**Modificar:**
- `tramites-backend/src/main/java/com/ufps/tramites/security/JwtService.java` — añadir `CLAIM_PRINCIPAL_TYPE` y `generateToken(Admin)`
- `tramites-backend/src/main/java/com/ufps/tramites/security/JwtAuthFilter.java` — leer `principalType`, poblar SecurityContext con `auth.getName()` = `cedula` (Usuario) o `codigo` (Admin)
- `tramites-backend/src/main/java/com/ufps/tramites/controller/AuthController.java` — `login` busca primero en `admins.codigo`, luego en `usuario.codigo`
- `tramites-backend/src/main/java/com/ufps/tramites/dto/LoginResponseDTO.java` — añadir `principalType`, `dependenciaId`, `esSuperAdmin`

### Frontend, Bloque 0

**Modificar:**
- `tramites-frontend/src/context/AuthContext.js` — `payloadToUsuario` añade `principalType`, `dependenciaId`, `esSuperAdmin`. No cambia el resto.

### Backend, Bloques 1–4

Detallado en §4 arriba. Total: ~12 archivos modificados, 1 nuevo (`AdminService`), 4 migraciones SQL.

### Frontend, Bloques 1–4

- `tramites-frontend/src/pages/posgrados/SeccionTiposCertificado.jsx` (Bloque 1)
- `tramites-frontend/src/pages/BandejaCertificadosDependencia.jsx` (Bloque 1)
- `tramites-frontend/src/pages/BandejaDependencia.jsx` (Bloque 3)
- `tramites-frontend/src/config/menuConfig.js` (Bloque 2 + 3)

---

## 8. Mapeo a la integración futura

Sin cambios respecto a v1 §9. Una vez completados los bloques 0–4, el costo de la integración con la BD oficial es renombrar tablas y mapear FKs — 3–5 días.

---

## 9. Decisiones tomadas (actualizadas)

- ✅ **v1 quedó como referencia conceptual** — su arquitectura objetivo es correcta. Lo único que cambia es el cronograma.
- ✅ **Bloque 0 es la unidad mínima ejecutable** en una sola sesión.
- ⏸️ **Bloques 1–4 se planean en backlog** y se priorizan según necesidad real.
- ✅ **El refactor de `dependencia_cedula → dependencia_id` (Bloque 1) tiene valor independiente** — cierra deuda del sprint anterior y desbloquea el dropdown buggy. Se puede ejecutar incluso sin los bloques 2 y 3.

---

---

## 10. Bloque 5 — Alineamiento académico con BD oficial (sprint futuro)

> Agregado después de revisar `Roles_bd_oficial.docx` (compartido por el equipo oficial el 2026-05-30) y confirmar que el `.md` previo (`base_de_datos_oficial_posgrados.md`) omitió campos críticos de la tabla `estudiantes`, en particular `usuario_id` (FK a `usuarios.id`) y `esPosgrado`.
>
> Esta deuda **no afecta el MVP que entregamos en Bloques 0–4** pero debe planificarse para la integración real con la BD oficial.

### 10.1 Lo que el docx confirma (y el `.md` previo no capturó)

- `estudiantes.usuario_id` es **FK formal a `usuarios.id`** — los estudiantes están relacionados con usuarios por id Long, no por cédula.
- `estudiantes.esPosgrado` es la bandera oficial para distinguir nivel de estudio. No se necesita un rol global "ESTUDIANTE_POSGRADO".
- `sustentacion_evaluador(idSustentacion, idUsuario, juradoExterno)` y `usuario_proyecto(idUsuario, idProyecto)` son ejemplos del patrón de **asignación contextual**: un docente puede ser jurado de un proyecto sin que su rol global cambie.
- `roles` es un catálogo **estrictamente global** (ejemplo: `ESTUDIANTE`, `DOCENTE`). No incluye conceptos como "DIRECTOR_PROGRAMA" — eso es una asignación contextual a un programa, no un rol.

### 10.2 Implicaciones para nuestro modelo

| Componente nuestro | Patrón oficial equivalente | Deuda |
|---|---|---|
| `Usuario.rol = 'DIRECTOR'` | `usuarios.rol_id = 'DOCENTE'` + tabla `programa_director(programa_id, docente_id, vigente_desde)` | DIRECTOR no es rol global. Hay que mapear a asignación contextual al integrar. |
| `Solicitud.cedula` (String) | `solicitudes.estudiante_id` (Long FK) | Cambiar a FK formal a `estudiantes.id`. |
| `Solicitud.cedulaDirector` (String) | Resolver el director vía `programa_director` del estudiante en el momento de la consulta | Eliminar el campo o convertirlo en FK a `usuarios.id`. |
| `Usuario.programa_id`, `Usuario.creditos_aprobados` (denormalizado en `usuario`) | Derivar de `estudiantes.programa_id` y agregar `notas_pregrado` / DIVISIT en tiempo real | Quitar columnas redundantes; usar JOIN. |
| Rol `DIRECTOR` en el catálogo `roles` | No existe como rol global en la oficial | Eliminar de `roles` cuando se integre. |

### 10.3 Por qué no se abordó en Bloques 0–4

- **Bloques 0–3 atacaron la deuda crítica**: separar admins de académicos (alineado con el patrón `admins ≠ usuarios` del docx). Esa era la deuda bloqueante para la demostración del sprint review.
- **Esta deuda académica requiere acuerdo con el equipo oficial**: si vamos a usar `estudiantes.id` como FK, primero hay que confirmar que su tabla esté disponible para nosotros (Opción 3 del plan de integración, §6.3). Refactorizar a ciegas ahora sería gastar trabajo en un esquema que puede cambiar.
- **El refactor de Bloque 0–4 no obstruye el Bloque 5**. Las migraciones futuras (`estudiante_id` FK, eliminar `cedulaDirector`) son aditivas; no rompen el modelo actual.

### 10.4 Sub-bloques propuestos (priorizar después de la integración real)

**Bloque 5a — Mapear ESTUDIANTE a `usuarios + estudiantes` oficial (3–4h por entidad migrada)**
- `Solicitud.cedula` → `Solicitud.estudiante_id` (FK Long a `estudiantes.id`).
- `SolicitudCertificado.cedula` → `SolicitudCertificado.estudiante_id`.
- `PazYSalvo.cedulaEstudiante` → `PazYSalvo.estudiante_id`.
- Actualizar repos, services y controllers para usar `estudiante_id`.
- `Usuario.creditos_aprobados` se elimina; se calcula vía `notas_pregrado` (o DIVISIT cuando esté disponible, Fase 3 del plan de integración).

**Bloque 5b — Modelar director como asignación contextual (4–6h)**
- Crear tabla `programa_director(programa_id, docente_usuario_id, vigente_desde, vigente_hasta)`.
- Eliminar `Usuario.rol = 'DIRECTOR'` del catálogo de roles.
- `SolicitudService.aprobarSolicitudConDirector` resuelve el director vía `programa_director` del estudiante en lugar de leerlo del JWT.
- `Solicitud.cedulaDirector` se reemplaza por `Solicitud.director_usuario_id` (Long FK) o se elimina si el director siempre es derivable.

**Bloque 5c — Adoptar `tipos_solicitudes` oficial (2h)**
- Migrar `Solicitud.tipo` (String enum) → FK a `tipos_solicitudes.id`.
- Coordinar con equipo oficial para añadir nuestros tipos (`TERMINACION_MATERIAS`, `GRADO`) si no existen.

**Bloque 5d — Cleanup de denormalización (1–2h)**
- Eliminar `Usuario.programa_id` (deriva de `Estudiante.programa_id`).
- Eliminar `Usuario.codigo` y otros campos académicos duplicados en `usuario` que ya vienen de `estudiantes`.

**Total estimado del Bloque 5 completo:** 10–14h, distribuibles en 2 sprints. **No es prerrequisito de nada del MVP actual.**

### 10.5 Lo que la IA externa señaló y validamos

La conclusión que el equipo externo compartió contiene 3 observaciones correctas que esta sección incorpora explícitamente:

1. ✅ **`esPosgrado` como filtro de nivel** en lugar de un rol global "ESTUDIANTE_POSGRADO" — coincide con el patrón oficial y con nuestro Bloque 5a.
2. ✅ **`tramite_id → estudiante_id`** en lugar de string-cédula — Bloque 5a.
3. ✅ **Asignación contextual de roles administrativos** (Director, Comité) en lugar de rol global — Bloque 5b.

Y una observación que en nuestro contexto **no aplica todavía**:
- ⚠️ **`tramite_revisor` para Comité de Evaluación** — el módulo actual solo modela Director + Posgrados (workflow de dos pasos). No hay comité hasta que se extienda a sustentaciones de tesis (que vive en la oficial como `sustentacion_evaluador`). Si se incorpora ese dominio, ahí sí aplica el patrón.

---

**Versión:** 2.1  
**Reemplaza:** `plan_roles.md` v1 (queda como referencia conceptual).  
**Última revisión:** 2026-05-30 — agregada §10 (Bloque 5 — deuda académica) tras revisar `Roles_bd_oficial.docx`.  
**Documentos relacionados:**
- [`plan_roles.md`](plan_roles.md) — visión original (cronograma optimista, alcance conceptual válido).
- [`plan_integracion_bd_oficial.md`](plan_integracion_bd_oficial.md) — estrategia general de integración.
- [`Roles_bd_oficial.docx`](Roles_bd_oficial.docx) — documento oficial del esquema de identidad y roles (recibido del equipo oficial).
