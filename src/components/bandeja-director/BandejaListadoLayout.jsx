import React from 'react';
import { useNavigate } from 'react-router-dom';
import DirectorSidebar from './DirectorSidebar';
import { ArrowLeftIcon } from './icons';

/**
 * Shell compartido para todas las páginas de listado de solicitudes del director.
 * Maneja: sidebar, header cromático, breadcrumb, título+badge, botón volver,
 * estados de carga/error/vacío, y la estructura tabla (desktop) + tarjetas (móvil).
 *
 * Props:
 *   usuario         – usuario autenticado
 *   cfg             – objeto CONFIG[estado] con label, sublabel, icono, mensajeVacio, colores
 *   estado          – valor del param de ruta (:estado)
 *   breadcrumb      – texto antes del estado en el breadcrumb
 *   rutaVolver      – ruta del botón "Volver"
 *   solicitudes     – array de solicitudes del estado actual
 *   cargando        – boolean
 *   error           – string de error global
 *   errorAccion     – string de error de acción (aprobar/rechazar)
 *   columnas        – [{ header, render(s), headerClass?, tdClass? }]
 *   renderAcciones  – (s) => JSX  acciones en columna final de la tabla
 *   renderMobileCard– (s) => JSX  tarjeta para vista móvil
 */
const BandejaListadoLayout = ({
  usuario,
  cfg,
  estado,
  breadcrumb,
  rutaVolver,
  solicitudes = [],
  cargando,
  error,
  errorAccion,
  columnas = [],
  renderAcciones,
  renderMobileCard,
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <DirectorSidebar usuario={usuario} />

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header cromático según estado */}
          <header className={`flex items-center justify-between gap-4 px-6 py-4 text-white shadow-sm md:px-8 ${cfg.colores.header}`}>
            <h1 className="text-lg font-bold uppercase tracking-[0.18em] md:text-xl">
              DIRECTOR DE PROGRAMA
            </h1>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-sm font-semibold">
                {(usuario?.nombre || 'D').slice(0, 2).toUpperCase()}
              </div>
              <p className="hidden text-sm font-semibold sm:block">{usuario?.nombre}</p>
            </div>
          </header>

          <main className="flex-1 p-6 md:p-8">
            {/* Breadcrumb */}
            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {breadcrumb} / <span className="text-slate-600">{estado.toUpperCase()}</span>
            </div>

            {/* Título + botón volver */}
            <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${cfg.colores.iconWrapper}`}>
                  {cfg.icono}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-slate-900">{cfg.label}</h2>
                    {!cargando && (
                      <span className={`rounded-full px-3 py-0.5 text-sm font-bold ${cfg.colores.badge}`}>
                        {solicitudes.length}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500">{cfg.sublabel}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate(rutaVolver)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Volver a la bandeja
              </button>
            </div>

            {/* Error de acción */}
            {errorAccion && (
              <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {errorAccion}
              </div>
            )}

            {/* Carga */}
            {cargando && (
              <div className="flex items-center gap-3 text-slate-400">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <span className="text-sm">Cargando solicitudes…</span>
              </div>
            )}

            {/* Error global */}
            {error && <p className="font-medium text-red-600">{error}</p>}

            {/* Contenido */}
            {!cargando && !error && (
              <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                {solicitudes.length === 0 ? (
                  /* Estado vacío */
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-20 text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                      {cfg.icono}
                    </div>
                    <p className="text-sm font-medium text-slate-400">{cfg.mensajeVacio}</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop: tabla */}
                    <div className="hidden overflow-x-auto sm:block">
                      <table className="w-full">
                        <thead className="bg-slate-50">
                          <tr className="border-b border-slate-200">
                            {columnas.map((c) => (
                              <th
                                key={c.header}
                                className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 ${c.headerClass ?? ''}`}
                              >
                                {c.header}
                              </th>
                            ))}
                            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {solicitudes.map((s) => (
                            <tr key={s.id} className="hover:bg-slate-50">
                              {columnas.map((c) => (
                                <td key={c.header} className={`px-6 py-4 ${c.tdClass ?? ''}`}>
                                  {c.render(s)}
                                </td>
                              ))}
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-2">
                                  {renderAcciones(s)}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Móvil: tarjetas */}
                    <div className="space-y-4 p-4 sm:hidden">
                      {solicitudes.map((s) => renderMobileCard(s))}
                    </div>
                  </>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default BandejaListadoLayout;
