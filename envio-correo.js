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

let mail={
    //from:"jlmuorizaga@gmail.com",
    //from:"chp01ame@gmail.com",
    to:"jlmuo@yahoo.com",
    subject:"Hola esta es una prueba",
    text:"Hola esta es una prueba de correo",
    html:`<h1 style="color:red;">Este mensaje fue enviado usando nodemailer</h1>`
}

transporter.sendMail(mail,(error,info)=>{
    if (error) {
        console.error("Error enviando correo: ",error);
    }
    else{
        //console.log("Correo enviado ",info);
        console.log("Correo enviado ");

    }
})