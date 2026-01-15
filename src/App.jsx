  // App.jsx
  import { useState, useEffect } from 'react'
  import './App.css'

  // ============ COMPONENTES ============

  // Navegación Principal
  const Nav = ({ cambiarVista, usuarioActivo, cerrarSesion, abrirMenu, menuAbierto, modoOscuro, toggleModoOscuro }) => {
    return (
      <nav className="nav">
        <div className="nav-contenedor">
          <div className="nav-logo" onClick={() => cambiarVista('inicio')}>
            <div className="logo-icono">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 21h10" />
                <path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z" />
                <path d="M11.38 12a2.4 2.4 0 0 1-.4-4.77 2.4 2.4 0 0 1 3.2-2.77 2.4 2.4 0 0 1 3.47-.63 2.4 2.4 0 0 1 3.37 3.37 2.4 2.4 0 0 1-1.1 3.7 2.51 2.51 0 0 1 .03 1.1" />
              </svg>
            </div>
            <span className="logo-texto">Healthy Help</span>
          </div>
          
          <button className="nav-hamburguesa" onClick={abrirMenu}>
            <span></span>
            <span></span>
            <span></span>
          </button>

          <ul className={`nav-menu ${menuAbierto ? 'activo' : ''}`}>
            <li onClick={() => cambiarVista('inicio')}>Inicio</li>
            <li onClick={() => cambiarVista('historial')}>Historial</li>
            <li onClick={() => cambiarVista('favoritos')}>Favoritos</li>
            <li onClick={() => cambiarVista('contacto')}>Contactanos</li>
            <li>
              <button className="btn-tema" onClick={toggleModoOscuro} title={modoOscuro ? 'Modo Claro' : 'Modo Oscuro'}>
                {modoOscuro ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2" />
                    <path d="M12 20v2" />
                    <path d="m4.93 4.93 1.41 1.41" />
                    <path d="m17.66 17.66 1.41 1.41" />
                    <path d="M2 12h2" />
                    <path d="M20 12h2" />
                    <path d="m6.34 17.66-1.41 1.41" />
                    <path d="m19.07 4.93-1.41 1.41" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                  </svg>
                )}
              </button>
            </li>
            {usuarioActivo ? (
              <li>
                <button className="btn-secundario" onClick={cerrarSesion}>
                  Cerrar Sesión
                </button>
              </li>
            ) : (
              <li>
                <button className="btn-primario" onClick={() => cambiarVista('login')}>
                  Inicio de sesión
                </button>
              </li>
            )}
          </ul>
        </div>
      </nav>
    );
  };

  // Robot IA Flotante
  const RobotIA = ({ activo, toggleIA }) => {
    const [mensaje, setMensaje] = useState('');
    const [chat, setChat] = useState([]);

    const enviarMensaje = () => {
      if (!mensaje.trim()) return;
      setChat([...chat, { tipo: 'usuario', texto: mensaje }]);
      setTimeout(() => {
        setChat(prev => [...prev, { 
          tipo: 'ia', 
          texto: '¡Hola! Soy tu asistente culinario. ¿En qué puedo ayudarte hoy?' 
        }]);
      }, 500);
      setMensaje('');
    };

    return (
      <>
        <button className="robot-boton" onClick={toggleIA}>
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M12 8V4H8" />
            <rect width="16" height="12" x="4" y="8" rx="2" />
            <path d="M2 14h2" />
            <path d="M20 14h2" />
            <path d="M15 13v2" />
            <path d="M9 13v2" />
          </svg>
        </button>
        
        {activo && (
          <div className="robot-chat">
            <div className="robot-header">
              <h3>Asistente IA</h3>
              <button onClick={toggleIA}>✕</button>
            </div>
            <div className="robot-mensajes">
              {chat.length === 0 && (
                <div className="robot-bienvenida">
                  ¡Hola! Pregúntame sobre recetas, ingredientes o nutrición.
                </div>
              )}
              {chat.map((msg, i) => (
                <div key={i} className={`robot-mensaje ${msg.tipo}`}>
                  {msg.texto}
                </div>
              ))}
            </div>
            <div className="robot-input">
              <input
                type="text"
                placeholder="Escribe tu pregunta..."
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && enviarMensaje()}
              />
              <button onClick={enviarMensaje}>Enviar</button>
            </div>
          </div>
        )}
      </>
    );
  };

  // Fondo Animado
  const FondoAnimado = () => {
    return (
      <div className="fondo-animado">
        <div className="gradient-mesh"></div>
        
        <svg style={{position: 'absolute', width: 0, height: 0}}>
          <defs>
            <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="glow-dark-green" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="glow-orange" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
        </svg>
        
        <div className="onda-linea onda-linea-1">
          <svg viewBox="0 0 2400 200" preserveAspectRatio="none">
            <path d="M-1200,100 Q-1050,50 -900,100 T-600,100 T-300,100 T0,100 T300,100 T600,100 T900,100 T1200,100 T1500,100 T1800,100 T2100,100 T2400,100 T2700,100 T3000,100 T3300,100 T3600,100" 
                  stroke="rgba(79, 119, 45, 0.8)" 
                  strokeWidth="3" 
                  fill="none"
                  filter="url(#glow-green)" />
          </svg>
        </div>
        
        <div className="onda-linea onda-linea-2">
          <svg viewBox="0 0 2400 200" preserveAspectRatio="none">
            <path d="M-1200,100 Q-1000,30 -800,100 T-400,100 T0,100 T400,100 T800,100 T1200,100 T1600,100 T2000,100 T2400,100 T2800,100 T3200,100 T3600,100" 
                  stroke="rgba(26, 77, 46, 0.6)" 
                  strokeWidth="2.5" 
                  fill="none"
                  filter="url(#glow-dark-green)" />
          </svg>
        </div>
        
        <div className="onda-linea onda-linea-3">
          <svg viewBox="0 0 2400 200" preserveAspectRatio="none">
            <path d="M-1200,100 Q-1100,70 -1000,100 T-800,100 T-600,100 T-400,100 T-200,100 T0,100 T200,100 T400,100 T600,100 T800,100 T1000,100 T1200,100 T1400,100 T1600,100 T1800,100 T2000,100 T2200,100 T2400,100 T2600,100 T2800,100 T3000,100 T3200,100 T3400,100 T3600,100" 
                  stroke="rgba(247, 127, 0, 0.15)" 
                  strokeWidth="2" 
                  fill="none"
                  filter="url(#glow-orange)" />
          </svg>
        </div>
      </div>
    );
  };

  // Panel de Nutrición con Gráfico Circular
  const NutricionGrafico = ({ nutri, onModalChange }) => {
    const [verDetalle, setVerDetalle] = useState(false);
    
    // Calcular porcentajes para el gráfico
    const totalMacros = nutri.gras + nutri.carb + nutri.prot;
    const porcGras = Math.round((nutri.gras / totalMacros) * 100);
    const porcCarb = Math.round((nutri.carb / totalMacros) * 100);
    const porcProt = Math.round((nutri.prot / totalMacros) * 100);

    // Calcular ángulos para el pie chart (en grados)
    const anguloGras = (porcGras / 100) * 360;
    const anguloCarb = (porcCarb / 100) * 360;
    // Función para crear path de arco SVG
    const crearArco = (startAngle, endAngle) => {
      const start = polarACartesiano(100, 100, 80, endAngle);
      const end = polarACartesiano(100, 100, 80, startAngle);
      const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
      return [
        "M", start.x, start.y,
        "A", 80, 80, 0, largeArc, 0, end.x, end.y,
        "L", 100, 100,
        "Z"
      ].join(" ");
    };

    const polarACartesiano = (centerX, centerY, radius, angleInDegrees) => {
      const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
      return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
      };
    };

    return (
      <>
        <div className="nutri-panel">
          <h3>Nutrición</h3>
          
          {/* Gráfico circular */}
          <svg viewBox="0 0 200 200" className="nutri-chart">
            {/* Fat - Cyan */}
            <path
              d={crearArco(0, anguloGras)}
              fill="#06b6d4"
              stroke="#ffffff"
              strokeWidth="2"
            />
            {/* Carbs - Amarillo */}
            <path
              d={crearArco(anguloGras, anguloGras + anguloCarb)}
              fill="#eab308"
              stroke="#ffffff"
              strokeWidth="2"
            />
            {/* Protein - Morado */}
            <path
              d={crearArco(anguloGras + anguloCarb, 360)}
              fill="#a855f7"
              stroke="#ffffff"
              strokeWidth="2"
            />
            {/* Círculo central blanco */}
            <circle cx="100" cy="100" r="45" fill="var(--blanco)" />
          </svg>

          {/* Leyenda del gráfico */}
          <div className="nutri-leyenda">
            <div className="nutri-leyenda-item">
              <span className="nutri-color" style={{backgroundColor: '#06b6d4'}}></span>
              <span>Grasas {porcGras}%</span>
            </div>
            <div className="nutri-leyenda-item">
              <span className="nutri-color" style={{backgroundColor: '#eab308'}}></span>
              <span>Carbohidratos {porcCarb}%</span>
            </div>
            <div className="nutri-leyenda-item">
              <span className="nutri-color" style={{backgroundColor: '#a855f7'}}></span>
              <span>Proteínas {porcProt}%</span>
            </div>
          </div>

          {/* Tabla de totales vs objetivos */}
          <div className="nutri-tabla-container">
            <table className="nutri-tabla">
              <thead>
                <tr>
                  <th>Nutrientes</th>
                  <th>Total</th>
                  <th>objetivo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Calorias</td>
                  <td>{nutri.cal}</td>
                  <td>2199</td>
                </tr>
                <tr>
                  <td>Carbohidratos</td>
                  <td>{nutri.carb}g</td>
                  <td>105 - 275g</td>
                </tr>
                <tr>
                  <td>Grasas</td>
                  <td>{nutri.gras}g</td>
                  <td>66 - 123g</td>
                </tr>
                <tr>
                  <td>Proteínas</td>
                  <td>{nutri.prot}g</td>
                  <td>108 - 275g</td>
                </tr>
                <tr>
                  <td>Fibra</td>
                  <td>{nutri.fiber}g</td>
                  <td>25g</td>
                </tr>
                <tr>
                  <td>Sodio</td>
                  <td>{nutri.sodio}mg</td>
                  <td>-</td>
                </tr>
                <tr>
                  <td>Colesterol</td>
                  <td>{nutri.colesterol}mg</td>
                  <td>-</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Botón para ver detalles */}
          <button
            className="btn-primario btn-nutri-detalle"
            onClick={() => {
              setVerDetalle(true);
              if (onModalChange) onModalChange(true);
            }}
          >
            Información Nutricional Detallada
          </button>
        </div>

        {/* Modal detallado */}
        {verDetalle && (
          <ModalNutricionDetallada
            nutri={nutri}
            cerrar={() => {
              setVerDetalle(false);
              if (onModalChange) onModalChange(false);
            }}
          />
        )}
      </>
    );
  };
  // Modal de Nutrición Detallada
  const ModalNutricionDetallada = ({ nutri, cerrar }) => {
    useEffect(() => {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }, []);

    return (
      <div className="modal-overlay" onClick={cerrar}>
        <div className="modal-contenido modal-nutri-detalle modal-nutri-amplio" onClick={(e) => e.stopPropagation()}>
          <button className="modal-cerrar" onClick={cerrar}>✕</button>
          <h2>Nutrición Detallada</h2>
          
          {/* Sección principal de nutrientes */}
          <div className="nutri-detalle-seccion">
            <h3>Mis Objetivos Nutricionales</h3>
            <table className="tabla-nutri-completa">
              <thead>
                <tr>
                  <th>Nutriente</th>
                  <th>Cantidad</th>
                  <th>Objetivo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Calorías</td>
                  <td>{nutri.cal}</td>
                  <td>2199</td>
                </tr>
                <tr>
                  <td>● Carbohidratos</td>
                  <td>{nutri.carb}g</td>
                  <td>105 - 275g</td>
                </tr>
                <tr>
                  <td>● Grasas</td>
                  <td>{nutri.gras}g</td>
                  <td>66 - 123g</td>
                </tr>
                <tr>
                  <td>● Proteínas</td>
                  <td>{nutri.prot}g</td>
                  <td>108 - 275g</td>
                </tr>
                <tr>
                  <td>Carbohidratos Netos</td>
                  <td>{nutri.carbNetos}g</td>
                  <td>-</td>
                </tr>
                <tr>
                  <td>Fibra</td>
                  <td>{nutri.fiber}g</td>
                  <td>25g</td>
                </tr>
                <tr>
                  <td>Sodio</td>
                  <td>{nutri.sodio}mg</td>
                  <td>-</td>
                </tr>
                <tr>
                  <td>Colesterol</td>
                  <td>{nutri.colesterol}mg</td>
                  <td>-</td>
                </tr>
                <tr>
                  <td>Calcio</td>
                  <td>{nutri.calcio} mg</td>
                  <td>{Math.round((nutri.calcio / 1000) * 100)}%</td>
                </tr>
                <tr>
                  <td>Hierro</td>
                  <td>{nutri.hierro} mg</td>
                  <td>{Math.round((nutri.hierro / 8) * 100)}%</td>
                </tr>
                <tr>
                  <td>Potasio</td>
                  <td>{nutri.potasio} mg</td>
                  <td>{Math.round((nutri.potasio / 4700) * 100)}%</td>
                </tr>
                <tr>
                  <td>Vitamina D</td>
                  <td>{nutri.vitD} μg</td>
                  <td>{Math.round((nutri.vitD / 15) * 100)}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Vitaminas y Minerales */}
          <div className="nutri-detalle-seccion">
            <h3>Vitaminas y Minerales</h3>
            <div className="nutri-grid-detalle nutri-grid-3col">
              <div className="nutri-item-detalle">
                <span className="nutri-nombre">Alfa caroteno</span>
                <span className="nutri-valor">{nutri.alphaCaroteno} μg</span>
                <span className="nutri-dv">–</span>
              </div>
              <div className="nutri-item-detalle">
                <span className="nutri-nombre">Beta caroteno</span>
                <span className="nutri-valor">{nutri.betaCaroteno} μg</span>
                <span className="nutri-dv">–</span>
              </div>
              <div className="nutri-item-detalle">
                <span className="nutri-nombre">Cafeína</span>
                <span className="nutri-valor">{nutri.cafeina} mg</span>
                <span className="nutri-dv">–</span>
              </div>
              <div className="nutri-item-detalle">
                <span className="nutri-nombre">Colina</span>
                <span className="nutri-valor">{nutri.colina} mg</span>
                <span className="nutri-dv">{Math.round((nutri.colina / 550) * 100)}%</span>
              </div>
              <div className="nutri-item-detalle">
                <span className="nutri-nombre">Cobre</span>
                <span className="nutri-valor">{nutri.cobre} mg</span>
                <span className="nutri-dv">{Math.round((nutri.cobre / 0.9) * 100)}%</span>
              </div>
              <div className="nutri-item-detalle">
                <span className="nutri-nombre">Fluoruro</span>
                <span className="nutri-valor">{nutri.fluoruro} μg</span>
                <span className="nutri-dv">–</span>
              </div>
              <div className="nutri-item-detalle">
                <span className="nutri-nombre">Folato (B9)</span>
                <span className="nutri-valor">{nutri.folato} μg</span>
                <span className="nutri-dv">{Math.round((nutri.folato / 400) * 100)}%</span>
              </div>
              <div className="nutri-item-detalle">
                <span className="nutri-nombre">Licopeno</span>
                <span className="nutri-valor">{nutri.licopeno} μg</span>
                <span className="nutri-dv">–</span>
              </div>
              <div className="nutri-item-detalle">
                <span className="nutri-nombre">Magnesio</span>
                <span className="nutri-valor">{nutri.magnesio} mg</span>
                <span className="nutri-dv">{Math.round((nutri.magnesio / 400) * 100)}%</span>
              </div>
              <div className="nutri-item-detalle">
                <span className="nutri-nombre">Manganeso</span>
                <span className="nutri-valor">{nutri.manganeso} mg</span>
                <span className="nutri-dv">{Math.round((nutri.manganeso / 2.3) * 100)}%</span>
              </div>
              <div className="nutri-item-detalle">
                <span className="nutri-nombre">Niacina</span>
                <span className="nutri-valor">{nutri.niacina} mg</span>
                <span className="nutri-dv">{Math.round((nutri.niacina / 16) * 100)}%</span>
              </div>
              <div className="nutri-item-detalle">
                <span className="nutri-nombre">Ácido pantoténico</span>
                <span className="nutri-valor">{nutri.acPantotenico} mg</span>
                <span className="nutri-dv">{Math.round((nutri.acPantotenico / 5) * 100)}%</span>
              </div>
              <div className="nutri-item-detalle">
                <span className="nutri-nombre">Fósforo</span>
                <span className="nutri-valor">{nutri.fosforo} mg</span>
                <span className="nutri-dv">{Math.round((nutri.fosforo / 700) * 100)}%</span>
              </div>
              <div className="nutri-item-detalle">
                <span className="nutri-nombre">Retinol</span>
                <span className="nutri-valor">{nutri.retinol} μg</span>
                <span className="nutri-dv">–</span>
              </div>
              <div className="nutri-item-detalle">
                <span className="nutri-nombre">Riboflavina (B2)</span>
                <span className="nutri-valor">{nutri.riboflavina} mg</span>
                <span className="nutri-dv">{Math.round((nutri.riboflavina / 1.3) * 100)}%</span>
              </div>
              <div className="nutri-item-detalle">
                <span className="nutri-nombre">Selenio</span>
                <span className="nutri-valor">{nutri.selenio} μg</span>
                <span className="nutri-dv">{Math.round((nutri.selenio / 55) * 100)}%</span>
              </div>
              <div className="nutri-item-detalle">
                <span className="nutri-nombre">Teobromina</span>
                <span className="nutri-valor">{nutri.teobromina} mg</span>
                <span className="nutri-dv">–</span>
              </div>
              <div className="nutri-item-detalle">
                <span className="nutri-nombre">Tiamina</span>
                <span className="nutri-valor">{nutri.tiamina} mg</span>
                <span className="nutri-dv">{Math.round((nutri.tiamina / 1.2) * 100)}%</span>
              </div>
              <div className="nutri-item-detalle">
                <span className="nutri-nombre">Vitamina A IU</span>
                <span className="nutri-valor">{nutri.vitAIU} IU</span>
                <span className="nutri-dv">–</span>
              </div>
              <div className="nutri-item-detalle">
                <span className="nutri-nombre">Vitamina A</span>
                <span className="nutri-valor">{nutri.vitA} μg</span>
                <span className="nutri-dv">{Math.round((nutri.vitA / 900) * 100)}%</span>
              </div>
              <div className="nutri-item-detalle">
                <span className="nutri-nombre">Vitamina B12</span>
                <span className="nutri-valor">{nutri.vitB12} μg</span>
                <span className="nutri-dv">{Math.round((nutri.vitB12 / 2.4) * 100)}%</span>
              </div>
              <div className="nutri-item-detalle">
                <span className="nutri-nombre">Vitamina B6</span>
                <span className="nutri-valor">{nutri.vitB6} mg</span>
                <span className="nutri-dv">{Math.round((nutri.vitB6 / 1.3) * 100)}%</span>
              </div>
              <div className="nutri-item-detalle">
                <span className="nutri-nombre">Vitamina C</span>
                <span className="nutri-valor">{nutri.vitC} mg</span>
                <span className="nutri-dv">{Math.round((nutri.vitC / 90) * 100)}%</span>
              </div>
              <div className="nutri-item-detalle">
                <span className="nutri-nombre">Vitamina D IU</span>
                <span className="nutri-valor">{nutri.vitDIU} IU</span>
                <span className="nutri-dv">–</span>
              </div>
              <div className="nutri-item-detalle">
                <span className="nutri-nombre">Vitamina D2</span>
                <span className="nutri-valor">{nutri.vitD2} μg</span>
                <span className="nutri-dv">–</span>
              </div>
              <div className="nutri-item-detalle">
                <span className="nutri-nombre">Vitamina D3</span>
                <span className="nutri-valor">{nutri.vitD3} μg</span>
                <span className="nutri-dv">–</span>
              </div>
              <div className="nutri-item-detalle">
                <span className="nutri-nombre">Vitamina E</span>
                <span className="nutri-valor">{nutri.vitE} mg</span>
                <span className="nutri-dv">{Math.round((nutri.vitE / 15) * 100)}%</span>
              </div>
              <div className="nutri-item-detalle">
                <span className="nutri-nombre">Vitamina K</span>
                <span className="nutri-valor">{nutri.vitK} μg</span>
                <span className="nutri-dv">{Math.round((nutri.vitK / 120) * 100)}%</span>
              </div>
              <div className="nutri-item-detalle">
                <span className="nutri-nombre">Zinc</span>
                <span className="nutri-valor">{nutri.zinc} mg</span>
                <span className="nutri-dv">{Math.round((nutri.zinc / 11) * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Azúcares */}
          <div className="nutri-detalle-seccion">
            <h3>Azúcares</h3>
            <div className="nutri-grid-simple">
              <div className="nutri-item-simple">
                <span>Azúcar</span>
                <strong>{nutri.azucar} g</strong>
              </div>
              <div className="nutri-item-simple">
                <span>Sacarosa</span>
                <strong>{nutri.sacarosa} g</strong>
              </div>
              <div className="nutri-item-simple">
                <span>Glucosa</span>
                <strong>{nutri.glucosa} g</strong>
              </div>
              <div className="nutri-item-simple">
                <span>Fructosa</span>
                <strong>{nutri.fructosa} g</strong>
              </div>
              <div className="nutri-item-simple">
                <span>Lactosa</span>
                <strong>{nutri.lactosa} g</strong>
              </div>
              <div className="nutri-item-simple">
                <span>Maltosa</span>
                <strong>{nutri.maltosa} g</strong>
              </div>
              <div className="nutri-item-simple">
                <span>Galactosa</span>
                <strong>{nutri.galactosa} g</strong>
              </div>
              <div className="nutri-item-simple">
                <span>Almidón</span>
                <strong>{nutri.almidon} g</strong>
              </div>
            </div>
          </div>

          {/* Grasas */}
          <div className="nutri-detalle-seccion">
            <h3>Grasas</h3>
            <div className="nutri-grid-simple">
              <div className="nutri-item-simple">
                <span>Grasas saturadas</span>
                <strong>{nutri.grasSat} g</strong>
                <span className="nutri-dv-inline">{Math.round((nutri.grasSat / 20) * 100)}%</span>
              </div>
              <div className="nutri-item-simple">
                <span>Grasas monoinsaturadas</span>
                <strong>{nutri.grasMonoins} g</strong>
              </div>
              <div className="nutri-item-simple">
                <span>Grasas poliinsaturadas</span>
                <strong>{nutri.grasPoliins} g</strong>
              </div>
              <div className="nutri-item-simple">
                <span>Grasas trans</span>
                <strong>{nutri.grasTrans} g</strong>
              </div>
            </div>
          </div>

          {/* Ácidos Grasos */}
          <div className="nutri-detalle-seccion">
            <h3>Ácidos Grasos</h3>
            <div className="nutri-grid-simple">
              <div className="nutri-item-simple">
                <span>Omega 3 total</span>
                <strong>{nutri.omega3} g</strong>
              </div>
              <div className="nutri-item-simple">
                <span>Omega 6 total</span>
                <strong>{nutri.omega6} g</strong>
              </div>
              <div className="nutri-item-simple">
                <span>Alpha Linolenic Acid (ALA)</span>
                <strong>{nutri.ala} g</strong>
              </div>
              <div className="nutri-item-simple">
                <span>Docosahexaenoic Acid (DHA)</span>
                <strong>{nutri.dha} g</strong>
              </div>
              <div className="nutri-item-simple">
                <span>Eicosapentaenoic Acid (EPA)</span>
                <strong>{nutri.epa} g</strong>
              </div>
              <div className="nutri-item-simple">
                <span>Docosapentaenoic Acid (DPA)</span>
                <strong>{nutri.dpa} g</strong>
              </div>
            </div>
          </div>

          {/* Aminoácidos */}
          <div className="nutri-detalle-seccion">
            <h3>Aminoácidos</h3>
            <div className="nutri-grid-simple">
              <div className="nutri-item-simple">
                <span>Alanina</span>
                <strong>{nutri.alanina} g</strong>
              </div>
              <div className="nutri-item-simple">
                <span>Arginina</span>
                <strong>{nutri.arginina} g</strong>
              </div>
              <div className="nutri-item-simple">
                <span>Ácido aspártico</span>
                <strong>{nutri.aspArtico} g</strong>
              </div>
              <div className="nutri-item-simple">
                <span>Cistina</span>
                <strong>{nutri.cistina} g</strong>
              </div>
              <div className="nutri-item-simple">
                <span>Ácido glutámico</span>
                <strong>{nutri.glutamico} g</strong>
              </div>
              <div className="nutri-item-simple">
                <span>Glicina</span>
                <strong>{nutri.glicina} g</strong>
              </div>
              <div className="nutri-item-simple">
                <span>Histidina</span>
                <strong>{nutri.histidina} g</strong>
              </div>
              <div className="nutri-item-simple">
                <span>Hidroxiprolina</span>
                <strong>{nutri.hidroxiprolina} g</strong>
              </div>
              <div className="nutri-item-simple">
                <span>Isoleucina</span>
                <strong>{nutri.isoleucina} g</strong>
              </div>
              <div className="nutri-item-simple">
                <span>Leucina</span>
                <strong>{nutri.leucina} g</strong>
              </div>
              <div className="nutri-item-simple">
                <span>Lisina</span>
                <strong>{nutri.lisina} g</strong>
              </div>
              <div className="nutri-item-simple">
                <span>Metionina</span>
                <strong>{nutri.metionina} g</strong>
              </div>
              <div className="nutri-item-simple">
                <span>Fenilalanina</span>
                <strong>{nutri.fenilalanina} g</strong>
              </div>
              <div className="nutri-item-simple">
                <span>Prolina</span>
                <strong>{nutri.prolina} g</strong>
              </div>
              <div className="nutri-item-simple">
                <span>Serina</span>
                <strong>{nutri.serina} g</strong>
              </div>
              <div className="nutri-item-simple">
                <span>Treonina</span>
                <strong>{nutri.treonina} g</strong>
              </div>
              <div className="nutri-item-simple">
                <span>Triptófano</span>
                <strong>{nutri.triptofano} g</strong>
              </div>
              <div className="nutri-item-simple">
                <span>Tirosina</span>
                <strong>{nutri.tirosina} g</strong>
              </div>
              <div className="nutri-item-simple">
                <span>Valina</span>
                <strong>{nutri.valina} g</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  // Tarjeta de Receta
  const TarjetaReceta = ({ receta, toggleFav, esFav }) => {
    const [verDetalle, setVerDetalle] = useState(false);

    return (
      <>
        <div className="tarjeta-receta" onClick={() => setVerDetalle(true)}>
          <div className="tarjeta-img">
            <img src={receta.img} alt={receta.nombre} />
            <button
              className={`btn-fav ${esFav ? 'activo' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleFav(receta.id);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>
          <div className="tarjeta-info">
            <h3>{receta.nombre}</h3>
            <p>{receta.desc}</p>
            <div className="tarjeta-puntuacion">
              ⭐ {receta.puntos}/5
            </div>
          </div>
        </div>

        {verDetalle && (
          <DetalleReceta receta={receta} cerrar={() => setVerDetalle(false)} />
        )}
      </>
    );
  };

  // Modal Detalle de Receta
  const DetalleReceta = ({ receta, cerrar }) => {
    useEffect(() => {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }, []);
    const [verNutriDetalle, setVerNutriDetalle] = useState(false);
    return (
      <div className="modal-overlay" onClick={cerrar}>
        <div className="modal-contenedor-receta" onClick={(e) => e.stopPropagation()}>
          {!verNutriDetalle && <button className="modal-cerrar" onClick={cerrar}>✕</button>}

          <div className="modal-col modal-izq">
            <img src={receta.img} alt={receta.nombre} className="modal-img" />
            <h2>{receta.nombre}</h2>
            <p className="modal-desc">{receta.desc}</p>

            <div className="modal-seccion">
              <h3>Ingredientes</h3>
              <ul>
                {receta.ingredientes.map((ing, i) => (
                  <li key={i}>{ing}</li>
                ))}
              </ul>
            </div>

            <div className="modal-seccion">
              <h3>Preparación</h3>
              <ol>
                {receta.pasos.map((paso, i) => (
                  <li key={i}>{paso}</li>
                ))}
              </ol>
            </div>

            <div className="modal-seccion">
              <h3>Puntuación: ⭐ {receta.puntos}/5</h3>
              <div className="comentarios">
                {receta.comentarios.map((com, i) => (
                  <div key={i} className="comentario">
                    <strong>{com.usuario}</strong>
                    <p>{com.texto}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-col modal-der">
            <NutricionGrafico nutri={receta.nutri} onModalChange={setVerNutriDetalle} />
          </div>
        </div>
      </div>
    );
  };

  // ============ VISTAS ============

  // Vista Login
  const VistaLogin = ({ cambiarVista, iniciarSesion }) => {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');

    const manejarSubmit = () => {
      if (email && pass) {
        iniciarSesion({ email, nombre: 'Usuario' });
        cambiarVista('inicio');
      }
    };

    return (
      <div className="vista-auth">
        <div className="auth-card">
          <h2>Iniciar Sesión</h2>
          <div className="auth-form">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && manejarSubmit()}
            />
            <button onClick={manejarSubmit} className="btn-primario">Entrar</button>
          </div>
          <p>
            ¿No tienes cuenta? <span onClick={() => cambiarVista('registro')}>Regístrate</span>
          </p>
          <p>
            <span onClick={() => cambiarVista('recuperar')}>¿Olvidaste tu contraseña?</span>
          </p>
        </div>
      </div>
    );
  };

  // Vista Registro
  const VistaRegistro = ({ cambiarVista }) => {
    const [datos, setDatos] = useState({ nombre: '', email: '', pass: '', passConf: '' });

    const manejarRegistro = () => {
      if (datos.pass === datos.passConf) {
        cambiarVista('login');
      }
    };

    return (
      <div className="vista-auth">
        <div className="auth-card">
          <h2>Crear Cuenta</h2>
          <div className="auth-form">
            <input 
              type="text" 
              placeholder="Nombre completo"
              value={datos.nombre}
              onChange={(e) => setDatos({...datos, nombre: e.target.value})}
            />
            <input 
              type="email" 
              placeholder="Correo electrónico"
              value={datos.email}
              onChange={(e) => setDatos({...datos, email: e.target.value})}
            />
            <input 
              type="password" 
              placeholder="Contraseña"
              value={datos.pass}
              onChange={(e) => setDatos({...datos, pass: e.target.value})}
            />
            <input 
              type="password" 
              placeholder="Confirmar contraseña"
              value={datos.passConf}
              onChange={(e) => setDatos({...datos, passConf: e.target.value})}
              onKeyPress={(e) => e.key === 'Enter' && manejarRegistro()}
            />
            <button onClick={manejarRegistro} className="btn-primario">Registrarse</button>
          </div>
          <p>
            ¿Ya tienes cuenta? <span onClick={() => cambiarVista('login')}>Inicia sesión</span>
          </p>
        </div>
      </div>
    );
  };

  // Vista Recuperar Contraseña
  const VistaRecuperar = ({ cambiarVista }) => {
    const [email, setEmail] = useState('');

    const manejarRecuperar = () => {
      if (email) {
        alert('Email enviado');
        cambiarVista('login');
      }
    };

    return (
      <div className="vista-auth">
        <div className="auth-card">
          <h2>Recuperar Contraseña</h2>
          <div className="auth-form">
            <input 
              type="email" 
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && manejarRecuperar()}
            />
            <button onClick={manejarRecuperar} className="btn-primario">Enviar enlace</button>
          </div>
          <p>
            <span onClick={() => cambiarVista('login')}>Volver al inicio</span>
          </p>
        </div>
      </div>
    );
  };

  // Vista Inicio
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
      <div className="vista-inicio">
        <section className="hero">
          <h1>Sabemos que llevar una dieta especial puede ser un reto, pero no tienes que hacerlo solo.</h1>
          <p>Aquí te ofrecemos recetas pensadas para ti, con ingredientes fáciles de conseguir y preparaciones sencillas pero exquisitas. Cuida tu salud y disfruta de cada comida con confianza y sabor.</p>
        </section>
        <section className="categorias">
          {categorias.map(cat => (
            <button
              key={cat.id}
              className={`cat-btn ${categoriaActiva === cat.id ? 'activo' : ''}`}
              onClick={() => cambiarCategoria(cat.id)}
            >
              <span className="cat-icono" dangerouslySetInnerHTML={{__html: cat.icono}}></span>
              <span>{cat.nombre}</span>
            </button>
          ))}
        </section>

        <section id="filtro-salud" className="filtro-salud">
          <div className="filtro-header" onClick={() => setFiltroAbierto(!filtroAbierto)}>
            <h2>¡Busca tu Tipo de Dieta Aquí!</h2>
            <span className="filtro-toggle">{filtroAbierto ? '▲' : '▼'}</span>
          </div>
          
          {filtroAbierto && (
            <div className="filtro-contenido">
              <div className="filtro-info">
                <p>Selecciona todas las condiciones que se apliquen a ti. Solo verás recetas que cumplan con todas tus necesidades.</p>
                {filtrosActivos.length > 0 && (
                  <button className="btn-limpiar" onClick={limpiarFiltros}>
                    Limpiar filtros ({filtrosActivos.length})
                  </button>
                )}
              </div>
              <div className="filtro-grid">
                {condicionesSalud.map(condicion => (
                  <button
                    key={condicion.id}
                    className={`filtro-card ${filtrosActivos.includes(condicion.id) ? 'activo' : ''}`}
                    onClick={() => toggleFiltro(condicion.id)}
                  >
                    <span className="filtro-icono" dangerouslySetInnerHTML={{__html: condicion.icono}}></span>
                    <span className="filtro-nombre">{condicion.nombre}</span>
                    {filtrosActivos.includes(condicion.id) && (
                      <span className="filtro-check">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="recetas-grid">
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
            <p className="sin-resultados">No hay recetas disponibles con estos filtros.</p>
          )}
        </section>
      </div>
    );
  };

  // Vista Historial
  const VistaHistorial = ({ recetas}) => {
    const [periodo, setPeriodo] = useState('hoy');

    const historialRecetas = recetas.slice(0, 3);

    return (
      <div className="vista-historial">
        <h1>Mi Historial</h1>
        <div className="periodo-btns">
          <button className={periodo === 'hoy' ? 'activo' : ''} onClick={() => setPeriodo('hoy')}>
            Hoy
          </button>
          <button className={periodo === 'semana' ? 'activo' : ''} onClick={() => setPeriodo('semana')}>
            Esta Semana
          </button>
          <button className={periodo === 'mes' ? 'activo' : ''} onClick={() => setPeriodo('mes')}>
            Este Mes
          </button>
        </div>
        <div className="historial-grid">
          {historialRecetas.map(receta => (
            <div key={receta.id} className="historial-item">
              <img src={receta.img} alt={receta.nombre} />
              <div className="historial-info">
                <h3>{receta.nombre}</h3>
                <p className="historial-fecha">2024-01-20</p>
                <p>{receta.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Vista Favoritos
  const VistaFavoritos = ({ recetas, toggleFav, favoritos }) => {
    const recetasFav = recetas.filter(r => favoritos.includes(r.id));

    return (
      <div className="vista-favoritos">
        <h1>Mis Recetas Favoritas</h1>
        {recetasFav.length === 0 ? (
          <div className="vacio">
            <div className="vacio-icono">♥</div>
            <p>Aún no tienes recetas favoritas. ¡Explora y guarda tus favoritas!</p>
          </div>
        ) : (
          <div className="grid">
            {recetasFav.map(receta => (
              <TarjetaReceta
                key={receta.id}
                receta={receta}
                toggleFav={toggleFav}
                esFav={true}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Vista Contacto
  const VistaContacto = () => {
    const [datosForm, setDatosForm] = useState({
      nombre: '',
      email: '',
      asunto: '',
      mensaje: ''
    });

    const enviarMensaje = () => {
      if (datosForm.nombre && datosForm.email && datosForm.mensaje) {
        alert('Mensaje enviado correctamente');
        setDatosForm({ nombre: '', email: '', asunto: '', mensaje: '' });
      }
    };

    return (
      <div className="vista-contacto">
        <h1>Contáctanos</h1>
        <p className="contacto-subtitulo">
          Nos encantaría saber de ti. Envíanos un mensaje y te responderemos lo antes posible.
        </p>
        
        <div className="contacto-contenedor">
          <div className="contacto-info">
            <div className="info-item">
              <div className="info-icono">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <div>
                <h3>Correo</h3>
                <p>support@healthyhelp.com</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icono">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div>
                <h3>Teléfono</h3>
                <p>+1 (555) 123-4567</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icono">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <h3>Ubicación</h3>
                <p>123 Health Street, Wellness City</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icono">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <h3>Horario de Atención</h3>
                <p>Lun - Vie: 9:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>

          <div className="contacto-form">
            <h2>Envíanos un Mensaje</h2>
            <input 
              type="text" 
              placeholder="Juan Pérez"
              value={datosForm.nombre}
              onChange={(e) => setDatosForm({...datosForm, nombre: e.target.value})}
            />
            <input 
              type="email" 
              placeholder="juan@ejemplo.com"
              value={datosForm.email}
              onChange={(e) => setDatosForm({...datosForm, email: e.target.value})}
            />
            <input 
              type="text" 
              placeholder="¿Cómo podemos ayudarte?"
              value={datosForm.asunto}
              onChange={(e) => setDatosForm({...datosForm, asunto: e.target.value})}
            />
            <textarea 
              placeholder="Cuéntanos más sobre tu consulta..." 
              rows="5"
              value={datosForm.mensaje}
              onChange={(e) => setDatosForm({...datosForm, mensaje: e.target.value})}
            ></textarea>
            <button onClick={enviarMensaje} className="btn-primario">Enviar Mensaje</button>
          </div>
        </div>
      </div>
    );
  };

  // ============ APP PRINCIPAL ============

  function App() {
    const [vista, setVista] = useState('inicio');
    const [usuario, setUsuario] = useState(null);
    const [favoritos, setFavoritos] = useState([]);
    const [categoriaActiva, setCategoriaActiva] = useState('todas');
    const [robotActivo, setRobotActivo] = useState(false);
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [modoOscuro, setModoOscuro] = useState(() => {
      const guardado = localStorage.getItem('modoOscuro');
      if (guardado !== null) {
        return guardado === 'true';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    const toggleModoOscuro = () => {
      setModoOscuro(prev => {
        const nuevo = !prev;
        localStorage.setItem('modoOscuro', nuevo);
        return nuevo;
      });
    };

    // Datos de ejemplo
    const recetas = [
      {
        id: 1,
        nombre: 'Ensalada Mediterránea con Quinoa',
        desc: 'Una ensalada fresca y nutritiva perfecta para personas con diabetes. Rica en fibra y proteínas vegetales.',
        img: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
        cat: 'almuerzo',
        salud: ['diabetes', 'vegano', 'vegetariano', 'bajo-sodio', 'celiaco', 'sin-azucar', 'bajo-grasa'],
        puntos: 4.8,
        ingredientes: ['Quinoa', 'Tomates cherry', 'Pepino', 'Aceitunas', 'Aceite de oliva'],
        pasos: ['Cocina la quinoa', 'Corta los vegetales', 'Mezcla todos los ingredientes', 'Aliña con aceite de oliva'],
        nutri: {
          cal: 320, prot: 12, carb: 35, gras: 14, fiber: 8, sodio: 150, colesterol: 0,
          carbNetos: 27, calcio: 80, hierro: 3.5, potasio: 450, vitD: 0,
          alphaCaroteno: 25, betaCaroteno: 520, cafeina: 0, colina: 45, cobre: 0.4,
          fluoruro: 5, folato: 78, licopeno: 1200, magnesio: 95, manganeso: 1.2,
          niacina: 2.8, acPantotenico: 0.9, fosforo: 185, retinol: 0, riboflavina: 0.15,
          selenio: 12, teobromina: 0, tiamina: 0.2, vitAIU: 850, vitA: 85, vitB12: 0,
          vitB6: 0.3, vitC: 28, vitDIU: 0, vitD2: 0, vitD3: 0, vitE: 3.5, vitK: 45, zinc: 1.8,
          azucar: 5, sacarosa: 1.5, glucosa: 2, fructosa: 1.5, lactosa: 0, maltosa: 0,
          galactosa: 0, almidon: 18, grasSat: 2, grasMonoins: 8, grasPoliins: 3,
          grasTrans: 0, omega3: 0.4, omega6: 2.5, ala: 0.4, dha: 0, epa: 0, dpa: 0,
          alanina: 0.5, arginina: 0.8, aspArtico: 1.2, cistina: 0.2, glutamico: 2.1,
          glicina: 0.6, histidina: 0.3, hidroxiprolina: 0, isoleucina: 0.5, leucina: 0.8,
          lisina: 0.7, metionina: 0.2, fenilalanina: 0.6, prolina: 0.5, serina: 0.6,
          treonina: 0.4, triptofano: 0.1, tirosina: 0.3, valina: 0.6
        },
        comentarios: [{ usuario: 'María G.', texto: '¡Deliciosa y muy fácil de preparar!' }]
      },
      {
        id: 2,
        nombre: 'Pollo Teriyaki con Brócoli',
        desc: 'Receta asiática saludable baja en carbohidratos. Rica en proteínas magras.',
        img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
        cat: 'cena',
        salud: ['diabetes', 'bajo-carbohidratos', 'celiaco', 'sin-frutos-secos', 'bajo-sodio'],
        puntos: 4.7,
        ingredientes: ['Pechuga de pollo', 'Brócoli', 'Salsa teriyaki sin azúcar', 'Sésamo', 'Ajo'],
        pasos: ['Corta el pollo en tiras', 'Saltea con ajo', 'Añade brócoli y salsa', 'Cocina 10 minutos'],
        nutri: {
          cal: 320, prot: 38, carb: 18, gras: 10, fiber: 4, sodio: 580, colesterol: 95,
          carbNetos: 14, calcio: 60, hierro: 1.8, potasio: 520, vitD: 0.5,
          alphaCaroteno: 15, betaCaroteno: 380, cafeina: 0, colina: 85, cobre: 0.2,
          fluoruro: 8, folato: 65, licopeno: 0, magnesio: 45, manganeso: 0.5,
          niacina: 12.5, acPantotenico: 1.8, fosforo: 285, retinol: 12, riboflavina: 0.25,
          selenio: 32, teobromina: 0, tiamina: 0.15, vitAIU: 620, vitA: 62, vitB12: 0.8,
          vitB6: 0.8, vitC: 85, vitDIU: 20, vitD2: 0, vitD3: 0.5, vitE: 1.5, vitK: 125, zinc: 2.2,
          azucar: 8, sacarosa: 3, glucosa: 2.5, fructosa: 2.5, lactosa: 0, maltosa: 0,
          galactosa: 0, almidon: 6, grasSat: 2.5, grasMonoins: 4, grasPoliins: 2.5,
          grasTrans: 0, omega3: 0.2, omega6: 2, ala: 0.15, dha: 0.05, epa: 0, dpa: 0,
          alanina: 2.1, arginina: 2.5, aspArtico: 3.6, cistina: 0.4, glutamico: 6.2,
          glicina: 1.8, histidina: 1.2, hidroxiprolina: 0, isoleucina: 1.9, leucina: 3.2,
          lisina: 3.5, metionina: 1.1, fenilalanina: 1.6, prolina: 1.4, serina: 1.5,
          treonina: 1.7, triptofano: 0.5, tirosina: 1.4, valina: 2.0
        },

        comentarios: [
          { usuario: 'Pedro R.', texto: 'Excelente sabor y muy saludable!' },
          { usuario: 'Laura M.', texto: 'Perfecta para mis cenas ligeras.' }
        ]
      },
      {
        id: 3,
        nombre: 'Salmón al Horno con Vegetales',
        desc: 'Receta baja en sodio ideal para hipertensión. Rico en omega-3 y antioxidantes naturales.',
        img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
        cat: 'almuerzo',
        salud: ['hipertension', 'bajo-sodio', 'paleo', 'sin-frutos-secos', 'colesterol-alto', 'bajo-carbohidratos'],
        puntos: 4.9,
        ingredientes: ['Salmón fresco', 'Brócoli', 'Zanahorias', 'Limón', 'Hierbas frescas'],
        pasos: ['Precalienta el horno', 'Coloca el salmón y vegetales', 'Hornea 20 minutos', 'Sirve con limón'],
        nutri: {
          cal: 380, prot: 32, carb: 18, gras: 20, fiber: 5, sodio: 180, colesterol: 75,
          carbNetos: 13, calcio: 90, hierro: 2.2, potasio: 680, vitD: 12,
          alphaCaroteno: 680, betaCaroteno: 4200, cafeina: 0, colina: 95, cobre: 0.3,
          fluoruro: 12, folato: 85, licopeno: 0, magnesio: 55, manganeso: 0.6,
          niacina: 10.5, acPantotenico: 2.1, fosforo: 320, retinol: 45, riboflavina: 0.35,
          selenio: 48, teobromina: 0, tiamina: 0.25, vitAIU: 4850, vitA: 485, vitB12: 4.5,
          vitB6: 0.9, vitC: 42, vitDIU: 480, vitD2: 0, vitD3: 12, vitE: 4.5, vitK: 68, zinc: 1.5,
          azucar: 6, sacarosa: 1.8, glucosa: 2.1, fructosa: 2.1, lactosa: 0, maltosa: 0,
          galactosa: 0, almidon: 8, grasSat: 4, grasMonoins: 8.5, grasPoliins: 6.5,
          grasTrans: 0, omega3: 2.8, omega6: 1.2, ala: 0.3, dha: 1.8, epa: 0.7, dpa: 0,
          alanina: 1.9, arginina: 1.8, aspArtico: 3.2, cistina: 0.35, glutamico: 4.8,
          glicina: 1.5, histidina: 0.95, hidroxiprolina: 0, isoleucina: 1.5, leucina: 2.6,
          lisina: 2.9, metionina: 0.95, fenilalanina: 1.3, prolina: 1.1, serina: 1.3,
          treonina: 1.4, triptofano: 0.35, tirosina: 1.1, valina: 1.7
        },
        comentarios: [{ usuario: 'Ana L.', texto: 'Mi plato favorito de la semana' }]
      },
      {
        id: 4,
        nombre: 'Ensalada de Garbanzos con Hierbas',
        desc: 'Ensalada fresca y ligera sin sal añadida. Perfecta para controlar la presión arterial.',
        img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
        cat: 'almuerzo',
        salud: ['hipertension', 'bajo-sodio', 'vegano', 'vegetariano', 'celiaco', 'bajo-grasa'],
        puntos: 4.6,
        ingredientes: ['Garbanzos', 'Perejil', 'Cilantro', 'Tomate', 'Limón', 'Aceite de oliva'],
        pasos: ['Escurre los garbanzos', 'Pica las hierbas', 'Mezcla todos los ingredientes', 'Aliña al gusto'],
        nutri: {
          cal: 280, prot: 12, carb: 38, gras: 9, fiber: 11, sodio: 95, colesterol: 0,
          carbNetos: 27, calcio: 75, hierro: 3.8, potasio: 420, vitD: 0,
          alphaCaroteno: 12, betaCaroteno: 280, cafeina: 0, colina: 52, cobre: 0.45,
          fluoruro: 4, folato: 145, licopeno: 850, magnesio: 78, manganeso: 1.5,
          niacina: 1.8, acPantotenico: 0.7, fosforo: 165, retinol: 0, riboflavina: 0.12,
          selenio: 8, teobromina: 0, tiamina: 0.18, vitAIU: 520, vitA: 52, vitB12: 0,
          vitB6: 0.35, vitC: 38, vitDIU: 0, vitD2: 0, vitD3: 0, vitE: 2.8, vitK: 35, zinc: 2.1,
          azucar: 7, sacarosa: 2, glucosa: 2.5, fructosa: 2.5, lactosa: 0, maltosa: 0,
          galactosa: 0, almidon: 22, grasSat: 1.2, grasMonoins: 5, grasPoliins: 2.5,
          grasTrans: 0, omega3: 0.3, omega6: 2.1, ala: 0.3, dha: 0, epa: 0, dpa: 0,
          alanina: 0.5, arginina: 1.1, aspArtico: 1.4, cistina: 0.15, glutamico: 2.1,
          glicina: 0.5, histidina: 0.35, hidroxiprolina: 0, isoleucina: 0.55, leucina: 0.9,
          lisina: 0.8, metionina: 0.15, fenilalanina: 0.65, prolina: 0.5, serina: 0.6,
          treonina: 0.45, triptofano: 0.1, tirosina: 0.3, valina: 0.55
        },
        comentarios: [
          { usuario: 'Sofía T.', texto: 'Fresca y muy nutritiva, ideal para el verano.' },
          { usuario: 'Miguel A.', texto: 'Me encanta lo fácil que es de preparar.' }
        ]
      },
      {
        id: 5,
        nombre: 'Tostadas de Aguacate y Huevo',
        desc: 'Desayuno completo rico en grasas saludables y proteínas de alta calidad.',
        img: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400',
        cat: 'desayuno',
        salud: ['celiaco', 'vegetariano', 'bajo-carbohidratos', 'keto', 'sin-frutos-secos'],
        puntos: 4.7,
        ingredientes: ['Pan integral sin gluten', 'Aguacate', 'Huevos', 'Tomates cherry', 'Aceite de oliva'],
        pasos: ['Tuesta el pan', 'Machaca el aguacate', 'Fríe los huevos', 'Monta las tostadas'],
        nutri: {
          cal: 340, prot: 16, carb: 24, gras: 20, fiber: 8, sodio: 280, colesterol: 370,
          carbNetos: 16, calcio: 95, hierro: 2.5, potasio: 520, vitD: 2,
          alphaCaroteno: 8, betaCaroteno: 180, cafeina: 0, colina: 148, cobre: 0.25,
          fluoruro: 15, folato: 95, licopeno: 320, magnesio: 42, manganeso: 0.4,
          niacina: 1.5, acPantotenico: 1.8, fosforo: 215, retinol: 85, riboflavina: 0.48,
          selenio: 28, teobromina: 0, tiamina: 0.12, vitAIU: 680, vitA: 98, vitB12: 1.2,
          vitB6: 0.4, vitC: 18, vitDIU: 80, vitD2: 0, vitD3: 2, vitE: 4.2, vitK: 28, zinc: 1.8,
          azucar: 3, sacarosa: 0.8, glucosa: 1.1, fructosa: 1.1, lactosa: 0, maltosa: 0,
          galactosa: 0, almidon: 15, grasSat: 4.5, grasMonoins: 11, grasPoliins: 3.5,
          grasTrans: 0, omega3: 0.5, omega6: 2.8, ala: 0.4, dha: 0.1, epa: 0, dpa: 0,
          alanina: 0.9, arginina: 1.1, aspArtico: 1.6, cistina: 0.35, glutamico: 2.1,
          glicina: 0.55, histidina: 0.42, hidroxiprolina: 0, isoleucina: 0.85, leucina: 1.4,
          lisina: 1.1, metionina: 0.52, fenilalanina: 0.88, prolina: 0.65, serina: 1.2,
          treonina: 0.78, triptofano: 0.22, tirosina: 0.68, valina: 1.05
        },
        comentarios: [
          { usuario: 'Carmen V.', texto: 'Mi desayuno favorito de la semana!' },
          { usuario: 'Daniel F.', texto: 'Perfecta combinación de sabores y texturas.' }
        ]
      },
      {
        id: 6,
        nombre: 'Bowl de Pollo y Aguacate',
        desc: 'Comida balanceada perfecta para control de peso. Alta en proteínas y grasas saludables.',
        img: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=400&q=80',
        cat: 'almuerzo',
        salud: ['celiaco', 'keto', 'bajo-carbohidratos', 'paleo', 'sin-frutos-secos'],
        puntos: 4.7,
        ingredientes: ['Pechuga de pollo', 'Aguacate', 'Espinacas', 'Tomates', 'Aceite de oliva'],
        pasos: ['Cocina el pollo a la plancha', 'Corta el aguacate', 'Monta el bowl', 'Aliña con aceite'],
        nutri: {
          cal: 420, prot: 35, carb: 15, gras: 25, fiber: 7, sodio: 320, colesterol: 85,
          carbNetos: 8, calcio: 68, hierro: 2.8, potasio: 780, vitD: 0.3,
          alphaCaroteno: 45, betaCaroteno: 1200, cafeina: 0, colina: 92, cobre: 0.28,
          fluoruro: 6, folato: 125, licopeno: 680, magnesio: 58, manganeso: 0.65,
          niacina: 11.2, acPantotenico: 2.2, fosforo: 295, retinol: 18, riboflavina: 0.32,
          selenio: 35, teobromina: 0, tiamina: 0.18, vitAIU: 1450, vitA: 145, vitB12: 0.6,
          vitB6: 0.95, vitC: 48, vitDIU: 12, vitD2: 0, vitD3: 0.3, vitE: 5.2, vitK: 98, zinc: 2.5,
          azucar: 4, sacarosa: 1, glucosa: 1.5, fructosa: 1.5, lactosa: 0, maltosa: 0,
          galactosa: 0, almidon: 5, grasSat: 5.5, grasMonoins: 13.5, grasPoliins: 4.5,
          grasTrans: 0, omega3: 0.6, omega6: 3.5, ala: 0.5, dha: 0.1, epa: 0, dpa: 0,
          alanina: 2.2, arginina: 2.6, aspArtico: 3.8, cistina: 0.45, glutamico: 6.5,
          glicina: 1.9, histidina: 1.3, hidroxiprolina: 0, isoleucina: 2.0, leucina: 3.4,
          lisina: 3.7, metionina: 1.15, fenilalanina: 1.7, prolina: 1.5, serina: 1.6,
          treonina: 1.75, triptofano: 0.52, tirosina: 1.45, valina: 2.1
        },
        comentarios: [
          { usuario: 'Isabel N.', texto: 'Completa, saludable y deliciosa.' },
          { usuario: 'Fernando P.', texto: 'Ideal para después del gimnasio.' }
        ]

      },
      {
        id: 7,
        nombre: 'Batido Verde Energizante',
        desc: 'Perfecto para comenzar el día con energía. Rico en vitaminas y minerales esenciales.',
        img: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=400',
        cat: 'desayuno',
        salud: ['intolerancia-lactosa', 'vegano', 'vegetariano', 'diabetes', 'celiaco', 'sin-frutos-secos', 'bajo-sodio'],
        puntos: 4.9,
        ingredientes: ['Espinacas', 'Plátano', 'Leche de almendras', 'Chía', 'Miel'],
        pasos: ['Lava las espinacas', 'Coloca todo en la licuadora', 'Licúa hasta que esté suave', 'Sirve frío'],
        nutri: {
          cal: 180, prot: 6, carb: 28, gras: 5, fiber: 6, sodio: 65, colesterol: 0,
          carbNetos: 22, calcio: 185, hierro: 2.5, potasio: 520, vitD: 2.5,
          alphaCaroteno: 28, betaCaroteno: 1850, cafeina: 0, colina: 28, cobre: 0.18,
          fluoruro: 3, folato: 95, licopeno: 0, magnesio: 82, manganeso: 0.95,
          niacina: 1.2, acPantotenico: 0.65, fosforo: 125, retinol: 0, riboflavina: 0.22,
          selenio: 4, teobromina: 0, tiamina: 0.15, vitAIU: 2150, vitA: 215, vitB12: 0.5,
          vitB6: 0.45, vitC: 25, vitDIU: 100, vitD2: 0, vitD3: 2.5, vitE: 2.8, vitK: 185, zinc: 0.8,
          azucar: 15, sacarosa: 3, glucosa: 6, fructosa: 6, lactosa: 0, maltosa: 0,
          galactosa: 0, almidon: 4, grasSat: 0.5, grasMonoins: 1.2, grasPoliins: 2.8,
          grasTrans: 0, omega3: 2.2, omega6: 0.5, ala: 2.2, dha: 0, epa: 0, dpa: 0,
          alanina: 0.3, arginina: 0.4, aspArtico: 0.6, cistina: 0.08, glutamico: 0.9,
          glicina: 0.25, histidina: 0.15, hidroxiprolina: 0, isoleucina: 0.28, leucina: 0.45,
          lisina: 0.35, metionina: 0.08, fenilalanina: 0.3, prolina: 0.25, serina: 0.3,
          treonina: 0.22, triptofano: 0.06, tirosina: 0.18, valina: 0.32
        },
        comentarios: [
          { usuario: 'Andrea L.', texto: 'Me da energía para todo el día!' },
          { usuario: 'Pablo C.', texto: 'Excelente manera de consumir vegetales.' }
        ]
      },
      {
        id: 8,
        nombre: 'Curry de Garbanzos y Espinacas',
        desc: 'Plato vegano rico en hierro y fibra. Ideal para una digestión saludable.',
        img: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400',
        cat: 'cena',
        salud: ['intolerancia-lactosa', 'vegano', 'vegetariano', 'celiaco', 'sin-frutos-secos', 'gastritis'],
        puntos: 4.9,
        ingredientes: ['Garbanzos', 'Espinacas', 'Leche de coco', 'Curry', 'Jengibre'],
        pasos: ['Sofríe las especias', 'Añade los garbanzos', 'Agrega la leche de coco', 'Cocina 15 minutos'],
        nutri: {
          cal: 380, prot: 14, carb: 48, gras: 14, fiber: 12, sodio: 420, colesterol: 0,
          carbNetos: 36, calcio: 195, hierro: 5.2, potasio: 780, vitD: 0,
          alphaCaroteno: 85, betaCaroteno: 3500, cafeina: 0, colina: 65, cobre: 0.58,
          fluoruro: 8, folato: 185, licopeno: 0, magnesio: 125, manganeso: 1.8,
          niacina: 2.5, acPantotenico: 1.2, fosforo: 245, retinol: 0, riboflavina: 0.28,
          selenio: 12, teobromina: 0, tiamina: 0.32, vitAIU: 4250, vitA: 425, vitB12: 0,
          vitB6: 0.55, vitC: 32, vitDIU: 0, vitD2: 0, vitD3: 0, vitE: 3.8, vitK: 285, zinc: 2.8,
          azucar: 8, sacarosa: 2.5, glucosa: 2.8, fructosa: 2.7, lactosa: 0, maltosa: 0,
          galactosa: 0, almidon: 28, grasSat: 8, grasMonoins: 3.5, grasPoliins: 2,
          grasTrans: 0, omega3: 0.25, omega6: 1.6, ala: 0.25, dha: 0, epa: 0, dpa: 0,
          alanina: 0.6, arginina: 1.3, aspArtico: 1.6, cistina: 0.18, glutamico: 2.5,
          glicina: 0.6, histidina: 0.4, hidroxiprolina: 0, isoleucina: 0.65, leucina: 1.1,
          lisina: 0.95, metionina: 0.18, fenilalanina: 0.75, prolina: 0.6, serina: 0.7,
          treonina: 0.52, triptofano: 0.12, tirosina: 0.35, valina: 0.65
        },
        comentarios: [
          { usuario: 'Mónica D.', texto: 'Sabores increíbles y muy reconfortante.' },
          { usuario: 'Jorge H.', texto: 'Quedó mejor de lo que esperaba!' }
        ]
      },
      {
        id: 9,
        nombre: 'Chips de Kale al Horno',
        desc: 'Snack crujiente y nutritivo bajo en calorías. Rico en antioxidantes y vitaminas.',
        img: 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=400',
        cat: 'postres-snacks',
        salud: ['vegano', 'vegetariano', 'keto', 'paleo', 'celiaco', 'bajo-carbohidratos', 'sin-azucar', 'bajo-grasa'],
        puntos: 4.5,
        ingredientes: ['Kale', 'Aceite de oliva', 'Sal marina', 'Ajo en polvo'],
        pasos: ['Lava y seca el kale', 'Mezcla con aceite y especias', 'Hornea 12 minutos', 'Deja enfriar'],
        nutri: {
          cal: 320, prot: 12, carb: 35, gras: 14, fiber: 8, sodio: 150, colesterol: 0,
          carbNetos: 27, calcio: 80, hierro: 3.5, potasio: 450, vitD: 0,
          alphaCaroteno: 25, betaCaroteno: 520, cafeina: 0, colina: 45, cobre: 0.4,
          fluoruro: 5, folato: 78, licopeno: 1200, magnesio: 95, manganeso: 1.2,
          niacina: 2.8, acPantotenico: 0.9, fosforo: 185, retinol: 0, riboflavina: 0.15,
          selenio: 12, teobromina: 0, tiamina: 0.2, vitAIU: 850, vitA: 85, vitB12: 0,
          vitB6: 0.3, vitC: 28, vitDIU: 0, vitD2: 0, vitD3: 0, vitE: 3.5, vitK: 45, zinc: 1.8,
          azucar: 5, sacarosa: 1.5, glucosa: 2, fructosa: 1.5, lactosa: 0, maltosa: 0,
          galactosa: 0, almidon: 18, grasSat: 2, grasMonoins: 8, grasPoliins: 3,
          grasTrans: 0, omega3: 0.4, omega6: 2.5, ala: 0.4, dha: 0, epa: 0, dpa: 0,
          alanina: 0.5, arginina: 0.8, aspArtico: 1.2, cistina: 0.2, glutamico: 2.1,
          glicina: 0.6, histidina: 0.3, hidroxiprolina: 0, isoleucina: 0.5, leucina: 0.8,
          lisina: 0.7, metionina: 0.2, fenilalanina: 0.6, prolina: 0.5, serina: 0.6,
          treonina: 0.4, triptofano: 0.1, tirosina: 0.3, valina: 0.6
        },
        comentarios: [
          { usuario: 'Valentina K.', texto: 'Crujientes y adictivos, mejor que las papas fritas!' },
          { usuario: 'Ricardo M.', texto: 'Perfecto snack saludable para la tarde.' }
        ]
      },
      {
        id: 10,
        nombre: 'Sopa de Lentejas y Verduras',
        desc: 'Receta rica en fibra ideal para digestión saludable. Baja en calorías y muy nutritiva.',
        img: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?w=400',
        cat: 'cena',
        salud: ['vegano', 'vegetariano', 'bajo-sodio', 'celiaco', 'sin-frutos-secos', 'bajo-grasa', 'gastritis'],
        puntos: 4.6,
        ingredientes: ['Lentejas', 'Zanahoria', 'Apio', 'Cebolla', 'Caldo de verduras'],
        pasos: ['Sofríe las verduras', 'Añade las lentejas', 'Agrega el caldo', 'Cocina 30 minutos'],
        nutri: {
          cal: 320, prot: 38, carb: 18, gras: 10, fiber: 4, sodio: 580, colesterol: 95,
          carbNetos: 14, calcio: 60, hierro: 1.8, potasio: 520, vitD: 0.5,
          alphaCaroteno: 15, betaCaroteno: 380, cafeina: 0, colina: 85, cobre: 0.2,
          fluoruro: 8, folato: 65, licopeno: 0, magnesio: 45, manganeso: 0.5,
          niacina: 12.5, acPantotenico: 1.8, fosforo: 285, retinol: 12, riboflavina: 0.25,
          selenio: 32, teobromina: 0, tiamina: 0.15, vitAIU: 620, vitA: 62, vitB12: 0.8,
          vitB6: 0.8, vitC: 85, vitDIU: 20, vitD2: 0, vitD3: 0.5, vitE: 1.5, vitK: 125, zinc: 2.2,
          azucar: 8, sacarosa: 3, glucosa: 2.5, fructosa: 2.5, lactosa: 0, maltosa: 0,
          galactosa: 0, almidon: 6, grasSat: 2.5, grasMonoins: 4, grasPoliins: 2.5,
          grasTrans: 0, omega3: 0.2, omega6: 2, ala: 0.15, dha: 0.05, epa: 0, dpa: 0,
          alanina: 2.1, arginina: 2.5, aspArtico: 3.6, cistina: 0.4, glutamico: 6.2,
          glicina: 1.8, histidina: 1.2, hidroxiprolina: 0, isoleucina: 1.9, leucina: 3.2,
          lisina: 3.5, metionina: 1.1, fenilalanina: 1.6, prolina: 1.4, serina: 1.5,
          treonina: 1.7, triptofano: 0.5, tirosina: 1.4, valina: 2.0
        },
        comentarios: [
          { usuario: 'Elena G.', texto: 'Reconfortante y perfecta para días fríos.' },
          { usuario: 'Tomás B.', texto: 'Nutritiva y muy fácil de preparar.' }
        ]
      },
      {
        id: 11,
        nombre: 'Yogur Griego con Frutos Rojos',
        desc: 'Desayuno probiótico ideal para la salud digestiva. Bajo en azúcar y rico en proteínas.',
        img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
        cat: 'desayuno',
        salud: ['vegetariano', 'bajo-grasa', 'diabetes', 'gastritis', 'sindrome-intestino'],
        puntos: 4.8,
        ingredientes: ['Yogur griego', 'Fresas', 'Arándanos', 'Granola sin azúcar', 'Miel'],
        pasos: ['Coloca el yogur en un bowl', 'Añade los frutos rojos', 'Espolvorea granola', 'Agrega miel al gusto'],
        nutri: {
          cal: 380, prot: 32, carb: 18, gras: 20, fiber: 5, sodio: 180, colesterol: 75,
          carbNetos: 13, calcio: 90, hierro: 2.2, potasio: 680, vitD: 12,
          alphaCaroteno: 680, betaCaroteno: 4200, cafeina: 0, colina: 95, cobre: 0.3,
          fluoruro: 12, folato: 85, licopeno: 0, magnesio: 55, manganeso: 0.6,
          niacina: 10.5, acPantotenico: 2.1, fosforo: 320, retinol: 45, riboflavina: 0.35,
          selenio: 48, teobromina: 0, tiamina: 0.25, vitAIU: 4850, vitA: 485, vitB12: 4.5,
          vitB6: 0.9, vitC: 42, vitDIU: 480, vitD2: 0, vitD3: 12, vitE: 4.5, vitK: 68, zinc: 1.5,
          azucar: 6, sacarosa: 1.8, glucosa: 2.1, fructosa: 2.1, lactosa: 0, maltosa: 0,
          galactosa: 0, almidon: 8, grasSat: 4, grasMonoins: 8.5, grasPoliins: 6.5,
          grasTrans: 0, omega3: 2.8, omega6: 1.2, ala: 0.3, dha: 1.8, epa: 0.7, dpa: 0,
          alanina: 1.9, arginina: 1.8, aspArtico: 3.2, cistina: 0.35, glutamico: 4.8,
          glicina: 1.5, histidina: 0.95, hidroxiprolina: 0, isoleucina: 1.5, leucina: 2.6,
          lisina: 2.9, metionina: 0.95, fenilalanina: 1.3, prolina: 1.1, serina: 1.3,
          treonina: 1.4, triptofano: 0.35, tirosina: 1.1, valina: 1.7
        },
        comentarios: [
          { usuario: 'Patricia W.', texto: 'Delicioso y muy saciante!' },
          { usuario: 'Andrés Q.', texto: 'El balance perfecto entre dulce y saludable.' }
        ]
      },
      {
        id: 12,
        nombre: 'Parfait de Chía y Mango',
        desc: 'Postre tropical ligero y refrescante. Alto en omega-3 y fibra soluble.',
        img: 'https://images.unsplash.com/photo-1511910849309-0dffb8785146?w=400',
        cat: 'postres-snacks',
        salud: ['vegetariano', 'vegano', 'celiaco', 'intolerancia-lactosa', 'diabetes', 'gastritis', 'bajo-grasa'],
        puntos: 4.7,
        ingredientes: ['Semillas de chía', 'Leche de coco', 'Mango', 'Vainilla', 'Stevia'],
        pasos: ['Mezcla chía con leche', 'Refrigera 4 horas', 'Corta el mango', 'Monta en capas'],
        nutri: {
          cal: 280, prot: 12, carb: 38, gras: 9, fiber: 11, sodio: 95, colesterol: 0,
          carbNetos: 27, calcio: 75, hierro: 3.8, potasio: 420, vitD: 0,
          alphaCaroteno: 12, betaCaroteno: 280, cafeina: 0, colina: 52, cobre: 0.45,
          fluoruro: 4, folato: 145, licopeno: 850, magnesio: 78, manganeso: 1.5,
          niacina: 1.8, acPantotenico: 0.7, fosforo: 165, retinol: 0, riboflavina: 0.12,
          selenio: 8, teobromina: 0, tiamina: 0.18, vitAIU: 520, vitA: 52, vitB12: 0,
          vitB6: 0.35, vitC: 38, vitDIU: 0, vitD2: 0, vitD3: 0, vitE: 2.8, vitK: 35, zinc: 2.1,
          azucar: 7, sacarosa: 2, glucosa: 2.5, fructosa: 2.5, lactosa: 0, maltosa: 0,
          galactosa: 0, almidon: 22, grasSat: 1.2, grasMonoins: 5, grasPoliins: 2.5,
          grasTrans: 0, omega3: 0.3, omega6: 2.1, ala: 0.3, dha: 0, epa: 0, dpa: 0,
          alanina: 0.5, arginina: 1.1, aspArtico: 1.4, cistina: 0.15, glutamico: 2.1,
          glicina: 0.5, histidina: 0.35, hidroxiprolina: 0, isoleucina: 0.55, leucina: 0.9,
          lisina: 0.8, metionina: 0.15, fenilalanina: 0.65, prolina: 0.5, serina: 0.6,
          treonina: 0.45, triptofano: 0.1, tirosina: 0.3, valina: 0.55
        },
        comentarios: [
          { usuario: 'Gabriela Z.', texto: 'Refrescante y lleno de sabor tropical.' },
          { usuario: 'Sebastián O.', texto: 'Perfecto para el desayuno o postre.' }
        ]
      },
      {
        id: 13,
        nombre: 'Mousse de Chocolate con Aguacate',
        desc: 'Postre cremoso y saludable sin lácteos. Rico en grasas saludables y antioxidantes.',
        img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
        cat: 'postres-snacks',
        salud: ['keto', 'vegano', 'vegetariano', 'paleo', 'celiaco', 'intolerancia-lactosa', 'sin-azucar'],
        puntos: 4.9,
        ingredientes: ['Aguacate maduro', 'Cacao en polvo', 'Stevia', 'Vainilla', 'Leche de almendras'],
        pasos: ['Licúa todos los ingredientes', 'Ajusta dulzor', 'Refrigera 2 horas', 'Decora con cacao'],
        nutri: {
          cal: 340, prot: 16, carb: 24, gras: 20, fiber: 8, sodio: 280, colesterol: 370,
          carbNetos: 16, calcio: 95, hierro: 2.5, potasio: 520, vitD: 2,
          alphaCaroteno: 8, betaCaroteno: 180, cafeina: 0, colina: 148, cobre: 0.25,
          fluoruro: 15, folato: 95, licopeno: 320, magnesio: 42, manganeso: 0.4,
          niacina: 1.5, acPantotenico: 1.8, fosforo: 215, retinol: 85, riboflavina: 0.48,
          selenio: 28, teobromina: 0, tiamina: 0.12, vitAIU: 680, vitA: 98, vitB12: 1.2,
          vitB6: 0.4, vitC: 18, vitDIU: 80, vitD2: 0, vitD3: 2, vitE: 4.2, vitK: 28, zinc: 1.8,
          azucar: 3, sacarosa: 0.8, glucosa: 1.1, fructosa: 1.1, lactosa: 0, maltosa: 0,
          galactosa: 0, almidon: 15, grasSat: 4.5, grasMonoins: 11, grasPoliins: 3.5,
          grasTrans: 0, omega3: 0.5, omega6: 2.8, ala: 0.4, dha: 0.1, epa: 0, dpa: 0,
          alanina: 0.9, arginina: 1.1, aspArtico: 1.6, cistina: 0.35, glutamico: 2.1,
          glicina: 0.55, histidina: 0.42, hidroxiprolina: 0, isoleucina: 0.85, leucina: 1.4,
          lisina: 1.1, metionina: 0.52, fenilalanina: 0.88, prolina: 0.65, serina: 1.2,
          treonina: 0.78, triptofano: 0.22, tirosina: 0.68, valina: 1.05
        },
        comentarios: [
          { usuario: 'Lucía J.', texto: 'No puedo creer que sea saludable, ¡está increíble!' },
          { usuario: 'Martín E.', texto: 'Cremoso y con sabor intenso a chocolate.' }
        ]
      },
      {
        id: 14,
        nombre: 'Aguacate Relleno con Atún',
        desc: 'Almuerzo keto completo. Alto en grasas saludables y proteína.',
        img: 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=400',
        cat: 'almuerzo',
        salud: ['keto', 'bajo-carbohidratos', 'paleo', 'celiaco', 'sin-frutos-secos'],
        puntos: 4.8,
        ingredientes: ['Aguacate', 'Atún en agua', 'Mayonesa', 'Limón', 'Cilantro'],
        pasos: ['Corta el aguacate por la mitad', 'Mezcla atún con mayonesa', 'Rellena el aguacate', 'Decora con cilantro'],
        nutri: {
          cal: 420, prot: 35, carb: 15, gras: 25, fiber: 7, sodio: 320, colesterol: 85,
          carbNetos: 8, calcio: 68, hierro: 2.8, potasio: 780, vitD: 0.3,
          alphaCaroteno: 45, betaCaroteno: 1200, cafeina: 0, colina: 92, cobre: 0.28,
          fluoruro: 6, folato: 125, licopeno: 680, magnesio: 58, manganeso: 0.65,
          niacina: 11.2, acPantotenico: 2.2, fosforo: 295, retinol: 18, riboflavina: 0.32,
          selenio: 35, teobromina: 0, tiamina: 0.18, vitAIU: 1450, vitA: 145, vitB12: 0.6,
          vitB6: 0.95, vitC: 48, vitDIU: 12, vitD2: 0, vitD3: 0.3, vitE: 5.2, vitK: 98, zinc: 2.5,
          azucar: 4, sacarosa: 1, glucosa: 1.5, fructosa: 1.5, lactosa: 0, maltosa: 0,
          galactosa: 0, almidon: 5, grasSat: 5.5, grasMonoins: 13.5, grasPoliins: 4.5,
          grasTrans: 0, omega3: 0.6, omega6: 3.5, ala: 0.5, dha: 0.1, epa: 0, dpa: 0,
          alanina: 2.2, arginina: 2.6, aspArtico: 3.8, cistina: 0.45, glutamico: 6.5,
          glicina: 1.9, histidina: 1.3, hidroxiprolina: 0, isoleucina: 2.0, leucina: 3.4,
          lisina: 3.7, metionina: 1.15, fenilalanina: 1.7, prolina: 1.5, serina: 1.6,
          treonina: 1.75, triptofano: 0.52, tirosina: 1.45, valina: 2.1
        },
        comentarios: [
          { usuario: 'Natalia Y.', texto: 'Fresco, rápido y muy satisfactorio.' },
          { usuario: 'Diego U.', texto: 'Perfecto para un almuerzo ligero.' }
        ]
      },
      {
        id: 15,
        nombre: 'Tacos de Pollo con Pico de Gallo',
        desc: 'Versión saludable de tacos. Alto en proteínas y bajo en grasas.',
        img: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400',
        cat: 'cena',
        salud: ['sin-mariscos', 'bajo-grasa', 'bajo-sodio', 'paleo'],
        puntos: 4.6,
        ingredientes: ['Pechuga de pollo', 'Tortillas de maíz', 'Tomate', 'Cilantro', 'Limón'],
        pasos: ['Marina el pollo', 'Cocina a la plancha', 'Calienta las tortillas', 'Arma los tacos'],
        nutri: {
          cal: 180, prot: 6, carb: 28, gras: 5, fiber: 6, sodio: 65, colesterol: 0,
          carbNetos: 22, calcio: 185, hierro: 2.5, potasio: 520, vitD: 2.5,
          alphaCaroteno: 28, betaCaroteno: 1850, cafeina: 0, colina: 28, cobre: 0.18,
          fluoruro: 3, folato: 95, licopeno: 0, magnesio: 82, manganeso: 0.95,
          niacina: 1.2, acPantotenico: 0.65, fosforo: 125, retinol: 0, riboflavina: 0.22,
          selenio: 4, teobromina: 0, tiamina: 0.15, vitAIU: 2150, vitA: 215, vitB12: 0.5,
          vitB6: 0.45, vitC: 25, vitDIU: 100, vitD2: 0, vitD3: 2.5, vitE: 2.8, vitK: 185, zinc: 0.8,
          azucar: 15, sacarosa: 3, glucosa: 6, fructosa: 6, lactosa: 0, maltosa: 0,
          galactosa: 0, almidon: 4, grasSat: 0.5, grasMonoins: 1.2, grasPoliins: 2.8,
          grasTrans: 0, omega3: 2.2, omega6: 0.5, ala: 2.2, dha: 0, epa: 0, dpa: 0,
          alanina: 0.3, arginina: 0.4, aspArtico: 0.6, cistina: 0.08, glutamico: 0.9,
          glicina: 0.25, histidina: 0.15, hidroxiprolina: 0, isoleucina: 0.28, leucina: 0.45,
          lisina: 0.35, metionina: 0.08, fenilalanina: 0.3, prolina: 0.25, serina: 0.3,
          treonina: 0.22, triptofano: 0.06, tirosina: 0.18, valina: 0.32
        },
        comentarios: [
          { usuario: 'Verónica I.', texto: 'Sabor auténtico y muy saludable!' },
          { usuario: 'Alejandro X.', texto: 'Mis hijos los devoran cada vez que los hago.' }
        ]
      },
      {
        id: 16,
        nombre: 'Ensalada César con Pollo',
        desc: 'Clásica ensalada sin anchoas. Rica y nutritiva.',
        img: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
        cat: 'almuerzo',
        salud: ['sin-mariscos', 'bajo-carbohidratos', 'sin-frutos-secos'],
        puntos: 4.7,
        ingredientes: ['Lechuga romana', 'Pollo a la plancha', 'Parmesano', 'Crotones', 'Aderezo César'],
        pasos: ['Corta la lechuga', 'Cocina el pollo', 'Mezcla los ingredientes', 'Sirve frío'],
        nutri: {
          cal: 380, prot: 14, carb: 48, gras: 14, fiber: 12, sodio: 420, colesterol: 0,
          carbNetos: 36, calcio: 195, hierro: 5.2, potasio: 780, vitD: 0,
          alphaCaroteno: 85, betaCaroteno: 3500, cafeina: 0, colina: 65, cobre: 0.58,
          fluoruro: 8, folato: 185, licopeno: 0, magnesio: 125, manganeso: 1.8,
          niacina: 2.5, acPantotenico: 1.2, fosforo: 245, retinol: 0, riboflavina: 0.28,
          selenio: 12, teobromina: 0, tiamina: 0.32, vitAIU: 4250, vitA: 425, vitB12: 0,
          vitB6: 0.55, vitC: 32, vitDIU: 0, vitD2: 0, vitD3: 0, vitE: 3.8, vitK: 285, zinc: 2.8,
          azucar: 8, sacarosa: 2.5, glucosa: 2.8, fructosa: 2.7, lactosa: 0, maltosa: 0,
          galactosa: 0, almidon: 28, grasSat: 8, grasMonoins: 3.5, grasPoliins: 2,
          grasTrans: 0, omega3: 0.25, omega6: 1.6, ala: 0.25, dha: 0, epa: 0, dpa: 0,
          alanina: 0.6, arginina: 1.3, aspArtico: 1.6, cistina: 0.18, glutamico: 2.5,
          glicina: 0.6, histidina: 0.4, hidroxiprolina: 0, isoleucina: 0.65, leucina: 1.1,
          lisina: 0.95, metionina: 0.18, fenilalanina: 0.75, prolina: 0.6, serina: 0.7,
          treonina: 0.52, triptofano: 0.12, tirosina: 0.35, valina: 0.65
        },
        comentarios: [
          { usuario: 'Camila Ñ.', texto: 'Clásica y siempre deliciosa.' },
          { usuario: 'Gustavo L.', texto: 'El pollo queda jugoso y perfectamente sazonado.' }
        ]
      },
      {
        id: 17,
        nombre: 'Avena con Nueces y Canela',
        desc: 'Desayuno que ayuda a reducir el colesterol. Rico en fibra soluble.',
        img: 'https://images.unsplash.com/photo-1495214783159-3503fd1b572d?w=400',
        cat: 'desayuno',
        salud: ['colesterol-alto', 'vegetariano', 'diabetes', 'bajo-grasa'],
        puntos: 4.8,
        ingredientes: ['Avena', 'Nueces', 'Canela', 'Leche descremada', 'Manzana'],
        pasos: ['Cocina la avena', 'Añade canela', 'Trocea la manzana', 'Agrega nueces'],
        nutri: {
          cal: 320, prot: 12, carb: 35, gras: 14, fiber: 8, sodio: 150, colesterol: 0,
          carbNetos: 27, calcio: 80, hierro: 3.5, potasio: 450, vitD: 0,
          alphaCaroteno: 25, betaCaroteno: 520, cafeina: 0, colina: 45, cobre: 0.4,
          fluoruro: 5, folato: 78, licopeno: 1200, magnesio: 95, manganeso: 1.2,
          niacina: 2.8, acPantotenico: 0.9, fosforo: 185, retinol: 0, riboflavina: 0.15,
          selenio: 12, teobromina: 0, tiamina: 0.2, vitAIU: 850, vitA: 85, vitB12: 0,
          vitB6: 0.3, vitC: 28, vitDIU: 0, vitD2: 0, vitD3: 0, vitE: 3.5, vitK: 45, zinc: 1.8,
          azucar: 5, sacarosa: 1.5, glucosa: 2, fructosa: 1.5, lactosa: 0, maltosa: 0,
          galactosa: 0, almidon: 18, grasSat: 2, grasMonoins: 8, grasPoliins: 3,
          grasTrans: 0, omega3: 0.4, omega6: 2.5, ala: 0.4, dha: 0, epa: 0, dpa: 0,
          alanina: 0.5, arginina: 0.8, aspArtico: 1.2, cistina: 0.2, glutamico: 2.1,
          glicina: 0.6, histidina: 0.3, hidroxiprolina: 0, isoleucina: 0.5, leucina: 0.8,
          lisina: 0.7, metionina: 0.2, fenilalanina: 0.6, prolina: 0.5, serina: 0.6,
          treonina: 0.4, triptofano: 0.1, tirosina: 0.3, valina: 0.6
        },
        comentarios: [
          { usuario: 'Beatriz R.', texto: 'Comenzar el día con esto es lo mejor!' },
          { usuario: 'Ernesto S.', texto: 'Nutritivo y me mantiene lleno hasta el almuerzo.' }
        ]
      },
      {
        id: 18,
        nombre: 'Ensalada de Frijoles Negros',
        desc: 'Rica en fibra para control de colesterol. Fresca y sabrosa.',
        img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
        cat: 'almuerzo',
        salud: ['colesterol-alto', 'vegano', 'vegetariano', 'celiaco', 'bajo-grasa'],
        puntos: 4.5,
        ingredientes: ['Frijoles negros', 'Maíz', 'Pimiento rojo', 'Cilantro', 'Lima'],
        pasos: ['Escurre los frijoles', 'Mezcla todos los ingredientes', 'Aliña con lima', 'Refrigera 30 min'],
        nutri: {
          cal: 320, prot: 38, carb: 18, gras: 10, fiber: 4, sodio: 580, colesterol: 95,
          carbNetos: 14, calcio: 60, hierro: 1.8, potasio: 520, vitD: 0.5,
          alphaCaroteno: 15, betaCaroteno: 380, cafeina: 0, colina: 85, cobre: 0.2,
          fluoruro: 8, folato: 65, licopeno: 0, magnesio: 45, manganeso: 0.5,
          niacina: 12.5, acPantotenico: 1.8, fosforo: 285, retinol: 12, riboflavina: 0.25,
          selenio: 32, teobromina: 0, tiamina: 0.15, vitAIU: 620, vitA: 62, vitB12: 0.8,
          vitB6: 0.8, vitC: 85, vitDIU: 20, vitD2: 0, vitD3: 0.5, vitE: 1.5, vitK: 125, zinc: 2.2,
          azucar: 8, sacarosa: 3, glucosa: 2.5, fructosa: 2.5, lactosa: 0, maltosa: 0,
          galactosa: 0, almidon: 6, grasSat: 2.5, grasMonoins: 4, grasPoliins: 2.5,
          grasTrans: 0, omega3: 0.2, omega6: 2, ala: 0.15, dha: 0.05, epa: 0, dpa: 0,
          alanina: 2.1, arginina: 2.5, aspArtico: 3.6, cistina: 0.4, glutamico: 6.2,
          glicina: 1.8, histidina: 1.2, hidroxiprolina: 0, isoleucina: 1.9, leucina: 3.2,
          lisina: 3.5, metionina: 1.1, fenilalanina: 1.6, prolina: 1.4, serina: 1.5,
          treonina: 1.7, triptofano: 0.5, tirosina: 1.4, valina: 2.0
        },
        comentarios: [
          { usuario: 'Claudia T.', texto: 'Llena de color y sabor, me encanta!' },
          { usuario: 'Héctor V.', texto: 'Perfecta para llevar al trabajo.' }
        ]
      },
      {
        id: 19,
        nombre: 'Arroz Blanco con Vegetales al Vapor',
        desc: 'Bajo en potasio y fósforo. Ideal para salud renal.',
        img: 'https://images.unsplash.com/photo-1516684669134-de6f7c473a2a?w=400',
        cat: 'almuerzo',
        salud: ['enfermedad-renal', 'bajo-sodio', 'vegetariano', 'celiaco'],
        puntos: 4.4,
        ingredientes: ['Arroz blanco', 'Zanahoria', 'Calabacín', 'Pimiento', 'Aceite de oliva'],
        pasos: ['Cocina el arroz', 'Cocina vegetales al vapor', 'Mezcla con aceite', 'Sirve caliente'],
        nutri: {
          cal: 380, prot: 32, carb: 18, gras: 20, fiber: 5, sodio: 180, colesterol: 75,
          carbNetos: 13, calcio: 90, hierro: 2.2, potasio: 680, vitD: 12,
          alphaCaroteno: 680, betaCaroteno: 4200, cafeina: 0, colina: 95, cobre: 0.3,
          fluoruro: 12, folato: 85, licopeno: 0, magnesio: 55, manganeso: 0.6,
          niacina: 10.5, acPantotenico: 2.1, fosforo: 320, retinol: 45, riboflavina: 0.35,
          selenio: 48, teobromina: 0, tiamina: 0.25, vitAIU: 4850, vitA: 485, vitB12: 4.5,
          vitB6: 0.9, vitC: 42, vitDIU: 480, vitD2: 0, vitD3: 12, vitE: 4.5, vitK: 68, zinc: 1.5,
          azucar: 6, sacarosa: 1.8, glucosa: 2.1, fructosa: 2.1, lactosa: 0, maltosa: 0,
          galactosa: 0, almidon: 8, grasSat: 4, grasMonoins: 8.5, grasPoliins: 6.5,
          grasTrans: 0, omega3: 2.8, omega6: 1.2, ala: 0.3, dha: 1.8, epa: 0.7, dpa: 0,
          alanina: 1.9, arginina: 1.8, aspArtico: 3.2, cistina: 0.35, glutamico: 4.8,
          glicina: 1.5, histidina: 0.95, hidroxiprolina: 0, isoleucina: 1.5, leucina: 2.6,
          lisina: 2.9, metionina: 0.95, fenilalanina: 1.3, prolina: 1.1, serina: 1.3,
          treonina: 1.4, triptofano: 0.35, tirosina: 1.1, valina: 1.7
        },
        comentarios: [
          { usuario: 'Silvia W.', texto: 'Simple pero muy satisfactorio.' },
          { usuario: 'Raúl A.', texto: 'Suave y fácil de digerir.' }
        ]
      },
      {
        id: 20,
        nombre: 'Pollo a la Plancha con Pepino',
        desc: 'Proteína magra baja en potasio. Suave y digestiva.',
        img: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=400',
        cat: 'cena',
        salud: ['enfermedad-renal', 'bajo-sodio', 'bajo-grasa', 'celiaco'],
        puntos: 4.6,
        ingredientes: ['Pechuga de pollo', 'Pepino', 'Limón', 'Aceite de oliva', 'Eneldo'],
        pasos: ['Cocina el pollo a la plancha', 'Corta el pepino', 'Aliña con limón', 'Decora con eneldo'],
        nutri: {
          cal: 280, prot: 12, carb: 38, gras: 9, fiber: 11, sodio: 95, colesterol: 0,
          carbNetos: 27, calcio: 75, hierro: 3.8, potasio: 420, vitD: 0,
          alphaCaroteno: 12, betaCaroteno: 280, cafeina: 0, colina: 52, cobre: 0.45,
          fluoruro: 4, folato: 145, licopeno: 850, magnesio: 78, manganeso: 1.5,
          niacina: 1.8, acPantotenico: 0.7, fosforo: 165, retinol: 0, riboflavina: 0.12,
          selenio: 8, teobromina: 0, tiamina: 0.18, vitAIU: 520, vitA: 52, vitB12: 0,
          vitB6: 0.35, vitC: 38, vitDIU: 0, vitD2: 0, vitD3: 0, vitE: 2.8, vitK: 35, zinc: 2.1,
          azucar: 7, sacarosa: 2, glucosa: 2.5, fructosa: 2.5, lactosa: 0, maltosa: 0,
          galactosa: 0, almidon: 22, grasSat: 1.2, grasMonoins: 5, grasPoliins: 2.5,
          grasTrans: 0, omega3: 0.3, omega6: 2.1, ala: 0.3, dha: 0, epa: 0, dpa: 0,
          alanina: 0.5, arginina: 1.1, aspArtico: 1.4, cistina: 0.15, glutamico: 2.1,
          glicina: 0.5, histidina: 0.35, hidroxiprolina: 0, isoleucina: 0.55, leucina: 0.9,
          lisina: 0.8, metionina: 0.15, fenilalanina: 0.65, prolina: 0.5, serina: 0.6,
          treonina: 0.45, triptofano: 0.1, tirosina: 0.3, valina: 0.55
        },
        comentarios: [
          { usuario: 'Mariana B.', texto: 'Ligero y refrescante, ideal para el verano.' },
          { usuario: 'Oscar C.', texto: 'El pepino le da un toque muy fresco.' }
        ]
      },
      {
        id: 21,
        nombre: 'Crema de Calabaza y Jengibre',
        desc: 'Sopa reconfortante ideal para problemas digestivos. Antiinflamatoria y nutritiva.',
        img: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=400',
        cat: 'cena',
        salud: ['sindrome-intestino', 'vegano', 'vegetariano', 'celiaco', 'intolerancia-lactosa', 'gastritis', 'bajo-grasa'],
        puntos: 4.8,
        ingredientes: ['Calabaza', 'Jengibre', 'Cebolla', 'Caldo vegetal', 'Aceite de coco'],
        pasos: ['Cocina la calabaza', 'Sofríe cebolla y jengibre', 'Licúa todo', 'Calienta y sirve'],
        nutri: {
          cal: 340, prot: 16, carb: 24, gras: 20, fiber: 8, sodio: 280, colesterol: 370,
          carbNetos: 16, calcio: 95, hierro: 2.5, potasio: 520, vitD: 2,
          alphaCaroteno: 8, betaCaroteno: 180, cafeina: 0, colina: 148, cobre: 0.25,
          fluoruro: 15, folato: 95, licopeno: 320, magnesio: 42, manganeso: 0.4,
          niacina: 1.5, acPantotenico: 1.8, fosforo: 215, retinol: 85, riboflavina: 0.48,
          selenio: 28, teobromina: 0, tiamina: 0.12, vitAIU: 680, vitA: 98, vitB12: 1.2,
          vitB6: 0.4, vitC: 18, vitDIU: 80, vitD2: 0, vitD3: 2, vitE: 4.2, vitK: 28, zinc: 1.8,
          azucar: 3, sacarosa: 0.8, glucosa: 1.1, fructosa: 1.1, lactosa: 0, maltosa: 0,
          galactosa: 0, almidon: 15, grasSat: 4.5, grasMonoins: 11, grasPoliins: 3.5,
          grasTrans: 0, omega3: 0.5, omega6: 2.8, ala: 0.4, dha: 0.1, epa: 0, dpa: 0,
          alanina: 0.9, arginina: 1.1, aspArtico: 1.6, cistina: 0.35, glutamico: 2.1,
          glicina: 0.55, histidina: 0.42, hidroxiprolina: 0, isoleucina: 0.85, leucina: 1.4,
          lisina: 1.1, metionina: 0.52, fenilalanina: 0.88, prolina: 0.65, serina: 1.2,
          treonina: 0.78, triptofano: 0.22, tirosina: 0.68, valina: 1.05
        },
        comentarios: [
          { usuario: 'Daniela D.', texto: 'Reconfortante y con un toque especiado perfecto.' },
          { usuario: 'Julio E.', texto: 'Suave y deliciosa, mi favorita del otoño.' }
        ]

      },
      {
        id: 22,
        nombre: 'Puré de Papas con Zanahoria',
        desc: 'Suave y fácil de digerir. Perfecto para intestino sensible.',
        img: 'https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?auto=format&fit=crop&w=400&q=80',
        cat: 'cena',
        salud: ['sindrome-intestino', 'vegetariano', 'celiaco', 'bajo-grasa', 'gastritis'],
        puntos: 4.5,
        ingredientes: ['Papas', 'Zanahoria', 'Leche descremada', 'Mantequilla light', 'Sal'],
        pasos: ['Cocina papas y zanahoria', 'Machaca junto con leche', 'Añade mantequilla', 'Sirve caliente'],
        nutri: {
          cal: 420, prot: 35, carb: 15, gras: 25, fiber: 7, sodio: 320, colesterol: 85,
          carbNetos: 8, calcio: 68, hierro: 2.8, potasio: 780, vitD: 0.3,
          alphaCaroteno: 45, betaCaroteno: 1200, cafeina: 0, colina: 92, cobre: 0.28,
          fluoruro: 6, folato: 125, licopeno: 680, magnesio: 58, manganeso: 0.65,
          niacina: 11.2, acPantotenico: 2.2, fosforo: 295, retinol: 18, riboflavina: 0.32,
          selenio: 35, teobromina: 0, tiamina: 0.18, vitAIU: 1450, vitA: 145, vitB12: 0.6,
          vitB6: 0.95, vitC: 48, vitDIU: 12, vitD2: 0, vitD3: 0.3, vitE: 5.2, vitK: 98, zinc: 2.5,
          azucar: 4, sacarosa: 1, glucosa: 1.5, fructosa: 1.5, lactosa: 0, maltosa: 0,
          galactosa: 0, almidon: 5, grasSat: 5.5, grasMonoins: 13.5, grasPoliins: 4.5,
          grasTrans: 0, omega3: 0.6, omega6: 3.5, ala: 0.5, dha: 0.1, epa: 0, dpa: 0,
          alanina: 2.2, arginina: 2.6, aspArtico: 3.8, cistina: 0.45, glutamico: 6.5,
          glicina: 1.9, histidina: 1.3, hidroxiprolina: 0, isoleucina: 2.0, leucina: 3.4,
          lisina: 3.7, metionina: 1.15, fenilalanina: 1.7, prolina: 1.5, serina: 1.6,
          treonina: 1.75, triptofano: 0.52, tirosina: 1.45, valina: 2.1
        },
        comentarios: [
          { usuario: 'Rosa F.', texto: 'Cremoso y con un sabor dulce muy agradable.' },
          { usuario: 'Vicente G.', texto: 'Perfecto acompañamiento para cualquier plato.' }
        ]
      },
      {
        id: 23,
        nombre: 'Bolas de Energía de Dátiles',
        desc: 'Snack natural endulzado solo con fruta. Perfecto para antes del ejercicio.',
        img: 'https://images.unsplash.com/photo-1599785209796-786432b228bc?w=400',
        cat: 'postres-snacks',
        salud: ['vegano', 'vegetariano', 'celiaco', 'intolerancia-lactosa', 'sin-azucar'],
        puntos: 4.6,
        ingredientes: ['Dátiles', 'Avena sin gluten', 'Cacao', 'Coco rallado', 'Vainilla'],
        pasos: ['Procesa los dátiles', 'Mezcla con avena y cacao', 'Forma bolitas', 'Refrigera 1 hora'],
        nutri: {
          cal: 180, prot: 6, carb: 28, gras: 5, fiber: 6, sodio: 65, colesterol: 0,
          carbNetos: 22, calcio: 185, hierro: 2.5, potasio: 520, vitD: 2.5,
          alphaCaroteno: 28, betaCaroteno: 1850, cafeina: 0, colina: 28, cobre: 0.18,
          fluoruro: 3, folato: 95, licopeno: 0, magnesio: 82, manganeso: 0.95,
          niacina: 1.2, acPantotenico: 0.65, fosforo: 125, retinol: 0, riboflavina: 0.22,
          selenio: 4, teobromina: 0, tiamina: 0.15, vitAIU: 2150, vitA: 215, vitB12: 0.5,
          vitB6: 0.45, vitC: 25, vitDIU: 100, vitD2: 0, vitD3: 2.5, vitE: 2.8, vitK: 185, zinc: 0.8,
          azucar: 15, sacarosa: 3, glucosa: 6, fructosa: 6, lactosa: 0, maltosa: 0,
          galactosa: 0, almidon: 4, grasSat: 0.5, grasMonoins: 1.2, grasPoliins: 2.8,
          grasTrans: 0, omega3: 2.2, omega6: 0.5, ala: 2.2, dha: 0, epa: 0, dpa: 0,
          alanina: 0.3, arginina: 0.4, aspArtico: 0.6, cistina: 0.08, glutamico: 0.9,
          glicina: 0.25, histidina: 0.15, hidroxiprolina: 0, isoleucina: 0.28, leucina: 0.45,
          lisina: 0.35, metionina: 0.08, fenilalanina: 0.3, prolina: 0.25, serina: 0.3,
          treonina: 0.22, triptofano: 0.06, tirosina: 0.18, valina: 0.32
        },
        comentarios: [
          { usuario: 'Lorena H.', texto: 'Perfectas para un boost de energía antes del gym!' },
          { usuario: 'Ignacio I.', texto: 'Dulces, nutritivas y muy fáciles de hacer.' }
        ]
      }
    ];


    const toggleFav = (id) => {
      setFavoritos(prev =>
        prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      );
    };

    const iniciarSesion = (datos) => {
      setUsuario(datos);
    };

    const cerrarSesion = () => {
      setUsuario(null);
      setVista('inicio');
    };
    return (
      <div className={`app ${modoOscuro ? 'modo-oscuro' : ''}`}>
        <FondoAnimado />
        <Nav
          vista={vista}
          cambiarVista={setVista}
          usuarioActivo={usuario}
          cerrarSesion={cerrarSesion}
          abrirMenu={() => setMenuAbierto(!menuAbierto)}
          menuAbierto={menuAbierto}
          modoOscuro={modoOscuro}
          toggleModoOscuro={toggleModoOscuro}
        />

        <main className="main">
          {vista === 'login' && <VistaLogin cambiarVista={(nuevaVista) => {
            setVista(nuevaVista);
            setMenuAbierto(false);
          }} iniciarSesion={iniciarSesion} />}
          {vista === 'registro' && <VistaRegistro cambiarVista={(nuevaVista) => {
            setVista(nuevaVista);
            setMenuAbierto(false);
          }} />}
          {vista === 'recuperar' && <VistaRecuperar cambiarVista={(nuevaVista) => {
            setVista(nuevaVista);
            setMenuAbierto(false);
          }} />}
          {vista === 'inicio' && (
            <VistaInicio
              recetas={recetas}
              toggleFav={toggleFav}
              favoritos={favoritos}
              cambiarCategoria={setCategoriaActiva}
              categoriaActiva={categoriaActiva}
            />
          )}
          {vista === 'historial' && (
            <VistaHistorial recetas={recetas} toggleFav={toggleFav} favoritos={favoritos} />
          )}
          {vista === 'favoritos' && (
            <VistaFavoritos recetas={recetas} toggleFav={toggleFav} favoritos={favoritos} />
          )}
          {vista === 'contacto' && <VistaContacto />}
        </main>

        <RobotIA activo={robotActivo} toggleIA={() => setRobotActivo(!robotActivo)} />

        <footer className="footer">
          <div className="footer-contenido">
            <div className="footer-seccion">
              <h3>Healthy Help</h3>
              <p>Tu compañero en el camino hacia una alimentación más saludable y balanceada.</p>
            </div>
            <div className="footer-seccion">
              <h4>Enlaces Rápidos</h4>
              <ul>
                <li onClick={() => setVista('inicio')}>Inicio</li>
                <li onClick={() => setVista('historial')}>Historial</li>
                <li onClick={() => setVista('favoritos')}>Favoritos</li>
              </ul>
            </div>
            <div className="footer-seccion">
              <h4>Contacto</h4>
              <p>Email: info@healthyhelp.com</p>
              <p>Teléfono: +1 (555) 123-4567</p>
            </div>
          </div>
          <div className="footer-copy">
            © 2024 Healthy Help. Todos los derechos reservados. | Powered by Readdy
          </div>
        </footer>
      </div>
    );
  }

  export default App;