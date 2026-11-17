import React, { useState } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { solicitudesApi } from '../../api/solicitudesApi';

// TP-156: el estudiante descarga su acta de grado cuando la Oficina de
// Posgrados ya la generó. Si todavía no existe, el backend responde 422 con
// el motivo y aquí se muestra tal cual.
const DescargarActaGrado = ({ solicitudId, radicado }) => {
  const [descargando, setDescargando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const descargar = async () => {
    setDescargando(true);
    setMensaje(null);
    try {
      const { blob } = await solicitudesApi.descargarActaEstudiante(solicitudId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `acta-grado-${radicado || solicitudId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setMensaje(e?.message || 'No se pudo descargar el acta de grado.');
    } finally {
      setDescargando(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={descargar}
        disabled={descargando}
        className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ArrowDownTrayIcon className="h-4 w-4" aria-hidden="true" />
        {descargando ? 'Descargando…' : 'Descargar acta de grado'}
      </button>
      {mensaje && (
        <p role="status" className="mt-2 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800">
          {mensaje}
        </p>
      )}
    </div>
  );
};

export default DescargarActaGrado;
