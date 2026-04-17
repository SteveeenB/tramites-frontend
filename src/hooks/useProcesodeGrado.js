import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';

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
      const [resProc, resSol] = await Promise.all([
        fetch(`http://localhost:8080/api/tramites/proceso-grado?cedula=${usuario.cedula}`),
        fetch(`http://localhost:8080/api/solicitudes?cedula=${usuario.cedula}`),
      ]);

      if (!resProc.ok) throw new Error('No se pudo cargar el proceso de grado');
      setDatos(await resProc.json());

      if (resSol.ok) {
        const jsonSol = await resSol.json();
        const terminacion = jsonSol.find((s) => s.tipo === 'TERMINACION_MATERIAS');
        if (terminacion) setSolicitud(terminacion);
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
      const res = await fetch(
        `http://localhost:8080/api/solicitudes/terminacion-materias?cedula=${usuario.cedula}`,
        { method: 'POST' },
      );
      const json = await res.json();
      if (!res.ok) {
        setErrorSolicitud(json.error || 'Error al crear la solicitud');
      } else {
        setSolicitud(json);
      }
    } catch {
      setErrorSolicitud('No se pudo conectar con el servidor');
    } finally {
      setEnviando(false);
    }
  };

  // Valores derivados de créditos
  const aprobados  = Number(datos?.creditos?.aprobados  || 0);
  const requeridos = Number(datos?.creditos?.requeridos || 0);
  const porcentaje = requeridos > 0 ? Math.min(100, Math.round((aprobados / requeridos) * 100)) : 0;
  const faltantes  = Math.max(requeridos - aprobados, 0);
  // Derivado localmente para mantener coherencia con la barra de progreso
  const etapa1Completada = porcentaje >= 100;

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
