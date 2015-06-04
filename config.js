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
  smtpuser: '',
  smtppass: '',
  smtphost: '',
  smtpport: 25,

};

module.exports = config;