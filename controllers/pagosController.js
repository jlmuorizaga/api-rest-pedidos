// controllers/pagosController.js
import Stripe from 'stripe';

// IMPORTAMOS el pool centralizado
import pool from '../db/database.js';

// Función para obtener la llave secreta (sk) de una sucursal
const getStripeSecretKey = async (claveSucursal) => {
  const res = await pool.query(
    'SELECT sk FROM preesppropro.sucursal WHERE clave = $1',
    [claveSucursal]
  );
  if (res.rows.length === 0) {
    throw new Error('Sucursal no encontrada o sin llave secreta.');
  }
  return res.rows[0].sk;
};

// --- ENDPOINT 1: Crear Intento de Pago ---
export const crearIntentoPago = async (req, res) => {
  const { montoTotal, claveSucursal } = req.body;

  if (!montoTotal || !claveSucursal) {
    return res.status(400).send({
      error: 'Faltan datos: montoTotal y claveSucursal son requeridos.',
    });
  }

  try {
    const secretKey = await getStripeSecretKey(claveSucursal);
    const stripe = new Stripe(secretKey);

    // Stripe requiere el monto en la unidad monetaria más pequeña (centavos para MXN)
    const montoEnCentavos = Math.round(montoTotal * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: montoEnCentavos,
      currency: 'mxn', // Moneda (pesos mexicanos)
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error al crear PaymentIntent:', error);
    res.status(500).send({ error: error.message });
  }
};

// --- ENDPOINT 2: Confirmar Pago y Guardar Pedido (VERSIÓN CORREGIDA CON SECUENCIA) ---
export const confirmarYGuardarPedido = async (req, res) => {
  const { paymentIntentId, pedido } = req.body;

  if (!paymentIntentId || !pedido) {
    return res.status(400).send({
      error: 'Faltan datos: paymentIntentId y pedido son requeridos.',
    });
  }

  try {
    const secretKey = await getStripeSecretKey(pedido.claveSucursal);
    const stripe = new Stripe(secretKey);

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      const montoRecibido = paymentIntent.amount / 100;
      if (montoRecibido !== pedido.montoTotal) {
        return res
          .status(400)
          .send({ error: 'La cantidad del pago no coincide con el pedido.' });
      }

      const chargeId = paymentIntent.latest_charge;
      if (!chargeId) {
        throw new Error('No se encontró un ID de cargo en el PaymentIntent.');
      }

      const charge = await stripe.charges.retrieve(chargeId);
      const urlRecibo = charge.receipt_url;

      // 👇 --- CAMBIO 1: La consulta SQL ahora usa nextval() ---
      // Se le pasa el nombre completo de la secuencia, incluyendo el esquema 'pedidos'.
      const query = `
        INSERT INTO pedidos.pedido (
          id_pedido, numero_pedido, id_cliente, datos_cliente, id_domicilio_cliente,
          datos_domicilio_cliente, clave_sucursal, datos_sucursal, fecha_hora, estatus,
          modalidad_entrega, monto_total, detalle_pedido, instrucciones_especiales,
          tipo_pago, cantidad_productos, resumen_pedido, url_recibo_pago
        ) VALUES (
          $1, nextval('pedidos.pedido_numero_pedido_seq'), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
        )
      `;

      // 👇 --- CAMBIO 2: Se elimina 'pedido.numeroPedido' del array de valores ---
      const values = [
        pedido.idPedido,
        // Se quita pedido.numeroPedido de aquí
        pedido.idCliente,
        pedido.datosCliente,
        pedido.idDomicilioCliente,
        pedido.datosDomicilioCliente,
        pedido.claveSucursal,
        pedido.datosSucursal,
        pedido.fechaHora,
        pedido.estatus,
        pedido.modalidadEntrega,
        pedido.montoTotal,
        pedido.detallePedido,
        pedido.instruccionesEspeciales,
        pedido.tipoPago,
        pedido.cantidadProductos,
        pedido.resumenPedido,
        urlRecibo,
      ];
      // Los placeholders ($2, $3, etc.) se ajustan automáticamente.

      await pool.query(query, values);

      res
        .status(200)
        .send({ success: true, message: 'Pedido guardado exitosamente.' });
    } else {
      res.status(400).send({
        success: false,
        message: `El pago no fue exitoso. Estado: ${paymentIntent.status}`,
      });
    }
  } catch (error) {
    console.error('Error al confirmar y guardar el pedido:', error);
    res.status(500).send({ error: error.message });
  }
};
