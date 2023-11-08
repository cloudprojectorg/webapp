//required files
//const AWS_SES = require('aws-sdk');
require('dotenv').config();
const applicationLog = require('./log/logger');
const mailgun = require('mailgun-js');

const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
});

//configure AWS SES service
// AWS_SES.config.update({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.SES_REGION
// });

//const aws_ses = new AWS_SES.SES();

function sendEmail(to, subject, text) {
  const data = {
    from: process.env.MAILGUN_SENDER,
    to: to,
    subject: subject,
    text: text
  };

  mg.messages().send(data, function (error, body) {
    if (error) {
      applicationLog(`Error sending email: ${error.message}`);
    } else {
      applicationLog(`Email sent: ${JSON.stringify(body)}`);
    }
  });
}

module.exports =  sendEmail ;
