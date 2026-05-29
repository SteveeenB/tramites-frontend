import React from 'react';

/**
 * Aviso visual de "esta sección es un mockup". Lo muestran las páginas
 * cuyo backend aún no está implementado para que el usuario sepa que los
 * datos son simulados y los botones no persisten cambios reales.
 */
const AvisoMockup = ({ texto }) => (
  <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
    <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" fill="currentColor">
      <path d="M1 21h22L12 2 1 21zm11-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
    </svg>
    <div className="text-sm text-amber-800">
      <strong className="font-bold">Mockup de UI.</strong>{' '}
      {texto || 'Los datos mostrados son simulados. El backend aún no implementa esta funcionalidad — las acciones no persisten cambios.'}
    </div>
  </div>
);

export default AvisoMockup;
