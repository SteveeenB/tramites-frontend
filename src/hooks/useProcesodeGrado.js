import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { tramitesApi } from '../api/tramitesApi';
import { solicitudesApi } from '../api/solicitudesApi';

export const useProcesodeGrado = () => {
  
  const { usuario } = useAuth();

  const [datos, setDatos]                         = useState(null);
  const [solicitud, setSolicitud]                 = useState(null);
  const [solicitudGrado, setSolicitudGrado]       = useState(null);
  const [cargando, setCargando]                   = useState(true);
  const [enviando, setEnviando]             = useState(false);
  const [errorPagina, setErrorPagina]       = useState('');
  const [errorSolicitud, setErrorSolicitud] = useState('');
  const [descargandoActa, setDescargandoActa] = useState(false);

  const cargarDatos = useCallback(async () => {
    if (!usuario?.cedula) return;
    setCargando(true);
    setErrorPagina('');
    try {
      const [dataProc, dataSol] = await Promise.all([
        tramitesApi.getProcesoGrado(),
        solicitudesApi.getMias(),
      ]);

      setDatos(dataProc);

      const terminacion = dataSol.find((s) => s.tipo === 'TERMINACION_MATERIAS');
      if (terminacion) setSolicitud(terminacion);

      // La solicitud de grado la leemos directamente desde proceso-grado
      // (el backend ya la incluye) para evitar una búsqueda extra en el array
      if (dataProc.solicitudGrado) {
        setSolicitudGrado(dataProc.solicitudGrado);
      } else {
        const grado = dataSol.find((s) => s.tipo === 'GRADO') || null;
        setSolicitudGrado(grado);
      }
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
      const json = await solicitudesApi.crearTerminacion();
      setSolicitud(json);
    } catch (e) {
      setErrorSolicitud(e.message || 'No se pudo conectar con el servidor');
    } finally {
      setEnviando(false);
    }
  };

  const descargarActaTerminacion = async () => {
    if (!solicitud?.id || !usuario?.cedula) return;
    setDescargandoActa(true);
    try {
      const { blob } = await solicitudesApi.descargarCertificadoPdf(solicitud.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `acta-terminacion-${solicitud.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error descargando acta:', e);
    } finally {
      setDescargandoActa(false);
    }
  };

  // Valores derivados de créditos
  const aprobados  = Number(datos?.creditos?.aprobados  || 0);
  const requeridos = Number(datos?.creditos?.requeridos || 0);
  const porcentaje = requeridos > 0 ? Math.min(100, Math.round((aprobados / requeridos) * 100)) : 0;
  const faltantes  = Math.max(requeridos - aprobados, 0);
  // Usa la validación del backend (créditos + calendario académico)
  const etapa1Completada = datos?.etapa1Completada === true;
  const actaDisponible = solicitud?.estado === 'APROBADA' && solicitud?.actaGenerada === true;

  console.log('datos del proceso:', JSON.stringify(datos));

  return {
    usuario,
    datos,
    solicitud,
    solicitudGrado,
    cargando,
    enviando,
    errorPagina,
    errorSolicitud,
    solicitarTerminacion,
    porcentaje,
    faltantes,
    etapa1Completada,
    descargarActaTerminacion,
    descargandoActa,
    actaDisponible,
  };
};
