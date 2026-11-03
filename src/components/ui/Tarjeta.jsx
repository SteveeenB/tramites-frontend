import React from 'react';
import { UI } from '../../constants/tramitesColors';

const PADDING = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' };

/** Contenedor blanco con borde gris y radio lg, el patrón de tarjeta de Matrícula. */
const Tarjeta = ({ as: Elemento = 'div', padding = 'lg', className = '', children, ...props }) => (
  <Elemento className={`${UI.tarjeta} ${PADDING[padding] ?? PADDING.lg} ${className}`} {...props}>
    {children}
  </Elemento>
);

export default Tarjeta;
