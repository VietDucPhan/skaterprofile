/**
 * Created by Administrator on 6/4/2015.
 * Sending email using nodemailer and node-email-template
 */
var path = require('path');
var templatesDir = path.resolve(__dirname, '..', 'views/email');
var nodemailer = require('nodemailer');
var config = require(__dirname+'config');
var emailTemplates = require('email-templates');
var smtpTransport = nodemailer.createTransport(smtpTransport({
  host: config.smtphost,
  port: config.smtpport,
  auth: {
    user: config.smtpuser,
    pass: config.smtppass
  }
}));

var email = module.exports = {};
