import { useState, useEffect, useCallback, useRef } from "react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider";
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
  localStorage.removeItem(LS_TIEMPO);
};

const useFiltroSalud = (usuario) => {
  const { loading: authLoading } = useContext(AuthContext);
  const uid = usuario?._id ?? null;

  if (uid && _cache.uid !== uid) limpiarLS();

  const cacheActual = _cache.uid === uid && _cache.cargado && uid !== null ? _cache : null;

  const [filtros, setFiltros] = useState(cacheActual?.filtros ?? []);
  const [categoria, setCategoria] = useState(cacheActual?.categoria ?? "");
  const [filtroTiempo, setFiltroTiempo] = useState(cacheActual?.filtroTiempo ?? null);
  const [listo, setListo] = useState(!!cacheActual?.cargado);

  const peticionRef = useRef(null);
  const usuarioIdRef = useRef(undefined);

  useEffect(() => {
    if (authLoading) return;
    if (uid === usuarioIdRef.current) return;
    usuarioIdRef.current = uid;

    if (_cache.uid === uid && _cache.cargado) {
      setFiltros(_cache.filtros);
      setCategoria(_cache.categoria);
      setFiltroTiempo(_cache.filtroTiempo);
      setListo(true);
      return;
    }

    setListo(false);

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
          setFiltros(nuevosFiltros);
          setCategoria(nuevaCategoria);
          setFiltroTiempo(nuevoTiempo);
        } catch (err) {
          if (cancelled) return;
          const nuevoTiempo = leerLS(LS_TIEMPO, null);
          const filtrosActuales = _cache.uid === uid ? _cache.filtros : [];
          const categoriaActual = _cache.uid === uid ? _cache.categoria : "";
          _cache = { uid, filtros: filtrosActuales, categoria: categoriaActual, filtroTiempo: nuevoTiempo, cargado: true };
          setFiltros(filtrosActuales);
          setCategoria(categoriaActual);
          setFiltroTiempo(nuevoTiempo);
        }
      } else {
        const f = leerLS(LS_CONDICIONES, []);
        const c = leerLS(LS_CATEGORIA, "");
        const t = leerLS(LS_TIEMPO, null);
        _cache = { uid: null, filtros: f, categoria: c, filtroTiempo: t, cargado: true };
        setFiltros(f);
        setCategoria(c);
        setFiltroTiempo(t);
      }

      if (!cancelled) setListo(true);
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
            setFiltros(revertFiltros);
            setCategoria(revertCategoria);
          } catch {}
        }
      }
    },
    [usuario, uid],
  );

  const toggleFiltro = useCallback(
    (id) => {
      setFiltros((prev) => {
        const nuevas = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
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

  const limpiarTodo = useCallback(() => {
    setFiltros([]);
    setCategoria("");
    persistir({ nuevasCondiciones: [], nuevaCategoria: "" });
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
  };
};

export default useFiltroSalud;