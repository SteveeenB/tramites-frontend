import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { getMenuByRole } from '../config/menuConfig';
import { tramitesApi } from '../api/tramitesApi';

export const useTramitesData = () => {
  const navigate = useNavigate();
  const { usuario, cambiarRol } = useAuth();

  const [datosModulo, setDatosModulo] = useState(null);
  const [selectedMenuId, setSelectedMenuId] = useState('');

  const rol = usuario?.rol || 'ESTUDIANTE';
  const menuItems = getMenuByRole(rol);

// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
    if (rol === 'ESTUDIANTE') {
      setSelectedMenuId('');
    } else {
      setSelectedMenuId(menuItems[0]?.id || '');
    }
}, [rol]);

  // Carga datos del módulo desde el backend
  useEffect(() => {
    if (!usuario) return;

    const fetchModulo = async () => {
      try {
        const json = await tramitesApi.getModulo();
        setDatosModulo(json);
      } catch {
        // el contenido se muestra igual con datos del menuConfig
      }
    };

    fetchModulo();
  }, [usuario]);

  const manejarSeleccion = (item) => {
    setSelectedMenuId(item.id);
    if (item.route && item.route !== '/tramites') {
      navigate(item.route);
    }
  };

  return { usuario, cambiarRol, datosModulo, selectedMenuId, manejarSeleccion, rol, menuItems };
};