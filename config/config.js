// required files
require('dotenv').config({ path: '/etc/webapp.env' });
module.exports = {
    development: {
      username: process.env.DB_USERNAME|| 'root',
      password: process.env.DB_PASSWORD|| 'root1234',
      database: process.env.DB_NAME||'csye6225',
      host: process.env.DB_HOST|| 'localhost',
      dialect: 'mysql'
    },
    test: {
      username: 'testuser',
      password: 'root1234',
      database: 'projectdb_test',
      host: 'localhost',
      dialect: 'mysql'
    }
  };
  