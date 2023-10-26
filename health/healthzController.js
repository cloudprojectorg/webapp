//required files
require('dotenv').config({ path: '/etc/webapp.env' });
const { Sequelize } = require('sequelize');
const dbConfig = require('../config/config');
const env = process.env.NODE_ENV || 'development';
const dbConfigToUse = dbConfig[env];

//Sequelize Initialization
const sequelize = new Sequelize({
  dialect: dbConfigToUse.dialect,
  host: dbConfigToUse.host,
  database: dbConfigToUse.database,
  username: dbConfigToUse.username,
  password: dbConfigToUse.password
});

//check for payload
exports.checkNoPayload = (req, res, next) => {
  if (Object.keys(req.body).length !== 0) {
    //status code 400
    res.status(400).set({
      'Cache-Control': 'no-cache, no-store, must-revalidate;',
      'Pragma': 'no-cache',
      'X-Content-Type-Options': 'nosniff'
      //payload not allowed
    }).json({ message: 'Payload Not allowed' });
    return;
  }
  next();
};

//method validation
exports.checkMethod = (req, res, next) => {
  if (req.method !== 'GET') {
    //status code 405
    res.status(405).set({
      'Cache-Control': 'no-cache, no-store, must-revalidate;',
      'Pragma': 'no-cache',
      'X-Content-Type-Options': 'nosniff'
      //method not allowed
    }).json({ message: 'Method not allowed' });
    return;
  }
  next();
};

//Database Connection Check
exports.checkDatabase = (req, res) => {
  sequelize.authenticate()
    .then(() => {
      //200 status code
      res.status(200).set({
        'Cache-Control': 'no-cache, no-store, must-revalidate;',
        'Pragma': 'no-cache',
        'X-Content-Type-Options': 'nosniff'
      }).end();
    })
    .catch(() => {
      res.status(503).set({
        //503 status code
        'Cache-Control': 'no-cache, no-store, must-revalidate;',
        'Pragma': 'no-cache',
        'X-Content-Type-Options': 'nosniff'
      }).end();
    });
};
