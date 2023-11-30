//required files
require('dotenv').config({ path: '/etc/webapp.env', override: true });
const fs = require('fs');
const path = require('path');
const applicationLog = require('../log/logger');
const { Sequelize } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const dbConfig = require('../config/config');
const csvLoader = require('../utils/csvUtils');

//console.log(`Before Sequelize`);
//console.log(process.env.DB_HOST, process.env.DB_USER, process.env.DB_PASSWORD);
// console.log(`Trying to connect to host outside sequelize: ${dbConfig[env].host}`);
// console.log(`Database Name ${dbConfig[env].username}`);
// console.log(`Database Password ${dbConfig[env].database}`);
// console.log(`Database User Name ${dbConfig[env].password}`);

applicationLog(`Connected to ${dbConfig[env].database} database in ${env} environment`);

const sequelize = new Sequelize({
  dialect: dbConfig[env].dialect,
  host: dbConfig[env].host,
  database: dbConfig[env].database,
  username: dbConfig[env].username,
  password: dbConfig[env].password
});

//authenticate connection with RDS
sequelize.authenticate()
  .then(() => {
    //console.log('Connection to RDS has been established successfully.');
    applicationLog('Connection to RDS has been established successfully.');
  })
  .catch(error => {
    //console.error('Unable to connect to the RDS:', error);
    applicationLog(`Unable to connect to the RDS: ${error.message}`);
  });

// console.log('Database Configuration:', {
//   dialect: dbConfig[env].dialect,
//   host: dbConfig[env].host,
//   database: dbConfig[env].database,
//   username: dbConfig[env].username,
//   password: dbConfig[env].password
// });


//Import Models
const UserModel = require('../Models/User.js')(sequelize);
const AssignmentModel = require('../Models/Assignment.js')(sequelize);
const SubmissionModel = require('../Models/submission.js')(sequelize, Sequelize.DataTypes);

//create database
const createDatabase = async () => {
  try {
    const sequelizeTemp = new Sequelize({
      dialect: dbConfig[env].dialect,
      host: dbConfig[env].host,
      username: dbConfig[env].username,
      password: dbConfig[env].password,
      logging: (msg) => applicationLog(msg)
    });

    //logs to check the database name it is fetching from the env
    //console.log(`Database name "${dbConfig[env].database}"`);
    //To create the database if it does not exists
    const query = `CREATE DATABASE IF NOT EXISTS ${dbConfig[env].database};`;
    await sequelizeTemp.query(query);
    //Ensure database
    applicationLog(`Database "${dbConfig[env].database}" ensured.`);
    await sequelizeTemp.close();
  } catch (err) {
    //failed to ensure database
    applicationLog(`Failed to ensure database: ${err.message}`);
  }
};

//initialize models for the database
const initializeModels = async () => {
  try {
    //sync
    await sequelize.sync({ alter: true });
    //models synced with the database
    applicationLog('Models synchronized with database.');
  } catch (err) {
    //failed to sync models
    applicationLog(`Failed to synchronize models: ${err.message}`);
  }
};

// Initialize everything in sequence only when this function is called
const initializeDatabase = async () => {
  //console.log('In intialize database')
  await createDatabase();
  //console.log('Created Database')
  await initializeModels();
  //console.log('Initialized Model')
};

//export module
module.exports = {
  sequelize,
  initializeDatabase
};
