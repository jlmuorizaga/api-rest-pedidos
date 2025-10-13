const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./queries');
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

app.get('/', (request, response) => {
  response.json({
    //info: "API CHPSystem Pedidos Móviles Nube versión: 20240416 2120",
    info: 'API CHPSystem Pedidos Móviles Nube versión: 20250102 1530',
  });
});

//Endpoints

//Endpoints para app móvil

//Endpoints de clientes

app.post('/login', db.verificaLogin);

app.get('/clientes/acceso/:correo/:contrasenia', db.getClienteAcceso);
app.get('/clientes/acceso/:correo', db.getClienteExisteCorreo);

app.post('/clientes', db.insertaCliente);
//app.put('/clientes', db.actualizaCliente);
app.put('/clientes/:idCliente', db.actualizaDatosCliente);
app.get('/clientes/:correo', db.getDatosCliente);
//app.get('/clientes-recupera-contrasenia/:correo', db.getContraseniaCliente);

app.post('/domicilios-cliente', db.insertaDomicilioCliente);
app.put('/domicilios-cliente', db.actualizaDomicilioCliente);
app.delete(
  '/domicilios-cliente/:idDomicilioCliente',
  db.eliminaDomicilioCliente
);
app.get('/domicilios-cliente/:idCliente', db.getDomiciliosCliente);

//app.get("/regiones", db.getRegiones);

//Endpoints de pedido
app.post('/pedidos', db.insertaPedido);
app.get('/pedidos/siguienteNumero', db.getSiguienteNumeroPedido);
app.put('/pedidos/pago/:idPedido', db.updatePedidoPago);
//app.put('/pedidos/:idPedido', db.actualizaPedido);
app.get('/pedidos/cliente/:idCliente', db.getPedidosByCliente);
//app.get('/pedidos/historico/:idCliente', db.getPedidosHistoricosByCliente);

// LGDD
app.get('/pedidos/historico/:idCliente', db.getTotalPedidosHistoricosByCliente);
app.get(
  '/pedidos/historico/:idCliente/:registrosXPagina/:iniciaEn',
  db.getPedidosHistoricosByCliente
);
// LGDD

//Endpoints para receptor de pedidos en sucursal

app.get('/pedidos/sucursal/:claveSucursal', db.getPedidosBySucursal);
// Se agregó para la demostración con Nacho en marzo 2024
//app.get("/pedidos/sucursal", db.getAllPedidos);
app.get('/pedidos/:idPedido', db.getPedidoById); //También se utiliza en aplicación móvil
app.put('/pedidos/estatus/:estatus/:idPedido', db.updateEstatusPedido);
//app.put("/pedidos/estatus", db.updateEstatusPedidoBody);

//Endpoints de utilería sólo para pruebas de desarrollo
//app.put('/pedidosReset', db.updateEstatusPedidosReset);

// Endpoint para configuración de mínimos y máximos
app.get("/configuracion", db.getConfiguracion);

app.listen(port, () => {
  console.log('API CHPSystem Pedidos Móviles Nube corriendo en puerto', port);
});
