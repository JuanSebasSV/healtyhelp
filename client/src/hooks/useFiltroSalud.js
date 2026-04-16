/**
 * useFiltroSalud
 * ──────────────────────────────────────────────────────────────────────────────
 * REGLA DE ORO:
 *   • Sin sesión  → cookies/localStorage SOLO (sin BD). IA no disponible.
 *   • Con sesión  → BD es la única fuente de verdad.
 *                   Al detectar usuario, se borran las cookies para que no
 *                   contaminen la sesión actual ni la siguiente cuenta.
 *
 * MANEJA:
 *   • condiciones  — filtros de dieta/salud (diabetes, vegano, etc.)
 *   • categorias   — tipo de comida (desayuno, almuerzo, cena, postres-snacks)
 *
 * EXPORTA:
 *   { filtros, toggleFiltro, limpiarFiltros,
 *     categorias, toggleCategoria, limpiarCategorias,
 *     limpiarTodo, listo }
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';

// ─── Claves de almacenamiento local (solo para anónimos) ─────────────────────
const LS_CONDICIONES = 'hh_filtros_condiciones';
const LS_CATEGORIAS  = 'hh_filtros_categorias';

// ─── Helpers localStorage (solo anónimos) ────────────────────────────────────

const leerLS = (clave) => {
  try {
    const raw = localStorage.getItem(clave);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const escribirLS = (clave, valor) => {
  try {
    // Siempre sobreescribe — resuelve el bug de "primera vez se guarda, después no"
    localStorage.setItem(clave, JSON.stringify(Array.isArray(valor) ? valor : []));
  } catch {
    // localStorage bloqueado (modo privado extremo) — ignorar silenciosamente
  }
};

const limpiarLS = () => {
  localStorage.removeItem(LS_CONDICIONES);
  localStorage.removeItem(LS_CATEGORIAS);
};

// ─── Hook ────────────────────────────────────────────────────────────────────

const useFiltroSalud = (usuario) => {
  const [filtros,    setFiltros]    = useState([]); // condiciones
  const [categorias, setCategorias] = useState([]); // tipo de comida
  const [listo,      setListo]      = useState(false);

  // Ref para cancelar peticiones obsoletas (evita race conditions)
  const peticionRef = useRef(null);
  // Ref para no reaccionar al mismo usuario dos veces
  const usuarioIdRef = useRef(null);

  // ── Carga inicial ─────────────────────────────────────────────────────────
  useEffect(() => {
    const uid = usuario?._id ?? null;

    // Evitar re-ejecución innecesaria si el usuario no cambió
    if (uid === usuarioIdRef.current && listo) return;
    usuarioIdRef.current = uid;

    setListo(false);

    const cargar = async () => {
      if (uid) {
        // ── Usuario logueado: BD es la fuente de verdad ───────────────────
        // Borrar cookies/localStorage del usuario anterior ANTES de cargar
        limpiarLS();

        try {
          const { data } = await api.get('/recomendaciones/filtros');
          setFiltros(   data.condiciones ?? []);
          setCategorias(data.categorias  ?? []);
        } catch {
          // Si falla la red, iniciar vacío (no leer cookies contaminadas)
          setFiltros([]);
          setCategorias([]);
        }
      } else {
        // ── Usuario anónimo: leer de localStorage ─────────────────────────
        setFiltros(   leerLS(LS_CONDICIONES));
        setCategorias(leerLS(LS_CATEGORIAS));
      }

      setListo(true);
    };

    cargar();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario?._id]);

  // ── Guardado unificado ────────────────────────────────────────────────────
  // Recibe los nuevos valores de ambos campos y persiste según el contexto
  const persistir = useCallback(async ({ nuevasCondiciones, nuevasCategorias }) => {
    if (!usuario) {
      // Anónimo: solo localStorage, siempre sobreescribir
      if (nuevasCondiciones !== undefined) escribirLS(LS_CONDICIONES, nuevasCondiciones);
      if (nuevasCategorias  !== undefined) escribirLS(LS_CATEGORIAS,  nuevasCategorias);
      return;
    }

    // Logueado: guardar en BD (merge parcial, no borra el otro campo)
    const token = Symbol(); // token único para cancelación
    peticionRef.current = token;

    try {
      await api.put('/chat/health-profile', {
        ...(nuevasCondiciones !== undefined && { condiciones: nuevasCondiciones }),
        ...(nuevasCategorias  !== undefined && { categorias:  nuevasCategorias  }),
      });
    } catch {
      // Si la petición falló y sigue siendo la más reciente, revertir estado
      if (peticionRef.current === token) {
        // Releer desde BD para dejar el estado consistente
        try {
          const { data } = await api.get('/recomendaciones/filtros');
          setFiltros(   data.condiciones ?? []);
          setCategorias(data.categorias  ?? []);
        } catch {
          // Sin red: mantener estado local como mejor esfuerzo
        }
      }
    }
  }, [usuario]);

  // ── API pública: condiciones ──────────────────────────────────────────────

  const toggleFiltro = useCallback((id) => {
    setFiltros(prev => {
      const nuevas = prev.includes(id)
        ? prev.filter(f => f !== id)
        : [...prev, id];
      persistir({ nuevasCondiciones: nuevas });
      return nuevas;
    });
  }, [persistir]);

  const limpiarFiltros = useCallback(() => {
    setFiltros([]);
    persistir({ nuevasCondiciones: [] });
  }, [persistir]);

  // ── API pública: categorías ───────────────────────────────────────────────

  const toggleCategoria = useCallback((id) => {
    setCategorias(prev => {
      const nuevas = prev.includes(id)
        ? prev.filter(c => c !== id)
        : [...prev, id];
      persistir({ nuevasCategorias: nuevas });
      return nuevas;
    });
  }, [persistir]);

  const limpiarCategorias = useCallback(() => {
    setCategorias([]);
    persistir({ nuevasCategorias: [] });
  }, [persistir]);

  // ── Limpiar todo ──────────────────────────────────────────────────────────

  const limpiarTodo = useCallback(() => {
    setFiltros([]);
    setCategorias([]);
    persistir({ nuevasCondiciones: [], nuevasCategorias: [] });
  }, [persistir]);

  // ── Alias de compatibilidad con el código anterior ────────────────────────
  // VistaInicio usaba: { filtros, toggleFiltro, limpiar, listo }
  // Mantenemos 'limpiar' como alias de limpiarFiltros para no romper VistaInicio

  return {
    // Condiciones (filtro de dieta/salud)
    filtros,
    toggleFiltro,
    limpiarFiltros,
    limpiar: limpiarFiltros, // alias de compatibilidad

    // Categorías (tipo de comida)
    categorias,
    toggleCategoria,
    limpiarCategorias,

    // Utilidades
    limpiarTodo,
    listo,
  };
};

export default useFiltroSalud;