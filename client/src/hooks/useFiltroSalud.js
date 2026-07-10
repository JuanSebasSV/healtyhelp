import { useState, useEffect, useCallback, useRef, use } from "react";
import { AuthContext } from "../context/authContext";
import api from "../api/axios";

const LS_CONDICIONES = "hh_filtros_condiciones";
const LS_CATEGORIA = "hh_filtro_categoria";
const LS_TIEMPO = "hh_filtro_tiempo";

let _cache = {
  uid: null,
  filtros: [],
  categoria: "",
  filtroTiempo: null,
  cargado: false,
};

const leerLS = (clave, fallback) => {
  try {
    const raw = localStorage.getItem(clave);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch (e) { console.error(`Error leyendo ${clave}:`, e); return fallback; }
};

const escribirLS = (clave, valor) => {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch (e) { console.error(`Error escribiendo ${clave}:`, e); }
};

const limpiarLS = () => {
  localStorage.removeItem(LS_CONDICIONES);
  localStorage.removeItem(LS_CATEGORIA);
  localStorage.removeItem(LS_TIEMPO);
};

const useFiltroSalud = (usuario) => {
  const { loading: authLoading } = use(AuthContext);
  const uid = usuario?._id ?? null;

  if (uid && _cache.uid !== uid) limpiarLS();

  const cacheActual = _cache.uid === uid && _cache.cargado && uid !== null ? _cache : null;

  const [state, setState] = useState({
    filtros: cacheActual?.filtros ?? [],
    categoria: cacheActual?.categoria ?? "",
    filtroTiempo: cacheActual?.filtroTiempo ?? null,
    listo: !!cacheActual?.cargado,
  });
  const filtros = state.filtros;
  const categoria = state.categoria;
  const filtroTiempo = state.filtroTiempo;
  const listo = state.listo;

  const peticionRef = useRef(null);
  const usuarioIdRef = useRef(undefined);

  useEffect(() => {
    if (authLoading) return;
    if (uid === usuarioIdRef.current) return;
    usuarioIdRef.current = uid;

    if (_cache.uid === uid && _cache.cargado) {
      setState({
        filtros: _cache.filtros,
        categoria: _cache.categoria,
        filtroTiempo: _cache.filtroTiempo,
        listo: true,
      });
      return;
    }

    setState((s) => ({ ...s, listo: false }));

    let cancelled = false;
    const cargar = async () => {
      if (uid) {
        if (_cache.uid !== uid) limpiarLS();

        try {
          const { data } = await api.get("/chat/filtros");
          if (cancelled) return;
          const nuevosFiltros = data.condiciones ?? [];
          const rawCat = data.categorias;
          const nuevaCategoria = Array.isArray(rawCat) ? (rawCat[0] ?? "") : (rawCat ?? "");
          const nuevoTiempo = leerLS(LS_TIEMPO, null);
          _cache = { uid, filtros: nuevosFiltros, categoria: nuevaCategoria, filtroTiempo: nuevoTiempo, cargado: true };
          if (!cancelled) {
            setState({
              filtros: nuevosFiltros,
              categoria: nuevaCategoria,
              filtroTiempo: nuevoTiempo,
              listo: true,
            });
          }
        } catch {
          if (cancelled) return;
          const nuevoTiempo = leerLS(LS_TIEMPO, null);
          const filtrosActuales = _cache.uid === uid ? _cache.filtros : [];
          const categoriaActual = _cache.uid === uid ? _cache.categoria : "";
          _cache = { uid, filtros: filtrosActuales, categoria: categoriaActual, filtroTiempo: nuevoTiempo, cargado: true };
          if (!cancelled) {
            setState({
              filtros: filtrosActuales,
              categoria: categoriaActual,
              filtroTiempo: nuevoTiempo,
              listo: true,
            });
          }
        }
      } else {
        const f = leerLS(LS_CONDICIONES, []);
        const c = leerLS(LS_CATEGORIA, "");
        const t = leerLS(LS_TIEMPO, null);
        _cache = { uid: null, filtros: f, categoria: c, filtroTiempo: t, cargado: true };
        if (!cancelled) {
          setState({ filtros: f, categoria: c, filtroTiempo: t, listo: true });
        }
      }
    };

    cargar();
    return () => { cancelled = true; };
  }, [uid, authLoading]);

  const persistir = useCallback(
    async ({ nuevasCondiciones, nuevaCategoria, nuevoTiempo }) => {
      _cache = {
        ..._cache,
        ...(nuevasCondiciones !== undefined && { filtros: nuevasCondiciones }),
        ...(nuevaCategoria !== undefined && { categoria: nuevaCategoria }),
        ...(nuevoTiempo !== undefined && { filtroTiempo: nuevoTiempo }),
      };

      if (nuevoTiempo !== undefined) escribirLS(LS_TIEMPO, nuevoTiempo);

      if (!usuario) {
        if (nuevasCondiciones !== undefined) escribirLS(LS_CONDICIONES, nuevasCondiciones);
        if (nuevaCategoria !== undefined) escribirLS(LS_CATEGORIA, nuevaCategoria);
        return;
      }

      if (nuevasCondiciones === undefined && nuevaCategoria === undefined) return;

      const token = Symbol();
      peticionRef.current = token;

      try {
        await api.put("/chat/health-profile", {
          ...(nuevasCondiciones !== undefined && { condiciones: nuevasCondiciones }),
          ...(nuevaCategoria !== undefined && { categorias: nuevaCategoria ? [nuevaCategoria] : [] }),
        });
      } catch {
        if (peticionRef.current === token) {
          try {
            const { data } = await api.get("/chat/filtros");
            const revertFiltros = data.condiciones ?? [];
            const rawCat = data.categorias;
            const revertCategoria = Array.isArray(rawCat) ? (rawCat[0] ?? "") : (rawCat ?? "");
            _cache = { ..._cache, uid, filtros: revertFiltros, categoria: revertCategoria, cargado: true };
            if (peticionRef.current === token) {
              setState((prev) => ({
                ...prev,
                filtros: revertFiltros,
                categoria: revertCategoria,
              }));
            }
          } catch (e) { console.error('Error reintentando filtros:', e); }
        }
      }
    },
    [usuario, uid],
  );

  const toggleFiltro = useCallback(
    (id) => {
      setState((prev) => {
        const nuevas = prev.filtros.includes(id) ? prev.filtros.filter((f) => f !== id) : [...prev.filtros, id];
        persistir({ nuevasCondiciones: nuevas });
        return { ...prev, filtros: nuevas };
      });
    },
    [persistir],
  );

  const limpiarFiltros = useCallback(() => {
    setState((prev) => {
      persistir({ nuevasCondiciones: [] });
      return { ...prev, filtros: [] };
    });
  }, [persistir]);

  const seleccionarCategoria = useCallback(
    (id) => {
      setState((prev) => {
        const nueva = prev.categoria === id ? "" : id;
        persistir({ nuevaCategoria: nueva });
        return { ...prev, categoria: nueva };
      });
    },
    [persistir],
  );

  const limpiarCategoria = useCallback(() => {
    setState((prev) => {
      persistir({ nuevaCategoria: "" });
      return { ...prev, categoria: "" };
    });
  }, [persistir]);

  const cambiarFiltroTiempo = useCallback(
    (id) => {
      setState((prev) => {
        const nuevo = prev.filtroTiempo === id ? null : id;
        persistir({ nuevoTiempo: nuevo });
        return { ...prev, filtroTiempo: nuevo };
      });
    },
    [persistir],
  );

  const limpiarTiempo = useCallback(() => {
    setState((prev) => {
      persistir({ nuevoTiempo: null });
      return { ...prev, filtroTiempo: null };
    });
  }, [persistir]);

  const limpiarTodo = useCallback(() => {
    setState((prev) => {
      persistir({ nuevasCondiciones: [], nuevaCategoria: "" });
      return { ...prev, filtros: [], categoria: "" };
    });
  }, [persistir]);

  return {
    filtros,
    toggleFiltro,
    limpiarFiltros,
    limpiar: limpiarFiltros,
    categoria,
    setCategoria: seleccionarCategoria,
    limpiarCategoria,
    filtroTiempo,
    cambiarFiltroTiempo,
    limpiarTiempo,
    categorias: categoria ? [categoria] : [],
    toggleCategoria: seleccionarCategoria,
    limpiarTodo,
    listo,
    alergia: usuario?.alergia || '',
  };
};

export default useFiltroSalud;