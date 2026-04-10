// VistaInicio.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TarjetaReceta from '../recipe/TarjetaReceta';
import { generarPDFRecetas } from '../../utils/generarPDF';
import './VistaInicio.css';
import api from '../../api/axios';

const imagenesHero = [
  'https://res.cloudinary.com/dqwqmipco/image/upload/q_auto,f_auto/v1774031315/ensalada_fs6t5u.webp',
  'https://res.cloudinary.com/dqwqmipco/image/upload/q_auto,f_auto/v1774031325/mani_y_frutas_ldhsqc.webp',
  'https://res.cloudinary.com/dqwqmipco/image/upload/q_auto,f_auto/v1774031316/pechuga_tfpvfm.webp',
  'https://res.cloudinary.com/dqwqmipco/image/upload/q_auto,f_auto/v1774031326/ajo_e0n3fy.webp',
  'https://res.cloudinary.com/dqwqmipco/image/upload/q_auto,f_auto/v1774031316/variedad_de_comida_ecokui.webp',
  'https://res.cloudinary.com/dqwqmipco/image/upload/q_auto,f_auto/v1774031319/verduras_gbvs6u.webp',
];

const _preloaded = imagenesHero.map(src => {
  const img = new Image();
  img.src = src;
  return img;
});

const VistaInicio = ({ recetas, cargandoRecetas, toggleFav, favoritos, cambiarCategoria, categoriaActiva }) => {
  const [filtrosActivos,    setFiltrosActivos]    = useState([]);
  const [filtroAbierto,     setFiltroAbierto]     = useState(false);
  const [imagenActual,      setImagenActual]       = useState(0);
  const [seleccionadas,     setSeleccionadas]      = useState([]);  // IDs seleccionadas para PDF
  const [generandoPDF,      setGenerandoPDF]       = useState(false);
  const transitandoRef = React.useRef(false);
  const navigate = useNavigate();

  const cambiarImagen = (indice) => {
    if (transitandoRef.current) return;
    const nuevo = (indice + imagenesHero.length) % imagenesHero.length;
    if (nuevo === imagenActual) return;
    transitandoRef.current = true;
    setImagenActual(nuevo);
    setTimeout(() => { transitandoRef.current = false; }, 900);
  };

  useEffect(() => {
    const intervalo = setInterval(() => { cambiarImagen(imagenActual + 1); }, 5000);
    return () => clearInterval(intervalo);
  }, [imagenActual]);

  useEffect(() => {
    const manejarTeclado = (e) => {
      if (e.key === 'ArrowLeft')  cambiarImagen(imagenActual - 1);
      if (e.key === 'ArrowRight') cambiarImagen(imagenActual + 1);
    };
    window.addEventListener('keydown', manejarTeclado);
    return () => window.removeEventListener('keydown', manejarTeclado);
  }, [imagenActual]);

  // ── Selección para PDF ────────────────────────────────────────────────────
  const toggleSeleccion = (id) => {
    setSeleccionadas(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleGenerarPDF = async () => {
    if (!seleccionadas.length) return;
    setGenerandoPDF(true);
    try {
      const recetasSeleccionadas = recetas.filter(r => seleccionadas.includes(r._id));
      await generarPDFRecetas(recetasSeleccionadas);
      setSeleccionadas([]);
    } finally {
      setGenerandoPDF(false);
    }
  };

  const categorias = [
    { id: 'todas',          nombre: 'Todas',             icono: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>' },
    { id: 'desayuno',       nombre: 'Desayuno',          icono: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun-icon lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>' },
    { id: 'almuerzo',       nombre: 'Almuerzo',          icono: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun-moon-icon lucide-sun-moon"><path d="M12 2v2"/><path d="M14.837 16.385a6 6 0 1 1-7.223-7.222c.624-.147.97.66.715 1.248a4 4 0 0 0 5.26 5.259c.589-.255 1.396.09 1.248.715"/><path d="M16 12a4 4 0 0 0-4-4"/><path d="m19 5-1.256 1.256"/><path d="M20 12h2"/></svg>' },
    { id: 'cena',           nombre: 'Cena',              icono: '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-moon-icon lucide-moon"><path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/></svg>' },
    { id: 'postres-snacks', nombre: 'Postres & Snacks',  icono: '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#e26e6e" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cake-slice-icon lucide-cake-slice"><path d="M16 13H3"/><path d="M16 17H3"/><path d="m7.2 7.9-3.388 2.5A2 2 0 0 0 3 12.01V20a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-8.654c0-2-2.44-6.026-6.44-8.026a1 1 0 0 0-1.082.057L10.4 5.6"/><circle cx="9" cy="7" r="2"/></svg>' }
  ];

  const condicionesSalud = [
    { id: 'diabetes',             nombre: 'Diabetes',                      icono: '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor"  stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-syringe-icon lucide-syringe"><path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/></svg>' },
    { id: 'hipertension',         nombre: 'Hipertensión',                  icono: '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor"  stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart-pulse-icon lucide-heart-pulse"><path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/><path d="M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/></svg>' },
    { id: 'celiaco',              nombre: 'Celíaco / Sin Gluten',          icono: '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor"  stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wheat-off-icon lucide-wheat-off"><path d="m2 22 10-10"/><path d="m16 8-1.17 1.17"/><path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="m8 8-.53.53a3.5 3.5 0 0 0 0 4.94L9 15l1.53-1.53c.55-.55.88-1.25.98-1.97"/><path d="M10.91 5.26c.15-.26.34-.51.56-.73L13 3l1.53 1.53a3.5 3.5 0 0 1 .28 4.62"/><path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z"/><path d="M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/><path d="m16 16-.53.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.49 3.49 0 0 1 1.97-.98"/><path d="M18.74 13.09c.26-.15.51-.34.73-.56L21 11l-1.53-1.53a3.5 3.5 0 0 0-4.62-.28"/><line x1="2" x2="22" y1="2" y2="22"/></svg>' },
    { id: 'intolerancia-lactosa', nombre: 'Intolerancia a la Lactosa',     icono: '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor"  stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-milk-off-icon lucide-milk-off"><path d="M8 2h8"/><path d="M9 2v1.343M15 2v2.789a4 4 0 0 0 .672 2.219l.656.984a4 4 0 0 1 .672 2.22v1.131M7.8 7.8l-.128.192A4 4 0 0 0 7 10.212V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-3"/><path d="M7 15a6.47 6.47 0 0 1 5 0 6.472 6.472 0 0 0 3.435.435"/><line x1="2" x2="22" y1="2" y2="22"/></svg>' },
    { id: 'vegano',               nombre: 'Vegano',                        icono: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"  stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-leafy-green-icon lucide-leafy-green"><path d="M2 22c1.25-.987 2.27-1.975 3.9-2.2a5.56 5.56 0 0 1 3.8 1.5 4 4 0 0 0 6.187-2.353 3.5 3.5 0 0 0 3.69-5.116A3.5 3.5 0 0 0 20.95 8 3.5 3.5 0 1 0 16 3.05a3.5 3.5 0 0 0-5.831 1.373 3.5 3.5 0 0 0-5.116 3.69 4 4 0 0 0-2.348 6.155C3.499 15.42 4.409 16.712 4.2 18.1 3.926 19.743 3.014 20.732 2 22"/><path d="M2 22 17 7"/></svg>' },
    { id: 'vegetariano',          nombre: 'Vegetariano',                   icono: '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-carrot-icon lucide-carrot"><path d="M2.27 21.7s9.87-3.5 12.73-6.36a4.5 4.5 0 0 0-6.36-6.37C5.77 11.84 2.27 21.7 2.27 21.7zM8.64 14l-2.05-2.04M15.34 15l-2.46-2.46"/><path d="M22 9s-1.33-2-3.5-2C16.86 7 15 9 15 9s1.33 2 3.5 2S22 9 22 9z"/><path d="M15 2s-2 1.33-2 3.5S15 9 15 9s2-1.84 2-3.5C17 3.33 15 2 15 2z"/></svg>' },
    { id: 'bajo-sodio',           nombre: 'Bajo en Sodio',                 icono: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-big-down-icon lucide-arrow-big-down"><path d="M15 11a1 1 0 0 0 1 1h2.939a1 1 0 0 1 .75 1.811l-6.835 6.836a1.207 1.207 0 0 1-1.707 0L4.31 13.81a1 1 0 0 1 .75-1.811H8a1 1 0 0 0 1-1V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1z"/></svg>' },
    { id: 'bajo-carbohidratos',   nombre: 'Bajo en Carbohidratos',         icono: '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" width="30" height="30" viewBox="0 0 512 512" fill="#ffffff"><g><path d="M402.12,402.1c-4.8,4.8-11.31,7.5-18.1,7.5l-0.14,0l0.13,0H128c-14.13-0.03-25.57-11.47-25.6-25.6V210.84c0-7.32-3.08-14.2-8.53-19.08c-11.35-10.17-17.03-24.03-17.06-38.18c0.02-12.22,4.25-24.27,13.04-34.11c3.33-3.72,7.18-6.93,11.44-9.54c12.06-7.38,15.86-23.14,8.48-35.2c-7.38-12.06-23.14-15.86-35.2-8.48c-8.52,5.21-16.23,11.64-22.88,19.08c-17.44,19.47-26.11,44.02-26.09,68.25c-0.03,28.03,11.56,56.17,34.12,76.34l17.07-19.08H51.2V384c0.02,42.43,34.37,76.78,76.8,76.8h256l0.13,0l-0.11-22.69l0,22.69l0.11,0l-0.11-22.69l0,22.69c20.37,0,39.91-8.09,54.31-22.5c10-10,9.99-26.21-0.01-36.2C428.32,392.1,412.12,392.1,402.12,402.1z"/></g></svg>' },
    { id: 'keto',                 nombre: 'Dieta Keto',                    icono: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M380-220q66 0 113-46.5T540-380q0-66-47-113t-113-47q-67 0-113.5 47T220-380q0 67 46.5 113.5T380-220Z"/></svg>' },
    { id: 'paleo',                nombre: 'Dieta Paleo',                   icono: '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13.144 21.144A7.274 10.445 45 1 0 2.856 10.856"/></svg>' },
    { id: 'sin-frutos-secos',     nombre: 'Sin Frutos Secos',              icono: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4V2"/><line x1="2" x2="22" y1="2" y2="22"/></svg>' },
    { id: 'sin-mariscos',         nombre: 'Sin Mariscos',                  icono: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 12.47v.03m0-.5v.47"/><path d="M2 2l20 20"/></svg>' },
    { id: 'bajo-grasa',           nombre: 'Bajo en Grasas',                icono: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M40-200v-80h600v80H40Z"/></svg>' },
    { id: 'sin-azucar',           nombre: 'Sin Azúcar',                    icono: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 2 20 20"/></svg>' },
    { id: 'colesterol-alto',      nombre: 'Colesterol Alto',               icono: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#ffffff"><path d="M295-119q-36-1-68.5-18.5T165-189q-40-48-62.5-114.5T80-440q0-83 31.5-156T197-723q54-54 127-85.5T480-840q83 0 156 32t127 87q54 55 85.5 129T880-433q0 77-25 144t-71 113Z"/></svg>' },
    { id: 'enfermedad-renal',     nombre: 'Enfermedad Renal',              icono: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M360-120v-167q-10 4-19.5 5.5T320-280q-100 0-170-70T80-520v-80Z"/></svg>' },
    { id: 'gastritis',            nombre: 'Gastritis',                     icono: '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"/></svg>' },
    { id: 'sindrome-intestino',   nombre: 'Síndrome Intestino Irritable',  icono: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M120-80v-240q0-50 35-85t85-35h80Z"/></svg>' },
  ];

  const toggleFiltro = async (id) => {
    const nuevos = filtrosActivos.includes(id)
      ? filtrosActivos.filter(f => f !== id)
      : [...filtrosActivos, id];
    setFiltrosActivos(nuevos);
    try {
      await api.put('/chat/health-profile', { condiciones: nuevos, alergias: [], preferencias: [] });
    } catch (error) {
      console.error('Error guardando perfil de salud:', error);
    }
  };

  const limpiarFiltros = () => setFiltrosActivos([]);

  const recetasFiltradas = recetas.filter(r => {
    const coincideCategoria = categoriaActiva === 'todas' || r.cat === categoriaActiva;
    if (filtrosActivos.length === 0) return coincideCategoria;
    return coincideCategoria && filtrosActivos.every(f => (r.salud || []).includes(f));
  });

  return (
    <div className="vistaInicio tema-inicio">

      {/* ── Hero ── */}
      <div className="hero">
        {imagenesHero.map((img, i) => (
          <div key={i} className={`hero-capa ${i === imagenActual ? 'hero-capa--activa' : ''}`}
            style={{ backgroundImage: `url('${img}')` }} />
        ))}
        <div className="hero-gradiente" />
        

            {/* Contenido */}
          

            <div className="hero-texto">
              <span className="hero-tag">🌿 Tu dieta, tu salud</span>
              <h1>
                Sabemos que llevar una dieta especial puede ser un reto,
                pero no tienes que hacerlo solo.
              </h1>
              <p>
                Aquí te ofrecemos recetas pensadas para ti, con ingredientes
                fáciles de conseguir y preparaciones sencillas pero exquisitas.
              </p>
              <div className="hero-linea"></div>
            </div>
            

            <div className="hero-dots">
              {imagenesHero.map((_, i) => (
                <button
                  key={i}
                  className={`hero-dot ${i === imagenActual ? 'activo' : ''}`}
                  onClick={() => cambiarImagen(i)}
                />
              ))}
            </div>
      </div>
       
      <div className="contenedor-grid">    
          {/* Stats flotantes */}
          <aside className="columna-stats">
              <div className="hero-stats">
                   <div className="hero-stat">
                      <span className="hero-stat__num">+120</span>
                      <span className="hero-stat__label">Recetas</span>
                    </div>
                    <div className="hero-stat-div"></div>
                    <div className="hero-stat">
                      <span className="hero-stat__num">16</span>
                      <span className="hero-stat__label">Dietas</span>
                    </div>
                    <div className="hero-stat-div"></div>
                    <div className="hero-stat">
                      <span className="hero-stat__num">100%</span>
                      <span className="hero-stat__label">Saludable</span>
                    </div>
              </div>
            </aside>
                   
            <main className="columna-cuerpo">  
              <div className='filtros-recetas'>
        
                {/* ── Filtro salud ── */}
                <section id="filtro-salud" className="filtroSalud">
                  <div className="filtroHeader" onClick={() => setFiltroAbierto(!filtroAbierto)}>
                      {/* Capa de brillo premium */}
                      <div className="premium-brillo-header"></div>
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
                            <span className="filtroIcono" dangerouslySetInnerHTML={{ __html: condicion.icono }} />
                            <span className="filtroNombre">{condicion.nombre}</span>
                            {filtrosActivos.includes(condicion.id) && <span className="filtroCheck">✓</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
            </div>  


          <section className="categorias">
            {categorias.map(cat => (
              <button
                key={cat.id}
                className={`catBtn ${categoriaActiva === cat.id ? 'activo' : ''}`}
                onClick={() => cambiarCategoria(cat.id)}
              >
                <span className="catIcono" dangerouslySetInnerHTML={{ __html: cat.icono }} />
                <span>{cat.nombre}</span>
              </button>
            ))}
          </section>

          </main> 

          <aside className="columna-right">
            <div className="panel-lateral widget-precio">
              <div className="widget-header">
                <span className="material-symbols-outlined">payments</span>
                <h3>Presupuesto</h3>
              </div>
              
              <p className="widget-desc">Filtra recetas según tu bolsillo:</p>
              
              <div className="precio-opciones">
                {/* Económico */}
                <div className="tooltip-wrapper" data-tooltip="Recetas con ingredientes básicos y muy baratos">
                  <button className="btn-precio">
                    <span className="precio-tag">$</span>
                    <span className="precio-label">Económico</span>
                  </button>
                </div>

              {/* Medio */}
              <div className="tooltip-wrapper" data-tooltip="Costo moderado con ingredientes frescos">
                <button className="btn-precio activo">
                  <span className="precio-tag">$$</span>
                  <span className="precio-label">Medio</span>
                </button>
              </div>
              
              {/* Premium */}
              <div className="tooltip-wrapper" data-tooltip="Ingredientes especiales o de mayor costo">
                <button className="btn-precio">
                  <span className="precio-tag">$$$</span>
                  <span className="precio-label">Premium</span>
                </button>
              </div>
              </div>
            </div>
          </aside>
      </div>
       {/* ── Recetas ── */}
       <section className="recetasGrid">
            <h2>Recetas recomendadas</h2>
            <div className='recetas-linea'></div>

            {cargandoRecetas ? (
              <div className="recetasCargando">
                <div className="spinner-recetas" />
                <p>Cargando recetas...</p>
              </div>
            ) : (
              <div className="grid">
                {recetasFiltradas.map(receta => (
                  <TarjetaReceta
                    key={receta._id}
                    receta={receta}
                    toggleFav={toggleFav}
                    esFav={favoritos.includes(receta._id)}
                  />
                ))}
              </div>
            )}

            {!cargandoRecetas && recetasFiltradas.length === 0 && (
              <p className="sinResultados">No hay recetas disponibles con estos filtros.</p>
            )}
          </section>
    </div>
    
  );
};

export default VistaInicio;