import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';
import { getCookie, setCookie, COOKIE_KEY } from '../components/admin/ModalCookies';

const FILTRO_COOKIE = 'hh_filtros_salud';
const FILTRO_LS     = 'hh_filtros_salud';

// ─── Helpers cookie/localStorage ─────────────────────────────────────────────

const leerFiltrosLocal = () => {
  try {
    const raw = getCookie(FILTRO_COOKIE) || localStorage.getItem(FILTRO_LS);
    return raw ? JSON.parse(decodeURIComponent(raw)) : [];
  } catch {
    return [];
  }
};

const guardarFiltrosLocal = (filtros) => {
  const val = encodeURIComponent(JSON.stringify(filtros));
  setCookie(FILTRO_COOKIE, val);
  localStorage.setItem(FILTRO_LS, JSON.parse(decodeURIComponent(val)) ? JSON.stringify(filtros) : '[]');
};

// ─── Hook principal ───────────────────────────────────────────────────────────

const useFiltroSalud = (usuario) => {
  const [filtros,   setFiltros]   = useState([]);
  const [listo,     setListo]     = useState(false);
  const peticionRef = useRef(null);

  // Carga inicial
  useEffect(() => {
    const cargar = async () => {
      if (usuario) {
        try {
          const { data } = await api.get('/usuarios/perfil-salud');
          const condiciones = data?.healthProfile?.condiciones || [];
          setFiltros(condiciones);
          guardarFiltrosLocal(condiciones); // sincroniza local
        } catch {
          setFiltros(leerFiltrosLocal());
        }
      } else {
        setFiltros(leerFiltrosLocal());
      }
      setListo(true);
    };
    cargar();
  }, [usuario?._id]);

  // Guardar en cuenta + cookie
  const guardar = useCallback(async (nuevos) => {
    setFiltros(nuevos);
    guardarFiltrosLocal(nuevos);

    if (!usuario) return;

    const token = {};
    peticionRef.current = token;
    try {
      await api.put('/chat/health-profile', {
        condiciones:  nuevos,
        alergias:     [],
        preferencias: [],
      });
    } catch {
      if (peticionRef.current === token) {
        // revert solo si no hubo otra petición más reciente
        setFiltros(f => f);
      }
    }
  }, [usuario?._id]);

  const toggleFiltro = useCallback((id) => {
    setFiltros(prev => {
      const nuevos = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      guardar(nuevos);
      return nuevos;
    });
  }, [guardar]);

  const limpiar = useCallback(() => guardar([]), [guardar]);

  return { filtros, toggleFiltro, limpiar, listo };
};

export default useFiltroSalud;
