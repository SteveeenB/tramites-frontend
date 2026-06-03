# Plan — Certificados solo en POSGRADOS

> **Estado:** propuesta de cambio sobre `main` actual (Supabase PostgreSQL).
> **Rama de trabajo:** `certificados-David` (existente en `tramites-backend` y `tramites-frontend`). **Muy desactualizada** respecto a `main` — paso 0 es actualizarla. Si el rebase es demasiado conflictivo, crear `feature/certificados-solo-posgrados` desde `main` y abandonar `certificados-David`. Ver §0.
> **No confundir con:** [`../TABLAS BD OFICIAL/plan_migracion_railway.md`](../TABLAS%20BD%20OFICIAL/plan_migracion_railway.md). Aquel es el experimento Railway/MySQL; éste cambio va a `main` ya.
> **Documento de contexto:** [`tramites-backend/src/main/java/com/ufps/tramites/rules/plan_certificados.md`](../../../../tramites-backend/src/main/java/com/ufps/tramites/rules/plan_certificados.md) — la HU11 original.

---

## 1. Resumen ejecutivo

**Qué cambia:** la realidad institucional es que los certificados académicos se emiten y sellan **únicamente en la oficina de Posgrados**, no en Biblioteca, Tesorería ni Admisiones. La arquitectura actual asume que cada tipo de certificado se asocia a una dependencia responsable; eso es ruido que hay que quitar.

**Cuatro cambios concretos:**

1. **Quitar la pestaña "Certificados" del rol DEPENDENCIA.** Su sidebar queda solo con "Paz y Salvos".
2. **Quitar el campo "Dependencia encargada" del formulario y modelo de tipos de certificado.** Se elimina del backend y del frontend.
3. **Mover la bandeja de gestión de certificados físicos a POSGRADOS.** El coordinador de Posgrados es quien imprime, sella y entrega.
4. **Mantener el catálogo de tipos y plantillas en ADMIN (por ahora).** POSGRADOS no configura tipos ni plantillas; solo gestiona la bandeja física. Se deja abierta la posibilidad de habilitar la vista a POSGRADOS en el futuro.

**Qué NO cambia:**
- Flujo del estudiante (solicitar, pagar, descargar PDF, modalidad digital/física).
- Estados de la máquina (`PENDIENTE_PAGO → PAGADO → GENERADO → LISTO_RETIRO → ENTREGADO`).
- Generación del PDF, hash, envío por correo.
- Cobro `precio_digital + costo_logistica_fisica` para físicos.

**Prioridades nuevas:**
- **Notificaciones end-to-end para certificados** (solicitud física → aviso a POSGRADOS; "Listo para retiro" → aviso al estudiante, etc). Las notificaciones deben cubrir **todo el proceso**, igual que en los demás trámites.
- **Pagos al final**: no bloquear el MVP por integración de pagos.

### 1.1 Incidencias del pull (jun 2026) que afectan el plan

1. **`plantillaHtml` agregado en `TipoCertificado.java`.** No se elimina. Mantener campo y getter/setter.
2. **`CertificadoService` usa `dependenciaNombre` al renderizar plantillas HTML.** Debe reemplazarse por un valor fijo: "Oficina de Posgrados".
3. **`SeccionPlantillasCertificado.jsx` y menú `plantillas-certificado` bajo ADMIN.** Se queda en ADMIN (no se mueve a POSGRADOS en este plan).
4. **Endpoints `/admin/tipos-certificado/{id}/plantilla` con `hasRole('ADMIN')`.** Se mantienen en ADMIN.
5. **`TramitesView.jsx` registra `plantillas-certificado` en `ADMIN_SECCIONES`.** Debe quedarse ahí, no en POSGRADOS.
6. **Variable `{{dependencia}}` en plantillas HTML.** **Se elimina.** En su lugar, el texto del frontend (y del backend) debe usar fijo "Oficina de Posgrados".

**Por qué no se rompe la modularidad de la HU11:** la decisión 3.7 del plan original (*"Dependencias reutilizan la tabla usuario"*) era una decisión arquitectónica para evitar duplicar tablas, no una decisión de negocio sobre quién emite certificados. Quitarla no rompe nada — simplifica el modelo.

---

## 2. Estado actual de la rama `certificados-David`

Comparado con `main` al 2026-06-01:

**Backend** — la rama está 15+ commits atrás:
- Le falta: refactor Bloque 4 (drop columnas zombie), Sprint A (estados_estudiantes), Sprint B (estudiante_id FK), modelo híbrido admins/usuario, creación del usuario administrador (POS001, ADMIN1, DEP001-3).
- Tiene 1 commit propio: "TENER EN CUENTA: Documento con brechas detectadas para el admin".

**Frontend** — la rama está 15+ commits atrás:
- Le falta: separación de roles POSGRADOS/ADMIN, mockup completo del admin, plan_roles_v3, planes de integración con BD oficial, plan migración Railway.
- Sin commits propios.

**Implicación:** el merge `main → certificados-David` va a ser grande y con conflictos garantizados, especialmente en:
- `data.sql` (cambió mucho con el refactor de admins).
- `Usuario.java` (modelo híbrido).
- `TipoCertificado.java` (la entity actual ya usa `Dependencia` como `@ManyToOne` con `dependencia_id`, no `dependencia_cedula`).
- `menuConfig.js` (sufrió la separación de POSGRADOS/ADMIN).

---

## 3. Fase 0 — Decidir base de trabajo

Dos opciones, elegir antes de codear:

### Opción A — Rebasear/mergear `certificados-David` desde `main` (lo que pidió el usuario)

1. `git checkout certificados-David` en ambos repos.
2. `git merge main` (o `git rebase main`).
3. Resolver conflictos.
4. Verificar que el código compila y arranca.
5. Hacer commit del merge.

**Pro:** respeta la decisión inicial; mantiene historial de la rama.
**Contra:** trabajo no creativo de resolución de conflictos antes de empezar el feature. Riesgo de perder código nuevo al resolver mal.

### Opción B — Crear `feature/certificados-solo-posgrados` desde `main` (recomendada si los conflictos son pesados)

1. `git checkout main && git pull`.
2. `git checkout -b feature/certificados-solo-posgrados`.
3. Hacer cambios desde un estado limpio.
4. PR → `main`.

**Pro:** parte de un estado conocido; cero conflictos heredados.
**Contra:** la rama `certificados-David` queda sin uso.

**Recomendación:** intentar Opción A primero. Si en los primeros 10-15 minutos los conflictos son inmanejables (más de 5-6 archivos con conflictos no triviales), abandonar y pasar a Opción B.

---

## 4. Cambios en BD (Supabase actual)

### 4.1 Tabla `tipo_certificado`

**Hoy:**
```sql
tipo_certificado (
  id, codigo, label, descripcion,
  precio_digital, costo_logistica_fisica,
  dependencia_id INTEGER REFERENCES dependencias(id),  -- ← se elimina
  dependencia_cedula VARCHAR,                          -- ← zombie del esquema anterior, se elimina
  direccion_oficina VARCHAR,                           -- ← se evalúa: ver §4.1.b
  plantilla_html TEXT,                                 -- ← NUEVO en el pull: se mantiene
  tiempo_entrega_dias INTEGER,
  activo BOOLEAN
)
```

**Cambio:**
```sql
-- Eliminar la FK a dependencias
ALTER TABLE tipo_certificado DROP CONSTRAINT IF EXISTS tipo_certificado_dependencia_id_fkey;
ALTER TABLE tipo_certificado DROP COLUMN IF EXISTS dependencia_id;

-- Eliminar el zombie del esquema anterior
ALTER TABLE tipo_certificado DROP COLUMN IF EXISTS dependencia_cedula;

-- Nota: NO eliminar plantilla_html. Se mantiene para la generación de PDFs.
```

**Decisión §4.1.b — qué hacer con `direccion_oficina`:**
- **Opción 1:** mantenerlo. Es la dirección de la oficina de posgrados donde se retira el certificado físico. Se llena una vez con la dirección fija de posgrados.
- **Opción 2:** eliminarlo. La dirección es global del módulo, ponerla en una configuración general o hardcodearla.

**Recomendación:** mantener (Opción 1). Cero costo y permite que el admin la edite si la oficina se muda. Si se elimina, hay que crear un endpoint de configuración global solo para esto.

### 4.2 Tabla `solicitud_certificado`

Sin cambios estructurales. La columna `cedula_dependencia` (que estaba marcada como zombie en el plan de migración Railway) sigue siendo zombie y se elimina cuando llegue ese refactor; este cambio no lo toca.

### 4.3 Seed `data.sql`

**Hoy (líneas 140-157 según el grep):**
```sql
-- dependencia_cedula  = FK lógica a usuario.cedula con rol = 'DEPENDENCIA'
INSERT INTO tipo_certificado (codigo, label, descripcion, precio_digital, costo_logistica_fisica,
                              dependencia_cedula, direccion_oficina, tiempo_entrega_dias, activo) VALUES
  (...);
ON CONFLICT (codigo) DO UPDATE SET
    ...
    dependencia_cedula     = EXCLUDED.dependencia_cedula,
    ...
```

**Esto ya estaba mal**: la entity usa `dependencia_id` desde el refactor pero el seed sigue insertando `dependencia_cedula`. Probablemente el seed estaba fallando silenciosamente o se compensa por otra ruta. **Con este cambio el problema desaparece** porque ambas columnas se eliminan.

**Cambio en `data.sql`:**
```sql
INSERT INTO tipo_certificado (codigo, label, descripcion, precio_digital, costo_logistica_fisica,
                              direccion_oficina, tiempo_entrega_dias, activo) VALUES
  ('CONSTANCIA_REGISTRO_CALIFICADO', 'Constancia de Registro Calificado',
   'Acredita el registro calificado del programa', 12000, 3700,
   'Bloque A - Oficina 203 - Coordinación de Posgrados', 2, TRUE),
  ('CONSTANCIA_MATRICULA', 'Constancia de Matrícula',
   'Acredita matrícula vigente', 8000, 3700,
   'Bloque A - Oficina 203 - Coordinación de Posgrados', 2, TRUE),
  ('CONSTANCIA_BUENA_CONDUCTA', 'Constancia de Buena Conducta',
   'Acredita buena conducta del estudiante', 8000, 3700,
   'Bloque A - Oficina 203 - Coordinación de Posgrados', 2, TRUE)
ON CONFLICT (codigo) DO UPDATE SET
    label                  = EXCLUDED.label,
    descripcion            = EXCLUDED.descripcion,
    precio_digital         = EXCLUDED.precio_digital,
    costo_logistica_fisica = EXCLUDED.costo_logistica_fisica,
    direccion_oficina      = EXCLUDED.direccion_oficina,
    tiempo_entrega_dias    = EXCLUDED.tiempo_entrega_dias,
    activo                 = EXCLUDED.activo;
```

### 4.4 Migración manual a aplicar en Supabase

Como `spring.jpa.hibernate.ddl-auto=update` **NO** ejecuta `DROP COLUMN`, hay que correrlo a mano:

```sql
-- Aplicar UNA SOLA VEZ en Supabase antes del primer arranque con el código nuevo.
BEGIN;
ALTER TABLE tipo_certificado DROP CONSTRAINT IF EXISTS tipo_certificado_dependencia_id_fkey;
ALTER TABLE tipo_certificado DROP COLUMN IF EXISTS dependencia_id;
ALTER TABLE tipo_certificado DROP COLUMN IF EXISTS dependencia_cedula;
COMMIT;
```

Documentar en `tramites-backend/.docs/sql/migracion_certificados_solo_posgrados.sql`.

---

## 5. Cambios en backend

### 5.1 Entity `TipoCertificado.java`

[`tramites-backend/src/main/java/com/ufps/tramites/model/TipoCertificado.java`](../../../../tramites-backend/src/main/java/com/ufps/tramites/model/TipoCertificado.java)

**Quitar:**
- Imports `JoinColumn`, `ManyToOne`.
- Campo `@ManyToOne @JoinColumn(name="dependencia_id") private Dependencia dependencia;`
- Getter/setter `getDependencia()`, `setDependencia()`.
- Helpers `getDependenciaId()`, `getDependenciaNombre()`.

**Mantener:** `plantillaHtml`, `direccionOficina`, `tiempoEntregaDias` (siguen útiles para plantillas y para mostrar al estudiante dónde retirar y en cuánto tiempo).

### 5.2 Controller `AdminTipoCertificadoController.java`

[`tramites-backend/src/main/java/com/ufps/tramites/controller/AdminTipoCertificadoController.java`](../../../../tramites-backend/src/main/java/com/ufps/tramites/controller/AdminTipoCertificadoController.java)

**Quitar:**
- `@Autowired private DependenciaService dependenciaService;`
- En `aplicar()`: el bloque `if (body.containsKey("dependenciaId")) { ... }` (líneas 131-134).
- En `toMap()`: los campos `dependenciaId` y `dependenciaNombre` (líneas 148-149).

**Autorización (se queda en ADMIN):** los endpoints de tipos y los nuevos endpoints de plantillas HTML (`GET/PUT /{id}/plantilla`) deben permanecer con `@PreAuthorize("hasRole('ADMIN')")`. POSGRADOS no configura tipos ni plantillas en este plan.

> **Justificación:** la configuración del catálogo es una función administrativa. POSGRADOS solo gestiona la entrega física.

### 5.3 Controller `CertificadoController.java`

[`tramites-backend/src/main/java/com/ufps/tramites/controller/CertificadoController.java`](../../../../tramites-backend/src/main/java/com/ufps/tramites/controller/CertificadoController.java)

**Endpoints de gestión de físicos:**

Hoy:
```java
@PreAuthorize("hasRole('DEPENDENCIA')")
@GetMapping("/dependencia/{dependenciaId}")
public ResponseEntity<?> bandejaDependencia(...)

@PreAuthorize("hasRole('DEPENDENCIA')")
@PostMapping("/{id}/marcar-listo")
public ResponseEntity<?> marcarListo(...)

@PreAuthorize("hasRole('DEPENDENCIA')")
@PostMapping("/{id}/marcar-entregado")
public ResponseEntity<?> marcarEntregado(...)
```

**Cambio:**
- Renombrar `GET /api/certificados/dependencia/{dependenciaId}` → `GET /api/certificados/posgrados/bandeja` (sin path param, devuelve TODOS los certificados físicos).
- `@PreAuthorize` cambia a `hasRole('POSGRADOS')` en los tres endpoints.
- `marcar-listo` y `marcar-entregado` mantienen el path pero la autorización pasa a POSGRADOS.
- Eliminar la validación `if (p.dependenciaId() == null || !p.dependenciaId().equals(dependenciaId))` — ya no aplica.

**Descarga del PDF — atención:**

Hoy: `@PreAuthorize("hasAnyRole('ESTUDIANTE', 'DEPENDENCIA')")`
Cambia: `@PreAuthorize("hasAnyRole('ESTUDIANTE', 'POSGRADOS')")`

Quitar la lógica que valida que la dependencia sea dueña del certificado; POSGRADOS puede descargar cualquier PDF físico.

### 5.4 Service `CertificadoService.java`

[`tramites-backend/src/main/java/com/ufps/tramites/service/CertificadoService.java`](../../../../tramites-backend/src/main/java/com/ufps/tramites/service/CertificadoService.java)

**Cambios:**
- Método `obtenerPorDependencia(Long dependenciaId, String estadoFiltro)`: renombrar a `obtenerBandejaPosgrados(String estadoFiltro)` y quitar el parámetro/filtro por dependencia. Devuelve TODAS las solicitudes físicas (todas las modalidades = FISICA) en el estado dado.
- Métodos `marcarListoRetiro(id, dependenciaId)` y `marcarEntregado(id, dependenciaId)`: quitar el parámetro `dependenciaId` y la validación de ownership por dependencia. Cualquier POSGRADOS puede transicionar.
- Método `descargarPdf(id, cedula, dependenciaId)`: quitar el parámetro `dependenciaId`. La autorización ahora es: el dueño (estudiante) o cualquier POSGRADOS.
- **Plantillas HTML:** al armar el `Map<String, Object> vars`, forzar `dependencia = "Sección de Posgrados"` (no usar `getDependenciaNombre()` porque ya no existe).

### 5.5 Repository `SolicitudCertificadoRepository.java`

[`tramites-backend/src/main/java/com/ufps/tramites/repository/SolicitudCertificadoRepository.java`](../../../../tramites-backend/src/main/java/com/ufps/tramites/repository/SolicitudCertificadoRepository.java)

**Cambios:**
- Si tiene un método `findByDependencia*`, eliminarlo.
- Agregar `findByModalidadEnvio(String modalidad)` o `findByModalidadEnvioAndEstado(String modalidad, String estado)` si no existe.

### 5.6 `PrincipalResolver` y `ResolvedPrincipal`

[`tramites-backend/src/main/java/com/ufps/tramites/security/PrincipalResolver.java`](../../../../tramites-backend/src/main/java/com/ufps/tramites/security/PrincipalResolver.java)

**Sin cambios estructurales.** Aún necesitamos `dependenciaId` en el principal para el flujo de paz y salvos (la dependencia sí gestiona esos). El cambio aquí es solo dejar de usarlo en certificados.

### 5.7 Notificaciones de certificados (prioritario)

**Objetivo:** usar el sistema de notificaciones actual para certificados físicos.

**Eventos mínimos:**
- **Solicitud física creada → notificación a POSGRADOS.** Mensaje tipo: "Andrea solicitó certificado físico: CONSTANCIA_MATRICULA".
- **Marcar "Listo para retiro" → notificación al estudiante.** Mensaje tipo: "Tu certificado está listo para retiro en Posgrados".

**Dónde:** dentro de `CertificadoService` al crear solicitud física y al ejecutar `marcarListoRetiro`.

---

## 6. Cambios en frontend

### 6.1 Menús — `menuConfig.js`

[`tramites-frontend/src/config/menuConfig.js`](../../../config/menuConfig.js)

**DEPENDENCIA — quitar el item de certificados:**
```js
DEPENDENCIA: [
  { id: 'paz-y-salvo',  label: 'Paz y Salvos',  route: '/tramites' },
  // QUITAR: { id: 'certificados', label: 'Certificados', route: '/tramites' },
],
```

**POSGRADOS — agregar items de certificados:**
```js
POSGRADOS: [
  { id: 'bandeja-posgrados',    label: 'Bandeja de Solicitudes', route: '/tramites' },
  { id: 'bandeja-certificados', label: 'Bandeja de Certificados', route: '/tramites' },
  { id: 'reportes',             label: 'Reportes',                 route: '/tramites' },
],
```

**ADMIN — mantener tipos y agregar plantillas en Catálogos:**
```js
ADMIN: [
  // ── Catálogos ─────────────────────────────────────────────────
  { id: 'tipos-certificado',     label: 'Tipos de Certificado',    route: '/tramites', group: 'Catálogos' },
  { id: 'plantillas-certificado', label: 'Plantillas de Certificado', route: '/tramites', group: 'Catálogos' },
  { id: 'tipos-tramite',         label: 'Tipos de Trámite',     route: '/tramites', group: 'Catálogos' },
  { id: 'dependencias',          label: 'Dependencias y Paz y Salvos', route: '/tramites', group: 'Catálogos' },
  ...
],
```

> Si en el futuro POSGRADOS necesita el catálogo, se puede duplicar el item y abrir permisos con `hasAnyRole`.

### 6.2 Formulario ADMIN — `SeccionTiposCertificado.jsx`

[`tramites-frontend/src/pages/posgrados/SeccionTiposCertificado.jsx`](../../../pages/posgrados/SeccionTiposCertificado.jsx) *(si está ubicado allí, no es obligatorio moverlo; solo asegurar que lo renderiza ADMIN)*

**Quitar del state inicial:**
```js
const TIPO_VACIO = {
  codigo: '',
  label: '',
  descripcion: '',
  precioDigital: 0,
  costoLogisticaFisica: 0,
  // QUITAR: dependenciaId: null,
  direccionOficina: '',
  tiempoEntregaDias: 1,
  activo: true,
};
```

**Quitar la carga de dependencias:**
```js
const cargar = useCallback(async () => {
  setCargando(true);
  try {
    const t = await apiClient('/admin/tipos-certificado');
    setTipos(t || []);
    // QUITAR: const d = await apiClient('/dependencias/catalogo'); ...
  } catch (e) {
    setError(e.message);
  } finally {
    setCargando(false);
  }
}, []);
```

**Quitar del state:** `dependencias`, `setDependencias`.

**Quitar columna de la tabla:**
```jsx
<th className="px-4 py-3 text-right">+ Logística física</th>
{/* QUITAR: <th className="px-4 py-3 text-left">Dependencia</th> */}
<th className="px-4 py-3 text-center">Activo</th>

// y en el tbody:
<td className="px-4 py-3 text-right text-slate-600">+{formatPesos(t.costoLogisticaFisica)}</td>
{/* QUITAR: <td className="px-4 py-3 text-xs text-slate-600">{t.dependenciaNombre || '—'}</td> */}
```

**Quitar el select del modal:**
```jsx
<div>
  {/* QUITAR todo este bloque:
  <label>Dependencia encargada</label>
  <select value={edicion.dependenciaId ?? ''} ...>
    ...
  </select>
  */}
</div>
```

**Actualizar descripción del header:**
```jsx
descripcion="Define qué certificados pueden solicitar los estudiantes, su precio base y el costo logístico físico. Todos los certificados se emiten y entregan desde la Coordinación de Posgrados."
```

### 6.2.b Plantillas HTML — `SeccionPlantillasCertificado.jsx` (ADMIN)

**Mantener en ADMIN.** El pull agregó esta sección y el item `plantillas-certificado` en el menú ADMIN.

**Nota sobre `{{dependencia}}`:**
- Dejar la variable disponible en el editor.
- En el preview usar `DATOS_PREVIEW.dependencia = 'Sección de Posgrados'` (ya coincide con la nueva regla de negocio).

### 6.3 Bandeja — renombrar/mover

**Opción simple (recomendada):** renombrar el archivo y ajustar imports.
- Renombrar: `tramites-frontend/src/pages/BandejaCertificadosDependencia.jsx` → `tramites-frontend/src/pages/posgrados/BandejaCertificadosPosgrados.jsx`.
- Cambiar la query de cabecera para que llame al nuevo endpoint `/api/certificados/posgrados/bandeja` sin pasar `dependenciaId`.
- Actualizar el título: "Bandeja de Certificados Físicos".
- Quitar cualquier UI que muestre "Dependencia: X" (si la había).

### 6.4 Rutas — `App.js`

[`tramites-frontend/src/App.js`](../../../App.js)

**Cambios:**
- Ruta que hoy renderiza `BandejaCertificadosDependencia` para DEPENDENCIA → cambiar a renderizar `BandejaCertificadosPosgrados` para POSGRADOS.
- `rolesPermitidos` en rutas de `tipos-certificado` y `plantillas-certificado`: deben ser **solo** `['ADMIN']`.

### 6.5 Vista de selección de sección — `TramitesView.jsx`

[`tramites-frontend/src/pages/TramitesView.jsx`](../../../pages/TramitesView.jsx)

Hoy renderiza distintas secciones según el `id` del menú activo. Ajustes:
- DEPENDENCIA: ya no tiene rama para `certificados` (queda solo `paz-y-salvo`).
- POSGRADOS: agregar rama para `bandeja-certificados` (renderiza `BandejaCertificadosPosgrados`).
- ADMIN: mantener ramas para `tipos-certificado` y agregar `plantillas-certificado` (renderiza `SeccionPlantillasCertificado`).

### 6.6 Cualquier referencia residual

Buscar y limpiar:
```bash
grep -r "BandejaCertificadosDependencia" tramites-frontend/src
grep -r "dependenciaId" tramites-frontend/src/pages/posgrados/SeccionTiposCertificado.jsx
grep -r "dependenciaNombre" tramites-frontend/src
grep -r "plantillas-certificado" tramites-frontend/src
grep -r "dependencia/{cedulaDependencia}" tramites-frontend/src
```

---

## 7. Plan de ejecución

### Fase 0 — Actualizar rama base (§3)

1. Backend: `git checkout certificados-David && git merge main`. Resolver conflictos. Compilar.
2. Frontend: idem.
3. Si los conflictos exceden lo razonable, abandonar y crear `feature/certificados-solo-posgrados` desde `main`.
4. Commit del merge.

### Fase 1 — Backend

1. Aplicar la migración SQL manual (§4.4) en Supabase de staging (no producción aún).
2. Modificar `TipoCertificado.java` (§5.1).
3. Modificar `AdminTipoCertificadoController.java` (§5.2) y asegurar endpoints de plantillas en ADMIN.
4. Modificar `CertificadoController.java` (§5.3) y `CertificadoService.java` (§5.4), incluyendo el valor fijo de `dependencia` en plantillas HTML.
5. Modificar `SolicitudCertificadoRepository.java` (§5.5).
6. Implementar notificaciones de certificados físicos (§5.7).
7. Actualizar `data.sql` (§4.3).
8. Compilar verde. Probar arranque local apuntando a Supabase staging.
9. Commit.

### Fase 2 — Frontend

1. Modificar `menuConfig.js` (§6.1).
2. Modificar `SeccionTiposCertificado.jsx` (ADMIN) (§6.2).
3. Revisar `SeccionPlantillasCertificado.jsx` (ADMIN) y su preview (§6.2.b).
4. Renombrar/mover bandeja (§6.3).
5. Actualizar `App.js` (§6.4) y `TramitesView.jsx` (§6.5).
6. Buscar referencias residuales (§6.6) y limpiar.
7. `npm start`, verificar visualmente.
8. Commit.

### Fase 2.5 — Pagos (opcional, post-MVP)

- Integrar pagos si hay tiempo disponible, sin bloquear el release del MVP.

### Fase 3 — Verificación E2E

Probar con los logins demo:

| Login | Lo que debe ver | Lo que NO debe ver |
|---|---|---|
| DEP001 (Biblioteca) | Solo "Paz y Salvos" en sidebar | Ya no aparece "Certificados" |
| DEP002 (Tesorería) | Solo "Paz y Salvos" | Ya no aparece "Certificados" |
| DEP003 (Admisiones) | Solo "Paz y Salvos" | Ya no aparece "Certificados" |
| POS001 (Coordinador Posgrados) | "Bandeja Solicitudes", "Bandeja Certificados", "Reportes" | No ve "Tipos de Certificado" ni "Plantillas de Certificado" |
| ADMIN1 (Admin) | Catálogos con "Tipos de Certificado" y "Plantillas de Certificado" | No ve bandeja física de certificados |
| Estudiante | "Certificados" (solicitud + historial) sin cambios | — |

**Flujo end-to-end a validar:**
1. Estudiante (Kevin) solicita certificado físico de CONSTANCIA_MATRICULA.
2. POSGRADOS recibe notificación de la solicitud.
3. Estudiante paga.
4. PDF se genera y llega al correo.
5. Login POS001 → entra a "Bandeja Certificados" → ve la solicitud en estado GENERADO.
6. POS001 descarga el PDF, lo imprime mentalmente, marca "Listo para retiro".
7. Estudiante recibe notificación de "Listo para retiro".
8. POS001 marca "Entregado".
9. Estudiante ve el estado actualizado.

**Verificar que NO funciona:**
- Login DEP001 intenta acceder a `/api/certificados/posgrados/bandeja` → 403.
- Login POS001 intenta `POST /api/admin/tipos-certificado` o `PUT /api/admin/tipos-certificado/{id}/plantilla` → 403.

### Fase 4 — PR a `main`

- PR del backend.
- PR del frontend.
- Descripción del PR incluye el SQL de migración manual a aplicar en Supabase de producción.

### Fase 5 — Deploy

1. Aplicar `migracion_certificados_solo_posgrados.sql` en Supabase de producción **antes** del deploy del backend.
2. Deploy backend (Render).
3. Deploy frontend (Render).
4. Smoke test en producción con los 6 logins.

---

## 8. Riesgos y decisiones abiertas

### 8.1 Riesgos

| Riesgo | Mitigación |
|---|---|
| Merge `main → certificados-David` con conflictos importantes | Plan B en §3: nueva rama desde `main`. |
| Solicitudes históricas con `modalidad=FISICA` que dependían de la dependencia para gestión | Después del cambio quedan en la bandeja de POSGRADOS. Sin pérdida de datos, solo cambio de quién las gestiona. |
| POSGRADOS necesita ver el catálogo (futuro) | Agregar item en menú POSGRADOS y cambiar a `hasAnyRole('POSGRADOS','ADMIN')`. Decisión reversible. |
| `direccion_oficina` hardcodeada por error en seed | Documentar en `data.sql` que es la dirección de Posgrados. |
| Aplicar `DROP COLUMN` con datos vivos en producción rompe | El DROP es seguro porque `dependencia_id` solo se usaba en `tipo_certificado`; no hay otra tabla con FK hacia esa columna. Verificar con `\d tipo_certificado` antes de correr el DROP. |

### 8.2 Decisiones abiertas

| Decisión | Opciones | Recomendación inicial |
|---|---|---|
| ¿POSGRADOS obtiene visibilidad de tipos/plantillas? | (a) solo ADMIN; (b) POSGRADOS + ADMIN read-only; (c) ambos rw | (a) por ahora. Reversible. |
| ¿Mantener `direccion_oficina` o moverla a config global? | Mantener / mover | Mantener. Cero costo, máxima flexibilidad. |
| ¿La bandeja de certificados físicos se une visualmente a la bandeja de solicitudes de grado? | Sí (1 sola "Bandeja") / no (2 secciones distintas) | No. Son dominios distintos, manténlas separadas. Cada una con su tab/sección en el sidebar de POSGRADOS. |
| ¿Eliminamos `BandejaCertificadosDependencia.jsx` o lo dejamos como referencia comentada? | Eliminar / comentar | Eliminar. Está en git history si se necesita. |

---

## 9. Impacto en otros documentos

| Documento | Acción |
|---|---|
| [`../TABLAS BD OFICIAL/plan_migracion_railway.md`](../TABLAS%20BD%20OFICIAL/plan_migracion_railway.md) §3.3 | Quitar la FK `dependencia_id` de `tipo_certificado` después de mergear este cambio a `main` y luego a `migracion-railway`. **Ya añadida una nota anticipatoria en §9b de ese plan.** |
| [`../Roles/plan_roles_v3.md`](../Roles/plan_roles_v3.md) | Actualizar la matriz de permisos por rol: DEPENDENCIA pierde acceso a certificados; POSGRADOS gana bandeja física; ADMIN mantiene tipos y plantillas. |
| [`tramites-backend/src/main/java/com/ufps/tramites/rules/plan_certificados.md`](../../../../tramites-backend/src/main/java/com/ufps/tramites/rules/plan_certificados.md) §3.7 y §6.2 | Marcar como deprecado: la decisión "dependencias reutilizan tabla usuario" sigue siendo válida para paz y salvos, pero ya no aplica a certificados. La bandeja de §6.2 se trasladó a POSGRADOS. Añadir nota al inicio. |

---

## 10. Próximos pasos

1. **Decidir Opción A o B** del §3 (rebase de `certificados-David` o nueva rama).
2. **Ejecutar Fase 0**: actualizar la rama base.
3. **Ejecutar Fase 1** (backend).
4. **Ejecutar Fase 2** (frontend).
5. **Smoke test** (Fase 3).
6. **PR + deploy** (Fases 4-5).

---

**Versión:** 1.1
**Última actualización:** 2026-06-02
**Estado:** propuesta para ejecutar sobre Supabase actual.
**Autor:** módulo Trámites de Posgrado UFPS.
