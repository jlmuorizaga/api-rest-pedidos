const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const pool = require('./conf_pg_stripe');
const stripeLoader = require('stripe');
const cors = require('cors');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = process.env.PORT || 3002;

app.get('/', (request, response) => {
  response.json({ info: 'API CHPSystem Pedidos Móviles Stripe versión: 20240416 2120' });
});

app.post('/stripe/charge', async (req, res) => {
  try {
    // El token de Stripe es enviado con la solicitud
    const { claveSucursal, token, amount, description } = req.body;

    //console.log('Sucursal: ',claveSucursal)
    const stripeSecretKey = await getStripeKey(claveSucursal);
    //console.log('Llave secreta: ',stripeSecretKey);
    const stripe = stripeLoader(stripeSecretKey);

    // Crear el cargo usando la API de Stripe
    const charge = await stripe.charges.create({
      amount: amount, // Cantidad a cobrar
      currency: 'mxn',
      source: token, // Token de Stripe
      description: description
    });

    // Responder al cliente indicando que el pago fue procesado exitosamente
    res.json({ success: true, message: 'Pago efectuado con éxito', charge });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Error al procesar el pago', error });
  }
});

async function getStripeKey(claveSucursal) {
  const query = 'SELECT sk FROM preesppropro.sucursal WHERE clave = $1';
  try {
    const res = await pool.query(query, [claveSucursal]);
    if (res.rows.length > 0) {
      return res.rows[0].sk;
    } else {
      throw new Error('No se encontró la sucursal o no tiene clave de Stripe configurada');
    }
  } catch (err) {
    console.error('Error al obtener la clave de Stripe:', err);
    throw err;  // Re-throw the error to be handled elsewhere
  }
}

app.listen(port, () => console.log('API CHPSystem Stripe Server started on port',port));