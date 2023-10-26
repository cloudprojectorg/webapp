//required files
require('dotenv').config({ path: '/etc/webapp.env' });
'use strict';

//required files
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

//sequelize
let sequelize;
if (config.use_env_variable) {
  //process env variable
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  //process database, username, password
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}


//Adding filter for different files
fs.readdirSync(__dirname)
  .filter(file => 
    file.indexOf('.') !== 0 &&
    file !== basename &&
    file.endsWith('.js') &&
    !file.endsWith('.test.js')
  )
  //check for the remaining files in each directory
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

//associate database
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

//sequelize
db.sequelize = sequelize;
db.Sequelize = Sequelize;

//export module
module.exports = db;
