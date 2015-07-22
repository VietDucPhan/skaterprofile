var config = {
  db_url : process.env.MONGOLAB_URI,
  app_name : "SkaterProfile",
  session_secret : process.env.SESSION_SECRECTS,
  meta_desc: "",
  meta_key: "",
  lifetime: 15*(1000*60), // milisecond
  clear_expire_sessions: 3600,// second
  mailfrom: 'no-reply@skaterprofile.com',
  fromname: 'No Reply',
  smtpuser: 'no-reply@skaterprofile.com',
  smtppass: process.env.SMTP_PASS,
  smtphost: 'smtp.zoho.com',
  smtpport: 465,
  fb_access_token: process.env.FB_ACCESS_TOKEN
};

module.exports = config;