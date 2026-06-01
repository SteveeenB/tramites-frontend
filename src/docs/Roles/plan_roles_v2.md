# Plan de refactor — Modelo híbrido de identidad (v2)

> ⚠️ **SUPERADO COMO PLAN OPERATIVO POR [`plan_roles_v3.md`](plan_roles_v3.md) (2026-05-31).**
>
> Este v2 se mantiene como **referencia detallada del análisis y las decisiones** que se tomaron durante el sprint de implementación de Bloques 0-4. Lee este archivo cuando quieras saber **por qué** se tomó una decisión específica, **qué alternativas se consideraron** o **qué inventario de código sirvió de base** para los bloques.
>
> Para saber **qué está hecho hoy y qué falta**, ir a [`plan_roles_v3.md`](plan_roles_v3.md).

---

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

---

## 11. Auditoría 2026-05-31 — refinamiento contra `clientes_finales_sistema.md`

> Esta sección se añade tras revisar el documento [`clientes_finales_sistema.md`](clientes_finales_sistema.md) compartido por el equipo oficial. Confirma alineamientos del refactor ya implementado (Bloques 0-3, ya en producción) y **corrige dos sub-bloques** del plan §10 que estaban desalineados con el patrón oficial real. También cierra decisiones que en §10 quedaron abiertas.

### 11.1 Lo que confirma alineamiento con el refactor implementado

| Concepto oficial | Estado en nuestro modelo (post-refactor Bloques 0-3) |
|---|---|
| `usuarios.rol_id` → catálogo `roles` global | ✅ `Usuario.rol_id` con FK a entidad `Rol` |
| `estudiantes.usuario_id` FK a `usuarios.id` | ✅ `Estudiante.usuario_id` con `referencedColumnName="id"` (fix del Bug C del refactor) |
| `estudiantes.esPosgrado` como bandera | ✅ `Estudiante.esPosgrado` |
| `admins` tabla separada con email/password | ✅ Implementado en Bloque 0 |
| `admins.es_super_admin` para SUPER | ✅ `Admin.esSuperAdmin` |
| `roles` y `estados_estudiantes` como catálogos | ⚠️ `roles` ya es catálogo. `estados_estudiantes` no existe en nuestro modelo (es string libre `Estudiante.estadoGrado`) |
| `estudiantes_divisit` como fuente externa | ✅ Fuera de alcance (responsabilidad del equipo oficial) |

### 11.2 Divergencias detectadas — qué ajustar en el plan §10

#### Divergencia A — Director NO se modela como `programa_director`

**§10.4 Bloque 5b decía:** crear tabla `programa_director(programa_id, docente_usuario_id, vigente_desde)`.

**El doc oficial §11 muestra:** no existe `programas.director_id` ni tabla `programa_director`. El director se infiere por **`cohorte_grupos.usuario_id`** — un usuario está vinculado a un grupo-cohorte específico de un programa. Director **cambia por cohorte**, no por programa entero.

**Implicación:** adoptar el patrón oficial es **caro**: requiere importar el dominio cohortes completo (`cohortes`, `cohorte_grupos`, `grupos_cohortes`, `grupos`), que `plan_integracion_bd_oficial.md` §2.1 marca como **propiedad del equipo oficial** y §4.2 confirma "hoy no manejamos cohortes". No es decisión de Bloque 5 aislado — es decisión de adopción de un dominio externo (Fase 4 del plan_integracion).

**Decisión adoptada (2026-05-31, revisada):** **no inventar tabla `programa_director`** (sería forzar un concepto que la oficial no tiene). Mantener el patrón actual: directores viven en `usuario` con rol `DIRECTOR` y `programa_id` (asignación implícita 1:1, suficiente para MVP con directores inventados). El único cambio formal es convertir `Solicitud.cedulaDirector` (string) en FK Long de auditoría a `usuario`. Ver §11.3 abajo. Cuando se ejecute Fase 4 del `plan_integracion`, la resolución "quién es director del programa X" pasa de leer `usuario.rol+programa_id` a leer `cohorte_grupos.usuario_id` — sin migrar tabla intermedia porque no la creamos.

#### Divergencia B — `usuarios` oficial NO tiene password; usa SSO + `sesiones_activas`

**El doc oficial §2 y §7 muestran:** `usuarios` sin campo `password`. Login real implícito vía SSO (`google_id`, `moodleId`). Existe tabla `sesiones_activas(correoUsuario PK, token, fecha_expiracion, ultima_actividad)` para sesiones server-side.

**Lo nuestro:** `Usuario.contrasena` BCrypt + JWT stateless (sin tabla de sesiones).

**Decisión adoptada (2026-05-31):** mantener JWT stateless + password para el MVP. Adoptar `sesiones_activas` ahora sin SSO sería lo peor de ambos mundos (password + sesiones server-side). Cuando SSO Moodle/Google esté disponible (Fase 4 del `plan_integracion`), entonces se migra todo el bloque de auth de una vez. Ver §11.5.

### 11.3 Bloque 5b corregido — director sin tabla nueva, solo FK de auditoría

**Reemplaza la versión documentada en §10.4 Bloque 5b.**

**Decisión:** **no crear tabla `programa_director`** (sería inventar un concepto que la oficial no tiene). En su lugar, **mantener el patrón actual** y solo formalizar la integridad referencial del campo de auditoría.

**Modelo actual (que ya tenemos, no requiere cambio):**
- "Director del programa X" = `Usuario` con `rol='DIRECTOR'` y `programa_id=X`. Asignación implícita 1:1 (suficiente para MVP, simula el flujo con directores inventados).
- Los directores viven en `usuario` con su rol, exactamente como Maria DIRECTOR (`20261002`) y Carlos DIRECTOR (`DIR001`) hoy.

**Único cambio necesario — campo de auditoría:**
- `Solicitud.cedulaDirector` (string, FK lógica frágil) → `Solicitud.directorUsuario` (`@ManyToOne` a Usuario, FK Long formal).
- Es el campo que registra **quién aprobó esta solicitud** (auditoría histórica), no "quién es el director del programa". Esa pregunta se resuelve consultando `usuario WHERE rol='DIRECTOR' AND programa_id=X` — lógica simple, sin tabla extra.

**Lo que NO se hace:**
- ❌ Tabla `programa_director` — no existe en la oficial, no hace falta inventarla.
- ❌ Modelar histórico de directores por programa — innecesario para MVP, lo aporta `cohorte_grupos` oficial cuando se integre.

**Migración cuando se haga Fase 4 del `plan_integracion`:**
- "Director del programa" pasa de ser `usuario.rol='DIRECTOR' + programa_id` a ser `usuario` referenciado por `cohorte_grupos.usuario_id` del cohorte vigente.
- El campo `Solicitud.directorUsuario` **no cambia** — sigue siendo FK a `usuario` (que en la oficial sería `usuarios.id`). Solo el query "quién es el director del programa X" cambia de fuente.

**Tiempo:** 2-3h (mucho menos que las 4-6h originales — solo es renombrar columna + setear FK en `aprobarSolicitudConDirector`).

### 11.4 Bloque 5e — Catálogo `estados_estudiantes` (NUEVO)

> Esto reemplaza el campo `Estudiante.estadoGrado` (string libre) por una FK a catálogo, alineado con el patrón oficial.

**Análisis de uso actual** (grep en código 2026-05-31):
- **2 valores literales** en código: `'PAGO_GRADO_PENDIENTE'` y `'GRADUADO'`.
- **3 sitios de escritura** en `SolicitudService`:
  - Línea 343: setea `'PAGO_GRADO_PENDIENTE'` al aprobar director.
  - Línea 602: setea `'GRADUADO'` al generar acta.
- **2 sitios de lectura**:
  - `PazYSalvoService.calcularEstadoEstudiante` línea 235: compara con `'GRADUADO'`.
  - `SolicitudService.generarActa` línea 601: lee para evitar doble set.
- **Frontend:** `EstadoEstudiantes.jsx` línea 13 solo muestra el label `'Graduado'`.

**Migración propuesta:**
```sql
-- Catálogo (3 estados iniciales — espacio para crecer al adoptar el oficial)
CREATE TABLE estados_estudiantes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE NOT NULL
);
INSERT INTO estados_estudiantes (nombre) VALUES
  ('ACTIVO'),
  ('PAGO_GRADO_PENDIENTE'),
  ('GRADUADO');

-- Estudiante: nueva FK, mantener columna vieja como zombie temporal
ALTER TABLE estudiante ADD COLUMN estado_estudiante_id BIGINT REFERENCES estados_estudiantes(id);

-- Backfill: mapear estado_grado existente al nuevo id
UPDATE estudiante SET estado_estudiante_id = (SELECT id FROM estados_estudiantes WHERE nombre = 'GRADUADO')
WHERE estado_grado = 'GRADUADO';
UPDATE estudiante SET estado_estudiante_id = (SELECT id FROM estados_estudiantes WHERE nombre = 'PAGO_GRADO_PENDIENTE')
WHERE estado_grado = 'PAGO_GRADO_PENDIENTE';
UPDATE estudiante SET estado_estudiante_id = (SELECT id FROM estados_estudiantes WHERE nombre = 'ACTIVO')
WHERE estado_grado IS NULL;
```

**Cambios en código:**
- `Estudiante.java`: añadir `@ManyToOne EstadoEstudiante estadoEstudiante`. Mantener `estadoGrado` String zombie (`insertable=false, updatable=false`) hasta Bloque 4 cleanup.
- `SolicitudService.aprobarSolicitudConDirector` y `.generarActa`: en vez de `setEstadoGrado("PAGO_GRADO_PENDIENTE")`, hacer `setEstadoEstudiante(estadosRepo.findByNombre("PAGO_GRADO_PENDIENTE").orElseThrow())`. Idem para GRADUADO.
- `PazYSalvoService.calcularEstadoEstudiante` línea 235: comparar `est.getEstadoEstudiante().getNombre().equals("GRADUADO")`.
- Crear entidad `EstadoEstudiante` y repo `EstadoEstudianteRepository`.

**Verificación de no-regresión:** los flujos críticos a probar después de migración son:
1. Maria aprueba solicitud de grado → estudiante debe quedar en `'PAGO_GRADO_PENDIENTE'`.
2. POSGRADOS genera acta → estudiante debe pasar a `'GRADUADO'`.
3. Maria ve "Estado estudiantes" → `EstadoEstudiantes.jsx` debe mostrar `'Graduado'` correctamente.

**Tiempo:** 3-4h (entidad + repo + SQL + 3 servicios + smoke test).

### 11.5 Bloque 5f — Estrategia de auth (NUEVO, sin acción inmediata)

**Decisión adoptada:** mantener JWT stateless con password BCrypt para el MVP.

**Deuda explícita para Fase 4 del `plan_integracion`:**
- Cuando SSO Moodle/Google esté disponible:
  - Eliminar `Usuario.contrasena` (queda solo BCrypt en `Admin.password`).
  - Reemplazar `AuthController.login` (codigo+contraseña) por flujo OAuth/SSO.
  - Decidir entre dos opciones de gestión de sesiones:
    - (a) Mantener JWT stateless solo (más simple, sin revocación inmediata).
    - (b) Adoptar `sesiones_activas` oficial (revocación inmediata, server-side state).
  - Recomendación tentativa: (b) si la oficial lo requiere para integración; (a) si nuestro módulo sigue siendo independiente.

**Tiempo estimado:** 6-10h, condicionado a disponibilidad del SSO.

### 11.6 Bloque 5d explicitado — qué se elimina y qué se mantiene en `usuario`

> En §10.4 el sub-bloque 5d quedó vago ("cleanup denormalización"). Esta sección lo concreta a la luz del doc oficial.

**Principio guía:** ser **lo más fiel posible al esquema oficial**. No inventar campos. Solo eliminamos lo que la oficial NO tiene (deuda preexistente del repo, documentada en `plan_integracion §3.1`).

**Importante:** la oficial **duplica deliberadamente** algunos campos entre `usuarios` y `estudiantes` para trazabilidad (lo dice `clientes_finales_sistema.md §3`: cedula, codigo, email, moodleId y telefono están en ambas tablas). **Esos NO se tocan** — los mantenemos igual que la oficial.

| Campo en nuestro `usuario` | ¿Está en `usuarios` oficial? | Acción en Bloque 5d |
|---|---|---|
| `id`, `cedula`, `codigo`, `email`, `foto_url`, `google_id`, `moodle_id`, `nombre_completo`, `primer_nombre`, `primer_apellido`, `segundo_nombre`, `segundo_apellido`, `telefono`, `rol_id` | ✅ Sí (en oficial) | **Mantener** — alineado con oficial |
| `programa_id` | ❌ No (la oficial lo tiene solo en `estudiantes`) | **Drop** — derivar de `Estudiante.programa_id` |
| `creditos_aprobados` | ❌ No (oficial lo calcula desde DIVISIT) | **Drop de `usuario`** — el valor canónico vive en `Estudiante.creditos_aprobados` (ver §11.7) |
| `estado_grado` | ❌ No (oficial usa `estudiantes.estado_estudiante_id` FK a catálogo) | **Drop de `usuario`** — migra a `Estudiante.estado_estudiante_id` (Bloque 5e) |
| `correo` | ❌ Duplicado interno de `email` | **Drop** — usar `email` (alineado con oficial) |
| `nombre` | ❌ Duplicado interno de `nombre_completo` | **Drop** — usar `nombre_completo` (alineado con oficial) |
| `rol` (string) | ❌ Duplicado interno de `rol_id` | **Drop** — usar `rol_id` con FK a entidad `Rol` (alineado con oficial) |
| `dependencia_id` | ❌ No (oficial lo tiene en `admins.dependencia_id`) | **Drop** — los DEPENDENCIA ya fueron migrados a `admins` en Bloque 2+3, la columna queda huérfana. Se drop en Bloque 4 (ver §11.8). |
| `contrasena` | ❌ No (oficial usa SSO Moodle/Google) | **Mantener hasta SSO disponible** (Bloque 5f) — sin esto se rompe el login propio del módulo. |

**SQL del Bloque 5d:**
```sql
-- Refactor previo de servicios (Java) que aún leen estas columnas:
--   UsuarioService, SolicitudService, controllers que consultan
--   creditos_aprobados o programa_id desde Usuario.
-- Una vez todo el código lee desde Estudiante, ejecutar:
ALTER TABLE usuario
  DROP COLUMN IF EXISTS programa_id,
  DROP COLUMN IF EXISTS creditos_aprobados,
  DROP COLUMN IF EXISTS estado_grado,
  DROP COLUMN IF EXISTS correo,
  DROP COLUMN IF EXISTS nombre,
  DROP COLUMN IF EXISTS rol;
-- dependencia_id se drop en Bloque 4 §11.8.
```

**Tiempo estimado Bloque 5d:** 3-4h (refactor de servicios + SQL + smoke test). Requiere Bloque 5a ya hecho (para que `Solicitud` y `PazYSalvo` usen `estudiante_id` y no necesiten `Usuario.programa_id`).

### 11.7 Créditos académicos — estrategia snapshot/sync (NUEVO)

> Dilema real: en el MVP necesitamos `creditos_aprobados` para validar prerrequisitos de Terminación de Materias. En la oficial este dato NO se persiste — se calcula sumando `materias.creditos` desde `notas_divisit` donde estado='APROBADA'. Sin acceso a DIVISIT no podemos replicar el cálculo.

**Decisión adoptada (2026-05-31):** mantener `Estudiante.creditos_aprobados` como **snapshot/caché documentado**.

**Significado de la decisión:**
- El campo permanece en `estudiante` exactamente como hoy. MVP funciona idéntico.
- Es un **snapshot del cálculo oficial**, no la fuente de verdad. La fuente de verdad vive en `notas_divisit` (DIVISIT, propiedad del equipo oficial).
- En MVP: se llena manualmente desde `data.sql` (valores hardcoded de prueba).
- Al integrar con DIVISIT (Fase 3 del `plan_integracion`): un job de sincronización (nocturno o on-demand) recalcula `creditos_aprobados` desde `notas_divisit` y actualiza el snapshot. Nuestro código sigue leyendo del snapshot — la única diferencia es quién escribe.

**Por qué esta opción es la correcta:**
1. **No rompe el MVP.** El código actual sigue funcionando tal cual.
2. **No rompe la oficial.** Solo leemos de `notas_divisit`, no escribimos.
3. **Patrón estándar.** Snapshots/cachés son comunes en sistemas integrados con fuentes lentas o no críticas para escritura inmediata.
4. **No inventa campos.** El campo ya existe en nuestra `estudiante` (es deuda preexistente del repo, no nueva).

**Código a documentar (sin cambios funcionales):**
- `Estudiante.creditos_aprobados`: añadir comentario en el campo explicando que es snapshot del cálculo oficial DIVISIT.
- `SolicitudService.crearSolicitudTerminacion` (líneas 81-89): el `perfilEstudiante.getCreditosAprobados()` sigue igual. Documentar en comentario que la validación se hace contra el snapshot.

**Cuando se ejecute Fase 3 del `plan_integracion`:**
- Crear `DivisitSyncService` que recalcula y actualiza el snapshot. Sin cambios en `SolicitudService` ni `Estudiante.java`.

**Tiempo:** 0h hoy (solo documentación en comentarios del código). El job de sync es Fase 3 del `plan_integracion`, condicionado a acceso a DIVISIT.

### 11.8 Bloque 4 — Cleanup específico (DETALLE COMPLETO)

> Bloque seguro, sin riesgo si Bloques 0-3 están en producción estables (✅ lo están desde 2026-05-31).

#### 11.8.1 Zombie columns en BD

```sql
-- Estas columnas viven en BD pero no se leen ni escriben desde el código actual.
-- En las entities están como @Column(insertable=false, updatable=false) o
-- ya fueron eliminadas. Drop seguro.
ALTER TABLE paz_y_salvo      DROP COLUMN IF EXISTS cedula_responsable;
ALTER TABLE solicitud        DROP COLUMN IF EXISTS cedula_posgrados;
ALTER TABLE tipo_certificado DROP COLUMN IF EXISTS dependencia_cedula;

-- Columna huérfana post-Bloque 2+3 (los DEPENDENCIA fueron movidos a
-- `admins`, donde la columna `dependencia_id` ya está). En `usuario` queda
-- sin uso y NO está en `usuarios` oficial.
ALTER TABLE usuario DROP COLUMN IF EXISTS dependencia_id;

-- Y la FK formal que dropeamos en bloque 2_3 (verificación de que no existe):
-- ALTER TABLE tipo_certificado DROP CONSTRAINT IF EXISTS fk_tc_dependencia;
```

**Verificación previa al drop de `usuario.dependencia_id`:**
```sql
SELECT cedula, codigo, dependencia_id FROM usuario WHERE dependencia_id IS NOT NULL;
-- Esperado: 0 filas. Si hay alguna, NO ejecutar el drop y revisar caso por caso.
```

#### 11.8.2 Eliminar getters @Deprecated y campos zombie en entities

- `PazYSalvo.java`: eliminar campo `cedulaResponsable` y `getCedulaResponsable()`.
- `Solicitud.java`: eliminar campo `cedulaPosgrados` y `getCedulaPosgrados()`.
- `TipoCertificado.java`: eliminar campo `dependenciaCedula` y `getDependenciaCedula()`.
- `Usuario.java`: eliminar campo `dependencia` (`@ManyToOne` a `Dependencia`) y sus getters/setters — ya no aplica.

#### 11.8.3 Eliminar código muerto

- `UsuarioService.crearUsuarioDependencia()` y `UsuarioService.eliminarUsuarioDependencia()` — ya no se llaman (reemplazadas por `AdminService.crearAdminDependencia/eliminarPorCodigo`).

#### 11.8.4 Limpieza catálogo `roles` (opcional)

```sql
-- Las filas POSGRADOS, DEPENDENCIA, ADMIN ya no son rol de ningún Usuario.
-- Verificar antes:
SELECT u.codigo, r.nombre
FROM usuario u JOIN roles r ON u.rol_id = r.id
WHERE r.nombre IN ('POSGRADOS','DEPENDENCIA','ADMIN');
-- Esperado: 0 filas (todos los admins se migraron a la tabla `admins` en Bloque 2+3).
-- Si hay alguna fila, NO ejecutar el DELETE y revisar caso por caso.

DELETE FROM roles WHERE nombre IN ('POSGRADOS','DEPENDENCIA','ADMIN');
-- Quedan solo: ESTUDIANTE, DIRECTOR.
```

#### 11.8.5 Tiempo estimado Bloque 4

3-4h total: 30min SQL + 1h refactor entities/services + 1h smoke test E2E + 30min commit/push.

### 11.9 Cronograma actualizado del Bloque 5

> Solo se ejecuta tras tener acuerdo con el equipo oficial sobre acceso a sus tablas (Opción 3 del `plan_integracion`). Antes de eso, todo Bloque 5 es planificación, no ejecución.

| Sub-bloque | Alcance | Tiempo | Prerequisito |
|---|---|---|---|
| 5a | `cedula` → `estudiante_id` FK en `solicitud`, `solicitud_certificado`, `paz_y_salvo` | 4-5h | Ninguno (podemos hacerlo solos) |
| 5b | `Solicitud.cedulaDirector` → FK `directorUsuario` (sin tabla nueva) | 2-3h | Ninguno |
| 5c | Adoptar `tipos_solicitudes` oficial | 2-3h | Acceso a tabla oficial |
| 5d | Cleanup denormalización (`Usuario.programa_id`, `creditos_aprobados`) | 2-3h | Bloque 5a hecho |
| 5e | Catálogo `estados_estudiantes` | 3-4h | Ninguno |
| 5f | Auth con SSO + `sesiones_activas` (opcional) | 6-10h | SSO Moodle/Google disponible |

**Total Bloque 5 sin dependencias externas (5a + 5b + 5d + 5e):** 11-15h.

**Bloques 5c y 5f quedan condicionados** a coordinación con el equipo oficial.

---

**Versión:** 2.3  
**Reemplaza:** `plan_roles.md` v1 (queda como referencia conceptual).  
**Última revisión:** 2026-05-31 — refinada §11: §11.6 explicita Bloque 5d con tabla exacta de columnas de `usuario` a eliminar (sin tocar las que la oficial sí duplica entre `usuarios` y `estudiantes`); §11.7 nueva sobre estrategia snapshot/sync para `creditos_aprobados`; §11.8 (Bloque 4) incluye drop de `usuario.dependencia_id` huérfana post-Bloque 2+3.  
**Revisión anterior:** 2026-05-31 v2.2 — §11 inicial con auditoría tras `clientes_finales_sistema.md`, corrección de Bloque 5b sin tabla intermedia.  
**Última revisión anterior:** 2026-05-30 — agregada §10 (Bloque 5 — deuda académica) tras revisar `Roles_bd_oficial.docx`.  
**Documentos relacionados:**
- [`plan_roles.md`](plan_roles.md) — visión original (cronograma optimista, alcance conceptual válido).
- [`plan_integracion_bd_oficial.md`](plan_integracion_bd_oficial.md) — estrategia general de integración (referenciado en §11.3 y §11.5 para Fase 4).
- [`Roles_bd_oficial.docx`](Roles_bd_oficial.docx) — documento oficial del esquema de identidad y roles (base de §10).
- [`clientes_finales_sistema.md`](clientes_finales_sistema.md) — análisis detallado del modelo oficial de identidad (base de §11).
