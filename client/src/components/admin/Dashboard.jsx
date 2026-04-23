import { useState, useEffect, useRef, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import UserList from "./UserList";
import Stats from "./Stats";
import RecipeManagement from "./RecipeManagement";
import TermsManager from "./TermsManager";
import PanelIA from "./PanelIA";
import ImagenesAprobacion from "./ImagenesAprobacion";

// Badge poll cada 60 s — suficiente para moderación
const BADGE_INTERVAL = 60_000;

//  Iconos estáticos fuera del componente 
const IcoShield = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    style={{ verticalAlign: "middle", marginRight: "10px", flexShrink: 0 }}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
));
IcoShield.displayName = "IcoShield";

const IcoBack = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    style={{ verticalAlign: "middle", marginRight: "6px" }}
  >
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
));
IcoBack.displayName = "IcoBack";

//  TabButton memoizado 
const TabButton = memo(({ id, label, icon, activeTab, onClick, badge = 0 }) => (
  <button
    className={`main-tab ${activeTab === id ? "active" : ""}`}
    onClick={() => onClick(id)}
  >
    {icon}
    {label}
    {badge > 0 && <span className="main-tab-badge">{badge}</span>}
  </button>
));
TabButton.displayName = "TabButton";

//  Dashboard 
const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("users");
  const [imgPendientes, setImgPendientes] = useState(0);
  const [limpiandoNotifs, setLimpiandoNotifs] = useState(false);

  const usersPerPage = 10;
  const badgeIntervalRef = useRef(null);

  //  Fetch badge — estable 
  const fetchBadge = useCallback(async () => {
    try {
      const { data } = await api.get(
        "/admin/imagenes-resenas?estado=pendiente&solo_total=true",
      );
      setImgPendientes(data.total ?? data.imagenes?.length ?? 0);
    } catch {
      /* silencioso */
    }
  }, []);

  // Poll del badge — protegido contra doble-mount
  useEffect(() => {
    let activo = true;
    const poll = () => {
      if (activo) fetchBadge();
    };

    poll();
    badgeIntervalRef.current = setInterval(poll, BADGE_INTERVAL);

    return () => {
      activo = false;
      clearInterval(badgeIntervalRef.current);
    };
  }, [fetchBadge]);

  //  Redirección si no es admin 
  useEffect(() => {
    if (!isAdmin()) {
      toast.error("Acceso denegado - Requiere permisos de administrador");
      navigate("/");
    }
  }, [isAdmin, navigate]);

  //  Carga inicial — protegida contra doble-mount 
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const [statsRes, usersRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/users"),
        ]);
        if (!mounted) return;
        setStats(statsRes.data.stats);
        setUsers(usersRes.data.users);
      } catch (error) {
        if (!mounted) return;
        if (error.response?.status === 403) {
          toast.error("Acceso denegado");
          navigate("/");
        } else {
          toast.error("Error cargando datos del panel");
        }
        console.error("Dashboard fetchData error:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  //  Refresco manual (acciones de usuarios) 
  const fetchData = useCallback(async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
    } catch (error) {
      toast.error(error.response?.data?.error || "Error recargando datos");
    }
  }, []);

  const handleDeleteUser = useCallback(
    async (userId) => {
      if (
        !window.confirm(
          "¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.",
        )
      )
        return;
      try {
        await api.delete(`/admin/users/${userId}`);
        toast.success("Usuario eliminado correctamente");
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.error || "Error eliminando usuario");
      }
    },
    [fetchData],
  );

  const handleChangeRole = useCallback(
    async (userId, newRole, action) => {
      if (action === "__refresh__") {
        fetchData();
        return;
      }
      try {
        await api.put(`/admin/users/${userId}/role`, { role: newRole });
        toast.success(
          `Rol actualizado a ${newRole === "admin" ? "Administrador" : "Usuario"}`,
        );
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.error || "Error cambiando rol");
      }
    },
    [fetchData],
  );

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((e) => {
    setFilterRole(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleTabClick = useCallback((tab) => setActiveTab(tab), []);

  const handleImagenesCambio = useCallback(() => {
    fetchData();
    fetchBadge();
  }, [fetchData, fetchBadge]);

  //  Limpiar notificaciones huérfanas 
  const handleLimpiarNotifs = useCallback(async () => {
    if (
      !window.confirm("¿Eliminar notificaciones de recetas que ya no existen?")
    )
      return;
    setLimpiandoNotifs(true);
    try {
      const { data } = await api.delete("/notifications/limpiar-huerfanas");
      toast.success(
        `Limpieza completada: ${data.borradas} notificación${data.borradas !== 1 ? "es" : ""} eliminada${data.borradas !== 1 ? "s" : ""}`,
      );
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Error limpiando notificaciones",
      );
    } finally {
      setLimpiandoNotifs(false);
    }
  }, []);

  const exportToCSV = useCallback(() => {
    const headers = ["ID", "Nombre", "Email", "Rol", "Fecha Registro"];
    const csvData = filteredUsers.map((u) => [
      u._id,
      u.name,
      u.email,
      u.isSuperAdmin
        ? "Super Administrador"
        : u.role === "admin"
          ? "Administrador"
          : "Usuario",
      new Date(u.createdAt).toLocaleDateString(),
    ]);
    const csvContent = [
      headers.join(","),
      ...csvData.map((r) => r.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `usuarios_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Datos exportados correctamente");
  }, [users]); // eslint-disable-line react-hooks/exhaustive-deps

  //  Derivados (no necesitan estado propio) 
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Cargando panel de administración...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div>
          <h1>
            <IcoShield />
            Panel de Administración
          </h1>
          <p className="admin-subtitle">Bienvenido, {user?.name}</p>
        </div>
        <button onClick={() => navigate("/")} className="btn-back">
          <IcoBack />
          Volver al inicio
        </button>
      </div>

      <Stats stats={stats} />

      <div className="admin-main-tabs">
        <TabButton
          id="users"
          label="Usuarios"
          activeTab={activeTab}
          onClick={handleTabClick}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />

        <TabButton
          id="recipes"
          label="Recetas"
          activeTab={activeTab}
          onClick={handleTabClick}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
              <path d="M7 2v20" />
              <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
            </svg>
          }
        />

        <TabButton
          id="terms"
          label="Términos"
          activeTab={activeTab}
          onClick={handleTabClick}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          }
        />

        <TabButton
          id="imagenes"
          label="Imágenes"
          activeTab={activeTab}
          onClick={handleTabClick}
          badge={imgPendientes}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          }
        />

        <TabButton
          id="ia"
          label="Asistente IA"
          activeTab={activeTab}
          onClick={handleTabClick}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ verticalAlign: "middle", marginRight: "6px" }}
            >
              <path d="M12 8V4H8" />
              <rect width="16" height="12" x="4" y="8" rx="2" />
              <path d="M2 14h2" />
              <path d="M20 14h2" />
              <path d="M15 13v2" />
              <path d="M9 13v2" />
            </svg>
          }
        />
      </div>

      {/*  Usuarios  */}
      {activeTab === "users" && (
        <>
          <div className="admin-controls">
            <div className="search-box">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <div className="filter-box">
              <select value={filterRole} onChange={handleFilterChange}>
                <option value="all">Todos los roles</option>
                <option value="admin">Solo Administradores</option>
                <option value="user">Solo Usuarios</option>
              </select>
            </div>
            <button onClick={exportToCSV} className="btn-export">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Exportar CSV
            </button>
          </div>

          <UserList
            users={currentUsers}
            onDelete={handleDeleteUser}
            onChangeRole={handleChangeRole}
          />

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Anterior
              </button>
              <span className="page-info">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Siguiente
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          )}

          <div className="admin-footer">
            <p>
              Mostrando {currentUsers.length} de {filteredUsers.length} usuarios
              {searchTerm && ` (filtrados de ${users.length} totales)`}
            </p>
          </div>
        </>
      )}

      {/*  Recetas  */}
      {activeTab === "recipes" && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              padding: "0 0 16px 0",
            }}
          >
            <button
              onClick={handleLimpiarNotifs}
              disabled={limpiandoNotifs}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                padding: "9px 16px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(201, 54, 54, 0.18)",
                color: "#f95a5a",
                cursor: limpiandoNotifs ? "not-allowed" : "pointer",
                opacity: limpiandoNotifs ? 0.6 : 1,
                fontSize: "13px",
                fontWeight: "500",
                backdropFilter: "blur(6px)",
                transition: "background 0.2s, opacity 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!limpiandoNotifs)
                  e.currentTarget.style.background = "rgba(180,60,60,0.32)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(180,60,60,0.18)";
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
              {limpiandoNotifs
                ? "Limpiando..."
                : "Limpiar notificaciones huérfanas"}
            </button>
          </div>
          <RecipeManagement />
        </>
      )}
      {activeTab === "ia" && <PanelIA />}
    </div>
  );
};

export default Dashboard;
