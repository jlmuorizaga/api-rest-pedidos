const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./queries");
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

app.get("/", (request, response) => {
  response.json({
    info: "API CHPSystem Pedidos Móviles Nube ver: 20230520 1350",
  });
});

//Endpoints para app móvil
//Endpoints de pedidos
app.post("/datos", db.insertaDatosPedido);
//app.post('/pedido', db.createPedido);
app.get("/estatusPedido/:id_pedido", db.getEstatusPedido);
app.get("/pedidosCliente/:id_cliente", db.getPedidosByCliente);

//Endpoints de clientes
app.get("/accesoCliente/:correo/:contrasenia", db.getClienteAcceso);
app.get("/accesoCliente/:correo", db.getDatosCliente);
app.post("/accesoCliente", db.insertaCliente);
app.put("/accesoCliente", db.actualizaCliente);

//Endpoints para receptor de pedidos en sucursal
app.get("/pedidos/:clave_sucursal", db.getPedidosBySucursal);
app.get("/pedido/:id_pedido", db.getPedidoById);
app.put("/pedidoRecibido/:id_pedido", db.updateEstatusRecibido);
app.put("/pedidoCapturado/:id_pedido", db.updateEstatusCapturado);
app.put("/pedidoEnviado/:id_pedido", db.updateEstatusEnviado);
app.put("/pedidoListo/:id_pedido", db.updateEstatusListo);
app.put("/pedidoAtendido/:id_pedido", db.updateEstatusAtendido);

//Endpoints de utilería sólo para pruebas de desarrollo
app.put("/pedidosReset", db.updateEstatusPedidosReset);

app.listen(port, () => {
  console.log("App corriendo en puerto", port);
});
