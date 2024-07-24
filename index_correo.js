const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const correo = require("./envio-correo");
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = process.env.PORT || 3003;

app.post("/verifica-correo", correo.verificaCorreo);
app.post("/recupera-correo", correo.recuperaCorreo);

app.listen(port, () => {
  console.log("API CHPSystem Servidor de Correos corriendo en puerto", port);
});
