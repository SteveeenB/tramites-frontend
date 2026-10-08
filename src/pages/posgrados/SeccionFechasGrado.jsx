import React, { useState, useEffect, useCallback } from 'react';
import PosgradosHeader from '../../components/posgrados/PosgradosHeader';
import { fechasGradoApi } from '../../api/fechasGradoApi';
import { formatearFechaGrado } from '../../constants/procesodeGrado';

const hoyISO = () => new Date().toISOString().slice(0, 10);
const VACIO = { fecha: '', modalidad: 'CEREMONIA', hora: '', lugar: '' };

/* ─── Modal de creación / edición ───────────────────────────────────── */
const ModalFecha = ({ inicial, onGuardar, onCancelar }) => {
  const editando = !!inicial?.id;
  const [form, setForm] = useState(inicial ? {
    fecha: inicial.fecha, modalidad: inicial.modalidad, hora: inicial.hora, lugar: inicial.lugar,
  } : VACIO);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  const handleGuardar = async () => {
    if (!form.fecha || !form.hora.trim() || !form.lugar.trim()) {
      setError('Completa la fecha, la hora y el lugar.');
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      const resultado = editando
        ? await fechasGradoApi.actualizar(inicial.id, form)
        : await fechasGradoApi.crear(form);
      onGuardar(resultado);
    } catch (e) {
      setError(e.message || 'No se pudo guardar la fecha.');
      setGuardando(false);
    }
  };

  const input = 'w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-slate-500 focus:outline-none';
  const label = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && !guardando) onCancelar(); }}>
      <div className="mx-4 w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <h3 className="mb-4 text-base font-bold text-slate-900">{editando ? 'Editar fecha de grado' : 'Nueva fecha de grado'}</h3>

        <div className="space-y-4">
          <div>
            <label className={label}>Fecha</label>
            <input type="date" value={form.fecha} min={editando ? undefined : hoyISO()} onChange={set('fecha')} className={input} />
          </div>
          <div>
            <label className={label}>Modalidad</label>
            <select value={form.modalidad} onChange={set('modalidad')} className={input}>
              <option value="CEREMONIA">🎓 Ceremonia (costo adicional)</option>
              <option value="SECRETARIA">📄 Secretaría (sin costo extra)</option>
            </select>
          </div>
          <div>
            <label className={label}>Hora</label>
            <input type="text" value={form.hora} placeholder="9:00 AM" onChange={set('hora')} className={input} />
          </div>
          <div>
            <label className={label}>Lugar</label>
            <input type="text" value={form.lugar} placeholder="Auditorio Principal UFPS" onChange={set('lugar')} className={input} />
          </div>
        </div>

        {error && <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{error}</p>}

        <div className="mt-5 flex gap-3">
          <button type="button" onClick={onCancelar} disabled={guardando}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            Cancelar
          </button>
          <button type="button" onClick={handleGuardar} disabled={guardando}
            className="flex-1 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50">
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Sección principal ─────────────────────────────────────────────── */
const SeccionFechasGrado = () => {
  const [fechas, setFechas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [errorAccion, setErrorAccion] = useState(null);
  const [modal, setModal] = useState(null); // null | {} (nueva) | fecha (editar)

  const cargar = useCallback(async () => {
    setError(null);
    try {
      setFechas((await fechasGradoApi.listar()) || []);
    } catch (e) {
      setError(e.message || 'No se pudieron cargar las fechas de grado.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const accion = async (fn) => {
    setErrorAccion(null);
    try { await fn(); await cargar(); } catch (e) { setErrorAccion(e.message || 'No se pudo completar la acción.'); }
  };

  const alternarActiva = (f) => accion(() => fechasGradoApi.actualizar(f.id, { activa: !f.activa }));
  const eliminar = (f) => {
    if (!window.confirm(`¿Eliminar la fecha del ${formatearFechaGrado(f.fecha)} (${f.hora})?`)) return;
    accion(() => fechasGradoApi.eliminar(f.id));
  };

  const estado = (f) => {
    if (f.fecha < hoyISO()) return { texto: 'Vencida', clase: 'bg-slate-200 text-slate-500' };
    return f.activa
      ? { texto: 'Publicada', clase: 'bg-emerald-100 text-emerald-700' }
      : { texto: 'Oculta', clase: 'bg-amber-100 text-amber-700' };
  };

  return (
    <div>
      <PosgradosHeader
        breadcrumb="Catálogos / Fechas de Grado"
        titulo="Fechas de Grado"
        descripcion="Publica las fechas que los estudiantes podrán elegir en el Paso 3 del proceso de grado. Solo se ofrecen las publicadas y no vencidas."
        accion={
          <button type="button" onClick={() => setModal({})}
            className="rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">
            + Nueva fecha
          </button>
        }
      />

      {cargando && <p className="text-sm text-slate-400">Cargando fechas de grado…</p>}
      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
      {errorAccion && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{errorAccion}</p>}

      {!cargando && !error && fechas.length === 0 && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Aún no hay fechas de grado. Mientras no publiques ninguna, los estudiantes no podrán completar el Paso 3.
        </p>
      )}

      {!cargando && !error && fechas.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Modalidad</th>
                <th className="px-4 py-3 text-left">Hora</th>
                <th className="px-4 py-3 text-left">Lugar</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fechas.map((f) => {
                const est = estado(f);
                return (
                  <tr key={f.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{formatearFechaGrado(f.fecha)}</td>
                    <td className="px-4 py-3 text-slate-700">{f.modalidad === 'CEREMONIA' ? '🎓 Ceremonia' : '📄 Secretaría'}</td>
                    <td className="px-4 py-3 text-slate-700">{f.hora}</td>
                    <td className="px-4 py-3 text-slate-700">{f.lugar}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${est.clase}`}>{est.texto}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button type="button" onClick={() => setModal(f)}
                          className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                          Editar
                        </button>
                        <button type="button" onClick={() => alternarActiva(f)}
                          className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                          {f.activa ? 'Ocultar' : 'Publicar'}
                        </button>
                        <button type="button" onClick={() => eliminar(f)}
                          className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <ModalFecha
          inicial={modal.id ? modal : null}
          onGuardar={() => { setModal(null); cargar(); }}
          onCancelar={() => setModal(null)}
        />
      )}
    </div>
  );
};

export default SeccionFechasGrado;
