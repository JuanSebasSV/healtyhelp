import React, { useState } from 'react';
import TarjetaReceta from '../recipe/TarjetaReceta';
import './VistaInicio.css';

const VistaInicio = ({ recetas, toggleFav, favoritos, cambiarCategoria, categoriaActiva }) => {
  const [filtrosActivos, setFiltrosActivos] = useState([]);
  const [filtroAbierto, setFiltroAbierto] = useState(false);

  const categorias = [
    {
      id: 'todas',
      nombre: 'Todas',
      icono: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>'
    },
    {
      id: 'desayuno',
      nombre: 'Desayuno',
      icono: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>'
    },
    {
      id: 'almuerzo',
      nombre: 'Almuerzo',
      icono: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M12 14v8"/><path d="M8.5 20h7"/></svg>'
    },
    {
      id: 'cena',
      nombre: 'Cena',
      icono: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>'
    },
    {
      id: 'postres-snacks',
      nombre: 'Postres & Snacks',
      icono: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/></svg>'
    }
  ];

  const condicionesSalud = [
    { id: 'diabetes', nombre: 'Diabetes', icono: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4"/><path d="M12 18v4"/><path d="m4.93 4.93 2.83 2.83"/><path d="m16.24 16.24 2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="m4.93 19.07 2.83-2.83"/><path d="m16.24 7.76 2.83-2.83"/></svg>' },
    { id: 'hipertension', nombre: 'Hipertensión', icono: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>' },
    { id: 'celiaco', nombre: 'Celíaco / Sin Gluten', icono: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m2 22 1-1h3l9-9"/><path d="M3 21v-3l9-9"/><path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z"/></svg>' },
    { id: 'intolerancia-lactosa', nombre: 'Intolerancia a la Lactosa', icono: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 2h8l4 10H4L8 2Z"/><path d="M12 12v10"/><path d="M8 22h8"/></svg>' },
    { id: 'vegano', nombre: 'Vegano', icono: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 22c1.25-.987 2.27-1.975 3.9-2.2a5.56 5.56 0 0 1 3.8 1.5 4 4 0 0 0 6.187-2.353 3.5 3.5 0 0 0 3.69-5.116A3.5 3.5 0 0 0 20.95 8 3.5 3.5 0 1 0 16 3.05a3.5 3.5 0 0 0-5.831 1.373 3.5 3.5 0 0 0-5.116 3.69 4 4 0 0 0-2.348 6.155C3.499 15.42 4.409 16.712 4.2 18.1 3.926 19.743 3.014 20.732 2 22"/></svg>' },
    { id: 'vegetariano', nombre: 'Vegetariano', icono: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/></svg>' },
    { id: 'bajo-sodio', nombre: 'Bajo en Sodio', icono: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20"/><path d="m15 19-3 3-3-3"/><path d="m19 15 3 3-3 3"/><path d="M5 9 2 6l3-3"/></svg>' },
    { id: 'bajo-carbohidratos', nombre: 'Bajo en Carbohidratos', icono: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>' },
    { id: 'keto', nombre: 'Dieta Keto', icono: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/><path d="M12 7v10"/><path d="M8 12h8"/></svg>' },
    { id: 'paleo', nombre: 'Dieta Paleo', icono: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6.5 6.5C8 5 9 3 9 3s1 2 2.5 3.5S14 9 14 9s-2 0-3.5 1.5S8 14 8 14s0-2-1.5-3.5S3 9 3 9s2-1 3.5-2.5z"/><path d="m18 16 4-4"/><path d="m14 20 4-4"/></svg>' },
    { id: 'sin-frutos-secos', nombre: 'Sin Frutos Secos', icono: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>' },
    { id: 'sin-mariscos', nombre: 'Sin Mariscos', icono: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z"/><path d="M18 12v.5"/><path d="M16 17.93a9.77 9.77 0 0 1 0-11.86"/><path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33"/></svg>' },
    { id: 'bajo-grasa', nombre: 'Bajo en Grasas', icono: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20"/><path d="M8 8H4l8-6 8 6h-4"/><path d="M8 14v5"/><path d="M16 14v5"/><path d="M6 19h12"/></svg>' },
    { id: 'sin-azucar', nombre: 'Sin Azúcar', icono: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m8.5 8.5-1 1a4.95 4.95 0 0 0 7 7l1-1"/><path d="M11.843 6.187A4.947 4.947 0 0 1 16.5 7.5a4.947 4.947 0 0 1 1.313 4.657"/><path d="M2 2l20 20"/></svg>' },
    { id: 'colesterol-alto', nombre: 'Colesterol Alto', icono: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>' },
    { id: 'enfermedad-renal', nombre: 'Enfermedad Renal', icono: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>' },
    { id: 'gastritis', nombre: 'Gastritis', icono: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 2v2.343"/><path d="M14 2v6.343"/><path d="m2 8 2-2"/><path d="m22 8-2-2"/><path d="m6 8-1.3 7.8a2 2 0 0 0 2 2.2H9"/><path d="M18 8l1.3 7.8a2 2 0 0 1-2 2.2H15"/><path d="M6 14h12"/><path d="M15 22v-4a2 2 0 0 1 4 0v4"/><path d="M15 18h4"/></svg>' },
    { id: 'sindrome-intestino', nombre: 'Síndrome Intestino Irritable', icono: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>' }
  ];

  const toggleFiltro = (filtroId) => {
    setFiltrosActivos(prev => 
      prev.includes(filtroId) 
        ? prev.filter(f => f !== filtroId)
        : [...prev, filtroId]
    );
  };

  const limpiarFiltros = () => {
    setFiltrosActivos([]);
  };

  const recetasFiltradas = recetas.filter(r => {
    const coincideCategoria = categoriaActiva === 'todas' || r.cat === categoriaActiva;

    if (filtrosActivos.length === 0) {
      return coincideCategoria;
    }

    const cumpleTodosFiltros = filtrosActivos.every(filtro =>
      r.salud.includes(filtro)
    );

    return coincideCategoria && cumpleTodosFiltros;
  });

  return (
    <div className="vistaInicio">
      <section className="hero">
        <h1>Sabemos que llevar una dieta especial puede ser un reto, pero no tienes que hacerlo solo.</h1>
        <p>Aquí te ofrecemos recetas pensadas para ti, con ingredientes fáciles de conseguir y preparaciones sencillas pero exquisitas. Cuida tu salud y disfruta de cada comida con confianza y sabor.</p>
      </section>
      
      <section className="categorias">
        {categorias.map(cat => (
          <button
            key={cat.id}
            className={`catBtn ${categoriaActiva === cat.id ? 'activo' : ''}`}
            onClick={() => cambiarCategoria(cat.id)}
          >
            <span className="catIcono" dangerouslySetInnerHTML={{__html: cat.icono}}></span>
            <span>{cat.nombre}</span>
          </button>
        ))}
      </section>

      <section id="filtro-salud" className="filtroSalud">
        <div className="filtroHeader" onClick={() => setFiltroAbierto(!filtroAbierto)}>
          <h2>¡Busca tu Tipo de Dieta Aquí!</h2>
          <span className="filtroToggle">{filtroAbierto ? '▲' : '▼'}</span>
        </div>
        
        {filtroAbierto && (
          <div className="filtroContenido">
            <div className="filtroInfo">
              <p>Selecciona todas las condiciones que se apliquen a ti. Solo verás recetas que cumplan con todas tus necesidades.</p>
              {filtrosActivos.length > 0 && (
                <button className="btnLimpiar" onClick={limpiarFiltros}>
                  Limpiar filtros ({filtrosActivos.length})
                </button>
              )}
            </div>
            <div className="filtroGrid">
              {condicionesSalud.map(condicion => (
                <button
                  key={condicion.id}
                  className={`filtroCard ${filtrosActivos.includes(condicion.id) ? 'activo' : ''}`}
                  onClick={() => toggleFiltro(condicion.id)}
                >
                  <span className="filtroIcono" dangerouslySetInnerHTML={{__html: condicion.icono}}></span>
                  <span className="filtroNombre">{condicion.nombre}</span>
                  {filtrosActivos.includes(condicion.id) && (
                    <span className="filtroCheck">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="recetasGrid">
        <h2>Recetas Recomendadas</h2>
        <div className="grid">
          {recetasFiltradas.map(receta => (
            <TarjetaReceta
              key={receta.id}
              receta={receta}
              toggleFav={toggleFav}
              esFav={favoritos.includes(receta.id)}
            />
          ))}
        </div>
        {recetasFiltradas.length === 0 && (
          <p className="sinResultados">No hay recetas disponibles con estos filtros.</p>
        )}
      </section>
    </div>
  );
};

export default VistaInicio;
