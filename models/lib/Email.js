/**
 * Created by Administrator on 6/4/2015.
 * Sending email using nodemailer and node-email-template
 */
var path = require('path');
var templatesDir = path.resolve(__dirname ,'../../views/emails');
var nodemailer = require('nodemailer');
var config = require('../../config');
var emailTemplates = require('email-templates');

var email = module.exports = {};

email.sendEmail = function(callback){
  emailTemplates(templatesDir, function(err, template) {

    if (err) {
      console.log(err);
    } else {

      // ## Send a single emails

      // Prepare nodemailer transport object
      var transport = nodemailer.createTransport({
        service: 'Zoho',
        auth: {
          user: config.smtpuser,
          pass: config.smtppass
        }
      });

      // An example users object with formatted emails function
      var locals = {
        email: 'joomdaily@gmail.com',
        name: {
          first: 'Mamma',
          last: 'Mia'
        }
      };

      // Send a single emails
      template('confirm', locals, function (err, html, text) {
        if (err) {
          console.log(err);
        } else {
          transport.sendMail({
            from: config.mailfrom,
            to: locals.email,
            subject: 'Mangia gli spaghetti con polpette!',
            html: html,
            // generateTextFromHTML: true,
            text: text
          }, function (err, responseStatus) {
            if (err) {
              console.log(err);
            } else {
              console.log(responseStatus.message);
            }
          });
        }
      });
    }
  });
}