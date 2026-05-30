# Plan de refactor — Modelo híbrido de identidad (admins / usuarios)

> Plan ejecutable para alinear el modelo de identidad del módulo trámites con el patrón híbrido de la BD oficial de Posgrados. Permite demostrar la viabilidad de la integración en el MVP sin esperar a la integración real, y reduce el costo de esa integración a renombrar tablas.

---

## 1. Resumen ejecutivo

### Qué se hace
Separar los perfiles administrativos (`POSGRADOS`, `DEPENDENCIA`, `ADMIN`) de los académicos (`ESTUDIANTE`, `DIRECTOR_PROGRAMA`) creando una tabla `admins` paralela a `usuario`. Los admins viven en `admins` con su propio login email/password. Los académicos siguen en `usuario` con login por código/contraseña (eventual SSO Moodle/Google).

### Por qué
- La BD oficial **ya separa** `usuarios` (académicos) de `admins` (operadores). Forzar todos los roles en una sola tabla rompe ese patrón.
- POSGRADOS y DEPENDENCIA no tienen sentido como "usuarios académicos": no tienen programa, ni cohorte, ni Moodle.
- Cuando se haga la integración real, alinear hoy reduce el costo a renombrar tablas.
- El MVP que se presente con esta arquitectura **demuestra que la integración no es compleja**.

### Costo total
**~19 horas (2-3 días de trabajo enfocado)**, distribuidas en 4 fases con puntos de control claros.

### Vía rápida disponible
Como los usuarios actuales en producción son de prueba (todos con contraseña `123456`), la fase de migración de datos puede hacerse **destructivamente** (drop + recrear desde `data.sql`), lo que reduce esa fase a 1 hora en lugar de 3.

---

## 2. Contexto

Hoy todos los perfiles del módulo viven en la tabla `usuario` con `rol_id` apuntando a la tabla `roles`. Eso significa que un funcionario de Biblioteca está modelado igual que un estudiante de doctorado, lo cual:

- Deja muchos campos NULL (programa_id, moodle_id, etc.) para los operadores.
- Mezcla dos dominios conceptualmente distintos (académico ≠ operativo).
- No se alinea con la separación que ya hizo la BD oficial.

El plan resuelve esto creando la tabla `admins` con la misma estructura que la oficial.

### Decisiones previas relevantes

Documentadas en otros archivos de `.docs/`:

- [`plan_integracion_bd_oficial.md`](plan_integracion_bd_oficial.md) §6 (Opción 3-C) y §8 (catálogo de roles) — propuesta arquitectónica.
- [`configuracion_admin.md`](configuracion_admin.md) §1 y §4 — separación de menú POSGRADOS (operativo) vs ADMIN (configurador) en el frontend.

---

## 3. Estado actual — análisis técnico

### 3.1 Lo que YA está alineado con el patrón híbrido

Esto es importante: **el código actual no parte de cero**.

| Componente | Estado | Implicación |
|---|---|---|
| `Usuario.id` es Long autoincremental | ✅ Igual que `usuarios` oficial | Sin migración de PK |
| `Usuario` tiene `email`, `googleId`, `moodleId`, `password BCrypt`, `primer_nombre`, `primer_apellido` | ✅ Igual que `usuarios` oficial | Identidad académica lista |
| `Estudiante` ya es entidad separada con FK a `Usuario` | ✅ Igual que la separación oficial | Patrón replicado |
| Tabla `dependencias` (id, nombre, descripcion, activa) | ✅ Como propuesta | No cambia |
| `JwtService` con claims `rol, cedula, email, codigo, nombreCompleto, estudianteId, programaNombre` | ✅ Solo falta `principalType` | Cambio pequeño |
| `@PreAuthorize("hasRole('POSGRADOS')")` y similares dispersos | ✅ Compatible | **No cambia ninguna anotación** |
| `paz_y_salvo.dependencia_id` apunta a `dependencias` (no a usuario) | ✅ FK correcta | No se toca |

### 3.2 Lo que está fuera de lugar

| Issue | Detalle |
|---|---|
| 5 filas en `usuario` con rol POSGRADOS/DEPENDENCIA/ADMIN | Conceptualmente deberían vivir en `admins` |
| `tipo_certificado.dependencia_cedula` apunta a cédula de usuario DEPENDENCIA | Debería apuntar a `dependencias.id` (FK a entidad). Es deuda pre-existente. |
| `JwtService` solo sabe generar tokens de `Usuario` | Falta el método para `Admin` |
| `AuthController.login` solo busca en `usuario` | Falta buscar también en `admins` |

### 3.3 Métricas de impacto en código

Conteo de referencias a roles administrativos en archivos del backend (rama `main`):

```
SwaggerConfig.java                  2
AdminTipoCertificadoController.java 7
CertificadoController.java          4
ConvocatoriaController.java         4
DependenciaController.java         16
PazYSalvoController.java            7
SolicitudController.java           13
PazYSalvo.java (model)              1
CertificadoService.java             1
PazYSalvoService.java               4
SolicitudService.java               2
UsuarioService.java                 4
ValidacionGradoService.java         2
─────────────────────────────────────
TOTAL                              67 ocurrencias en 13 archivos
```

**Pero la mayoría son `@PreAuthorize` strings que NO cambian.** El refactor real está en `AuthController`, `JwtService`, `JwtAuthFilter` y unas pocas consultas en `UsuarioService`.

---

## 4. Arquitectura propuesta

### 4.1 Modelo de identidad

```
┌─────────────────────────────────────┐    ┌─────────────────────────────────────┐
│   USUARIOS ACADÉMICOS               │    │   OPERADORES DEL SISTEMA            │
│   (tabla `usuario`)                 │    │   (tabla `admins`)                  │
├─────────────────────────────────────┤    ├─────────────────────────────────────┤
│ • ESTUDIANTE                        │    │ • POSGRADOS (tipo='POSGRADOS')      │
│ • DIRECTOR_PROGRAMA                 │    │ • DEPENDENCIA (tipo='DEPENDENCIA',   │
│                                     │    │                dependencia_id=X)    │
│                                     │    │ • ADMIN (es_super_admin=true)       │
│                                     │    │                                     │
│ Login: código + contraseña          │    │ Login: email + contraseña           │
│ A futuro: SSO Moodle/Google         │    │                                     │
└─────────────────────────────────────┘    └─────────────────────────────────────┘
        │                                              │
        └──────────────────┬───────────────────────────┘
                           │
                  ┌────────▼────────┐
                  │   JWT TOKEN     │
                  │                 │
                  │ sub:            │
                  │ principalType:  │ ← 'USUARIO' o 'ADMIN'
                  │ rol:            │ ← 'ESTUDIANTE', 'POSGRADOS', etc.
                  │ ... (claims)    │
                  └─────────────────┘
```

### 4.2 DDL de la tabla `admins`

```sql
CREATE TABLE admins (
  id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  codigo            VARCHAR(20)  UNIQUE,
  primer_nombre     VARCHAR(50),
  segundo_nombre    VARCHAR(50),
  primer_apellido   VARCHAR(50),
  segundo_apellido  VARCHAR(50),
  nombre_completo   VARCHAR(150),
  email             VARCHAR(100) UNIQUE NOT NULL,
  password          VARCHAR(255) NOT NULL,           -- BCrypt
  es_super_admin    BOOLEAN      DEFAULT false,
  active            BOOLEAN      DEFAULT true,
  tipo              VARCHAR(30)                       -- 'SUPER' | 'POSGRADOS' | 'DEPENDENCIA'
                    CHECK (tipo IN ('SUPER','POSGRADOS','DEPENDENCIA')),
  dependencia_id    BIGINT                            -- solo cuando tipo='DEPENDENCIA'
                    REFERENCES dependencias(id),
  fecha_creacion    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admins_email  ON admins(email);
CREATE INDEX idx_admins_codigo ON admins(codigo);
CREATE INDEX idx_admins_tipo   ON admins(tipo);
```

### 4.3 Estados del JWT

```json
// JWT de usuario académico
{
  "sub": "1",
  "principalType": "USUARIO",
  "rol": "ESTUDIANTE",
  "cedula": "1098765432",
  "codigo": "20261001",
  "email": "...",
  "nombreCompleto": "...",
  "estudianteId": 5,
  "programaNombre": "..."
}

// JWT de operador administrativo
{
  "sub": "3",
  "principalType": "ADMIN",
  "rol": "POSGRADOS",
  "codigo": "POS001",
  "email": "posgrados@ufps.edu.co",
  "nombreCompleto": "Oficina Posgrados",
  "dependenciaId": null,
  "esSuperAdmin": false
}
```

### 4.4 Endpoints de auth

| Endpoint | Body | Búsqueda | Token |
|---|---|---|---|
| `POST /api/auth/login` | `{codigo, contrasena}` | 1° en `admins.codigo`, 2° en `usuario.codigo` | JWT con `principalType` correcto |
| `POST /api/auth/admin-login` | `{email, contrasena}` | Solo en `admins.email` | JWT con `principalType='ADMIN'` |
| `POST /api/auth/google` | `{idToken}` | Solo en `usuario.googleId` | JWT con `principalType='USUARIO'` |
| `POST /api/auth/login-demo` (dev) | `cedula` o `email` | Ambas tablas | JWT acorde |

**Recomendación:** el `/api/auth/login` actual se vuelve genérico (acepta código/contraseña, busca en ambas). El frontend no cambia su flujo de login. Los admins también tienen `codigo` (POS001, DEP001, etc.) para mantener compatibilidad con el demo selector actual.

---

## 5. Plan por fases

### Fase 1 — Coexistencia (8 horas)

**Objetivo:** las dos tablas existen, el login funciona desde ambas, sin tocar datos reales.

**Entregables:**

1. **DDL aplicado en Supabase**: tabla `admins` creada con la estructura de §4.2. La tabla está vacía.
2. **Entidad JPA `Admin.java`** en `model/`. ~80 líneas, calcada de `Usuario` pero con campos administrativos.
3. **Repositorio `AdminRepository.java`** con `findByEmail`, `findByCodigo`, `findByTipo`.
4. **`JwtService` extendido** con `generateToken(Admin admin)` y constante `CLAIM_PRINCIPAL_TYPE`.
5. **`JwtAuthFilter` extendido** para leer `principalType` del token y poblar el `SecurityContext` con el principal correcto (Admin o Usuario).
6. **`AuthController.login` extendido** para buscar primero en `admins` por código y por email; si no encuentra, busca en `usuario`.
7. **Tests manuales** del login con las 6 credenciales actuales (siguen funcionando porque siguen viviendo en `usuario`).

**Punto de control:** después de esta fase, el sistema funciona exactamente igual que ahora, pero internamente está listo para recibir admins en la nueva tabla.

**Tasks granulares:**

- [ ] Aplicar DDL en Supabase
- [ ] Crear `Admin.java` con campos del §4.2
- [ ] Crear `AdminRepository.java`
- [ ] Añadir `CLAIM_PRINCIPAL_TYPE` y método `generateToken(Admin)` a `JwtService`
- [ ] Modificar `JwtAuthFilter.doFilterInternal` para usar el claim
- [ ] Modificar `AuthController.login` con doble búsqueda
- [ ] Verificar `@PreAuthorize` siguen aceptando el `rol` del JWT
- [ ] Test E2E: login + acceso a un endpoint por rol

---

### Fase 2 — Migración de datos (1-3 horas)

**Objetivo:** mover los 5 admins de `usuario` a `admins`.

#### Vía recomendada (1h, porque los datos son de prueba)

Como los usuarios en producción son falsos, la migración puede ser destructiva:

1. **Detener el backend** brevemente.
2. **Borrar las 5 filas** de admins en la tabla `usuario`:
   ```sql
   DELETE FROM usuario
   WHERE rol_id IN (SELECT id FROM roles WHERE nombre IN ('ADMIN','POSGRADOS','DEPENDENCIA'));
   ```
3. **Actualizar `data.sql`** con los nuevos INSERT en `admins`.
4. **Reiniciar el backend** — `ddl-auto=update` aplica el nuevo seed.
5. **Validar** que `Coordinador Posgrados`, `Admin User`, `Biblioteca`, `Financiera`, `Admisiones` aparecen en la nueva tabla.

#### Vía conservadora (3h)

Si por alguna razón hay que preservar IDs y relaciones existentes:

1. Script INSERT a INSERT a `admins` mapeando los datos.
2. UPDATE en tablas que referencien cédulas (revisar `tipo_certificado.dependencia_cedula`, `solicitud.cedula_posgrados`).
3. DELETE en `usuario`.

**Datos a insertar en `admins`:**

| codigo | nombre_completo | email | tipo | dependencia_id | es_super_admin |
|---|---|---|---|---|---|
| ADMIN1 | Admin User | admin@ufps.edu.co | SUPER | NULL | true |
| POS001 | Oficina Posgrados | posgrados@ufps.edu.co | POSGRADOS | NULL | false |
| DEP001 | Biblioteca Central | kevarias.2195@gmail.com | DEPENDENCIA | 1 (Biblioteca) | false |
| DEP002 | División Financiera | financiera@test.com | DEPENDENCIA | 2 (Financiera) | false |
| DEP003 | Admisiones y Registro | admisiones@test.com | DEPENDENCIA | 3 (Admisiones) | false |

Todas con contraseña `123456` hasheada con BCrypt.

**Tasks granulares:**

- [ ] Backup de Supabase (snapshot)
- [ ] DELETE de filas admin en `usuario`
- [ ] Actualizar `data.sql` con bloque nuevo de INSERT en `admins`
- [ ] Restart de la app (Render redeploy)
- [ ] Validar login con cada uno de los 5 admins
- [ ] Validar que los demos del frontend siguen funcionando

**Punto de control:** los 5 admins viven en `admins`. La tabla `usuario` solo tiene ESTUDIANTES y DIRECTORES.

---

### Fase 3 — Limpieza y refactor (4 horas)

**Objetivo:** código alineado con la nueva arquitectura, sin restos del modelo viejo.

**Entregables:**

1. **Servicios refactorizados:**
   - `UsuarioService` ya no busca usuarios POSGRADOS/DEPENDENCIA/ADMIN. Métodos que lo hacían se mueven a `AdminService` o se eliminan.
   - `PazYSalvoService` cuando registra "quién respondió", usa `Admin` o `Usuario` según el contexto.
   - `SolicitudService` cuando guarda `cedula_posgrados` o `cedula_director`, lo extrae del JWT principal.
2. **`tipo_certificado.dependencia_cedula` → `dependencia_id`** (FK a la entidad `Dependencia`). Esto **resuelve el bug del dropdown** que vimos en sprint.
3. **Frontend `AuthContext.js`** lee y guarda el claim `principalType` (no afecta UI, solo lo almacena para uso futuro).
4. **Demo selector del frontend** ajustado: las cédulas ADMIN/POSGRADOS/DEPENDENCIA del `DEMO_USERS` se mapean a códigos correspondientes en `admins`.
5. **Eliminar (opcional) filas POSGRADOS/DEPENDENCIA/ADMIN** del catálogo `roles`. Quedan solo ESTUDIANTE y DIRECTOR_PROGRAMA en `roles`. Esto refleja que ahora `roles` es exclusivo de usuarios académicos.

**Tasks granulares:**

- [ ] Inventariar todos los `findByCedula` que buscan admins
- [ ] Mover lógica a `AdminService` o adaptar consultas
- [ ] Refactor de `tipo_certificado` (entidad, repositorio, controller, frontend dropdown)
- [ ] Actualizar `AuthContext.js` con `principalType`
- [ ] Actualizar `menuConfig.js` y `DEMO_USERS` para reflejar admins
- [ ] (Opcional) Cleanup de `roles` tabla
- [ ] Test E2E completo: cada rol hace su flujo principal

**Punto de control:** ningún `usuarioRepository.findByX` busca admins. Toda la administración pasa por `AdminRepository`.

---

### Fase 4 — Validación y deploy (4 horas)

**Objetivo:** confianza de que todo funciona, deploy coordinado, documentación al día.

**Entregables:**

1. **Testing manual E2E** siguiendo el checklist de §8.
2. **Documentación final actualizada** en `plan_integracion_bd_oficial.md` y `configuracion_admin.md` reflejando que el patrón ya está implementado.
3. **Notas para sprint review** preparadas con material para demo.
4. **Deploy a producción** (Render): merge a `main`, redeploy automático.
5. **Smoke test** en `https://tramites-backend.onrender.com` con las nuevas credenciales.

**Tasks granulares:**

- [ ] Correr checklist de §8 contra local
- [ ] Actualizar docs (revisión 3 en `plan_integracion_bd_oficial.md §8`, agregar §11)
- [ ] Preparar slide / texto para sprint review
- [ ] Merge a main
- [ ] Validar producción
- [ ] Comunicar al equipo oficial el patrón implementado

---

## 6. Inventario de archivos a tocar

### Backend (Java)

#### Crear
- `src/main/java/com/ufps/tramites/model/Admin.java`
- `src/main/java/com/ufps/tramites/repository/AdminRepository.java`
- `src/main/java/com/ufps/tramites/service/AdminService.java` (opcional, si la lógica se complica)

#### Modificar
- `src/main/java/com/ufps/tramites/security/JwtService.java` — añadir `CLAIM_PRINCIPAL_TYPE`, método `generateToken(Admin)`.
- `src/main/java/com/ufps/tramites/security/JwtAuthFilter.java` — leer claim, poblar SecurityContext según tipo.
- `src/main/java/com/ufps/tramites/controller/AuthController.java` — extender `/login` con doble búsqueda; nuevo `/admin-login` opcional.
- `src/main/java/com/ufps/tramites/service/UsuarioService.java` — quitar búsquedas de admins.
- `src/main/java/com/ufps/tramites/service/PazYSalvoService.java` — cuando rol DEPENDENCIA responde, traer del JWT principal.
- `src/main/java/com/ufps/tramites/service/SolicitudService.java` — `cedula_posgrados` se llena desde JWT.
- `src/main/java/com/ufps/tramites/model/TipoCertificado.java` — `dependenciaCedula` → `dependenciaId` (FK a Dependencia).
- `src/main/java/com/ufps/tramites/controller/AdminTipoCertificadoController.java` — ajustar mapeo de dependencia.
- `src/main/resources/data.sql` — mover 5 INSERT de `usuario` a `admins`.

#### NO se tocan
- Todos los `@PreAuthorize` quedan igual.
- `Estudiante.java`, `EstudianteRepository.java`, lógica académica.
- `Dependencia.java`, `DependenciaController.java`.
- `CertificadoController` (excepto por el cambio de `dependenciaCedula` → `dependenciaId`).

### Frontend (React)

#### Modificar
- `src/context/AuthContext.js` — extraer y guardar `principalType` del JWT.
- `src/config/menuConfig.js` — ajustar `DEMO_USERS` para usar códigos de admins (POS001, DEP001, etc.).
- `src/pages/posgrados/SeccionTiposCertificado.jsx` — el dropdown de "Dependencia encargada" pasa a usar `dependenciaId` en vez de `dependenciaCedula` (resuelve bug del sprint).

#### NO se tocan
- `Login.jsx` — el código de login con `codigo + contraseña` funciona igual.
- Toda la lógica de roles del sidebar.
- ProtectedRoute (`DEMO_MODE` ya lo flexibiliza).

### BD

#### Aplicar (script SQL en `.docs/sql/migracion_admins.sql`, a crear)
```sql
-- 1. Crear tabla admins
CREATE TABLE admins ( ... );

-- 2. Insertar los 5 admins iniciales
INSERT INTO admins (codigo, nombre_completo, email, password, tipo, es_super_admin, dependencia_id)
VALUES
  ('ADMIN1', 'Admin User',           'admin@ufps.edu.co',     '$2a$10$...', 'SUPER',       true,  NULL),
  ('POS001', 'Oficina Posgrados',    'posgrados@ufps.edu.co', '$2a$10$...', 'POSGRADOS',   false, NULL),
  ('DEP001', 'Biblioteca Central',   'biblioteca@ufps.edu.co','$2a$10$...', 'DEPENDENCIA', false, 1),
  ('DEP002', 'División Financiera',  'financiera@test.com',   '$2a$10$...', 'DEPENDENCIA', false, 2),
  ('DEP003', 'Admisiones y Registro','admisiones@test.com',   '$2a$10$...', 'DEPENDENCIA', false, 3);

-- 3. Borrar de la tabla usuario
DELETE FROM usuario WHERE rol_id IN (
  SELECT id FROM roles WHERE nombre IN ('ADMIN','POSGRADOS','DEPENDENCIA')
);

-- 4. (Opcional) Quitar filas POSGRADOS/DEPENDENCIA/ADMIN de la tabla roles
-- Solo si todas las FKs ya están limpias
-- DELETE FROM roles WHERE nombre IN ('ADMIN','POSGRADOS','DEPENDENCIA');
```

#### Cambio adicional en `tipo_certificado`
```sql
-- Reemplazar dependencia_cedula (string) por dependencia_id (FK)
ALTER TABLE tipo_certificado ADD COLUMN dependencia_id BIGINT REFERENCES dependencias(id);

-- Migrar datos: mapear las cédulas viejas a IDs
UPDATE tipo_certificado tc
SET dependencia_id = d.id
FROM usuario u
JOIN dependencias d ON u.dependencia_id = d.id
WHERE u.cedula = tc.dependencia_cedula;

-- Una vez validado, quitar la columna vieja
-- ALTER TABLE tipo_certificado DROP COLUMN dependencia_cedula;
```

---

## 7. Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Romper login al cambiar `AuthController` | Media | Alto | Fase 1 mantiene compatibilidad: doble búsqueda en ambas tablas. Si falla, rollback a versión anterior. |
| Migración de datos en producción | Baja | Medio | Como los datos son de prueba, hacer la migración destructiva. Backup previo. |
| `JwtAuthFilter` no hidrata correctamente el principal | Media | Alto | Tests unitarios + manuales antes de deploy. El claim `principalType` es claro y testeable. |
| Referencias hardcoded a cédulas en código | Baja | Bajo | Inventario en Fase 3. Reemplazar con consultas por id. |
| Equipo oficial pide cambios al esquema | Baja | Bajo | El patrón propuesto ya respeta el de ellos. Cambios serán menores. |
| Sprint review descubre que falta algo | Media | Bajo | El plan tiene puntos de control claros; si una fase no termina, se queda en estado estable. |

---

## 8. Checklist de validación E2E

Después de cada fase, correr este checklist en `localhost`:

### Login
- [ ] ESTUDIANTE Laura (`20261005 / 123456`) entra y ve "Mis Trámites".
- [ ] DIRECTOR Maria (`20261002 / 123456`) entra y ve "Bandeja de Solicitudes" del director.
- [ ] POSGRADOS (`POS001 / 123456`) entra y ve solo "Bandeja de Solicitudes" + "Reportes" en el sidebar.
- [ ] DEPENDENCIA Biblioteca (`DEP001 / 123456`) entra y ve solo paz y salvos de Biblioteca.
- [ ] ADMIN (`ADMIN1 / 123456`) entra y ve TODAS las pestañas de configuración del sidebar.

### Flujo de certificados
- [ ] Laura solicita un certificado digital → aparece en su historial.
- [ ] Laura paga → estado pasa a GENERADO.
- [ ] Laura descarga el PDF.
- [ ] Laura solicita un certificado físico → aparece en bandeja de Admisiones (DEP003).
- [ ] DEP003 marca como listo → Laura ve "Listo para retiro" + dirección.

### Admin (CRUD)
- [ ] ADMIN crea un nuevo tipo de certificado → aparece en la lista de estudiantes.
- [ ] ADMIN crea una nueva dependencia → aparece en el dropdown de tipos de certificado (resuelve bug del sprint).
- [ ] POSGRADOS intenta crear un tipo de certificado → recibe 403.
- [ ] POSGRADOS edita una convocatoria → recibe 403.

### JWT y seguridad
- [ ] El token JWT contiene `principalType` correcto según el login.
- [ ] Endpoint con `@PreAuthorize("hasRole('POSGRADOS')")` rechaza JWT de ADMIN (es esperado — son roles distintos).
- [ ] Endpoint con `@PreAuthorize("hasRole('ADMIN')")` rechaza JWT de POSGRADOS.
- [ ] Endpoint público (`/api/auth/login`) funciona sin token.

---

## 9. Mapeo a la integración futura

Cuando se haga la integración real con la BD oficial:

| Nuestra tabla actual | Tabla oficial destino | Acción |
|---|---|---|
| `admins` | `admins` (oficial, ya extendida con `tipo` y `dependencia_id`) | Renombrar / migrar filas |
| `usuario` | `usuarios` (oficial) | Mapear campos directos; nombres ya alineados |
| `estudiante` (nuestra) | `estudiantes` (oficial) | Datos académicos enriquecidos por DIVISIT |
| `dependencias` | `dependencias` (nueva en su schema, propuesta del módulo) | Mover bajo schema oficial |
| `tipo_certificado`, `solicitud_certificado`, `convocatoria`, `paz_y_salvo`, `pagos` | Quedan en schema del módulo | Sin cambio |

**Esfuerzo estimado de la integración real (post-refactor):** 3-5 días, principalmente para SSO Moodle/Google y mapeo de programas a `programas + pensum` oficial.

**Sin este refactor:** la integración costaría 10-15 días porque habría que reestructurar el modelo de identidad al mismo tiempo.

---

## 10. Notas para el sprint review

### Mensaje principal
> "Implementamos en nuestra BD el mismo patrón de identidad que usa la BD oficial: separamos usuarios académicos (estudiantes, directores) de operadores administrativos (Posgrados, dependencias, admin). Esto **demuestra que la arquitectura es viable** y que la integración real será trivial: mapear nuestras tablas a las suyas."

### Demo sugerido
1. Mostrar la nueva tabla `admins` en Supabase con los 5 operadores.
2. Loguear como ADMIN → mostrar el sidebar de configuración completo.
3. Loguear como POSGRADOS → mostrar solo bandeja operativa.
4. Loguear como DEPENDENCIA Biblioteca → mostrar solo paz y salvos de Biblioteca.
5. Mostrar el JWT decodificado en cada caso con el claim `principalType`.

### Slide opcional
```
┌─────────────────────────────────────────────────────────┐
│  Modelo de identidad: ANTES y AHORA                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ANTES                          AHORA                   │
│  ─────                          ─────                   │
│                                                          │
│  usuario                        usuario     admins      │
│  ├── ESTUDIANTE                 ├── EST     ├── SUPER   │
│  ├── DIRECTOR                   └── DIR     ├── POSGR   │
│  ├── POSGRADOS                                └── DEP   │
│  ├── DEPENDENCIA                                        │
│  └── ADMIN                                              │
│                                                          │
│  ❌ Todo en una tabla            ✅ Separación académico/op │
│  ❌ NULL en muchos campos        ✅ Cada tabla con sus campos │
│  ❌ Difícil de integrar          ✅ Alineado con BD oficial │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 11. Decisiones tomadas

- ✅ **Adoptar Opción 3-C** (modelo híbrido) — equipo oficial dio luz verde condicionada al MVP funcional.
- ✅ **Implementar refactor antes de integración** para demostrar viabilidad.
- ✅ **Migración destructiva permitida** — los usuarios actuales son de prueba.
- ✅ **`tipo_certificado.dependencia_cedula` → `dependencia_id`** se hace en este refactor (cierra deuda del sprint anterior).
- ⏸️ **Eliminar filas POSGRADOS/DEPENDENCIA/ADMIN de tabla `roles`** queda como opcional en Fase 3 — útil pero no bloqueante.

---

## 12. Próximos pasos

1. Revisar este plan con el equipo y validar el alcance.
2. Crear branch `feature/admins-hibrido` en backend y frontend.
3. Ejecutar Fase 1 (no toca datos, riesgo bajo).
4. Punto de check + decisión de continuar con Fase 2.
5. Continuar con Fases 2, 3, 4.
6. PR final a `main` con changelog completo.

---

**Versión:** 1  
**Última actualización:** durante sprint de integración con BD oficial  
**Documentos relacionados:**
- [`plan_integracion_bd_oficial.md`](plan_integracion_bd_oficial.md) — Estrategia general de integración.
- [`configuracion_admin.md`](configuracion_admin.md) — Funcionalidades faltantes del admin.
- [`plan_certificados.md`](../tramites-backend/src/main/java/com/ufps/tramites/rules/plan_certificados.md) — Módulo de certificados (base del trabajo de roles).
