import React, { useEffect, useState } from 'react';
import { convocatoriasApi } from '../../api/convocatoriasApi';
import PosgradosHeader from '../../components/posgrados/PosgradosHeader';

/**
 * Edición de la convocatoria global para Terminación de Materias.
 * Funcional — consume el endpoint real `/api/convocatorias`.
 */
const SeccionConvocatoria = () => {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(false);

  useEffect(() => {
    convocatoriasApi.getActiva()
      .then((data) => { setFechaInicio(data.fechaInicio); setFechaFin(data.fechaFin); })
      .catch(() => setError('No se pudo cargar la convocatoria actual.'))
      .finally(() => setCargando(false));
  }, []);

  const handleGuardar = async (e) => {
    e.preventDefault();
    setError(null); setExito(false); setGuardando(true);
    try {
      await convocatoriasApi.actualizar(fechaInicio, fechaFin);
      setExito(true);
    } catch (err) {
      setError(err.message || 'Error al guardar los cambios.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div>
      <PosgradosHeader
        breadcrumb="Convocatorias"
        titulo="Convocatorias"
        descripcion="Período en que los estudiantes pueden radicar su solicitud de Terminación de Materias. Próximamente: convocatorias por programa y por cohorte."
      />

      {cargando ? (
        <div className="text-sm text-slate-400">Cargando convocatoria…</div>
      ) : (
        <form onSubmit={handleGuardar} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-1 text-lg font-bold text-slate-900">Convocatoria activa</h3>
          <p className="mb-5 text-xs text-slate-500">Aplica a todos los programas de posgrado.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Fecha de inicio</label>
              <input type="date" required value={fechaInicio}
                onChange={(e) => { setFechaInicio(e.target.value); setExito(false); }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Fecha de cierre</label>
              <input type="date" required value={fechaFin}
                onChange={(e) => { setFechaFin(e.target.value); setExito(false); }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200" />
            </div>
          </div>
          {error && <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</div>}
          {exito && <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">Convocatoria actualizada correctamente.</div>}
          <button type="submit" disabled={guardando}
            className="mt-5 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50">
            {guardando ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </form>
      )}
    </div>
  );
};

export default SeccionConvocatoria;
