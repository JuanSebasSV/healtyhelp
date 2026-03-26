// server/scripts/seedTerms.js
// Inserta los Términos y Condiciones v1.0.0 en la base de datos si no existen.
// Se ejecuta automáticamente al arrancar el servidor — si ya hay un documento no hace nada.

const TermsDocument = require('../models/TermsDocument');

const CONTENIDO_V1 = `<h3>1. Identificación y Objeto</h3>
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
<p>Para consultas sobre estos términos: <strong>support@healthyhelp.com</strong>. Fecha de última actualización: marzo de 2025.</p>`;

const seedTerms = async () => {
  try {
    const existe = await TermsDocument.findOne();
    if (existe) return; // ya hay términos en BD, no tocar nada

    await TermsDocument.create({
      version:     '1.0.0',
      content:     CONTENIDO_V1,
      publishedAt: new Date()
    });

    console.log('✅ Términos v1.0.0 insertados en la base de datos');
  } catch (error) {
    console.error('❌ Error al insertar términos iniciales:', error.message);
  }
};

module.exports = seedTerms;
