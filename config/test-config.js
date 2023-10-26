module.exports = {
    mysql: {
      username: process.env.RDS_USERNAME || 'testuser',
      password: process.env.RDS_PASSWORD || 'root1234',
      database: 'projectdb_test',
      host: process.env.RDS_HOSTNAME || 'localhost',
      dialect: 'mysql'
    }
  };
  