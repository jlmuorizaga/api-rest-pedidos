// controllers/correoController.js

import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

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
  const { correo, asunto, codigoVerificacion } = req.body;

  // 1. Validar parámetros requeridos
  if (!correo || !asunto || !codigoVerificacion) {
    return res.status(400).send({
      message:
        'Faltan parámetros requeridos: correo, asunto y codigoVerificacion.',
    });
  }

  // URL del Logo (Idealmente deberías tener tu logo alojado en S3 o tu servidor público)
  // Si no tienes uno aún, usa un placeholder o texto, pero aquí dejo la estructura lista.
  const logoUrl = 'https://tu-dominio.com/assets/logo-cheese-pizza-white.png';

  // 2. Cuerpo del correo (Versión Texto Plano - Importante para accesibilidad y filtros spam)
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
              <!-- Si tienes logo usa la etiqueta IMG, si no, usa el H1 -->
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
    Source: process.env.SENDER_EMAIL, // Asegúrate de usar tu variable de entorno
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
      message: 'Error interno del servidor al intentar enviar el correo.',
      errorDetails: error.message,
    });
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
            SELECT nombre, contrasenia 
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

    // --- DISEÑO DEL CORREO ---
    // Definimos el HTML aquí para mantener limpio el objeto params
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

                                <p style="font-size: 16px; color: #555555;">Aquí tienes tu credencial actual:</p>

                                <!-- Caja de Contraseña Destacada -->
                                <div style="background-color: #f3f4f6; border-left: 4px solid #2563EB; padding: 20px; margin: 24px 0; text-align: center;">
                                    <span style="display: block; font-size: 14px; color: #6b7280; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">Tu Contraseña</span>
                                    <span style="display: block; font-size: 28px; font-weight: bold; color: #111827; letter-spacing: 1px;">${usuario.contrasenia}</span>
                                </div>

                                <p style="font-size: 14px; color: #666666; margin-top: 32px; border-top: 1px solid #eeeeee; padding-top: 20px;">
                                    Por seguridad, te recomendamos eliminar este correo una vez hayas ingresado a tu cuenta.
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
      Source: process.env.SENDER_EMAIL,
      Destination: { ToAddresses: [correo] },
      Message: {
        Subject: { Data: 'Recuperación de contraseña - Pedidos' },
        Body: {
          // Versión texto plano para clientes antiguos
          Text: {
            Data: `Hola ${usuario.nombre},\n\nTu contraseña es: ${usuario.contrasenia}\n\nSi no solicitaste esto, ignora este mensaje.`,
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
      mensaje: 'Se ha enviado la contraseña a tu correo electrónico.',
    });
  } catch (error) {
    console.error('Error en recuperaContrasenia:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Ocurrió un error interno al procesar la solicitud.',
      error: error.message,
    });
  }
};
