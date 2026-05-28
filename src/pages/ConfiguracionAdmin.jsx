import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { convocatoriasApi } from '../api/convocatoriasApi';
import { apiClient } from '../api/apiClient';
import { dependenciasApi } from '../api/dependenciasApi';

const formatPesos = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n || 0);

// ── Sección: Convocatoria ──────────────────────────────────────────────
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

  if (cargando) return <div className="text-sm text-slate-400">Cargando convocatoria…</div>;

  return (
    <form onSubmit={handleGuardar} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-1 text-lg font-bold text-slate-900">Convocatoria de Terminación de Materias</h3>
      <p className="mb-5 text-xs text-slate-500">Período en que los estudiantes pueden radicar su solicitud.</p>
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
  );
};

// ── Sección: Tipos de Certificado ──────────────────────────────────────
const TIPO_VACIO = {
  codigo: '',
  label: '',
  descripcion: '',
  precioDigital: 0,
  costoLogisticaFisica: 0,
  dependenciaCedula: '',
  direccionOficina: '',
  tiempoEntregaDias: 1,
  activo: true,
};

const SeccionTiposCertificado = () => {
  const [tipos, setTipos] = useState([]);
  const [dependencias, setDependencias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [edicion, setEdicion] = useState(null);  // null = sin form, {} = creando, {id...} = editando
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const [tipos, deps] = await Promise.all([
        apiClient('/admin/tipos-certificado'),
        apiClient('/dependencias'),
      ]);
      setTipos(tipos || []);
      setDependencias(deps || []);
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

  // Atajo: ↑/↓ sobre los inputs numéricos saltan de 1000 en 1000.
  // Con Shift, el salto es de 10.000. Permite teclear cualquier valor además.
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
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Tipos de Certificado</h3>
          <p className="text-xs text-slate-500">Configura los certificados que los estudiantes pueden solicitar.</p>
        </div>
        <button type="button" onClick={() => setEdicion({ ...TIPO_VACIO })}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
          + Nuevo tipo
        </button>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</div>}

      {cargando ? (
        <div className="py-8 text-center text-sm text-slate-400">Cargando…</div>
      ) : tipos.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-400">No hay tipos de certificado configurados.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                <th className="px-3 py-2 text-left">Código</th>
                <th className="px-3 py-2 text-left">Label</th>
                <th className="px-3 py-2 text-right">Precio digital</th>
                <th className="px-3 py-2 text-right">+ Logística física</th>
                <th className="px-3 py-2 text-left">Dependencia</th>
                <th className="px-3 py-2 text-center">Activo</th>
                <th className="px-3 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tipos.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-3 py-3 font-mono text-xs text-slate-700">{t.codigo}</td>
                  <td className="px-3 py-3 text-slate-800">{t.label}</td>
                  <td className="px-3 py-3 text-right text-slate-800">{formatPesos(t.precioDigital)}</td>
                  <td className="px-3 py-3 text-right text-slate-600">+{formatPesos(t.costoLogisticaFisica)}</td>
                  <td className="px-3 py-3 text-slate-600 text-xs">{t.dependenciaNombre || t.dependenciaCedula || '—'}</td>
                  <td className="px-3 py-3 text-center">
                    <button type="button" onClick={() => toggleActivo(t)}
                      className={`rounded-full px-3 py-0.5 text-xs font-semibold ${t.activo
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'}`}>
                      {t.activo ? 'Sí' : 'No'}
                    </button>
                  </td>
                  <td className="px-3 py-3 text-center">
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
                <select value={edicion.dependenciaCedula || ''}
                  onChange={(e) => setEdicion({ ...edicion, dependenciaCedula: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                  <option value="">— Sin asignar —</option>
                  {dependencias.map((d) => (
                    <option key={d.cedula} value={d.cedula}>{d.nombre}</option>
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

// ── Sección: Dependencias ──────────────────────────────────────────────
const DEP_VACIO  = { nombre: '', descripcion: '' };
const USER_VACIO = { nombreCompleto: '', cedula: '', codigo: '', correo: '', contrasena: '', dependenciaId: '' };

const SeccionDependencias = () => {
  const [items, setItems]               = useState([]);
  const [usuarios, setUsuarios]         = useState([]);
  const [cargando, setCargando]         = useState(true);
  const [error, setError]               = useState(null);
  const [edicion, setEdicion]           = useState(null);
  const [guardando, setGuardando]       = useState(false);
  const [nuevoUser, setNuevoUser]       = useState(null);
  const [guardandoUser, setGuardandoUser] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const [deps, users] = await Promise.all([
        dependenciasApi.listarCatalogo(),
        dependenciasApi.listarUsuarios(),
      ]);
      setItems(deps || []);
      setUsuarios(users || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const toggleActivo = async (dep) => {
    try {
      await dependenciasApi.toggleActivo(dep.id, !dep.activa);
      cargar();
    } catch (e) {
      setError(e.message);
    }
  };

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      if (edicion.id) {
        await dependenciasApi.actualizar(edicion.id, edicion);
      } else {
        await dependenciasApi.crear(edicion);
      }
      setEdicion(null);
      await cargar();
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  };

  const guardarUsuario = async (e) => {
    e.preventDefault();
    setGuardandoUser(true);
    setError(null);
    try {
      await dependenciasApi.crearUsuario({
        ...nuevoUser,
        dependenciaId: nuevoUser.dependenciaId ? Number(nuevoUser.dependenciaId) : null,
      });
      setNuevoUser(null);
      await cargar();
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardandoUser(false);
    }
  };

  const eliminarUsuario = async (cedula, nombre) => {
    if (!window.confirm(`¿Eliminar a "${nombre}" como responsable?`)) return;
    try {
      await dependenciasApi.eliminarUsuario(cedula);
      cargar();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Cabecera con acento rojo institucional */}
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-1.5 rounded-full bg-red-600" />
          <div>
            <h3 className="text-lg font-bold text-slate-900">Dependencias</h3>
            <p className="text-xs text-slate-500">
              Unidades que participan en el proceso de paz y salvos.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setEdicion({ ...DEP_VACIO })}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          + Nueva dependencia
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {cargando ? (
        <div className="py-8 text-center text-sm text-slate-400">Cargando…</div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-10 text-center">
          <p className="text-sm font-medium text-slate-400">No hay dependencias registradas.</p>
          <p className="mt-1 text-xs text-slate-400">
            Crea la primera con el botón de arriba.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                <th className="px-3 py-2 text-left">Nombre</th>
                <th className="px-3 py-2 text-left">Descripción</th>
                <th className="px-3 py-2 text-center">Estado</th>
                <th className="px-3 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((dep) => (
                <tr key={dep.id} className="hover:bg-slate-50">
                  <td className="px-3 py-3 font-semibold text-slate-900">{dep.nombre}</td>
                  <td className="px-3 py-3 text-slate-500 text-xs max-w-xs truncate">
                    {dep.descripcion || <span className="italic text-slate-300">Sin descripción</span>}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => toggleActivo(dep)}
                      title={dep.activa ? 'Click para desactivar' : 'Click para reactivar'}
                      className={`rounded-full px-3 py-0.5 text-xs font-semibold transition hover:opacity-80 ${
                        dep.activa
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {dep.activa ? 'Activa' : 'Inactiva'}
                    </button>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <button
                      type="button"
                      disabled={!dep.activa}
                      onClick={() => setEdicion({ ...dep })}
                      className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Subsección: Responsables ── */}
      <hr className="my-6 border-slate-100" />
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h4 className="font-semibold text-slate-800">Responsables</h4>
          <p className="text-xs text-slate-500">
            Usuarios que validan paz y salvos en el proceso de grado.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setNuevoUser({ ...USER_VACIO })}
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
        >
          + Agregar responsable
        </button>
      </div>

      {usuarios.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-8 text-center">
          <p className="text-sm font-medium text-slate-400">No hay responsables registrados.</p>
          <p className="mt-1 text-xs text-slate-400">
            Agrega el primero con el botón de arriba.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                <th className="px-3 py-2 text-left">Nombre</th>
                <th className="px-3 py-2 text-left">Cédula</th>
                <th className="px-3 py-2 text-left">Correo</th>
                <th className="px-3 py-2 text-left">Dependencia</th>
                <th className="px-3 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usuarios.map((u) => (
                <tr key={u.cedula} className="hover:bg-slate-50">
                  <td className="px-3 py-3 font-semibold text-slate-900">{u.nombreCompleto}</td>
                  <td className="px-3 py-3 font-mono text-xs text-slate-600">{u.cedula}</td>
                  <td className="px-3 py-3 text-xs text-slate-500">{u.correo || '—'}</td>
                  <td className="px-3 py-3">
                    {u.dependenciaNombre ? (
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                        {u.dependenciaNombre}
                      </span>
                    ) : (
                      <span className="text-xs italic text-slate-300">Sin asignar</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => eliminarUsuario(u.cedula, u.nombreCompleto)}
                      className="rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal crear / editar catálogo */}
      {edicion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <form
            onSubmit={guardar}
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="h-8 w-1.5 rounded-full bg-red-600" />
              <h3 className="text-lg font-bold text-slate-900">
                {edicion.id ? 'Editar dependencia' : 'Nueva dependencia'}
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input type="text" required value={edicion.nombre}
                  onChange={(e) => setEdicion({ ...edicion, nombre: e.target.value })}
                  placeholder="Ej: Biblioteca Central"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Descripción
                </label>
                <textarea rows={3} value={edicion.descripcion || ''}
                  onChange={(e) => setEdicion({ ...edicion, descripcion: e.target.value })}
                  placeholder="Descripción breve de la dependencia…"
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100" />
              </div>
            </div>
            {error && <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</div>}
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => { setEdicion(null); setError(null); }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Cancelar
              </button>
              <button type="submit" disabled={guardando}
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50">
                {guardando ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal nuevo responsable */}
      {nuevoUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <form onSubmit={guardarUsuario}
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-8 w-1.5 rounded-full bg-red-600" />
              <h3 className="text-lg font-bold text-slate-900">Agregar responsable</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Nombre completo <span className="text-red-500">*</span>
                </label>
                <input type="text" required value={nuevoUser.nombreCompleto}
                  onChange={(e) => setNuevoUser({ ...nuevoUser, nombreCompleto: e.target.value })}
                  placeholder="Ej: Biblioteca Central"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Cédula <span className="text-red-500">*</span>
                </label>
                <input type="text" required value={nuevoUser.cedula}
                  onChange={(e) => setNuevoUser({ ...nuevoUser, cedula: e.target.value })}
                  placeholder="1234567890"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Código
                </label>
                <input type="text" value={nuevoUser.codigo}
                  onChange={(e) => setNuevoUser({ ...nuevoUser, codigo: e.target.value })}
                  placeholder="DEP004"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Correo
                </label>
                <input type="email" value={nuevoUser.correo}
                  onChange={(e) => setNuevoUser({ ...nuevoUser, correo: e.target.value })}
                  placeholder="dependencia@ufps.edu.co"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <input type="password" required value={nuevoUser.contrasena}
                  onChange={(e) => setNuevoUser({ ...nuevoUser, contrasena: e.target.value })}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Dependencia asignada
                </label>
                <select value={nuevoUser.dependenciaId}
                  onChange={(e) => setNuevoUser({ ...nuevoUser, dependenciaId: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100">
                  <option value="">— Sin asignar —</option>
                  {items.filter(d => d.activa).map((d) => (
                    <option key={d.id} value={d.id}>{d.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
            {error && <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</div>}
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => { setNuevoUser(null); setError(null); }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Cancelar
              </button>
              <button type="submit" disabled={guardandoUser}
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50">
                {guardandoUser ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// ── Página principal ──────────────────────────────────────────────────
const ConfiguracionAdmin = () => {
  const navigate = useNavigate();
  const { usuario } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <header className="flex items-center justify-between gap-4 bg-slate-800 px-6 py-4 text-white shadow-sm md:px-8">
        <h1 className="text-lg font-bold uppercase tracking-[0.18em] md:text-xl">ADMINISTRADOR</h1>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-sm font-semibold">
            {(usuario?.nombre || 'A').slice(0, 2).toUpperCase()}
          </div>
          <p className="hidden text-sm font-semibold sm:block">{usuario?.nombre}</p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-6 md:p-10">
        <button type="button" onClick={() => navigate('/tramites')}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800">
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z" />
          </svg>
          Volver al panel
        </button>

        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          ADMINISTRACIÓN / CONFIGURACIÓN
        </div>
        <h2 className="mb-8 text-3xl font-bold text-slate-900">Configuración del módulo</h2>

        <div className="space-y-8">
          <SeccionConvocatoria />
          <SeccionTiposCertificado />
          <SeccionDependencias />
        </div>
      </main>
    </div>
  );
};

export default ConfiguracionAdmin;
