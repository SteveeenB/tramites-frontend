import { useState, useEffect, useCallback, useRef } from 'react';
import { tramitesApi, crearSseStream } from '../api/tramitesApi';

export function useTramitesEnVivo() {
  const [tramites, setTramites] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [conectado, setConectado] = useState(false);
  const esRef = useRef(null);
  const reconectarRef = useRef(null);

  const cargarTramites = useCallback(async () => {
    try {
      const data = await tramitesApi.getMisTramites();
      setTramites(data || []);
      setError(null);
    } catch (e) {
      setError(e.message || 'No se pudieron cargar los trámites');
    } finally {
      setCargando(false);
    }
  }, []);

  const conectarSSE = useCallback(() => {
    // Limpia conexión anterior
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }

    const es = crearSseStream(
      // onEstadoActualizado — actualiza el trámite afectado sin recargar todo
      (evento) => {
        setTramites((prev) =>
          prev.map((t) =>
            t.id === evento.solicitudId
              ? { ...t, estado: evento.estadoNuevo, observaciones: evento.observaciones }
              : t
          )
        );
      },
      // onConectado
      () => setConectado(true),
      // onError — intenta reconectar en 5s
      () => {
        setConectado(false);
        reconectarRef.current = setTimeout(() => conectarSSE(), 5000);
      }
    );

    esRef.current = es;
  }, []);

  useEffect(() => {
    cargarTramites();
    conectarSSE();

    return () => {
      // Cleanup al desmontar
      if (esRef.current) esRef.current.close();
      if (reconectarRef.current) clearTimeout(reconectarRef.current);
    };
  }, [cargarTramites, conectarSSE]);

  return { tramites, cargando, error, conectado, recargar: cargarTramites };
}