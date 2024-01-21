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
    response.json({ info: 'API CHPSystem Pedidos Móviles Nube versión: 20240120 2015' });
});

//Endpoints

//Endpoints para app móvil

//Endpoints de clientes

app.get('/clientes/acceso/:correo/:contrasenia', db.getClienteAcceso);

app.post('/clientes', db.insertaCliente);
app.put('/clientes', db.actualizaCliente);
app.get('/clientes/:correo', db.getDatosCliente);

app.post('/domicilios-cliente', db.insertaDomicilioCliente);
app.put('/domicilios-cliente', db.actualizaDomicilioCliente);
app.delete('/domicilios-cliente/:idDomicilioCliente', db.eliminaDomicilioCliente);
app.get('/domicilios-cliente/:idCliente', db.getDomiciliosCliente);

app.get('/lugares', db.getLugares);

//Endpoints de pedido
app.post('/pedidos', db.insertaPedido);
//app.put('/pedidos/:idPedido', db.actualizaPedido);
app.get('/pedidos/cliente/:idCliente', db.getPedidosByCliente);
//app.get('/pedidos/historico/:idCliente', db.getPedidosHistoricosByCliente);


//Endpoints para receptor de pedidos en sucursal

app.get('/pedidos/sucursal/:claveSucursal', db.getPedidosBySucursal);
app.get('/pedidos/:idPedido', db.getPedidoById); //También se utiliza en aplicación móvil
app.put('/pedidos/estatus/:estatus/:idPedido', db.updateEstatusPedido);


//Endpoints de utilería sólo para pruebas de desarrollo
//app.put('/pedidosReset', db.updateEstatusPedidosReset);

app.listen(port, () => {
    console.log('API CHPSystem Pedidos Móviles Nube corriendo en puerto', port);
});
