// controllers/correoController.js

import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import bcrypt from 'bcryptjs';

//import dotenv from 'dotenv';
//dotenv.config();

import pool from '../db/database.js';

// --- Configuración de AWS SES ---
const REGION = process.env.AWS_REGION;
const sesClient = new SESClient({ region: REGION });

// Remitente verificado en SES
const SENDER_EMAIL = 'registro_app@cheesepizza.com.mx';

/**
 * SIMULACIÓN: Verifica el correo de un usuario.
 * Responde con éxito sin enviar un correo real.
 */
export const verificaCorreoPrueba = async (req, res) => {
  // Obtenemos el correo solo para incluirlo en la respuesta
  const { correo } = req.body;

  console.log(`SIMULACIÓN: Enviando código de verificación a ${correo}`);

  // Respondemos con el mismo éxito que daría la función real
  return res
    .status(201)
    .json({ respuesta: `Se ha enviado un correo a ${correo}` });
};

/**
 * Verifica el correo de un usuario.
 */

export const verificaCorreo = async (req, res) => {
  const { correo, asunto } = req.body;

  // 1. Validar parámetros requeridos
  if (!correo || !asunto) {
    return res.status(400).send({
      message: 'Faltan parámetros requeridos: correo y asunto.',
    });
  }

  // Generar código de 6 dígitos en el servidor
  let codigoVerificacion = '';
  for (let i = 0; i < 6; i++) {
    codigoVerificacion += Math.floor(Math.random() * 10).toString();
  }

  // Guardar en la base de datos
  try {
    const expiracion = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos
    const dbQuery = `
      INSERT INTO pedidos.codigo_verificacion (correo, codigo, expiracion, verificado)
      VALUES ($1, $2, $3, FALSE)
      ON CONFLICT (correo) 
      DO UPDATE SET codigo = EXCLUDED.codigo, expiracion = EXCLUDED.expiracion, verificado = FALSE
    `;
    await pool.query(dbQuery, [correo, codigoVerificacion, expiracion]);
  } catch (error) {
    console.error('Error al guardar código de verificación en la base de datos:', error);
    return res.status(500).send({
      message: 'Error interno del servidor al registrar el código de verificación.',
      errorDetails: error.message,
    });
  }

  // URL del Logo (Idealmente deberías tener tu logo alojado en S3 o tu servidor público)
  const logoUrl = 'https://tu-dominio.com/assets/logo-cheese-pizza-white.png';

  // 2. Cuerpo del correo (Versión Texto Plano)
  const emailBodyText = `
Hola,

Gracias por registrarte en Cheese Pizza.
Para completar tu verificación, por favor utiliza el siguiente código:

${codigoVerificacion}

Este código es válido por 10 minutos.
Si no solicitaste este código, puedes ignorar este mensaje de forma segura.

Saludos,
El equipo de Cheese Pizza
`;

  // 3. Cuerpo del correo (Versión HTML Profesional)
  const emailBodyHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${asunto}</title>
</head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; -webkit-text-size-adjust: none;">
  
  <!-- Contenedor Principal -->
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        
        <!-- Tarjeta del Correo -->
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Encabezado Rojo -->
          <tr>
            <td style="background-color: #d62828; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 1px;">
                CHEESE PIZZA
              </h1>
            </td>
          </tr>

          <!-- Contenido Principal -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin-top: 0; font-size: 22px;">¡Hola!</h2>
              <p style="color: #666666; font-size: 16px; line-height: 1.5;">
                Gracias por comenzar tu registro en la App Móvil de Cheese Pizza. Para proteger tu cuenta, necesitamos verificar tu correo electrónico.
              </p>
              
              <p style="color: #666666; font-size: 16px; line-height: 1.5;">
                Usa el siguiente código para completar el proceso:
              </p>

              <!-- Caja del Código -->
              <div style="background-color: #f8f9fa; border: 2px dashed #e9ecef; border-radius: 6px; padding: 20px; text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #d62828; display: block;">
                  ${codigoVerificacion}
                </span>
              </div>

              <p style="color: #999999; font-size: 14px; text-align: center;">
                Este código expira en 10 minutos.
              </p>
              
              <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 30px 0;">

              <p style="color: #999999; font-size: 13px; line-height: 1.4;">
                Si tú no creaste esta cuenta, es posible que alguien haya escrito mal su correo. Puedes ignorar este mensaje y no se creará ninguna cuenta.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #333333; padding: 20px; text-align: center;">
              <p style="color: #ffffff; font-size: 12px; margin: 0;">
                &copy; ${new Date().getFullYear()} Cheese Pizza. Todos los derechos reservados.
              </p>
              <p style="color: #888888; font-size: 12px; margin: 5px 0 0;">
                Este es un mensaje automático, por favor no respondas a este correo.
              </p>
            </td>
          </tr>
        </table>
        
      </td>
    </tr>
  </table>

</body>
</html>
`;

  // 4. Crear el comando de SES
  const sendEmailCommand = new SendEmailCommand({
    Source: process.env.SENDER_EMAIL || SENDER_EMAIL,
    Destination: {
      ToAddresses: [correo],
    },
    Message: {
      Subject: {
        Charset: 'UTF-8',
        Data: asunto,
      },
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: emailBodyText,
        },
        Html: {
          Charset: 'UTF-8',
          Data: emailBodyHtml,
        },
      },
    },
  });

  // 5. Enviar el correo
  try {
    const data = await sesClient.send(sendEmailCommand);
    console.log('Correo enviado exitosamente:', data.MessageId);

    return res.status(200).send({
      message: 'Correo enviado exitosamente.',
      messageId: data.MessageId,
      recipient: correo,
    });
  } catch (error) {
    console.error('Error al enviar el correo con SES:', error);

    return res.status(500).send({
      message: 'Error interno del servidor al intentar enviar el correo con SES.',
      errorDetails: error.message,
    });
  }
};

/**
 * Confirma el código de verificación del correo de un usuario.
 */
export const confirmarCodigo = async (req, res) => {
  const { correo, codigo } = req.body;

  if (!correo || !codigo) {
    return res.status(400).json({ error: 'Se requiere correo y código.' });
  }

  try {
    const query = `
      SELECT codigo, expiracion 
      FROM pedidos.codigo_verificacion 
      WHERE correo = $1
    `;
    const result = await pool.query(query, [correo]);

    if (result.rows.length === 0) {
      return res.status(400).json({ verificado: false, mensaje: 'No se ha solicitado verificación para este correo.' });
    }

    const { codigo: dbCodigo, expiracion } = result.rows[0];

    // Verificar si ya expiró
    if (new Date() > new Date(expiracion)) {
      return res.status(400).json({ verificado: false, mensaje: 'El código de verificación ha expirado.' });
    }

    // Verificar si coincide
    if (dbCodigo !== codigo.toString().trim()) {
      return res.status(400).json({ verificado: false, mensaje: 'El código de verificación es incorrecto.' });
    }

    // Marcar como verificado
    await pool.query(
      'UPDATE pedidos.codigo_verificacion SET verificado = TRUE WHERE correo = $1',
      [correo]
    );

    res.status(200).json({ verificado: true, mensaje: 'Código verificado con éxito.' });
  } catch (error) {
    console.error('Error al confirmar código:', error);
    res.status(500).json({ error: 'Error interno al validar el código.' });
  }
};

/**
 * SIMULACIÓN: Recupera la contraseña de un usuario.
 * Responde con éxito sin enviar un correo real.
 */
export const recuperaCorreoPrueba = async (req, res) => {
  const { correo } = req.body;

  console.log(`SIMULACIÓN: Enviando correo de recuperación a ${correo}`);

  // Simulamos la respuesta que daría la función real (que consulta la BD)
  // Devuelve solo datos necesarios, simulando que se encontró el usuario.
  return res.status(200).json({ correoElectronico: correo, activo: 'S' });
};

/**
 * Recupera la contraseña de un usuario.
 */
export const recuperarContrasenia = async (req, res) => {
  const { correo } = req.body;

  if (!correo) {
    return res.status(400).json({
      mensaje: 'Por favor, proporciona un correo electrónico.',
    });
  }

  try {
    const consulta = `
            SELECT nombre 
            FROM pedidos.cliente 
            WHERE correo_electronico = $1 
            LIMIT 1
        `;

    const resultado = await pool.query(consulta, [correo]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        exito: false,
        mensaje: 'El correo electrónico no se encuentra registrado.',
      });
    }

    const usuario = resultado.rows[0];

    // Generar código PIN de 6 dígitos en el servidor
    let codigoPIN = '';
    for (let i = 0; i < 6; i++) {
      codigoPIN += Math.floor(Math.random() * 10).toString();
    }

    // Guardar en la base de datos de verificaciones
    const expiracion = new Date(Date.now() + 15 * 60 * 1000); // Válido por 15 minutos
    const dbQuery = `
      INSERT INTO pedidos.codigo_verificacion (correo, codigo, expiracion, verificado)
      VALUES ($1, $2, $3, FALSE)
      ON CONFLICT (correo) 
      DO UPDATE SET codigo = EXCLUDED.codigo, expiracion = EXCLUDED.expiracion, verificado = FALSE
    `;
    await pool.query(dbQuery, [correo, codigoPIN, expiracion]);

    // --- DISEÑO DEL CORREO ---
    const htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Recuperación de Contraseña</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td align="center" style="padding: 40px 0;">
                        <!-- Tarjeta Principal -->
                        <div style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 600px; width: 100%; text-align: left;">
                            
                            <!-- Encabezado Azul -->
                            <div style="background-color: #2563EB; padding: 24px; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">Recuperación de Acceso</h1>
                            </div>

                            <!-- Contenido -->
                            <div style="padding: 32px;">
                                <p style="font-size: 16px; color: #333333; margin-top: 0;">Hola <strong>${usuario.nombre}</strong>,</p>
                                
                                <p style="font-size: 16px; color: #555555; line-height: 1.5;">
                                    Hemos recibido una solicitud para recuperar tu contraseña de acceso a la plataforma de Pedidos.
                                </p>

                                <p style="font-size: 16px; color: #555555;">Aquí tienes tu código PIN de verificación:</p>

                                <!-- Caja de Contraseña Destacada con fuente monoespaciada legible -->
                                <div style="background-color: #f3f4f6; border-left: 4px solid #2563EB; padding: 20px; margin: 24px 0; text-align: center;">
                                    <span style="display: block; font-size: 14px; color: #6b7280; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">Código PIN de Restablecimiento</span>
                                    <span style="display: block; font-size: 32px; font-weight: bold; color: #111827; letter-spacing: 4px; font-family: Consolas, 'Courier New', Courier, monospace;">${codigoPIN}</span>
                                </div>

                                <p style="font-size: 14px; color: #555555;">
                                    Este código es válido por 15 minutos. Si tú no solicitaste esta recuperación, puedes ignorar este mensaje de forma segura y tu contraseña no cambiará.
                                </p>
                            </div>
                            
                            <!-- Footer -->
                            <div style="background-color: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
                                <p style="margin: 0;">Si no solicitaste esta recuperación, ignora este mensaje.</p>
                            </div>
                        </div>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `;

    const params = {
      Source: process.env.SENDER_EMAIL || SENDER_EMAIL,
      Destination: { ToAddresses: [correo] },
      Message: {
        Subject: { Data: 'Restablecimiento de contraseña - Pedidos' },
        Body: {
          // Versión texto plano para clientes antiguos
          Text: {
            Data: `Hola ${usuario.nombre},\n\nTu código PIN para restablecer la contraseña es: ${codigoPIN}\n\nEste código expira en 15 minutos.\n\nSi no solicitaste esto, ignora este mensaje.`,
          },
          // Versión HTML bonita
          Html: {
            Data: htmlTemplate,
          },
        },
      },
    };

    const command = new SendEmailCommand(params);
    await sesClient.send(command);

    return res.status(200).json({
      exito: true,
      mensaje: 'Se ha enviado un código PIN de verificación a tu correo electrónico.',
    });
  } catch (error) {
    console.error('Error en recuperarContrasenia:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Ocurrió un error interno al procesar la solicitud.',
      error: error.message,
    });
  }
};

/**
 * Aplica el cambio físico de contraseña tras validar el código PIN.
 */
export const restablecerContraseniaConCodigo = async (req, res) => {
  const { correo, codigo, nuevaContrasenia } = req.body;

  if (!correo || !codigo || !nuevaContrasenia) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos.' });
  }

  // Enforce backend validation of length >= 6
  if (nuevaContrasenia.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  try {
    // 1. Verificar que el código en la base de datos coincida y esté validado (verificado = true)
    const checkQuery = `
      SELECT verificado, expiracion 
      FROM pedidos.codigo_verificacion 
      WHERE correo = $1 AND codigo = $2
    `;
    const checkResult = await pool.query(checkQuery, [correo, codigo.toString().trim()]);

    if (checkResult.rows.length === 0) {
      return res.status(400).json({ error: 'El código de verificación o correo son inválidos.' });
    }

    const { verificado, expiracion } = checkResult.rows[0];

    if (!verificado) {
      return res.status(400).json({ error: 'El código de verificación aún no ha sido confirmado.' });
    }

    if (new Date() > new Date(expiracion)) {
      return res.status(400).json({ error: 'El código de verificación ha expirado.' });
    }

    // 2. Hashear la nueva contraseña con bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(nuevaContrasenia, salt);

    // 3. Actualizar la contraseña en la base de datos de clientes
    await pool.query(
      'UPDATE pedidos.cliente SET contrasenia = $1 WHERE correo_electronico = $2',
      [hashedPassword, correo]
    );

    // 4. Limpiar el código usado de la tabla temporal
    await pool.query('DELETE FROM pedidos.codigo_verificacion WHERE correo = $1', [correo]);

    res.status(200).json({ exito: true, mensaje: 'Tu contraseña ha sido cambiada exitosamente.' });
  } catch (error) {
    console.error('Error en restablecerContraseniaConCodigo:', error);
    res.status(500).json({ error: 'Error interno del servidor al restablecer contraseña.' });
  }
};
