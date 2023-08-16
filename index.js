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
    response.json({ info: 'API CHPSystem Pedidos Móviles Nube versión: 20230815 2232' });
});

//Endpoints

//Endpoints para app móvil

//Endpoints de clientes

app.get('/cliente/acceso/:correo/:contrasenia', db.getClienteAcceso);

app.post('/cliente', db.insertaCliente);
app.put('/cliente', db.actualizaCliente);
app.get('/cliente/:correo', db.getDatosCliente);

app.post('/domicilio', db.insertaDomicilioCliente);
app.put('/domicilio', db.actualizaDomicilioCliente);
app.delete('/domicilio/:idDomicilio', db.eliminaDomicilioCliente);
app.get('/domicilio/:idCliente', db.getDomiciliosCliente);

app.post('/formaPago', db.insertaFormaPagoCliente);
app.put('/formaPago', db.actualizaFormaPagoCliente);
app.delete('/formaPago/:idFormaPago', db.eliminaFormaPagoCliente);
app.get('/formaPago/:idCliente', db.getFormasPagoCliente);

app.get('/lugar', db.getLugares);

//Endpoints de pedido
//app.post('/pedido', db.insertaPedido);
//app.put('/pedido/:id_pedido', db.actualizaPedido);
//app.get('/pedido/:id_pedido', db.getPedidoById);
//app.get('/pedido/cliente/:id_cliente', db.getPedidosByCliente);
//app.get('/pedido/sucursal/:clave_sucursal', db.getPedidosBySucursal);
//app.put('/pedido/estatus/:estatus/:id_pedido', db.updateEstatusPedido);

//Endpoints de utilería sólo para pruebas de desarrollo
//app.put('/pedidosReset', db.updateEstatusPedidosReset);

app.listen(port, () => {
    console.log('API CHPSystem Pedidos Móviles Nube corriendo en puerto', port);
});
