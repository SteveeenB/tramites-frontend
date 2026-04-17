import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { solicitudesApi } from '../api/solicitudesApi';
import { ApiError } from '../api/apiClient';

const BANDEJA_VACIA = { pendientes: [], aprobadas: [], rechazadas: [] };

const mensajeDeError = (e) => {
  if (e instanceof ApiError) {
    if (e.status === 403) return 'No tienes permisos para ver esta bandeja.';
    if (e.status === 404) return 'Director no encontrado.';
    if (e.status >= 500) return 'Error en el servidor. Intenta más tarde.';
  }
  if (e.name === 'TypeError') return 'No se pudo conectar con el servidor.';
  return e.message || 'Error inesperado.';
};

export const useBandejaDirector = () => {
  const { usuario } = useAuth();

  const [bandeja, setBandeja]           = useState(BANDEJA_VACIA);
  const [cargando, setCargando]         = useState(true);
  const [error, setError]               = useState('');
  const [accionEnCurso, setAccion]      = useState(null); // id de la solicitud en proceso
  const [errorAccion, setErrorAccion]   = useState('');

  const cargarBandeja = useCallback(async () => {
    if (!usuario?.cedula) return;
    try {
      const data = await solicitudesApi.getBandejaDirector(usuario.cedula);
      setBandeja(data);
    } catch (e) {
      setError(mensajeDeError(e));
    }
  }, [usuario?.cedula]);

  useEffect(() => {
    setCargando(true);
    cargarBandeja().finally(() => setCargando(false));
  }, [cargarBandeja]);

  const aprobar = async (id) => {
    setAccion(id);
    setErrorAccion('');
    try {
      await solicitudesApi.aprobar(id, usuario.cedula);
      await cargarBandeja();
    } catch (e) {
      setErrorAccion(mensajeDeError(e));
    } finally {
      setAccion(null);
    }
  };

  const rechazar = async (id) => {
    setAccion(id);
    setErrorAccion('');
    try {
      await solicitudesApi.rechazar(id, usuario.cedula);
      await cargarBandeja();
    } catch (e) {
      setErrorAccion(mensajeDeError(e));
    } finally {
      setAccion(null);
    }
  };

  return { usuario, bandeja, cargando, error, aprobar, rechazar, accionEnCurso, errorAccion };
};
