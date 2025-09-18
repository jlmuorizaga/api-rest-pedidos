// envio-correo.js (versión mejorada)
const nodemailer = require('nodemailer');
const { Pool } = require('pg');

/* ====== Config ====== */
const {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_PORT = 5432,

  SMTP_HOST = 'email-smtp.us-east-1.amazonaws.com',
  SMTP_PORT = 587,                // STARTTLS
  SMTP_USER,
  SMTP_PASS,
  MAIL_FROM = 'registro_app@cheesepizza.com.mx',
  LOGO_URL = 'https://ec2-54-144-58-67.compute-1.amazonaws.com/img/logo/logo_cheese_pizza_sombra.png'
} = process.env;

/* ====== DB Pool ====== */
const pool = new Pool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: Number(DB_PORT),
  // Con RDS, usa SSL pero sin desactivar verificación
  ssl: { require: true }
});

/* ====== SMTP (SES) ====== */
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: false,                   // 587 = STARTTLS
  auth: { user: SMTP_USER, pass: SMTP_PASS },
  pool: true,                      // reutiliza conexión
  maxConnections: 5,
  maxMessages: 100
});

// Verifica una sola vez al cargar el módulo
transporter.verify()
  .then(() => console.log('SMTP listo para enviar correos'))
  .catch(err => console.error('SMTP verify error:', err));

/* ====== Helpers ====== */
const buildHtmlHeader = () => `
  <div style="font-family:Arial,sans-serif">
    <img src="${LOGO_URL}" alt="CheesePizza" style="max-width:180px"><br/>
    <h3>Sistema CheesePizza de Pedidos Móviles</h3>
`;

const closeHtml = `</div>`;

async function sendMailSafe(options) {
  // fuerza dirección “from” válida en SES
  const mail = { from: MAIL_FROM, ...options };
  return transporter.sendMail(mail);
}

/* ====== Handlers ====== */
async function verificaCorreo(req, res) {
  try {
    const { correo, asunto, codigoVerificacion } = req.body;

    const html = `
      ${buildHtmlHeader()}
      <p>Tu código de verificación es:</p>
      <h1 style="letter-spacing:3px">${codigoVerificacion}</h1>
      <p>Válido durante 10 minutos.</p>
      <p style="color:#555"><i>Este es un correo automático, por favor no respondas.</i></p>
      ${closeHtml}
    `;

    const info = await sendMailSafe({
      to: correo,
      subject: asunto || 'Verificación de correo',
      text: `Tu código de verificación es: ${codigoVerificacion}. Válido por 10 minutos.`,
      html
    });

    console.log('Correo enviado:', info.messageId);
    return res.status(201).json({ respuesta: `Se ha enviado un correo a ${correo}` });
  } catch (error) {
    console.error('Error enviando correo:', error);
    return res.status(422).json({ respuesta: `Error al enviar correo a ${req.body?.correo || ''}` });
  }
}

async function recuperaCorreo(req, res) {
  try {
    const { correo, asunto } = req.body;

    const { rows } = await pool.query(
      `SELECT correo_electronico AS "correoElectronico",
              contrasenia        AS "contraSenia",
              activo
         FROM pedidos.cliente
        WHERE correo_electronico = $1
          AND activo = 'S'`,
      [correo]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'No se encontró el cliente' });
    }

    const contra = rows[0].contraSenia;

    const html = `
      ${buildHtmlHeader()}
      <p>Tu contraseña es:</p>
      <h2>${contra}</h2>
      <p>Te recomendamos cambiarla y guardarla en un lugar seguro.</p>
      <p style="color:#555"><i>Este es un correo automático, por favor no respondas.</i></p>
      ${closeHtml}
    `;

    const info = await sendMailSafe({
      to: correo,
      subject: asunto || 'Recuperación de contraseña',
      text: `Tu contraseña es: ${contra}. Te recomendamos cambiarla.`,
      html
    });

    console.log('Correo enviado:', info.messageId);
    // Devuelve solo datos necesarios; evita exponer la contraseña aquí
    return res.status(200).json({ correoElectronico: rows[0].correoElectronico, activo: 'S' });
  } catch (error) {
    console.error('Error recuperaCorreo:', error);
    return res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
}

module.exports = { verificaCorreo, recuperaCorreo };
