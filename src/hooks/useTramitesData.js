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

  // Selecciona el primer ítem al cambiar de rol
  useEffect(() => {
    setSelectedMenuId(menuItems[0]?.id || '');
  }, [rol]);

  // Carga datos del módulo desde el backend
  useEffect(() => {
    if (!usuario?.cedula) return;
    tramitesApi.getModulo(usuario.cedula)
      .then(setDatosModulo)
      .catch(() => {}); // falla silenciosamente — UI se muestra igual con datos del menuConfig
  }, [usuario?.cedula]);

  const manejarSeleccion = (item) => {
    setSelectedMenuId(item.id);
    if (item.route && item.route !== '/tramites') {
      navigate(item.route);
    }
  };

  return { usuario, cambiarRol, datosModulo, selectedMenuId, manejarSeleccion, rol, menuItems };
};
