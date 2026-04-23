import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { tramitesApi } from '../api/tramitesApi';
import { solicitudesApi } from '../api/solicitudesApi';

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
      const [dataProc, dataSol] = await Promise.all([
        tramitesApi.getProcesoGrado(usuario.cedula),
        solicitudesApi.getByCedula(usuario.cedula),
      ]);

      setDatos(dataProc);

      const terminacion = dataSol.find((s) => s.tipo === 'TERMINACION_MATERIAS');
      if (terminacion) setSolicitud(terminacion);
    } catch (e) {
      setErrorPagina(e.message);
    } finally {
      setCargando(false);
    }
  }, [usuario?.cedula]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const solicitarTerminacion = async () => {
    setEnviando(true);
    setErrorSolicitud('');
    try {
      const json = await solicitudesApi.crearTerminacion(usuario.cedula);
      setSolicitud(json);
    } catch (e) {
      setErrorSolicitud(e.message || 'No se pudo conectar con el servidor');
    } finally {
      setEnviando(false);
    }
  };

  // Valores derivados de créditos
  const aprobados  = Number(datos?.creditos?.aprobados  || 0);
  const requeridos = Number(datos?.creditos?.requeridos || 0);
  const porcentaje = requeridos > 0 ? Math.min(100, Math.round((aprobados / requeridos) * 100)) : 0;
  const faltantes  = Math.max(requeridos - aprobados, 0);
  // Usa la validación del backend (créditos + calendario académico)
  const etapa1Completada = datos?.etapa1Habilitada === true;

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
    etapa1Completada,
  };
};
