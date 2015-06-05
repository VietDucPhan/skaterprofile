var config = {
  db_url : process.env.MONGOLAB_URI || 'mongodb://localhost:27017/skaterprofile',
  app_name : "SkaterProfile",
  session_secret : process.env.SESSION_SECRECTS || 1231231,
  meta_desc: "",
  meta_key: "",
  lifetime: 15*(1000*60), // milisecond
  clear_expire_sessions: 3600,// second
  mailfrom: 'no-reply@skaterprofile.com',
  fromname: 'No Reply',
  smtpuser: 'no-reply@skaterprofile.com',
  smtppass: '!Noreply)5',
  smtphost: 'smtp.zoho.com',
  smtpport: 465,

};

module.exports = config;