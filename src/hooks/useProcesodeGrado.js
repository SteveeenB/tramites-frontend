import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { tramitesApi } from '../api/tramitesApi';
import { solicitudesApi } from '../api/solicitudesApi';
import { ApiError } from '../api/apiClient';

const mensajeDeError = (e) => {
  if (e instanceof ApiError) {
    if (e.status === 404) return 'Estudiante no encontrado.';
    if (e.status === 422) return e.message; // mensaje de negocio del backend
    if (e.status >= 500) return 'Error en el servidor. Intenta más tarde.';
  }
  if (e.name === 'TypeError') return 'No se pudo conectar con el servidor.';
  return e.message || 'Error inesperado.';
};

export const useProcesodeGrado = () => {
  const { usuario } = useAuth();

  const [datos, setDatos]                   = useState(null);
  const [solicitud, setSolicitud]           = useState(null);
  const [cargando, setCargando]             = useState(true);
  const [enviando, setEnviando]             = useState(false);
  const [errorPagina, setErrorPagina]       = useState('');
  const [errorSolicitud, setErrorSolicitud] = useState('');

  const cargarDatos = useCallback(async () => {
    if (!usuario?.cedula) return;
    setCargando(true);
    setErrorPagina('');
    try {
      const [proceso, solicitudes] = await Promise.allSettled([
        tramitesApi.getProcesoGrado(usuario.cedula),
        solicitudesApi.getByCedula(usuario.cedula),
      ]);

      if (proceso.status === 'rejected') throw proceso.reason;
      setDatos(proceso.value);

      if (solicitudes.status === 'fulfilled') {
        const terminacion = solicitudes.value.find((s) => s.tipo === 'TERMINACION_MATERIAS');
        if (terminacion) setSolicitud(terminacion);
      }
    } catch (e) {
      setErrorPagina(mensajeDeError(e));
    } finally {
      setCargando(false);
    }
  }, [usuario?.cedula]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const solicitarTerminacion = async () => {
    setEnviando(true);
    setErrorSolicitud('');
    try {
      const nueva = await solicitudesApi.crearTerminacion(usuario.cedula);
      setSolicitud(nueva);
    } catch (e) {
      setErrorSolicitud(mensajeDeError(e));
    } finally {
      setEnviando(false);
    }
  };

  // Solo cálculos visuales — la lógica de negocio la decide el backend
  const aprobados  = Number(datos?.creditos?.aprobados  || 0);
  const requeridos = Number(datos?.creditos?.requeridos || 0);
  const porcentaje = requeridos > 0 ? Math.min(100, Math.round((aprobados / requeridos) * 100)) : 0;
  const faltantes  = Math.max(requeridos - aprobados, 0);

  return {
    usuario,
    datos,
    solicitud,
    cargando,
    enviando,
    errorPagina,
    errorSolicitud,
    solicitarTerminacion,
    porcentaje,
    faltantes,
    etapa1Habilitada: datos?.etapa1Habilitada ?? false,
    etapa2Habilitada: datos?.etapa2Habilitada ?? false,
  };
};
