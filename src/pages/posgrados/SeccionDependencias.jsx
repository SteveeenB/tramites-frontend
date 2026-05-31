import React, { useCallback, useEffect, useState } from 'react';
import { dependenciasApi } from '../../api/dependenciasApi';
import PosgradosHeader from '../../components/posgrados/PosgradosHeader';

/**
 * CRUD de dependencias y responsables que participan en el flujo de paz y salvos.
 * Funcional — consume `dependenciasApi` del equipo:
 *   - `/dependencias/catalogo`            (catálogo de dependencias)
 *   - `/dependencias/usuarios-dependencia` (responsables con rol DEPENDENCIA)
 *
 * Originalmente vivía en la página /tramites/admin/configuracion (ConfiguracionAdmin.jsx).
 * Se migró aquí para que viva como pestaña del sidebar, conservando la misma
 * lógica de backend.
 */

const DEP_VACIO  = { nombre: '', descripcion: '' };
const USER_VACIO = { nombreCompleto: '', codigo: '', correo: '', contrasena: '', dependenciaId: '' };

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

  const eliminarUsuario = async (codigo, nombre) => {
    if (!window.confirm(`¿Eliminar a "${nombre}" como responsable?`)) return;
    try {
      await dependenciasApi.eliminarUsuario(codigo);
      cargar();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div>
      <PosgradosHeader
        breadcrumb="Catálogos / Dependencias y Paz y Salvos"
        titulo="Dependencias y Paz y Salvos"
        descripcion="Catálogo de dependencias que emiten paz y salvo durante el proceso de grado, y los responsables que validan cada una."
        accion={
          <button type="button" onClick={() => setEdicion({ ...DEP_VACIO })}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
            + Nueva dependencia
          </button>
        }
      />

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/* ── Catálogo de dependencias ─────────────────────────────── */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h3 className="text-base font-bold text-slate-900">Dependencias</h3>
          <p className="text-xs text-slate-500">Unidades que participan en el proceso de paz y salvos.</p>
        </div>

        {cargando ? (
          <div className="py-12 text-center text-sm text-slate-400">Cargando…</div>
        ) : items.length === 0 ? (
          <div className="m-5 rounded-xl border-2 border-dashed border-slate-200 py-10 text-center">
            <p className="text-sm font-medium text-slate-400">No hay dependencias registradas.</p>
            <p className="mt-1 text-xs text-slate-400">Crea la primera con el botón de arriba.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                  <th className="px-4 py-3 text-left">Nombre</th>
                  <th className="px-4 py-3 text-left">Descripción</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((dep) => (
                  <tr key={dep.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{dep.nombre}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-xs truncate">
                      {dep.descripcion || <span className="italic text-slate-300">Sin descripción</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button type="button" onClick={() => toggleActivo(dep)}
                        title={dep.activa ? 'Click para desactivar' : 'Click para reactivar'}
                        className={`rounded-full px-3 py-0.5 text-xs font-semibold transition hover:opacity-80 ${
                          dep.activa
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                        {dep.activa ? 'Activa' : 'Inactiva'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button type="button" disabled={!dep.activa}
                        onClick={() => setEdicion({ ...dep })}
                        className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
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

      {/* ── Responsables ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Responsables</h3>
            <p className="text-xs text-slate-500">Usuarios que validan paz y salvos en el proceso de grado.</p>
          </div>
          <button type="button" onClick={() => setNuevoUser({ ...USER_VACIO })}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
            + Agregar responsable
          </button>
        </div>

        {usuarios.length === 0 ? (
          <div className="m-5 rounded-xl border-2 border-dashed border-slate-200 py-8 text-center">
            <p className="text-sm font-medium text-slate-400">No hay responsables registrados.</p>
            <p className="mt-1 text-xs text-slate-400">Agrega el primero con el botón de arriba.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                  <th className="px-4 py-3 text-left">Nombre</th>
                  <th className="px-4 py-3 text-left">Código</th>
                  <th className="px-4 py-3 text-left">Correo</th>
                  <th className="px-4 py-3 text-left">Dependencia</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuarios.map((u) => (
                  <tr key={u.codigo} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{u.nombreCompleto}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{u.codigo}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{u.correo || '—'}</td>
                    <td className="px-4 py-3">
                      {u.dependenciaNombre ? (
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                          {u.dependenciaNombre}
                        </span>
                      ) : (
                        <span className="text-xs italic text-slate-300">Sin asignar</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button type="button" onClick={() => eliminarUsuario(u.codigo, u.nombreCompleto)}
                        className="rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal crear / editar catálogo de dependencias */}
      {edicion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <form onSubmit={guardar} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="mb-5 text-lg font-bold text-slate-900">
              {edicion.id ? 'Editar dependencia' : 'Nueva dependencia'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input type="text" required value={edicion.nombre}
                  onChange={(e) => setEdicion({ ...edicion, nombre: e.target.value })}
                  placeholder="Ej: Biblioteca Central"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Descripción
                </label>
                <textarea rows={3} value={edicion.descripcion || ''}
                  onChange={(e) => setEdicion({ ...edicion, descripcion: e.target.value })}
                  placeholder="Descripción breve de la dependencia…"
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200" />
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
            <h3 className="mb-5 text-lg font-bold text-slate-900">Agregar responsable</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Nombre completo <span className="text-red-500">*</span>
                </label>
                <input type="text" required value={nuevoUser.nombreCompleto}
                  onChange={(e) => setNuevoUser({ ...nuevoUser, nombreCompleto: e.target.value })}
                  placeholder="Nombre del responsable"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Código <span className="text-red-500">*</span>
                </label>
                <input type="text" required value={nuevoUser.codigo}
                  onChange={(e) => setNuevoUser({ ...nuevoUser, codigo: e.target.value.toUpperCase() })}
                  placeholder="DEP004"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Correo
                </label>
                <input type="email" value={nuevoUser.correo}
                  onChange={(e) => setNuevoUser({ ...nuevoUser, correo: e.target.value })}
                  placeholder="dependencia@ufps.edu.co"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <input type="password" required value={nuevoUser.contrasena}
                  onChange={(e) => setNuevoUser({ ...nuevoUser, contrasena: e.target.value })}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Dependencia asignada
                </label>
                <select value={nuevoUser.dependenciaId}
                  onChange={(e) => setNuevoUser({ ...nuevoUser, dependenciaId: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                  <option value="">— Sin asignar —</option>
                  {items.filter((d) => d.activa).map((d) => (
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

export default SeccionDependencias;
