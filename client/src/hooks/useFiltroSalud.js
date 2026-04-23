// useFiltroSalud

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';

//  Claves de almacenamiento local (solo para anónimos) 
const LS_CONDICIONES = 'hh_filtros_condiciones';
const LS_CATEGORIA   = 'hh_filtro_categoria'; // solo un string, no array

let _cache = {
  uid:        null,
  filtros:    [],
  categoria:  '', 
  cargado:    false,
};

//  Helpers localStorage (solo anónimos) 
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
    // localStorage bloqueado (modo privado extremo)
  }
};

const limpiarLS = () => {
  localStorage.removeItem(LS_CONDICIONES);
  localStorage.removeItem(LS_CATEGORIA);
};

//  Hook 
const useFiltroSalud = (usuario) => {
  const uid = usuario?._id ?? null;

  // Restaurar desde caché si es el mismo usuario
  const cacheActual = _cache.uid === uid && _cache.cargado ? _cache : null;

  const [filtros,   setFiltros]   = useState(cacheActual?.filtros   ?? []);
  const [categoria, setCategoria] = useState(cacheActual?.categoria ?? '');
  const [listo,     setListo]     = useState(!!cacheActual?.cargado);

  const peticionRef  = useRef(null);
  const usuarioIdRef = useRef(uid);

  //  Sincronizar caché → state cuando cambia el usuario 
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
          // El backend puede devolver un array (legacy) o string
          const rawCat          = data.categorias;
          const nuevaCategoria  = Array.isArray(rawCat)
            ? (rawCat[0] ?? '') 
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
        // Usuario anónimo
        const f = leerLS(LS_CONDICIONES, []);
        const c = leerLS(LS_CATEGORIA,   '');
        _cache = { uid: null, filtros: f, categoria: c, cargado: true };
        setFiltros(f);
        setCategoria(c);
      }

      setListo(true);
    };

    cargar();
  }, [uid]);

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

    // La BD almacena categoria como array para compatibilidad con el motor de recomendaciones.
    const token = Symbol();
    peticionRef.current = token;

    try {
      await api.put('/chat/health-profile', {
        ...(nuevasCondiciones !== undefined && { condiciones: nuevasCondiciones }),
        ...(nuevaCategoria    !== undefined && {
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
        }
      }
    }
  }, [usuario, uid]);

  //  API pública: condiciones (multi-selección) 
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

  const seleccionarCategoria = useCallback((id) => {
    setCategoria(prev => {
      const nueva = prev === id ? '' : id;
      persistir({ nuevaCategoria: nueva });
      return nueva;
    });
  }, [persistir]);

  const limpiarCategoria = useCallback(() => {
    setCategoria('');
    persistir({ nuevaCategoria: '' });
  }, [persistir]);

  //  Limpiar todo 

  const limpiarTodo = useCallback(() => {
    setFiltros([]);
    setCategoria('');
    persistir({ nuevasCondiciones: [], nuevaCategoria: '' });
  }, [persistir]);

  return {
    // Condiciones (multi-selección)
    filtros,
    toggleFiltro,
    limpiarFiltros,
    limpiar: limpiarFiltros,

    // Categoría (radio)
    categoria,                          
    setCategoria: seleccionarCategoria,
    limpiarCategoria,

    // Alias de compatibilidad 
    categorias:     categoria ? [categoria] : [],
    toggleCategoria: seleccionarCategoria,

    // Utilidades
    limpiarTodo,
    listo,
  };
};

export default useFiltroSalud;