const nodeMailer = require("nodemailer");
const Pool = require("pg").Pool;

//Datos de conexión a base de datos en AWS
//Servidor viejito
//const DB_HOST =
//  process.env.DB_HOST || "database-1.cgujpjkz4fsl.us-west-1.rds.amazonaws.com";

//Servidor nuevo 18 Oct 2024
const DB_HOST =
process.env.DB_HOST || "database-1.czyiomwau3kc.us-east-1.rds.amazonaws.com";  
const DB_USER = process.env.DB_USER || "cheesepizzauser";
const DB_PASSWORD = process.env.DB_PASSWORD || "cheesepizza2001";
const DB_NAME = process.env.DB_NAME || "cheesepizzapedidosmovilesdb";
const DB_PORT = process.env.DB_PORT || 5432;

//const logo =
//"http://ec2-54-153-58-93.us-west-1.compute.amazonaws.com/img/logo/logo_cheese_pizza_sombra.png";
  
const logo =
  "http://ec2-54-144-58-67.compute-1.amazonaws.com/img/logo/logo_cheese_pizza_sombra.png";

//Pool de conexiones a base de datos
const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_NAME,
  password: DB_PASSWORD,
  port: DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
});

const transporter = nodeMailer.createTransport({
  //host: "smtp.gmail.com",
  host: "mail.cheesepizza.com.mx",
  port: 465,
  secure: true,
  rejectUnauthorized: false,
  auth: {
    //user:"jlmuorizaga@gmail.com",
    //pass:"klzkllfyjxijplos"

    // user: "chp01ame@gmail.com",
    // pass: "nxswxjiwbhylgsaz",
    user: "registro_app@cheesepizza.com.mx",
    pass: "Olaf2020chp$",
  },
  /*tls: {
    //servername: "smtp.gmail.com",
    servername:'mail.cheesepizza.com.mx',
    rejectUnauthorized: false,
  },*/
});

const verificaCorreo = (req, res) => {
  const { correo, asunto, codigoVerificacion } = req.body;
  let mail = {
    //from:"jlmuorizaga@gmail.com",
    //from:"chp01ame@gmail.com",
    from: "registro_app@cheesepizza.com.mx",
    to: correo,
    subject: asunto,
    //text:"Hola esta es una prueba de correo",
    html:
      '<img src="' +
      logo +
      '" width="25%"><br>' +
      "<h3>Sistema CheesePizza de Pedidos Móviles</h3><p>Su código de verificación es: </p>" +
      "<h1>" +
      codigoVerificacion +
      "</h1>" +
      "<p>Su código será válido durante 10 minutos</p><br>" +
      "<p><i>Esta es un correo automático, favor de no responder</i></p>",
  };

  transporter.sendMail(mail, (error, info) => {
    if (error) {
      textoRespuesta =
        '{"respuesta": "Error al enviar correo a ' + correo + '"}';
      res.status(422).json(JSON.parse(textoRespuesta));
      console.error("Error enviando correo: ", error);
    } else {
      textoRespuesta =
        '{"respuesta": "Se ha enviado un correo a ' + correo + '"}';
      res.status(201).json(JSON.parse(textoRespuesta));
      console.log("Correo enviado ", info);
      //console.log("Correo enviado ");
    }
  });
};

const recuperaCorreo = (req, res) => {
  const { correo, asunto } = req.body;
  pool.query(
    'SELECT correo_electronico as "correoElectronico", contrasenia as "contraSenia", activo ' +
      "FROM pedidos.cliente " +
      "WHERE correo_electronico = $1 and activo= $2",
    [correo, "S"],
    (error, results) => {
      if (error) {
        throw error;
      }
      if (results.rows[0]) {
        let contra = results.rows[0].contraSenia;
        let mail = {
          //from:"jlmuorizaga@gmail.com",
          //from:"chp01ame@gmail.com",
          from: "registro_app@cheesepizza.com.mx",
          to: correo,
          subject: asunto,
          //text:"Hola esta es una prueba de correo",
          html:
            '<img src="' +
            logo +
            '" width="25%"><br>' +
            "<h3>Sistema CheesePizza de Pedidos Móviles</h3><p>Su contraseña es: </p>" +
            "<h2>" +
            contra +
            "</h2>" +
            "<p>Apunte su contraseña en un lugar seguro</p><br>" +
            "<p><i>Esta es un correo automático, favor de no responder</i></p>",
        };

        transporter.sendMail(mail, (error, info) => {
          if (error) {
            textoRespuesta =
              '{"respuesta": "Error al enviar correo a ' + correo + '"}';
            res.status(422).json(JSON.parse(textoRespuesta));
            console.error("Error enviando correo: ", error);
          } else {
            textoRespuesta =
              '{"respuesta": "Se ha enviado un correo a ' + correo + '"}';
            res.status(201).json(JSON.parse(textoRespuesta));
            console.log("Correo enviado ", info);
            //console.log("Correo enviado ");
          }
          res.status(200).json(results.rows[0]);
        });

        //response.status(200).json(results.rows[0]);
      } else {
        textoError = '{"error": "No se encontró el cliente"}';
        response.status(404).json(JSON.parse(textoError));
      }
    }
  );
};

module.exports = {
  verificaCorreo,
  recuperaCorreo,
};
