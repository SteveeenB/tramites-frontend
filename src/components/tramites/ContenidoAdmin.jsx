import React from 'react';
import { useNavigate } from 'react-router-dom';
import TarjetaAccion from './TarjetaAccion';
import { PanelIcon, UsersIcon, SettingsIcon } from './icons';

const ContenidoAdmin = ({ datosModulo }) => {
  const navigate = useNavigate();
  const puedeGestionar = datosModulo?.acciones?.find((a) => a.codigo === 'GESTION_TOTAL')?.habilitada;

  return (
    <>
      <div className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        TRÁMITES / ADMINISTRACIÓN
      </div>
      <h2 className="mb-7 text-3xl font-bold text-slate-900">Panel Administrativo</h2>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <TarjetaAccion
          icono={<PanelIcon />}
          titulo="Panel General"
          descripcion="Vista general de todos los trámites activos, solicitudes pendientes y estadísticas del sistema."
          etiqueta="Ver panel"
          onClick={() => {}}
          deshabilitada={!puedeGestionar}
        />
        <TarjetaAccion
          icono={<UsersIcon />}
          titulo="Gestión de Usuarios"
          descripcion="Administra los usuarios del sistema: estudiantes, directores de programa y personal administrativo."
          etiqueta="Gestionar usuarios"
          onClick={() => {}}
          deshabilitada={!puedeGestionar}
        />
        <TarjetaAccion
          icono={<SettingsIcon />}
          titulo="Configuración"
          descripcion="Configura los parámetros del sistema, convocatorias, créditos requeridos por programa y más."
          etiqueta="Configurar"
          onClick={() => navigate('/tramites/admin/configuracion')}
          deshabilitada={!puedeGestionar}
        />
      </div>
    </>
  );
};

export default ContenidoAdmin;
