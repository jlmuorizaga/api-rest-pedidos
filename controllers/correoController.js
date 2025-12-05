// controllers/correoController.js

import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import dotenv from 'dotenv';
dotenv.config();

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
  // Obtenemos el correo
  const { correo, asunto, codigoVerificacion } = req.body;

  // 1. Validar parámetros requeridos
  if (!correo || !asunto || !codigoVerificacion) {
    return res.status(400).send({
      message:
        'Faltan parámetros requeridos: correo, asunto y codigoVerificacion.',
    });
  }

  // 2. Cuerpo del correo
  const emailBodyText = `Hola,\n\nEste es el contenido de prueba. El dato proporcionado es: ${codigoVerificacion}\n\nSaludos.`;

  const emailBodyHtml = `
<html>
  <body style="font-family: Arial, sans-serif; background-color: #ffffff; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">

      <h1 style="color: #d62828; text-align: center;">
        ${asunto}
      </h1>

      <p style="font-size: 16px; line-height: 1.5; text-align: center;">
        <b>${codigoVerificacion}</b>
      </p>

      <br>

      <p style="font-size: 14px; line-height: 1.4;">
        Saludos,<br>
        <b>Cheese Pizza</b>
      </p>

    </div>
  </body>
</html>

  `;

  // 3. Crear el comando de SES
  const sendEmailCommand = new SendEmailCommand({
    Source: SENDER_EMAIL,
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

  // 4. Enviar el correo
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
