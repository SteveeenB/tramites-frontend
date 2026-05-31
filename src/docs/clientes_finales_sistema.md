# Clientes Finales del Sistema — Análisis de Entidades

> Sistema universitario de gestión académica e investigación.  
> Este documento describe todas las entidades que representan a los usuarios activos (clientes finales) del sistema.

---

## Índice

1. [Mapa general de clientes](#1-mapa-general-de-clientes)
2. [usuarios](#2-tabla-usuarios)
3. [estudiantes](#3-tabla-estudiantes)
4. [estudiantes_divisit (legacy)](#4-tabla-estudiantes_divisit--legacy-)
5. [roles](#5-tabla-roles)
6. [estados_estudiantes](#6-tabla-estados_estudiantes)
7. [sesiones_activas](#7-tabla-sesiones_activas)
8. [admins](#8-tabla-admins)
9. [Flujo de gestión de un cliente](#9-flujo-de-gestión-de-un-cliente)
10. [Tipos de clientes y su mapeo](#10-tipos-de-clientes-y-su-mapeo)
11. [Nota sobre el Director de Programa](#11-nota-sobre-el-director-de-programa)

---

## 1. Mapa general de clientes

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTES DEL SISTEMA                      │
│                                                             │
│   [admins]          [usuarios]  ──────── rol_id ──► [roles] │
│   (tabla propia)        │                                   │
│                         │ usuario_id (FK directa)           │
│                         ▼                                   │
│                   [estudiantes]                             │
│                   (perfil académico)                        │
│                         │                                   │
│   [estudiantes_divisit] │ (fuente externa legacy)           │
│   (sync desde DIVISIT)  │                                   │
│                         ▼                                   │
│                [sesiones_activas]                           │
│                (sesiones en curso)                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Tabla: `usuarios`

> **Rol:** Identidad digital de toda persona que inicia sesión en el sistema.  
> Docentes, estudiantes e investigadores tienen registro aquí.

| Campo | Tipo | Descripción |
|---|---|---|
| id | 123 | Clave primaria |
| cedula | AZ | Documento de identidad |
| codigo | AZ | Código institucional |
| email | AZ | Correo electrónico (usado para sesión) |
| foto_url | AZ | URL de foto de perfil |
| google_id | AZ | Identificador de autenticación con Google |
| moodleId | AZ | Vinculación con plataforma Moodle |
| nombreCompleto | AZ | Nombre completo concatenado |
| primerApellido | AZ | Primer apellido |
| primerNombre | AZ | Primer nombre |
| segundoApellido | AZ | Segundo apellido |
| segundoNombre | AZ | Segundo nombre |
| telefono | AZ | Teléfono de contacto |
| rol_id | 123 | FK → `roles.id` (define el tipo de usuario) |

---

## 3. Tabla: `estudiantes`

> **Rol:** Perfil académico del alumno matriculado.  
> Extiende directamente a `usuarios` mediante `usuario_id`.  
> Cubre tanto pregrado como posgrado mediante la bandera `esPosgrado`.

| Campo | Tipo | Descripción |
|---|---|---|
| id | 123 | Clave primaria |
| apellido | AZ | Primer apellido |
| apellido2 | AZ | Segundo apellido |
| cedula | AZ | Documento de identidad |
| codigo | AZ | Código estudiantil |
| email | AZ | Correo institucional |
| esPosgrado | 123 | `1` = Posgrado / `0` = Pregrado |
| fechaIngreso | ⊘ | Fecha de ingreso al programa |
| fechaNacimiento | ⊘ | Fecha de nacimiento |
| migrado | 123 | Flag de migración desde sistema anterior |
| moodleId | AZ | Vinculación con Moodle |
| nombre | AZ | Primer nombre |
| nombre2 | AZ | Segundo nombre |
| telefono | AZ | Teléfono de contacto |
| cohorte_id | 123 | FK → `cohortes.id` |
| estado_estudiante_id | 123 | FK → `estados_estudiantes.id` |
| pensum_id | 123 | FK → `pensums.id` (plan de estudios) |
| programa_id | 123 | FK → `programas.id` (carrera) |
| **usuario_id** | 123 | **FK → `usuarios.id` (relación directa)** |

### Relación directa con `usuarios`

```
usuarios.id  ◄────────  estudiantes.usuario_id
```

Los campos compartidos que permiten trazabilidad cruzada:

| Campo compartido | `usuarios` | `estudiantes` |
|---|---|---|
| codigo | ✅ | ✅ |
| cedula | ✅ | ✅ |
| email | ✅ | ✅ |
| moodleId | ✅ | ✅ |
| telefono | ✅ | ✅ |

---

## 4. Tabla: `estudiantes_divisit` *(legacy)*

> **Rol:** Registro sincronizado desde el sistema externo **DIVISIT** (sistema académico institucional legado).  
> Contiene los datos de estudiantes tal como llegan del sistema origen.  
> No reemplaza a `estudiantes`, actúa como fuente de sincronización.

| Campo | Tipo | Descripción |
|---|---|---|
| codigo | AZ | **Clave primaria** — código del alumno en DIVISIT |
| activo | 123 | Estado activo en DIVISIT |
| desc_tipo_car | AZ | Descripción del tipo de carrera |
| documento | AZ | Número de documento |
| email | AZ | Correo electrónico |
| fecha_nacimiento | ⊘ | Fecha de nacimiento |
| fecha_sincronizacion | ⊘ | Última sincronización con DIVISIT |
| moodle_id | AZ | ID en Moodle |
| nom_carrera | AZ | Nombre de la carrera (texto plano desde DIVISIT) |
| primer_apellido | AZ | Primer apellido |
| primer_nombre | AZ | Primer nombre |
| segundo_apellido | AZ | Segundo apellido |
| segundo_nombre | AZ | Segundo nombre |
| t_matriculado | AZ | Tipo de matrícula |
| tipo_documento | AZ | Tipo de documento (CC, TI, etc.) |

### Comparativa: `estudiantes` vs `estudiantes_divisit`

| Aspecto | `estudiantes` | `estudiantes_divisit` |
|---|---|---|
| Origen | Sistema actual | Sistema DIVISIT (externo) |
| PK | `id` (autoincremental) | `codigo` (código DIVISIT) |
| Vinculado a `usuarios` | ✅ via `usuario_id` | ❌ No vinculado |
| Carrera | `programa_id` (FK normalizada) | `nom_carrera` (texto plano) |
| Uso | Operacional activo | Sincronización / referencia |

---

## 5. Tabla: `roles`

> **Rol:** Catálogo que define el tipo de cada usuario del sistema.

| Campo | Tipo | Descripción |
|---|---|---|
| id | 123 | Clave primaria |
| nombre | AZ | Nombre del rol (ej: Estudiante, Docente, Director, Evaluador) |

---

## 6. Tabla: `estados_estudiantes`

> **Rol:** Catálogo del estado académico actual de un estudiante.

| Campo | Tipo | Descripción |
|---|---|---|
| id | 123 | Clave primaria |
| nombre | AZ | Nombre del estado (ej: Activo, Retirado, Graduado, Suspendido) |

---

## 7. Tabla: `sesiones_activas`

> **Rol:** Registro de sesiones en curso en el sistema.  
> Se usa para control de tokens activos y expiración de sesión.

| Campo | Tipo | Descripción |
|---|---|---|
| correoUsuario | AZ | **PK** — vincula con `usuarios.email` |
| fecha_expiracion | ⊘ | Cuándo expira la sesión |
| token | AZ | Token de autenticación activo |
| ultima_actividad | ⊘ | Timestamp de última acción en el sistema |

---

## 8. Tabla: `admins`

> **Rol:** Administradores del sistema.  
> **Tabla completamente separada de `usuarios`** — los admins no tienen cuenta en `usuarios`.  
> Tienen credenciales propias y bandera de super administrador.

| Campo | Tipo | Descripción |
|---|---|---|
| id | 123 | Clave primaria |
| primer_nombre | AZ | Primer nombre |
| segundo_nombre | AZ | Segundo nombre |
| primer_apellido | AZ | Primer apellido |
| segundo_apellido | AZ | Segundo apellido |
| email | AZ | Correo electrónico / login |
| password | AZ | Contraseña (hash) |
| es_super_admin | 123 | `1` = Super admin con acceso total |
| activo | 123 | `1` = Activo en el sistema |

---

## 9. Flujo de gestión de un cliente

```
INGRESO AL SISTEMA
       │
       ▼
[sesiones_activas]  ←── token generado al hacer login
 correoUsuario ─────────────────────────┐
                                        │
                                        ▼
                                   [usuarios]
                                    rol_id ──► [roles]
                                       │
                            usuario_id │ (FK directa)
                                       ▼
                                 [estudiantes]
                                  ├── programa_id ──► [programas]
                                  ├── pensum_id ────► [pensums]
                                  ├── cohorte_id ───► [cohortes]
                                  └── estado_estudiante_id ► [estados_estudiantes]
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    ▼                     ▼                     ▼
              [matriculas]         [solicitudes]    [contraprestaciones]
              [notas_pregrado]     [soportes]
              [notas_posgrado]
                    │
                    ▼
         [usuario_proyecto] ──► [proyecto] ──► [sustentacion]
```

---

## 10. Tipos de clientes y su mapeo

| Tipo de cliente | Tabla de identidad | Tabla de perfil | Condición |
|---|---|---|---|
| Estudiante Pregrado | `usuarios` | `estudiantes` | `esPosgrado = 0` |
| Estudiante Posgrado | `usuarios` | `estudiantes` | `esPosgrado = 1` |
| Docente / Director investigación | `usuarios` | — | `rol_id` = rol docente |
| Evaluador de sustentación | `usuarios` | — | referenciado en `sustentacion_evaluador` |
| Administrador del sistema | `admins` | — | tabla independiente |
| Estudiante legacy (sin cuenta) | — | `estudiantes_divisit` | fuente DIVISIT |

---

## 11. Nota sobre el Director de Programa

> **Pregunta:** ¿En qué parte de la base de datos persiste la información del director de cada programa?

Analizando el esquema, **no existe un campo `director_id` explícito en la tabla `programas`**. Sin embargo, hay dos mecanismos donde esa información podría persistir:

### Opción A — A través de `cohorte_grupos` *(más probable)*

La tabla `cohorte_grupos` posee un campo `usuario_id` que vincula un usuario a un grupo-cohorte de un programa específico:

```
cohorte_grupos
├── programa_id  ──► [programas]   (a qué programa pertenece el grupo)
└── usuario_id   ──► [usuarios]    (quién es el responsable / director)
```

Esto sugiere que el **director de programa** es el `usuario` asignado al `cohorte_grupos` de su respectivo `programa_id`.

### Opción B — A través de `roles` + `usuarios`

El sistema podría asignar al director un rol específico (ej. `roles.nombre = "Director de Programa"`) en `usuarios.rol_id`, y la vista del sistema filtra el contenido según ese rol. En este caso, la relación director ↔ programa sería manejada a nivel de **lógica de aplicación**, no de FK en base de datos.

### Conclusión

La vista que viste en el sistema en vivo para el director probablemente consume datos de `usuarios` filtrados por `rol_id`, y la asociación con su programa específico se resuelve a través de `cohorte_grupos.usuario_id` + `cohorte_grupos.programa_id`. **El esquema actual no tiene un campo dedicado `director_id` en `programas`**, lo que puede ser una deuda técnica del diseño.
