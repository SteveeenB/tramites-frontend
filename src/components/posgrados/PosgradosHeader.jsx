import React from 'react';
import EncabezadoPagina from '../ui/EncabezadoPagina';

/**
 * Header común de cada sección administrativa de Posgrados.
 * Mantiene la jerarquía visual consistente entre todas las pestañas.
 */
const PosgradosHeader = ({ titulo, descripcion, breadcrumb, accion }) => (
  <EncabezadoPagina
    migas={breadcrumb ? `Administración / ${breadcrumb}` : undefined}
    titulo={titulo}
    descripcion={descripcion}
    acciones={accion}
  />
);

export default PosgradosHeader;
