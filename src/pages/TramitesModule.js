import React, { useEffect, useMemo, useState } from 'react';
import TramitesSidebar from '../components/TramitesSidebar';
import './TramitesModule.css';

const TramitesModule = () => {
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [menuSeleccionado, setMenuSeleccionado] = useState('');

  useEffect(() => {
    const cargarTramites = async () => {
      try {
        setCargando(true);
        const response = await fetch('http://localhost:8080/api/tramites');

        if (!response.ok) {
          throw new Error('No fue posible cargar el modulo de tramites');
        }

        const json = await response.json();
        setData(json);
        if (json.sidebar && json.sidebar.length > 0) {
          setMenuSeleccionado(json.sidebar[0].id);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setCargando(false);
      }
    };

    cargarTramites();
  }, []);

  const accionesVisibles = useMemo(() => {
    if (!data?.acciones) {
      return [];
    }
    return data.acciones.filter((accion) => accion.habilitada);
  }, [data]);

  if (cargando) {
    return <div className="tramites-status">Cargando modulo de tramites...</div>;
  }

  if (error) {
    return <div className="tramites-status error">{error}</div>;
  }

  if (!data) {
    return <div className="tramites-status">Sin datos de tramites</div>;
  }

  return (
    <div className="tramites-layout">
      <TramitesSidebar
        items={data.sidebar}
        seleccionado={menuSeleccionado}
        onSeleccionar={(item) => setMenuSeleccionado(item.id)}
      />

      <section className="tramites-main">
        <h2>Modulo de Tramites</h2>
        <p>
          Usuario: <strong>{data.usuario?.nombre}</strong> ({data.usuario?.rol})
        </p>

        <div className="tramites-card">
          <h3>Acciones disponibles</h3>
          <div className="tramites-actions">
            {accionesVisibles.map((accion) => (
              <button key={accion.codigo} className="tramites-action-btn" type="button">
                {accion.label}
              </button>
            ))}
          </div>
        </div>

        <div className="tramites-card">
          <h3>Opcion seleccionada del sidebar</h3>
          <p>{menuSeleccionado || 'Ninguna'}</p>
        </div>
      </section>
    </div>
  );
};

export default TramitesModule;
