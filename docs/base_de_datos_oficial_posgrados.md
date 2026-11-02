# Esquema de la BD oficial de Posgrados

> **Última actualización:** 2026-05-31  
> Campos añadidos tras cruzar con `clientes_finales_sistema.md` (compartido por el equipo oficial). Cambios resumidos al final del archivo en la sección "Cambios 2026-05-31".

---

📋 MÓDULO: DIVISIT (Sincronización externa)
estudiantes_divisit
codigo, active, desc_tipo_car, documento, email, fecha_nacimiento, fecha_sincronizacion, moodle_id, nom_carrera, primer_apellido, primer_nombre, segundo_apellido, t_matriculado, tipo_documento
notas_divisit
id, active, ciclo, cod_alumno, cod_carrera, cod_materia, def, estado_nota, ex, fecha_sincronizacion, fecha_ultima_actualizacion, grupo, hab, p1, p2, p3, semestre, cod_mat_mat
materias_matriculadas_divisit
id, cod_car_mat, cod_alumno, cod_materia, cod_mat_not, grupo
grupos_divisit
ciclo, cod_carrera, cod_materia, cod_seccional, grupo, active, titulo, calido, cod_profesor, correo, dogodo, fecha_sincronizacion, moodle_id, notas_procesadas, num_alum_matriculados, num_max_alumnos, seccional, semestre
profesores_divisit
cod_profesor, active, apellido1, apellido2, documento, email, fecha_sincronizacion, moodle_id, nombre1, nombre2, tipo_documento
materia_divisit
cod_carrera, cod_materia, active, cod_dpto, creditos, fecha_sincronizacion, finca, had, hp, hd, nls, micro, moodle_pro_f72, multi_gr, multi_p, nombre, tipo_materia, unica_nota, semestre_pensum_id

👩‍🎓 MÓDULO: ESTUDIANTES Y MATRÍCULAS
estudiantes
id, apellido1, apellido2, cedula, codigo, email, esPregrado, fechaIngreso, fechaNacimiento, migrado, moodleid, nombre, nombre2, telefono, estado_estudiante_id, cohorte_id, pensum_id, programa_id, usuario_id
matriculas
id, correcEnviado, fechaCorrEnviado, fechaMatricula, notaAbierta, nuevaMatricula, semestre, estado_matricula_id, fechoHolista, nota, grupo_cohorte_id
cambio_estado_matriculas
id, fechaCambioEstado, semestre, usuarioCambioEstado, estado_matricula_id, matricula_id
estados_matriculas
id, nombre
estados_estudiantes
id, nombre
notas_pregrado (tabla de registro básico)
id, fechaHolista, nota, matricula_id
notas_pregrado (tabla extendida de notas)
id, es_modificable, estudiante_codigo, examen_final, fecha_modificacion, habilitacion, modificado_por, moodle_course_id, nota_definitiva, moodle_last_sync, moodle_student_id, moodle_sync_status, observaciones, oracle_cod_carrera, oracle_cod_materia, oracle_cod_grupo, oracle_nota, fechaFin, realizado_por, segundo_premio, tercera_nota, grupo_cohorte_id
solicitudes
id, descripcion, fechaAprobada, fechaSolicitud, estado_id, estudiante_id, matricula_id, solicitud_aplazamiento_id, soporte_id, tipo_solicitud_id
tipos_solicitudes
id, nombre

📚 MÓDULO: ACADÉMICO / PROGRAMAS
programas
id, es_pregrado, historicoMoodleid, moodleid, nombre, semestre_actual, tipo_programa_id
tipos_programas
id, nombre, moodle_id
pensum
id, cantidadSemestres, moodleid, historico, historicoMoodleid, nombre, semestre_actual, tipo_programa_id
semestres_programas
id, moodleid, programa_id, semestre_id
semestres_pensum
id, nombre, moodleid, tipo_materia, unica_nota, semestre_id, programa_id
semestres
id, nombre, numero, numero_romano
materias
id, nombre, creditos, moodleid, pensum_id, semestre, semestre_pensum_id
linea_programa
id, nombre, id_programa

👥 MÓDULO: COHORTES Y GRUPOS
cohortes
id, fechaCreacion, nombre
cohorte_grupos
id, nombre, estado_estudiante_id, pensum_id, usuario_id
grupos_cohortes
id, active, codigo, fechaCreacion, moodleid, nombre1, nombre2, programa_id, semestreTerminado, cohorte_grupo_id, docente_id, grupo_id
grupos
id, active, codigo, materia_id
historico_grupos
id, fecha_creacion, moodle_curso_historico_id, moodle_curso_original_id, grupo_cohorte_id, historico_semestre_id
historico_semestres
id, fecha_fin, fecha_inicio, moodle_categoria_id, semestre, programa_id

🔬 MÓDULO: INVESTIGACIÓN
proyecto
id, estadoActual, estadoRevision, comentarioDirectores, objetivoGeneral, pregunta, problema, recomendacionDirectores, titulo, moodle_id, id_linea_investigacion
linea_investigacion
id, nombre, id_grupo_investigacion, id_lineaprograma
grupo_investigacion
id, nombre, id_programa
objetivo_especifico
id, avanceFinal, avanceReporteSO, descripcion, cohort, director, fecha_fin, fecha_inicio, numeroOrden, pensum_id, id_proyecto
definitiva
id, calificacion, honores, id_proyecto
usuario_proyecto
id, idUsuario, idProyecto
documento
id, nombre, path, peso, tipo, tipoObjetivo, tipoDocumento, id_proyecto
retroalimentacion
id, descripcion, tipoDocumento, idUsuario
sustentacion
id, sustentacionConfirmada, descripcion, fecha, hora, horaFin, lugar, sustentacionExterna, sustentacionRealizada, tipoSustentacion, id_proyecto
sustentacion_documento
idDocumento, idSustentacion
sustentacion_evaluador
idUsuario, idProyecto, condEsterno, nota, observaciones
criterio_evaluacion
id, descripcion, id_sustentacion
meta_ods
id, nombre
proyecto_meta_ods
proyecto_id, meta_od_id
macro
id, titulo, resumen, objetivo_general, objetivos_especificos, metodologia
macro_grupo
id_macro, id_grupo

🎓 MÓDULO: COLOQUIOS Y CONTRAPRESTACIONES
coloquio
id, descripcion, fecha, hora, lugar, grupo_cohorte_id
coloquio_estudiante
idColoquio, idDocumento, idEstudiante
contraprestaciones
id, active, aprobada, certificadoGenerado, fechaCertificado, fechaCreacion, fechaFin, fechaInicio, certificado_id, estudiante_id, soporte_id, tipo_contraprestacion_id
tipos_contraprestaciones
id, nombre, porcentaje

📎 MÓDULO: SOPORTES Y ARCHIVOS
soportes
id, extension, fecha_subida, mime_type, nombre, peso, rate, tamano_bytes, tipo, sol_id

👤 MÓDULO: USUARIOS Y ROLES
usuarios
id, cedula, codigo, email, foto_url, google_id, grupo_id, moodleid, nombreCompleto, primerApellido, primerNombre, segundoApellido, segundoNombre, telefono, rol_id
roles
id, nombre
admins
id, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, email, password, es_super_admin, active
sesiones_archivo
correoUsuario, fecha_expiracion, token, ultima_actividad

📝 MÓDULO: HISTÓRICOS Y REGISTROS
historial_cierre_notas
id, cod_carrera, cod_grupo, grupo_cohorte_id, matricula_id, realizado_por
trabajos_social
id, encid_id, titulo, tipo, autor, revista, doc, password, credito_ait, programa_en, codigo_profesor

---

## Cambios 2026-05-31

Tras cruzar este archivo con `clientes_finales_sistema.md` (compartido por el equipo oficial), se añadieron campos que faltaban en la versión anterior. Lo que sigue es el detalle de los cambios para que el equipo no se confunda y nadie asuma que faltan campos.

### Campos añadidos

**`estudiantes`** (módulo Estudiantes y Matrículas):
- `email` — correo institucional (también está duplicado en `usuarios` por trazabilidad).
- `pensum_id` — FK a `pensum` (plan de estudios del estudiante).
- `programa_id` — FK a `programas` (carrera del estudiante).
- `usuario_id` — FK a `usuarios.id` (relación directa estudiante↔usuario). Este campo ya estaba en la última versión pero se documenta aquí por su importancia.

**`usuarios`** (módulo Usuarios y Roles):
- `email` — correo electrónico, usado para sesión y como dato compartido con `estudiantes`/`admins`.
- `google_id` — identificador OAuth para SSO con Google.

### Divergencias de nomenclatura pendientes de confirmar con el equipo oficial

Estas son **inconsistencias entre los dos documentos oficiales que recibimos**, no errores de transcripción. Se mantienen los nombres que aparecen en este archivo (el más detallado a nivel de módulos), y se anotan aquí para evitar ambigüedad.

| Tabla | Este archivo | `clientes_finales_sistema.md` | Comentario |
|---|---|---|---|
| `estudiantes` | `esPregrado` | `esPosgrado` | Mismo campo con interpretación inversa (`true` = pregrado vs `true` = posgrado). Funcionalmente equivalente pero **el nombre canónico hay que confirmarlo** con el equipo oficial antes de cualquier integración. |
| (tabla de sesiones) | `sesiones_archivo` | `sesiones_activas` | Mismos campos (`correoUsuario`, `token`, `fecha_expiracion`, `ultima_actividad`). Probablemente sea la misma tabla con dos nombres documentados. |
| `estudiantes` | `apellido1, apellido2, nombre, nombre2` | `apellido, apellido2, nombre, nombre2` | Mismo campo, primer apellido nombrado de forma diferente. |

### Cómo usar este documento

- Este archivo es **descriptivo** del esquema oficial — refleja lo que el equipo oficial nos ha compartido sobre su BD.
- **No es el esquema de nuestro módulo de trámites.** Para nuestro modelo ver `SQL_BD_Tramites_posgrados.txt` y `plan_integracion_bd_oficial.md`.
- Cualquier discrepancia entre este archivo y la BD real del equipo oficial debe resolverse pidiendo aclaración directa, no asumiendo.

**Documentos relacionados:**
- [`clientes_finales_sistema.md`](clientes_finales_sistema.md) — análisis enfocado en las entidades de identidad (usuarios, estudiantes, admins, roles, sesiones).
- [`Roles_bd_oficial.docx`](Roles_bd_oficial.docx) — desglose de roles globales vs contextuales en la oficial.
- [`plan_integracion_bd_oficial.md`](plan_integracion_bd_oficial.md) — estrategia de integración con la BD oficial.
- [`plan_roles_v2.md`](plan_roles_v2.md) §11 — auditoría de nuestro modelo contra los anteriores.