import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Alerta, Badge, Boton, Cargando, EncabezadoPagina } from '../ui';
import { UI } from '../../constants/tramitesColors';

/**
 * Shell compartido para todas las páginas de listado de solicitudes del director.
 * Maneja: breadcrumb, título+badge, botón volver, estados de carga/error/vacío,
 * y la estructura tabla (desktop) + tarjetas (móvil).
 *
 * Props:
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
    <>
      <EncabezadoPagina
        migas={`${breadcrumb} / ${estado}`}
        titulo={(
          <span className="flex items-center gap-3">
            <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${cfg.colores.iconWrapper}`}>
              {cfg.icono}
            </span>
            {cfg.label}
          </span>
        )}
        etiqueta={!cargando && <Badge className={cfg.colores.badge}>{solicitudes.length}</Badge>}
        descripcion={cfg.sublabel}
        acciones={(
          <Boton variante="secundario" icono={ArrowLeftIcon} onClick={() => navigate(rutaVolver)}>
            Volver a la bandeja
          </Boton>
        )}
      />

      {errorAccion && <Alerta tipo="error" className="mb-4">{errorAccion}</Alerta>}

      {cargando && <Cargando texto="Cargando solicitudes…" />}

      {error && <Alerta tipo="error">{error}</Alerta>}

      {!cargando && !error && (
        <div className={`${UI.tarjeta} animate-fade-in-up`}>
          {solicitudes.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                {cfg.icono}
              </div>
              <p className="text-sm font-medium text-gray-500">{cfg.mensajeVacio}</p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200">
                      {columnas.map((c) => (
                        <th
                          key={c.header}
                          scope="col"
                          className={`px-6 py-4 text-left text-sm font-semibold text-gray-600 ${c.headerClass ?? ''}`}
                        >
                          {c.header}
                        </th>
                      ))}
                      <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-gray-600">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {solicitudes.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50">
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

              <div className="space-y-4 p-4 sm:hidden">
                {solicitudes.map((s) => renderMobileCard(s))}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default BandejaListadoLayout;
