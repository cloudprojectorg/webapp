const { Sequelize } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const dbConfig = require('../config/config');



const sequelize = new Sequelize({
  dialect: dbConfig[env].dialect,
  host: '127.0.0.1',
  database: dbConfig[env].database,
  username: dbConfig[env].username,
  password: dbConfig[env].password
});



//Import Models
//const UserModel = require('../Models/user')(sequelize);
//const AssignmentModel = require('../Models/assignment')(sequelize);

const createDatabase = async () => {
  try {
      const sequelizeTemp = new Sequelize({
          dialect: dbConfig[env].dialect,
          host: '127.0.0.1',
          username: dbConfig[env].username,
          password: dbConfig[env].password
      });

      const query = `CREATE DATABASE IF NOT EXISTS ${dbConfig[env].database};`;
      await sequelizeTemp.query(query);
      console.log(`Database "${dbConfig[env].database}" ensured.`);
      await sequelizeTemp.close();
  } catch (err) {
      console.error(`Failed to ensure database: ${err}`);
  }
};

const initializeModels = async () => {
  try {
      await sequelize.sync({ alter: true }); 
      console.log('Models synchronized with database.');
  } catch (err) {
      console.error(`Failed to synchronize models: ${err}`);
  }
};

// Initialize everything in sequence only when this function is called
const initializeDatabase = async () => {
  await createDatabase();
  await initializeModels();
};


module.exports = {
  sequelize,
  initializeDatabase
};
