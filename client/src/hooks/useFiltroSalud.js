// useFiltroSalud

import { useState, useEffect, useCallback, useRef } from "react";
import api from "../api/axios";

//  Claves de almacenamiento local
const LS_CONDICIONES = "hh_filtros_condiciones";
const LS_CATEGORIA = "hh_filtro_categoria";
const LS_TIEMPO = "hh_filtro_tiempo"; // ← NUEVO

let _cache = {
  uid: null,
  filtros: [],
  categoria: "",
  filtroTiempo: null, // ← NUEVO
  cargado: false,
};

//  Helpers localStorage
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
  } catch {}
};

const limpiarLS = () => {
  localStorage.removeItem(LS_CONDICIONES);
  localStorage.removeItem(LS_CATEGORIA);
  localStorage.removeItem(LS_TIEMPO); // ← NUEVO
};

//  Hook
const useFiltroSalud = (usuario) => {
  const uid = usuario?._id ?? null;

  const cacheActual = _cache.uid === uid && _cache.cargado ? _cache : null;

  const [filtros, setFiltros] = useState(cacheActual?.filtros ?? []);
  const [categoria, setCategoria] = useState(cacheActual?.categoria ?? "");
  const [filtroTiempo, setFiltroTiempo] = useState(
    cacheActual?.filtroTiempo ?? null,
  ); // ← NUEVO
  const [listo, setListo] = useState(!!cacheActual?.cargado);

  const peticionRef = useRef(null);
  const usuarioIdRef = useRef(uid);

  //  Sincronizar caché → state cuando cambia el usuario
  useEffect(() => {
    if (uid === usuarioIdRef.current && listo) return;
    usuarioIdRef.current = uid;

    if (_cache.uid === uid && _cache.cargado) {
      setFiltros(_cache.filtros);
      setCategoria(_cache.categoria);
      setFiltroTiempo(_cache.filtroTiempo); // ← NUEVO
      setListo(true);
      return;
    }

    setListo(false);

    const cargar = async () => {
      if (uid) {
        if (_cache.uid !== uid) limpiarLS();

        try {
          const { data } = await api.get("/chat/filtros");
          const nuevosFiltros = data.condiciones ?? [];
          const rawCat = data.categorias;
          const nuevaCategoria = Array.isArray(rawCat)
            ? (rawCat[0] ?? "")
            : (rawCat ?? "");
          // El tiempo no se guarda en BD (es preferencia de sesión de navegación),
          // pero sí persiste en localStorage entre recargas/cierres de pestaña.
          const nuevoTiempo = leerLS(LS_TIEMPO, null);

          _cache = {
            uid,
            filtros: nuevosFiltros,
            categoria: nuevaCategoria,
            filtroTiempo: nuevoTiempo, // ← NUEVO
            cargado: true,
          };
          setFiltros(nuevosFiltros);
          setCategoria(nuevaCategoria);
          setFiltroTiempo(nuevoTiempo); // ← NUEVO
        } catch {
          const nuevoTiempo = leerLS(LS_TIEMPO, null);
          _cache = {
            uid,
            filtros: [],
            categoria: "",
            filtroTiempo: nuevoTiempo,
            cargado: true,
          };
          setFiltros([]);
          setCategoria("");
          setFiltroTiempo(nuevoTiempo);
        }
      } else {
        // Usuario anónimo — todo desde localStorage
        const f = leerLS(LS_CONDICIONES, []);
        const c = leerLS(LS_CATEGORIA, "");
        const t = leerLS(LS_TIEMPO, null); // ← NUEVO
        _cache = {
          uid: null,
          filtros: f,
          categoria: c,
          filtroTiempo: t,
          cargado: true,
        };
        setFiltros(f);
        setCategoria(c);
        setFiltroTiempo(t); // ← NUEVO
      }

      setListo(true);
    };

    cargar();
  }, [uid]);

  const persistir = useCallback(
    async ({ nuevasCondiciones, nuevaCategoria, nuevoTiempo }) => {
      _cache = {
        ..._cache,
        ...(nuevasCondiciones !== undefined && { filtros: nuevasCondiciones }),
        ...(nuevaCategoria !== undefined && { categoria: nuevaCategoria }),
        ...(nuevoTiempo !== undefined && { filtroTiempo: nuevoTiempo }), // ← NUEVO
      };

      // El tiempo siempre va a localStorage (no lo enviamos a BD)
      if (nuevoTiempo !== undefined) escribirLS(LS_TIEMPO, nuevoTiempo);

      if (!usuario) {
        if (nuevasCondiciones !== undefined)
          escribirLS(LS_CONDICIONES, nuevasCondiciones);
        if (nuevaCategoria !== undefined)
          escribirLS(LS_CATEGORIA, nuevaCategoria);
        return;
      }

      // Solo condiciones y categoría van a la BD
      if (nuevasCondiciones === undefined && nuevaCategoria === undefined)
        return;

      const token = Symbol();
      peticionRef.current = token;

      try {
        await api.put("/chat/health-profile", {
          ...(nuevasCondiciones !== undefined && {
            condiciones: nuevasCondiciones,
          }),
          ...(nuevaCategoria !== undefined && {
            categorias: nuevaCategoria ? [nuevaCategoria] : [],
          }),
        });
      } catch {
        if (peticionRef.current === token) {
          try {
            const { data } = await api.get("/chat/filtros");
            const revertFiltros = data.condiciones ?? [];
            const rawCat = data.categorias;
            const revertCategoria = Array.isArray(rawCat)
              ? (rawCat[0] ?? "")
              : (rawCat ?? "");
            _cache = {
              ..._cache,
              uid,
              filtros: revertFiltros,
              categoria: revertCategoria,
              cargado: true,
            };
            setFiltros(revertFiltros);
            setCategoria(revertCategoria);
          } catch {}
        }
      }
    },
    [usuario, uid],
  );

  //  Condiciones (multi-selección)
  const toggleFiltro = useCallback(
    (id) => {
      setFiltros((prev) => {
        const nuevas = prev.includes(id)
          ? prev.filter((f) => f !== id)
          : [...prev, id];
        persistir({ nuevasCondiciones: nuevas });
        return nuevas;
      });
    },
    [persistir],
  );

  const limpiarFiltros = useCallback(() => {
    setFiltros([]);
    persistir({ nuevasCondiciones: [] });
  }, [persistir]);

  //  Categoría (radio)
  const seleccionarCategoria = useCallback(
    (id) => {
      setCategoria((prev) => {
        const nueva = prev === id ? "" : id;
        persistir({ nuevaCategoria: nueva });
        return nueva;
      });
    },
    [persistir],
  );

  const limpiarCategoria = useCallback(() => {
    setCategoria("");
    persistir({ nuevaCategoria: "" });
  }, [persistir]);

  //  Filtro de tiempo  ← NUEVO
  const cambiarFiltroTiempo = useCallback(
    (id) => {
      setFiltroTiempo((prev) => {
        const nuevo = prev === id ? null : id;
        persistir({ nuevoTiempo: nuevo });
        return nuevo;
      });
    },
    [persistir],
  );

  const limpiarTiempo = useCallback(() => {
    setFiltroTiempo(null);
    persistir({ nuevoTiempo: null });
  }, [persistir]);

  //  Limpiar todo
  const limpiarTodo = useCallback(() => {
    setFiltros([]);
    setCategoria("");
    // El tiempo NO se limpia con "limpiar filtros de dieta" — es independiente.
    // Si también querés limpiarlo, descomenta la línea de abajo:
    // setFiltroTiempo(null); persistir({ nuevasCondiciones: [], nuevaCategoria: '', nuevoTiempo: null });
    persistir({ nuevasCondiciones: [], nuevaCategoria: "" });
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

    // Filtro de tiempo ← NUEVO
    filtroTiempo,
    cambiarFiltroTiempo,
    limpiarTiempo,

    // Alias de compatibilidad
    categorias: categoria ? [categoria] : [],
    toggleCategoria: seleccionarCategoria,

    // Utilidades
    limpiarTodo,
    listo,
  };
};

export default useFiltroSalud;
