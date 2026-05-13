// config/nodemailer.js

import nodemailer from "nodemailer"

const transporter=nodemailer.createTransport({
    host:process.env.SMTP_HOST,
    port:process.env.SMTP_PORT,
    secure:false,
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
    }
})

transporter.verify((error)=>{
    if(error){
        console.log("smtp error",error)
    }
    else{
        console.log("smtp ready")
    }
})

export default transporter