const nodeMailer =require('nodemailer')
const transporter = nodeMailer.createTransport({
    host:"smtp.gmail.com",
    port:465,
    secure:true,
    auth:{
        //user:"jlmuorizaga@gmail.com",
        //pass:"klzkllfyjxijplos"

        user:"chp01ame@gmail.com",
        pass:"nxswxjiwbhylgsaz"
    }
})






const verificaCorreo = (req, res) => {
    const { correo,asunto,codigoVerificacion } = req.body;
    let mail={
        //from:"jlmuorizaga@gmail.com",
        //from:"chp01ame@gmail.com",
        to:correo,
        subject:asunto,
        //text:"Hola esta es una prueba de correo",
        html:'<h3>Sistema CheesePizza de Pedidos Móviles</h3><p>Su código de verificación es: </p>'+
        '<h1>'+codigoVerificacion+'</h1>'+
        '<p>Su código será válido durante 10 minutos</p><br>'+
        '<p><i>Esta es un correo automático, favor de no responder</i></p>'
    }

    transporter.sendMail(mail,(error,info)=>{
        if (error) {

            textoRespuesta = '{"respuesta": "Error al enviar correo a '+correo+'"}';
            res.status(422).json(JSON.parse(textoRespuesta));
            console.error("Error enviando correo: ",error);
        }
        else{
            textoRespuesta = '{"respuesta": "Se ha enviado un correo a '+correo+'"}';
            res.status(201).json(JSON.parse(textoRespuesta));
            console.log("Correo enviado ",info);
            //console.log("Correo enviado ");
    
        }
    })



}

module.exports = {
    verificaCorreo
}
