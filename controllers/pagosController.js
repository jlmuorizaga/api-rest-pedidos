// controllers/pagosController.js
import Stripe from 'stripe';
import pkg from 'pg';
const { Pool } = pkg;

// Configura tu pool de conexión a PostgreSQL
const pool = new Pool({
  user: 'cheesepizzauser',
  host: 'database-1.czyiomwau3kc.us-east-1.rds.amazonaws.com',
  database: 'chppreciosespecprodpromocdb',
  password: 'cheesepizza2001',
  port: 5432,ssl: {
    rejectUnauthorized: false,
  },
});

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

// --- ENDPOINT 2: Confirmar Pago y Guardar Pedido ---
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

    // 1. VERIFICACIÓN: Consulta el PaymentIntent a Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // 2. VALIDACIÓN: Asegúrate de que el pago fue exitoso
    if (paymentIntent.status === 'succeeded') {
      // Valida también que el monto coincide para mayor seguridad
      const montoRecibido = paymentIntent.amount / 100;
      if (montoRecibido !== pedido.montoTotal) {
        return res
          .status(400)
          .send({ error: 'La cantidad del pago no coincide con el pedido.' });
      }

      // 3. INSERCIÓN: Guarda el pedido en la base de datos
      const urlRecibo = paymentIntent.charges.data[0].receipt_url;

      const query = `
        INSERT INTO pedidos.pedido (
          id_pedido, numero_pedido, id_cliente, datos_cliente, id_domicilio_cliente,
          datos_domicilio_cliente, clave_sucursal, datos_sucursal, fecha_hora, estatus,
          modalidad_entrega, monto_total, detalle_pedido, instrucciones_especiales,
          tipo_pago, cantidad_productos, resumen_pedido, url_recibo_pago
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
        )
      `;

      const values = [
        pedido.idPedido,
        pedido.numeroPedido,
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
        urlRecibo, // Aquí se inserta la URL del recibo de Stripe
      ];

      await pool.query(query, values);

      res
        .status(200)
        .send({ success: true, message: 'Pedido guardado exitosamente.' });
    } else {
      // Si el estado no es 'succeeded', rechaza la inserción
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
