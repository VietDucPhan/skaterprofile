var config = {
  db_url : process.env.MONGOLAB_URI || "mongodb://localhost:27017/skaterprofile",
  app_name : "SkaterProfile",
  session_secret : process.env.SESSION_SECRECTS || 'something',
  meta_desc: "",
  meta_key: "",
  lifetime: 15000, // milisecond
  clear_expire_sessions: 3600,// second
};

module.exports = config;