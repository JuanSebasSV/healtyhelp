/**
 * useFiltroSalud
 * ──────────────────────────────────────────────────────────────────────────────
 * REGLA DE ORO:
 *   • Sin sesión  → localStorage SOLO (sin BD). IA no disponible.
 *   • Con sesión  → BD es la única fuente de verdad.
 *                   Al detectar un usuario nuevo, se limpia localStorage para que
 *                   no contamine la sesión actual ni la siguiente cuenta.
 *
 * MANEJA:
 *   • condiciones  — filtros de dieta/salud (multi-selección)
 *   • categoria    — tipo de comida (RADIO: solo uno a la vez, o vacío = "todas")
 *
 * EXPORTA:
 *   { filtros, toggleFiltro, limpiarFiltros,
 *     categoria, setCategoria, limpiarCategoria,
 *     limpiarTodo, listo }
 *
 * CACHÉ DE MÓDULO:
 *   El estado se guarda en variables fuera del hook para sobrevivir
 *   desmontajes/remontajes del componente (navegación entre vistas).
 *   Esto evita el parpadeo y las pérdidas de estado al volver a la vista.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';

// ─── Claves de almacenamiento local (solo para anónimos) ─────────────────────
const LS_CONDICIONES = 'hh_filtros_condiciones';
const LS_CATEGORIA   = 'hh_filtro_categoria'; // solo un string, no array

// ─── Caché de módulo: sobrevive desmontajes ───────────────────────────────────
// Guarda el último estado confirmado para el userId activo.
// Si el componente se desmonta y remonta con el mismo usuario, restaura
// instantáneamente sin esperar otra petición a la BD.
let _cache = {
  uid:        null,
  filtros:    [],
  categoria:  '', // '' = "todas"
  cargado:    false,
};

// ─── Helpers localStorage (solo anónimos) ────────────────────────────────────

const leerLS = (clave, fallback) => {
  try {
    const raw = localStorage.getItem(clave);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const escribirLS = (clave, valor) => {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    // localStorage bloqueado (modo privado extremo) — ignorar
  }
};

const limpiarLS = () => {
  localStorage.removeItem(LS_CONDICIONES);
  localStorage.removeItem(LS_CATEGORIA);
};

// ─── Hook ────────────────────────────────────────────────────────────────────

const useFiltroSalud = (usuario) => {
  const uid = usuario?._id ?? null;

  // Restaurar desde caché si es el mismo usuario — evita parpadeo al navegar
  const cacheActual = _cache.uid === uid && _cache.cargado ? _cache : null;

  const [filtros,   setFiltros]   = useState(cacheActual?.filtros   ?? []);
  const [categoria, setCategoria] = useState(cacheActual?.categoria ?? '');
  const [listo,     setListo]     = useState(!!cacheActual?.cargado);

  const peticionRef  = useRef(null);
  const usuarioIdRef = useRef(uid);

  // ── Sincronizar caché → state cuando cambia el usuario ────────────────────
  useEffect(() => {
    // Si el usuario no cambió y ya está cargado, no hacer nada
    if (uid === usuarioIdRef.current && listo) return;
    usuarioIdRef.current = uid;

    // Si hay caché válido para este uid, restaurar sin petición de red
    if (_cache.uid === uid && _cache.cargado) {
      setFiltros(_cache.filtros);
      setCategoria(_cache.categoria);
      setListo(true);
      return;
    }

    // Sin caché: cargar desde fuente de verdad
    setListo(false);

    const cargar = async () => {
      if (uid) {
        // Usuario logueado — limpiar LS del usuario anterior antes de leer BD
        if (_cache.uid !== uid) limpiarLS();

        try {
          const { data } = await api.get('/chat/filtros');
          const nuevosFiltros   = data.condiciones ?? [];
          // El backend puede devolver un array (legacy) o string — normalizamos
          const rawCat          = data.categorias;
          const nuevaCategoria  = Array.isArray(rawCat)
            ? (rawCat[0] ?? '')   // tomar el primero si viene como array legacy
            : (rawCat ?? '');

          _cache = { uid, filtros: nuevosFiltros, categoria: nuevaCategoria, cargado: true };
          setFiltros(nuevosFiltros);
          setCategoria(nuevaCategoria);
        } catch {
          // Fallo de red: dejar vacío pero marcar como cargado para no bloquear UI
          _cache = { uid, filtros: [], categoria: '', cargado: true };
          setFiltros([]);
          setCategoria('');
        }
      } else {
        // Usuario anónimo — leer de localStorage
        const f = leerLS(LS_CONDICIONES, []);
        const c = leerLS(LS_CATEGORIA,   '');
        _cache = { uid: null, filtros: f, categoria: c, cargado: true };
        setFiltros(f);
        setCategoria(c);
      }

      setListo(true);
    };

    cargar();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  // ── Persistir en BD o localStorage ───────────────────────────────────────
  const persistir = useCallback(async ({ nuevasCondiciones, nuevaCategoria }) => {
    // Actualizar caché de módulo inmediatamente
    _cache = {
      ..._cache,
      ...(nuevasCondiciones !== undefined && { filtros:   nuevasCondiciones }),
      ...(nuevaCategoria    !== undefined && { categoria: nuevaCategoria    }),
    };

    if (!usuario) {
      // Anónimo: solo localStorage
      if (nuevasCondiciones !== undefined) escribirLS(LS_CONDICIONES, nuevasCondiciones);
      if (nuevaCategoria    !== undefined) escribirLS(LS_CATEGORIA,   nuevaCategoria);
      return;
    }

    // Logueado: guardar en BD
    // La BD almacena categoria como array para compatibilidad con el motor de recomendaciones.
    // Convertimos el string radio → array de un elemento (o array vacío si es '').
    const token = Symbol();
    peticionRef.current = token;

    try {
      await api.put('/chat/health-profile', {
        ...(nuevasCondiciones !== undefined && { condiciones: nuevasCondiciones }),
        ...(nuevaCategoria    !== undefined && {
          // '' = "todas" = sin filtro → array vacío en BD
          categorias: nuevaCategoria ? [nuevaCategoria] : [],
        }),
      });
    } catch {
      // Fallo: revertir estado al último confirmado en BD
      if (peticionRef.current === token) {
        try {
          const { data } = await api.get('/chat/filtros');
          const revertFiltros   = data.condiciones ?? [];
          const rawCat          = data.categorias;
          const revertCategoria = Array.isArray(rawCat) ? (rawCat[0] ?? '') : (rawCat ?? '');

          _cache = { uid, filtros: revertFiltros, categoria: revertCategoria, cargado: true };
          setFiltros(revertFiltros);
          setCategoria(revertCategoria);
        } catch {
          // Sin red: mantener estado optimista
        }
      }
    }
  }, [usuario, uid]);

  // ── API pública: condiciones (multi-selección) ────────────────────────────

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

  // ── API pública: categoría (RADIO — solo una o ninguna) ───────────────────
  // Llamar con un id selecciona ese id (o lo deselecciona si ya estaba).
  // En la UI esto equivale a un botón de radio donde hacer clic en el activo
  // lo apaga (vuelve a "todas").

  const seleccionarCategoria = useCallback((id) => {
    setCategoria(prev => {
      // Si ya estaba seleccionada, deseleccionar (volver a "todas")
      const nueva = prev === id ? '' : id;
      persistir({ nuevaCategoria: nueva });
      return nueva;
    });
  }, [persistir]);

  const limpiarCategoria = useCallback(() => {
    setCategoria('');
    persistir({ nuevaCategoria: '' });
  }, [persistir]);

  // ── Limpiar todo ──────────────────────────────────────────────────────────

  const limpiarTodo = useCallback(() => {
    setFiltros([]);
    setCategoria('');
    persistir({ nuevasCondiciones: [], nuevaCategoria: '' });
  }, [persistir]);

  // ── Compatibilidad hacia atrás ────────────────────────────────────────────
  // VistaInicio usaba `categorias` (array) y `toggleCategoria`.
  // Exponemos alias para no romper código existente.
  // NUEVO comportamiento: categorias es siempre un array de 0 o 1 elementos.

  return {
    // Condiciones (multi-selección)
    filtros,
    toggleFiltro,
    limpiarFiltros,
    limpiar: limpiarFiltros, // alias legacy

    // Categoría (radio)
    categoria,                          // string: '' | 'desayuno' | 'almuerzo' | 'cena' | 'postres-snacks'
    setCategoria: seleccionarCategoria, // nombre semántico
    limpiarCategoria,

    // Alias de compatibilidad (VistaInicio usaba `categorias` como array)
    categorias:     categoria ? [categoria] : [],   // array de 0 o 1 elementos
    toggleCategoria: seleccionarCategoria,           // mismo comportamiento radio

    // Utilidades
    limpiarTodo,
    listo,
  };
};

export default useFiltroSalud;