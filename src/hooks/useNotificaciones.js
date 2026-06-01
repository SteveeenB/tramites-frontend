import { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  getNotificaciones,
  getConteoNoLeidas,
  marcarLeida as apiMarcarLeida,
  crearEventSource,
} from '../api/notificacionesApi';

let toastCounter = 0;

export const useNotificaciones = () => {
  const { usuario } = useContext(AuthContext);
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [toasts, setToasts] = useState([]);
  const esRef = useRef(null);

  // cedula para ESTUDIANTE/DIRECTOR; codigo para POSGRADOS/DEPENDENCIA/ADMIN
  const identificador = usuario?.cedula ?? usuario?.codigo ?? null;

  const cargar = useCallback(async () => {
    if (!identificador) return;
    try {
      const [lista, conteo] = await Promise.all([
        getNotificaciones(),
        getConteoNoLeidas(),
      ]);
      setNotificaciones(lista || []);
      setNoLeidas(conteo?.count ?? 0);
    } catch {
      // sin conexión o no autenticado — no romper UI
    }
  }, [identificador]);

  const marcar = useCallback(async (id) => {
    try {
      await apiMarcarLeida(id);
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
      setNoLeidas((prev) => Math.max(0, prev - 1));
    } catch {
      // silencioso
    }
  }, []);

  const dismissToast = useCallback((toastId) => {
    setToasts((prev) => prev.filter((t) => t.toastId !== toastId));
  }, []);

  // Carga inicial
  useEffect(() => {
    cargar();
  }, [cargar]);

  // Conexión SSE
  useEffect(() => {
    if (!identificador) return;

    const es = crearEventSource(identificador);
    esRef.current = es;

    es.addEventListener('notificacion-nueva', (e) => {
      try {
        const noti = JSON.parse(e.data);
        setNotificaciones((prev) => [noti, ...prev]);
        setNoLeidas((prev) => prev + 1);
        const toastId = ++toastCounter;
        setToasts((prev) => [...prev, { ...noti, toastId }]);
      } catch {
        // dato malformado — ignorar
      }
    });

    // Refresca el conteo cuando llega un evento de estado de solicitud
    es.addEventListener('estado-actualizado', () => {
      cargar();
    });

    es.onerror = () => {
      // EventSource reintenta automáticamente; solo limpiamos si fue cerrado
      if (es.readyState === EventSource.CLOSED) {
        esRef.current = null;
      }
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [identificador, cargar]);

  return { notificaciones, noLeidas, toasts, marcar, dismissToast };
};
