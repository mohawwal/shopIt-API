const nodemailer = require('nodemailer')

const sendEmail = async options => {

    const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD
        }
    });

    const message = {
        from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    await transport.sendMail(message)
}

module.exports = sendEmail;


// const nodemailer = require('nodemailer');

// const sendEmail = async (options) => {
//   const transport = nodemailer.createTransport({
//     service: 'Gmail',
//     auth: {
//       user: process.env.EMAIL_USERNAME, 
//       pass: process.env.EMAIL_PASSWORD, 
//     },
//   });

//   const message = {
//     from: `${process.env.SMTP_FROM_NAME} <${process.env.EMAIL_USERNAME}>`,
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//   };

//   await transport.sendMail(message);
// };

// module.exports = sendEmail;
