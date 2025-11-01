// controllers/correoController.js

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
 * SIMULACIÓN: Recupera la contraseña de un usuario.
 * Responde con éxito sin enviar un correo real.
 */
export const recuperaCorreoPrueba = async (req, res) => {
  const { correo } = req.body;

  console.log(`SIMULACIÓN: Enviando correo de recuperación a ${correo}`);

  // Simulamos la respuesta que daría la función real (que consulta la BD)
  // Devuelve solo datos necesarios, simulando que se encontró el usuario.
  return res
    .status(200)
    .json({ correoElectronico: correo, activo: 'S' });
};