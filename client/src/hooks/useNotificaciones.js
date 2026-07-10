import { useState, useEffect, useRef, useCallback } from 'react';
import { useEffectEvent } from 'react';
import api from '../api/axios';

export const useNotificaciones = (user, NOTIF_INTERVAL = 60000) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [cargandoNotifs, setCargandoNotifs] = useState(false);
  const notifIntervalRef = useRef(null);

  const fetchNotificaciones = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/notifications');
      setNotificaciones(data.notificaciones || []);
      setNoLeidas(data.noLeidas || 0);
    } catch (e) { console.error('Error cargando notificaciones:', e); }
  }, [user]);

  const onPollNotif = useEffectEvent(fetchNotificaciones);

  useEffect(() => {
    if (!user) return;
    let activo = true;
    const poll = () => { if (activo) onPollNotif(); };
    poll();
    notifIntervalRef.current = setInterval(poll, NOTIF_INTERVAL);
    return () => { activo = false; clearInterval(notifIntervalRef.current); };
  }, [user, NOTIF_INTERVAL]);

  const handleAbrirPanel = useCallback(() => {
    setPanelAbierto((v) => {
      const nuevoEstado = !v;
      if (nuevoEstado) {
        setCargandoNotifs(true);
        fetchNotificaciones().finally(() => setCargandoNotifs(false));
      }
      return nuevoEstado;
    });
  }, [fetchNotificaciones]);

  const handleCerrarPanel = useCallback(() => setPanelAbierto(false), []);

  const handleLeerTodas = useCallback(async () => {
    try {
      await api.put('/notifications/leer-todas');
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
      setNoLeidas(0);
    } catch (e) { console.error('Error marcando como leídas:', e); }
  }, []);

  const handleEliminarNotif = useCallback(async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotificaciones((prev) => {
        const eraNoLeida = prev.find((n) => n._id === id && !n.leida);
        if (eraNoLeida) setNoLeidas((c) => Math.max(0, c - 1));
        return prev.filter((n) => n._id !== id);
      });
    } catch (e) { console.error('Error eliminando notificación:', e); }
  }, []);

  const handleLeerUna = useCallback(async (id) => {
    setNotificaciones((prev) => {
      const notif = prev.find((n) => n._id === id);
      if (!notif || notif.leida) return prev;
      setNoLeidas((c) => Math.max(0, c - 1));
      return prev.map((n) => (n._id === id ? { ...n, leida: true } : n));
    });
    try { await api.put(`/notifications/${id}/leer`); } catch (e) { console.error('Error marcando leída:', e); }
  }, []);

  return {
    notificaciones, noLeidas, panelAbierto, setPanelAbierto, cargandoNotifs,
    handleAbrirPanel, handleCerrarPanel,
    handleLeerTodas, handleLeerUna, handleEliminarNotif,
  };
};
