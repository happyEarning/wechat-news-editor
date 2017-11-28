const moment = require('moment'),
    Excel = require('exceljs'),
    config = require('../config'),
    mail = config.mail,
    Nodemailer = require('nodemailer');


module.exports = (mailTo,attachments,subject,text,next) =>{
    let transporter = Nodemailer.createTransport({
        pool:true,
        host: mail.host,
        port: mail.port,
        secure: true, // secure:true for port 465, secure:false for port 587
        auth: {
            user: mail.authUser,
            pass: mail.password
        }
    });
    let mailOptions = {
        from: mail.mailFrom, // sender address
        to: mailTo, // list of receivers
        subject: subject, // Subject line
        text: text, // plain text body
        //html: mail.htmlContent, // html body
        attachments
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            next(error);
            return;
        }else{
            next();
        }
    });
}