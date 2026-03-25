import { useState } from 'react';
import './ModalTerminos.css';

export const TERMS_VERSION = '1.0.0';
export const TERMS_KEY     = 'terms_accepted_v1.0.0';

const ModalTerminos = ({ onAceptar, esActualizacion = false }) => {
  const [scrollado,  setScrollado]  = useState(false);
  const [aceptado,   setAceptado]   = useState(false);
  const [cargando,   setCargando]   = useState(false);

  const handleScroll = (e) => {
    const el = e.target;
    const llegóAlfinal = el.scrollHeight - el.scrollTop <= el.clientHeight + 50;
    if (llegóAlfinal) setScrollado(true);
  };

  const handleAceptar = async () => {
    if (!aceptado || !scrollado) return;
    setCargando(true);
    await onAceptar();
    setCargando(false);
  };

  return (
    <div className="terminos-overlay">
      <div className="terminos-modal">

        <div className="terminos-header">
          <div className="terminos-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div>
            <h2>{esActualizacion ? 'Actualización de Términos' : 'Términos y Condiciones'}</h2>
            <p className="terminos-version">Versión {TERMS_VERSION} — Healthy Help</p>
          </div>
        </div>

        {esActualizacion && (
          <div className="terminos-aviso-actualizacion">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:'8px',flexShrink:0}}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Hemos actualizado nuestros términos. Debes aceptarlos para continuar usando Healthy Help.
          </div>
        )}

        <p className="terminos-instruccion">
          Lee los términos completos antes de aceptar. Debes llegar al final del documento.
        </p>

        <div className="terminos-contenido" onScroll={handleScroll}>

          <h3>1. Identificación y Objeto</h3>
          <p>Healthy Help es una plataforma digital de orientación nutricional operada en la República de Colombia. Su objeto es proporcionar información general sobre alimentación saludable, recetas y seguimiento nutricional a usuarios mayores de 18 años, de conformidad con la Ley 1581 de 2012 (Habeas Data), la Ley 527 de 1999 (Comercio Electrónico) y demás normas aplicables.</p>

          <h3>2. Aceptación de Términos</h3>
          <p>El acceso y uso de Healthy Help implica la aceptación plena de estos Términos y Condiciones. Si no está de acuerdo con alguna disposición, debe abstenerse de usar la plataforma. La aceptación constituye un acuerdo legalmente vinculante entre el usuario y Healthy Help conforme al Artículo 824 del Código de Comercio colombiano y la Ley 527 de 1999.</p>

          <h3>3. Requisitos de Edad</h3>
          <p>El uso de Healthy Help está restringido a personas mayores de 18 años. Al aceptar estos términos, el usuario declara bajo la gravedad del juramento que es mayor de edad conforme a la legislación colombiana (Artículo 34 del Código Civil). Healthy Help no se hace responsable por el uso de la plataforma por menores de edad que falsifiquen su información.</p>

          <h3>4. Descargo de Responsabilidad en Salud</h3>
          <p><strong>IMPORTANTE:</strong> Healthy Help proporciona información nutricional con fines exclusivamente informativos y educativos. Esta plataforma <strong>NO constituye consejo médico, dietético ni de salud profesional</strong>. La información disponible no reemplaza la consulta con médicos, nutricionistas, dietistas u otros profesionales de la salud debidamente certificados ante el Ministerio de Salud y Protección Social de Colombia.</p>
          <p>Conforme a la Ley 1438 de 2011 y la Ley 100 de 1993, el usuario reconoce que:</p>
          <ul>
            <li>Debe consultar a un profesional de salud antes de iniciar cualquier régimen alimenticio.</li>
            <li>Las condiciones de salud preexistentes como diabetes, hipertensión, enfermedades renales, cardíacas u otras requieren atención médica especializada.</li>
            <li>Healthy Help no diagnostica enfermedades ni prescribe tratamientos.</li>
            <li>La información nutricional puede variar según preparación, ingredientes y condiciones individuales.</li>
          </ul>

          <h3>5. Limitación de Responsabilidad</h3>
          <p>Healthy Help no será responsable por daños directos, indirectos, incidentales o consecuentes derivados del uso o imposibilidad de uso de la plataforma, incluyendo pero no limitado a: decisiones alimenticias basadas en la información de la plataforma, reacciones alérgicas a ingredientes, agravamiento de condiciones de salud preexistentes, o pérdida de datos. Esta limitación aplica en la máxima extensión permitida por la ley colombiana, incluyendo el Estatuto del Consumidor (Ley 1480 de 2011).</p>

          <h3>6. Protección de Datos Personales</h3>
          <p>En cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013, Healthy Help recopila y trata los datos personales del usuario (nombre, correo electrónico, edad, peso, altura) para los siguientes fines: (i) prestación del servicio, (ii) personalización de recomendaciones nutricionales, (iii) comunicaciones relacionadas con el servicio. Los datos de salud (peso, altura, edad) son considerados datos sensibles y serán tratados con la más estricta confidencialidad. El usuario podrá ejercer sus derechos de acceso, rectificación, cancelación y oposición (derechos ARCO) escribiendo a support@healthyhelp.com.</p>

          <h3>7. Propiedad Intelectual</h3>
          <p>Todo el contenido de Healthy Help, incluyendo recetas, textos, imágenes, diseño y código, está protegido por la Ley 23 de 1982 sobre Derechos de Autor y la Decisión Andina 351 de 1993. Queda prohibida su reproducción, distribución o uso comercial sin autorización expresa y por escrito de Healthy Help.</p>

          <h3>8. Conducta del Usuario</h3>
          <p>El usuario se compromete a: usar la plataforma conforme a la ley colombiana y estos términos; no compartir información falsa; no intentar acceder sin autorización a sistemas o datos de otros usuarios; no usar la plataforma para fines ilegales según el Código Penal colombiano (Ley 599 de 2000) y la Ley 1273 de 2009 sobre delitos informáticos.</p>

          <h3>9. Suspensión y Eliminación de Cuentas</h3>
          <p>Healthy Help se reserva el derecho de suspender o eliminar cuentas que violen estos términos, sin previo aviso y sin responsabilidad, conforme al Artículo 16 de la Ley 1480 de 2011. El usuario podrá solicitar la eliminación de su cuenta y datos personales en cualquier momento desde su perfil o escribiendo a support@healthyhelp.com.</p>

          <h3>10. Modificaciones</h3>
          <p>Healthy Help podrá modificar estos Términos en cualquier momento. Los cambios serán notificados al usuario al iniciar sesión. El uso continuado de la plataforma tras la notificación constituye aceptación de los nuevos términos.</p>

          <h3>11. Ley Aplicable y Jurisdicción</h3>
          <p>Estos Términos se rigen por las leyes de la República de Colombia. Para cualquier controversia, las partes se someten a la jurisdicción de los jueces y tribunales competentes de la ciudad de Bogotá D.C., Colombia, renunciando a cualquier otro fuero que pudiera corresponderles. Antes de acudir a instancias judiciales, las partes intentarán resolver sus diferencias mediante conciliación conforme a la Ley 640 de 2001.</p>

          <h3>12. Contacto</h3>
          <p>Para consultas sobre estos términos: <strong>support@healthyhelp.com</strong>. Fecha de última actualización: marzo de 2025.</p>

          <div className="terminos-fin">
            ✓ Has llegado al final del documento
          </div>
        </div>

        <div className="terminos-footer">
          <label className="terminos-checkbox-label">
            <input
              type="checkbox"
              checked={aceptado}
              onChange={e => setAceptado(e.target.checked)}
              disabled={!scrollado}
            />
            <span>
              He leído y acepto los Términos y Condiciones, la Política de Privacidad
              y el Descargo de Responsabilidad en Salud de Healthy Help.
            </span>
          </label>

          {!scrollado && (
            <p className="terminos-hint">
              Desplázate hasta el final del documento para poder aceptar.
            </p>
          )}

          <button
            className="terminos-btn-aceptar"
            onClick={handleAceptar}
            disabled={!aceptado || !scrollado || cargando}
          >
            {cargando ? 'Guardando...' : 'Aceptar y Continuar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalTerminos;
