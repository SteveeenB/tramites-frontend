# Base de Datos — Tablas, Campos y Relaciones

> Notación de tipos: `INT` = numérico · `TEXT` = texto · `DATE` = fecha/datetime  
> `PK` = clave primaria · `FK` = clave foránea

---

## 1. Sincronización DIVISIT

### `estudiantes_divisit`
| Campo | Tipo | Relación |
|---|---|---|
| **codigo** | TEXT | PK |
| activo | INT | |
| desc_tipo_car | TEXT | |
| documento | TEXT | |
| email | TEXT | |
| fecha_nacimiento | DATE | |
| fecha_sincronizacion | DATE | |
| moodle_id | TEXT | |
| nom_carrera | TEXT | |
| primer_apellido | TEXT | |
| primer_nombre | TEXT | |
| segundo_apellido | TEXT | |
| segundo_nombre | TEXT | |
| t_matriculado | TEXT | |
| tipo_documento | TEXT | |

---

### `notas_divisit`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| activo | INT | |
| ciclo | TEXT | |
| cod_alumno | TEXT | |
| cod_carrera | TEXT | |
| cod_materia | TEXT | |
| def | INT | |
| estado_nota | TEXT | |
| ex | INT | |
| fecha_sincronizacion | DATE | |
| fecha_ultima_actualizacion | DATE | |
| grupo | TEXT | |
| hab | TEXT | |
| p1 | INT | |
| p2 | INT | |
| p3 | INT | |
| semestre | TEXT | |
| cod_car_mat | TEXT | |
| cod_mat_mat | TEXT | |

---

### `materias_matriculadas_divisit`
| Campo | Tipo | Relación |
|---|---|---|
| **cod_alumno** | TEXT | PK |
| **cod_car_mat** | TEXT | PK |
| **cod_carrera** | TEXT | PK |
| **cod_mat_mat** | TEXT | PK |
| **grupo** | TEXT | PK |
| activo | INT | |
| ciclo | TEXT | |
| cod_materia | TEXT | |
| estado | TEXT | |
| fecha_sincronizacion | DATE | |
| seccional | TEXT | |
| semestre | TEXT | |

---

### `grupos_divisit`
| Campo | Tipo | Relación |
|---|---|---|
| **ciclo** | TEXT | PK |
| **cod_carrera** | TEXT | PK |
| **cod_materia** | TEXT | PK |
| **grupo** | TEXT | PK |
| activo | INT | |
| cedido | TEXT | |
| cod_profesor | TEXT | |
| dirigido | TEXT | |
| fecha_sincronizacion | DATE | |
| moodle_id | TEXT | |
| notas_procesadas | TEXT | |
| num_alum_matriculados | INT | |
| num_max_alumnos | INT | |
| seccional | TEXT | |
| semestre | TEXT | |

---

### `profesores_divisit`
| Campo | Tipo | Relación |
|---|---|---|
| **cod_profesor** | TEXT | PK |
| activo | INT | |
| apellido1 | TEXT | |
| apellido2 | TEXT | |
| documento | TEXT | |
| email | TEXT | |
| fecha_sincronizacion | DATE | |
| moodle_id | TEXT | |
| nombre1 | TEXT | |
| nombre2 | TEXT | |
| tipo_documento | TEXT | |

---

### `materias_divisit`
| Campo | Tipo | Relación |
|---|---|---|
| **cod_carrera** | TEXT | PK |
| **cod_materia** | TEXT | PK |
| activa | TEXT | |
| activo | INT | |
| cod_dpto | TEXT | |
| creditos | INT | |
| fecha_sincronizacion | DATE | |
| hasa | INT | |
| hasl | INT | |
| hp | INT | |
| ht | INT | |
| hti | INT | |
| id_micro | INT | |
| modulo_acu_012 | TEXT | |
| moodle_id | TEXT | |
| multi_p | TEXT | |
| nbc | TEXT | |
| nombre | TEXT | |
| semestre | TEXT | |
| tipo_materia | TEXT | |
| unica_nota | TEXT | |
| pensum_id | INT | FK → `pensums`.id |
| semestre_pensum_id | INT | FK → `semestres_pensums`.id |

---

### `semestres_programas`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| moodleId | TEXT | |
| programa_id | INT | FK → `programas`.id |
| semestre_id | INT | FK → `semestres`.id |

---

## 2. Usuarios y Acceso

### `usuarios`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| cedula | TEXT | |
| codigo | TEXT | |
| email | TEXT | |
| foto_url | TEXT | |
| google_id | TEXT | |
| moodleId | TEXT | |
| nombreCompleto | TEXT | |
| primerApellido | TEXT | |
| primerNombre | TEXT | |
| segundoApellido | TEXT | |
| segundoNombre | TEXT | |
| telefono | TEXT | |
| rol_id | INT | FK → `roles`.id |

---

### `roles`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| nombre | TEXT | |

---

### `admins`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| primer_nombre | TEXT | |
| segundo_nombre | TEXT | |
| primer_apellido | TEXT | |
| segundo_apellido | TEXT | |
| email | TEXT | |
| password | TEXT | |
| es_super_admin | INT | |
| activo | INT | |

---

### `sesiones_activas`
| Campo | Tipo | Relación |
|---|---|---|
| **correoUsuario** | TEXT | PK |
| fecha_expiracion | DATE | |
| token | TEXT | |
| ultima_actividad | DATE | |

---

## 3. Estructura Académica

### `programas`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| codigo | TEXT | |
| es_posgrado | INT | |
| historicoMoodleId | TEXT | |
| moodleId | TEXT | |
| nombre | TEXT | |
| semestre_actual | TEXT | |
| tipo_programa_id | INT | FK → `tipos_programas`.id |

---

### `tipos_programas`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| nombre | TEXT | |
| moodle_id | TEXT | |

---

### `pensums`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| cantidadSemestres | INT | |
| moodleId | TEXT | |
| nombre | TEXT | |
| programa_id | INT | FK → `programas`.id |

---

### `semestres_pensums`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| moodleId | TEXT | |
| pensum_id | INT | FK → `pensums`.id |
| programa_id | INT | FK → `programas`.id |
| semestre_id | INT | FK → `semestres`.id |

---

### `semestres`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| nombre | TEXT | |
| numero | INT | |
| numeroRomano | TEXT | |

---

### `materias`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| codigo | TEXT | |
| creditos | TEXT | |
| moodleId | TEXT | |
| nombre | TEXT | |
| semestre | TEXT | |
| pensum_id | INT | FK → `pensums`.id |
| semestre_pensum_id | INT | FK → `semestres_pensums`.id |

---

### `linea_programa`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| nombre | TEXT | |
| id_programa | INT | FK → `programas`.id |

---

## 4. Estudiantes

### `estudiantes`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| apellido | TEXT | |
| apellido2 | TEXT | |
| cedula | TEXT | |
| codigo | TEXT | |
| email | TEXT | |
| esPosgrado | INT | |
| fechaIngreso | DATE | |
| fechaNacimiento | DATE | |
| migrado | INT | |
| moodleId | TEXT | |
| nombre | TEXT | |
| nombre2 | TEXT | |
| telefono | TEXT | |
| cohorte_id | INT | FK → `cohortes`.id |
| estado_estudiante_id | INT | FK → `estados_estudiantes`.id |
| pensum_id | INT | FK → `pensums`.id |
| programa_id | INT | FK → `programas`.id |
| usuario_id | INT | FK → `usuarios`.id |

---

### `estados_estudiantes`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| nombre | TEXT | |

---

### `cohortes`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| fechaCreacion | DATE | |
| nombre | TEXT | |

---

### `cohorte_grupos`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| nombre | TEXT | |
| cohorte_id | INT | FK → `cohortes`.id |
| estado_estudiante_id | INT | FK → `estados_estudiantes`.id |
| pensum_id | INT | FK → `pensums`.id |
| programa_id | INT | FK → `programas`.id |
| usuario_id | INT | FK → `usuarios`.id |

---

## 5. Matrículas y Notas

### `matriculas`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| correoEnviado | INT | |
| fechaCorreoEnviado | DATE | |
| fechaMatriculacion | DATE | |
| fechaNota | DATE | |
| nota | INT | |
| notaAbierta | INT | |
| nuevaMatricula | INT | |
| semestre | TEXT | |
| estado_matricula_id | INT | FK → `estados_matriculas`.id |
| estudiante_id | INT | FK → `estudiantes`.id |
| grupo_cohorte_id | INT | FK → `grupos_cohortes`.id |

---

### `estados_matriculas`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| nombre | TEXT | |

---

### `cambio_estado_matriculas`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| fechaCambioEstado | DATE | |
| semestre | TEXT | |
| usuarioCambioEstado | TEXT | |
| estado_matricula_id | INT | FK → `estados_matriculas`.id |
| matricula_id | INT | FK → `matriculas`.id |

---

### `notas_pregrado`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| es_modificable | INT | |
| estudiante_codigo | TEXT | ref. `estudiantes`.codigo |
| examen_final | TEXT | |
| fecha_modificacion | DATE | |
| fecha_registro | DATE | |
| habilitacion | INT | |
| modificado_por | TEXT | |
| moodle_course_id | TEXT | |
| moodle_last_sync | DATE | |
| moodle_student_id | TEXT | |
| moodle_sync_status | INT | |
| nota_definitiva | INT | |
| observaciones | TEXT | |
| oracle_ciclo | TEXT | |
| oracle_cod_alumno | TEXT | |
| oracle_cod_carrera | TEXT | |
| oracle_cod_materia | TEXT | |
| oracle_grupo | TEXT | |
| primer_previo | INT | |
| realizado_por | TEXT | |
| segundo_previo | INT | |
| tercera_nota | INT | |
| grupo_cohorte_id | INT | FK → `grupos_cohortes`.id |

---

### `notas_posgrado`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| fechaNota | DATE | |
| nota | INT | |
| realizadoPor | TEXT | |
| matricula_id | INT | FK → `matriculas`.id |

---

### `historial_cierre_notas`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| fecha_cierre | DATE | |
| grupo_cohorte_id | INT | FK → `grupos_cohortes`.id |
| matricula_id | INT | FK → `matriculas`.id |
| realizado_por | TEXT | |

---

## 6. Grupos y Cohortes

### `grupos_cohortes`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| fechaCreacion | DATE | |
| moodleId | TEXT | |
| semestre | TEXT | |
| semestreTerminado | INT | |
| cohorte_grupo_id | INT | FK → `cohorte_grupos`.id |
| cohorte_id | INT | FK → `cohortes`.id |
| docente_id | INT | FK → `usuarios`.id |
| grupo_id | INT | FK → `grupos`.id |

---

### `grupos`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| activo | INT | |
| codigo | TEXT | |
| nombre | TEXT | |
| materia_id | INT | FK → `materias`.id |

---

### `historico_grupos`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| fecha_creacion | DATE | |
| moodle_curso_historico_id | TEXT | |
| moodle_curso_original_id | TEXT | |
| grupo_cohorte_id | INT | FK → `grupos_cohortes`.id |
| historico_semestre_id | INT | FK → `historico_semestres`.id |

---

### `historico_semestres`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| fecha_fin | DATE | |
| fecha_inicio | DATE | |
| moodle_categoria_id | TEXT | |
| semestre | TEXT | |
| programa_id | INT | FK → `programas`.id |

---

### `coloquio`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| descripcion | TEXT | |
| fecha | DATE | |
| hora | DATE | |
| lugar | TEXT | |
| grupo_cohorte_id | INT | FK → `grupos_cohortes`.id |

---

### `coloquio_estudiante`
| Campo | Tipo | Relación |
|---|---|---|
| **idColoquio** | INT | PK · FK → `coloquio`.id |
| **idDocumento** | INT | PK |
| **idEstudiante** | INT | PK · FK → `estudiantes`.id |

---

## 7. Solicitudes, Soportes y Contraprestaciones

### `solicitudes`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| descripcion | TEXT | |
| estaAprobada | INT | |
| fechaAprobacion | DATE | |
| fechaCreacion | DATE | |
| estudiante_id | INT | FK → `estudiantes`.id |
| matricula_id | INT | FK → `matriculas`.id |
| solicitud_aplazamiento_id | INT | ref. propia |
| soporte_id | INT | FK → `soportes`.id |
| tipo_solicitud_id | INT | FK → `tipos_solicitudes`.id |

---

### `tipos_solicitudes`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| nombre | TEXT | |

---

### `soportes`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| extension | TEXT | |
| fecha_subida | DATE | |
| mime_type | TEXT | |
| nombre_archivo | TEXT | |
| peso | TEXT | |
| ruta | TEXT | |
| tamano_bytes | INT | |
| tipo | TEXT | |
| url_s3 | TEXT | |

---

### `contraprestaciones`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| actividades | TEXT | |
| aprobada | INT | |
| certificadoGenerado | INT | |
| fechaCertificado | DATE | |
| fechaCreacion | DATE | |
| fechaFin | DATE | |
| fechaInicio | DATE | |
| semestre | TEXT | |
| certificado_id | INT | FK → `soportes`.id |
| estudiante_id | INT | FK → `estudiantes`.id |
| soporte_id | INT | FK → `soportes`.id |
| tipo_contraprestacion_id | INT | FK → `tipos_contraprestaciones`.id |

---

### `tipos_contraprestaciones`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| nombre | TEXT | |
| porcentaje | TEXT | |

---

## 8. Investigación y Proyectos

### `proyecto`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| createdAt | DATE | |
| estadoActual | TEXT | |
| estadoRevision | TEXT | |
| comentarioRevision | TEXT | |
| objetivoGeneral | TEXT | |
| pregunta | TEXT | |
| problema | TEXT | |
| recomendacionDirectores | TEXT | |
| titulo | TEXT | |
| updatedAt | DATE | |
| id_linea_investigacion | INT | FK → `linea_investigacion`.id |

---

### `objetivo_especifico`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| avanceReal | INT | |
| avanceReportado | INT | |
| descripcion | TEXT | |
| codirector | INT | FK → `usuarios`.id |
| director | INT | FK → `usuarios`.id |
| fecha_fin | DATE | |
| fecha_inicio | DATE | |
| numeroOrden | INT | |
| id_proyecto | INT | FK → `proyecto`.id |

---

### `usuario_proyecto`
| Campo | Tipo | Relación |
|---|---|---|
| **idProyecto** | INT | PK · FK → `proyecto`.id |
| **idUsuario** | INT | PK · FK → `usuarios`.id |
| rol_id | INT | FK → `roles`.id |

---

### `documento`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| nombre | TEXT | |
| path | TEXT | |
| peso | TEXT | |
| tag | TEXT | |
| tipoArchivo | TEXT | |
| tipoDocumento | TEXT | |
| id_proyecto | INT | FK → `proyecto`.id |

---

### `retroalimentacion`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| descripcion | TEXT | |
| idDocumento | INT | FK → `documento`.id |
| idUsuario | INT | FK → `usuarios`.id |

---

### `definitiva`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| calificacion | INT | |
| honores | INT | |
| id_proyecto | INT | FK → `proyecto`.id |

---

### `meta_ods`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| nombre | TEXT | |

---

### `proyecto_meta_ods`
| Campo | Tipo | Relación |
|---|---|---|
| **proyecto_id** | INT | PK · FK → `proyecto`.id |
| **meta_ods_id** | INT | PK · FK → `meta_ods`.id |

---

### `linea_investigacion`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| nombre | TEXT | |
| id_grupo_investigacion | INT | FK → `grupo_investigacion`.id |
| id_lineaprograma | INT | FK → `linea_programa`.id |

---

### `grupo_investigacion`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| nombre | TEXT | |
| id_programa | INT | FK → `programas`.id |

---

### `macro`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| titulo | TEXT | |
| resumen | TEXT | |
| objetivo_general | TEXT | |
| objetivos_especificos | TEXT | |
| metodologia | TEXT | |

---

### `macro_grupo`
| Campo | Tipo | Relación |
|---|---|---|
| **id_macro** | INT | PK · FK → `macro`.id |
| **id_grupo** | INT | PK · FK → `grupo_investigacion`.id |

---

### `trabajos_orcid`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| orcid_id | TEXT | |
| titulo | TEXT | |
| tipo | TEXT | |
| fecha | DATE | |
| revista | TEXT | |
| doi | TEXT | |
| autores | TEXT | |
| creado_en | DATE | |
| actualizado_en | DATE | |
| codigo_profesor | TEXT | ref. `profesores_divisit`.cod_profesor |

---

## 9. Sustentación

### `sustentacion`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| asistenciaConfirmada | INT | |
| descripcion | TEXT | |
| fecha | DATE | |
| hora | DATE | |
| horaFin | DATE | |
| lugar | TEXT | |
| sustentacionExterna | INT | |
| sustentacionRealizada | INT | |
| tipoSustentacion | TEXT | |
| id_proyecto | INT | FK → `proyecto`.id |

---

### `sustentacion_documento`
| Campo | Tipo | Relación |
|---|---|---|
| **idDocumento** | INT | PK · FK → `documento`.id |
| **idSustentacion** | INT | PK · FK → `sustentacion`.id |

---

### `sustentacion_evaluador`
| Campo | Tipo | Relación |
|---|---|---|
| **idSustentacion** | INT | PK · FK → `sustentacion`.id |
| **idUsuario** | INT | PK · FK → `usuarios`.id |
| juradoExterno | INT | |
| nota | INT | |
| observaciones | TEXT | |

---

### `criterio_evaluacion`
| Campo | Tipo | Relación |
|---|---|---|
| **id** | INT | PK |
| descripcion | TEXT | |
| id_sustentacion | INT | FK → `sustentacion`.id |

---

## Resumen

| # | Grupo | Tablas |
|---|---|---|
| 1 | Sincronización DIVISIT | 7 |
| 2 | Usuarios y Acceso | 4 |
| 3 | Estructura Académica | 7 |
| 4 | Estudiantes | 4 |
| 5 | Matrículas y Notas | 6 |
| 6 | Grupos y Cohortes | 6 |
| 7 | Solicitudes, Soportes y Contraprestaciones | 5 |
| 8 | Investigación y Proyectos | 13 |
| 9 | Sustentación | 4 |
| | **Total** | **56 tablas** |
