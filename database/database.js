const { Sequelize } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const dbConfig = require('../config/config');
console.log(`Connected to ${dbConfig[env].database} database in ${env} mode.`);
console.log(`Connected to ${dbConfig[env].database} database.`);

const sequelize = new Sequelize({
  dialect: dbConfig[env].dialect,
  host: dbConfig[env].host,
  database: dbConfig[env].database,
  username: dbConfig[env].username,
  password: dbConfig[env].password
});

module.exports = {
  sequelize
};
