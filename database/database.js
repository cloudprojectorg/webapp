const { Sequelize } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const dbConfig = require('../config/config');
const csvLoader = require('../utils/csvUtils');
// const sequelizeTemp  = new sequelize();



const sequelize = new Sequelize({
  dialect: dbConfig[env].dialect,
  host: dbConfig[env].host,
  // host: '127.0.0.1',
  database: dbConfig[env].database,
  // username: dbConfig[env].username,
  username: dbConfig[env].username,
  password: dbConfig[env].password
});

console.log('Database Configuration:', {
  dialect: dbConfig[env].dialect,
  host: dbConfig[env].host,
  database: dbConfig[env].database,
  // username: dbConfig[env].username,
  username: dbConfig[env].username,
  password: dbConfig[env].password
});


//Import Models
const UserModel = require('../Models/User.js')(sequelize);
const AssignmentModel = require('../Models/Assignment.js')(sequelize);

const createDatabase = async () => {
  try {
    const sequelizeTemp = new Sequelize({
      dialect: dbConfig[env].dialect,
      host: dbConfig[env].host,
      // host: '127.0.0.1',
      // username: 'projectdb',
      username: dbConfig[env].username,
      password: dbConfig[env].password
    });

    console.log(`Database "${dbConfig[env].database}" database name.`);
    const query = `CREATE DATABASE IF NOT EXISTS ${dbConfig[env].database};`;
    await sequelizeTemp.query(query);
    console.log(`Database "${dbConfig[env].database}" ensured.`);
    await sequelizeTemp.close();
  } catch (err) {
    console.error(`Failed to ensure database: ${err}`);
  }
};

// const initializeModels = async () => {
//   try {
//     const UserModel = require('../Models/user')(sequelize);
//     const AssignmentModel = require('../Models/assignment')(sequelize);
//        await sequelize.sync({ alter: true })
//        csvLoader('opt/users.csv')
//       // await sequelize.sync({ alter: true }).then(()=>csvLoader1('opt/users.csv')); 
//       console.log('Models synchronized with database.');
//   } catch (err) {
//       console.error(`Failed to synchronize models: ${err}`);
//   }
// };


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
  //console.log('in intialize database')
  await createDatabase();
  //console.log('Created Database')
  await initializeModels();
  //console.log('initialized Model')
};


module.exports = {
  sequelize,
  initializeDatabase
};
