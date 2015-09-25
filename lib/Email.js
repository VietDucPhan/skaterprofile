/**
 * Created by Administrator on 6/4/2015.
 * Sending email using nodemailer and node-email-template
 */
var path = require('path');
var templatesDir = path.resolve(__dirname ,'../views/emails');
var nodemailer = require('nodemailer');
var config = require('../config');
var emailTemplates = require('email-templates');

var email = module.exports = {};

/**
 *
 * @param locals Object that have email, template, subject is always required
 * @param callback
 */
email.sendEmail = function(locals,callback){
  emailTemplates(templatesDir, function(err, template) {

    if (err || !locals.template || !locals.email || !locals.subject) {
      return callback(err);
    } else {
      var transport = nodemailer.createTransport({
        service: 'Zoho',
        auth: {
          user: config.smtpuser,
          pass: config.smtppass
        }
      });
      template(locals.template, locals, function (err, html, text) {
        console.info('err',err);
        console.info('html',html);
        if (err) {
          console.info('email_template',err);
          return callback(err);
        } else {
          transport.sendMail({
            from: config.fromname + '< ' + config.mailfrom + '>',
            to: locals.email,
            subject: locals.subject,
            html: html,
            // generateTextFromHTML: true,
            text: text
          }, function (err, responseStatus) {
            if (err) {
              console.info('email_reponse',err);
              if(typeof callback == 'function'){
                return callback(err);
              }

            } else {
              if(typeof callback == 'function'){
                return callback(err,responseStatus.message);
              }
            }
          });
        }
      });
    }
  });
};

