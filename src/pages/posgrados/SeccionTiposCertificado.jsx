import React, { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../../api/apiClient';
import PosgradosHeader from '../../components/posgrados/PosgradosHeader';

const formatPesos = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n || 0);

const TIPO_VACIO = {
  codigo: '',
  label: '',
  descripcion: '',
  precioDigital: 0,
  costoLogisticaFisica: 0,
  dependenciaId: null,
  direccionOficina: '',
  tiempoEntregaDias: 1,
  activo: true,
};

/**
 * CRUD de los tipos de certificado académico (HU11).
 * Funcional — consume `/api/admin/tipos-certificado` y `/api/dependencias`.
 */
const SeccionTiposCertificado = () => {
  const [tipos, setTipos] = useState([]);
  const [dependencias, setDependencias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [edicion, setEdicion] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const [t, d] = await Promise.all([
        apiClient('/admin/tipos-certificado'),
        apiClient('/dependencias/catalogo'),
      ]);
      setTipos(t || []);
      setDependencias((d || []).filter((dep) => dep.activa !== false));
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const toggleActivo = async (tipo) => {
    try {
      await apiClient(`/admin/tipos-certificado/${tipo.id}/activo?valor=${!tipo.activo}`, { method: 'PATCH' });
      cargar();
    } catch (e) { setError(e.message); }
  };

  const stepMil = (field) => (e) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    const base = e.shiftKey ? 10000 : 1000;
    const delta = e.key === 'ArrowUp' ? base : -base;
    const current = Number(edicion?.[field] || 0);
    setEdicion({ ...edicion, [field]: Math.max(0, current + delta) });
  };

  const guardarTipo = async (e) => {
    e.preventDefault();
    setGuardando(true); setError(null);
    try {
      const esNuevo = !edicion.id;
      const path = esNuevo ? '/admin/tipos-certificado' : `/admin/tipos-certificado/${edicion.id}`;
      await apiClient(path, {
        method: esNuevo ? 'POST' : 'PUT',
        body: JSON.stringify(edicion),
      });
      setEdicion(null);
      await cargar();
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div>
      <PosgradosHeader
        breadcrumb="Catálogos / Tipos de Certificado"
        titulo="Tipos de Certificado"
        descripcion="Define qué certificados pueden solicitar los estudiantes, su precio base, costo logístico físico y la dependencia encargada de su gestión."
        accion={
          <button type="button" onClick={() => setEdicion({ ...TIPO_VACIO })}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
            + Nuevo tipo
          </button>
        }
      />

      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</div>}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {cargando ? (
          <div className="py-12 text-center text-sm text-slate-400">Cargando…</div>
        ) : tipos.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">No hay tipos de certificado configurados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                  <th className="px-4 py-3 text-left">Código</th>
                  <th className="px-4 py-3 text-left">Label</th>
                  <th className="px-4 py-3 text-right">Precio digital</th>
                  <th className="px-4 py-3 text-right">+ Logística física</th>
                  <th className="px-4 py-3 text-left">Dependencia</th>
                  <th className="px-4 py-3 text-center">Activo</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tipos.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">{t.codigo}</td>
                    <td className="px-4 py-3 text-slate-800">{t.label}</td>
                    <td className="px-4 py-3 text-right text-slate-800">{formatPesos(t.precioDigital)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">+{formatPesos(t.costoLogisticaFisica)}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{t.dependenciaNombre || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <button type="button" onClick={() => toggleActivo(t)}
                        className={`rounded-full px-3 py-0.5 text-xs font-semibold ${t.activo
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'}`}>
                        {t.activo ? 'Sí' : 'No'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button type="button" onClick={() => setEdicion({ ...t })}
                        className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {edicion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <form onSubmit={guardarTipo} className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="mb-4 text-lg font-bold text-slate-900">
              {edicion.id ? 'Editar tipo de certificado' : 'Nuevo tipo de certificado'}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Código</label>
                <input type="text" required value={edicion.codigo} disabled={!!edicion.id}
                  onChange={(e) => setEdicion({ ...edicion, codigo: e.target.value.toUpperCase() })}
                  placeholder="CONSTANCIA_ALGO"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono disabled:bg-slate-50 disabled:text-slate-500" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Activo</label>
                <select value={edicion.activo} onChange={(e) => setEdicion({ ...edicion, activo: e.target.value === 'true' })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Label (visible al estudiante)</label>
                <input type="text" required value={edicion.label}
                  onChange={(e) => setEdicion({ ...edicion, label: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Descripción</label>
                <textarea rows={2} value={edicion.descripcion || ''}
                  onChange={(e) => setEdicion({ ...edicion, descripcion: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Precio digital (COP)
                  <span className="ml-2 font-normal normal-case text-[10px] text-slate-400">↑/↓ ±1.000</span>
                </label>
                <input step="any" type="number" min="0" required value={edicion.precioDigital}
                  onChange={(e) => setEdicion({ ...edicion, precioDigital: Number(e.target.value) })}
                  onKeyDown={stepMil('precioDigital')}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  + Costo logística física (COP)
                  <span className="ml-2 font-normal normal-case text-[10px] text-slate-400">↑/↓ ±1.000</span>
                </label>
                <input step="any" type="number" min="0" value={edicion.costoLogisticaFisica || 0}
                  onChange={(e) => setEdicion({ ...edicion, costoLogisticaFisica: Number(e.target.value) })}
                  onKeyDown={stepMil('costoLogisticaFisica')}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Dependencia encargada</label>
                <select value={edicion.dependenciaId ?? ''}
                  onChange={(e) => setEdicion({ ...edicion, dependenciaId: e.target.value ? Number(e.target.value) : null })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                  <option value="">— Sin asignar —</option>
                  {dependencias.map((d) => (
                    <option key={d.id} value={d.id}>{d.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Tiempo entrega (días)</label>
                <input type="number" min="0" value={edicion.tiempoEntregaDias || 0}
                  onChange={(e) => setEdicion({ ...edicion, tiempoEntregaDias: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Dirección de la oficina</label>
                <input type="text" value={edicion.direccionOficina || ''}
                  onChange={(e) => setEdicion({ ...edicion, direccionOficina: e.target.value })}
                  placeholder="Bloque A - Oficina 203"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setEdicion(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Cancelar
              </button>
              <button type="submit" disabled={guardando}
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50">
                {guardando ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SeccionTiposCertificado;
