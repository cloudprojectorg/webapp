// required files
require('dotenv').config({ path: '/etc/webapp.env' });
process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const Sequelize = require('sequelize');
const { app, startServer, getServer } = require('../index');
//const testConfig = require('../config/test-config');
chai.use(chaiHttp);
const { expect } = chai;
const log = require('why-is-node-running');

//sequelize
const sequelize = new Sequelize('projectdb_test', 'testuser', 'root1234', {
  host: 'localhost',
  dialect: 'mysql'
});

//integration test
describe('Integration Tests', () => {
  //before test
  before((done) => {
    (async () => {
      try {
        console.log("Test setup: starting");
        await sequelize.authenticate();
        console.log("Test setup: authenticated");
        await sequelize.sync({ force: true });
        console.log("Test setup: tables synchronized");
        await startServer();  // Start the server here
        console.log("Server started for testing");
        done();
      } catch (err) {
        console.error("Error during test setup:", err);
        done(err);
      }
    })();
  });

  //after test
  after((done) => {
    (async () => {
      try {
        console.log("Test teardown: starting");

        await sequelize.close();
        const serverInstance = getServer();
        //server instance
        if (serverInstance) {
          serverInstance.close((err) => {
            if (err) {
              console.error("Server close error:", err);
            } else {
              console.log("Server closed successfully!");
            }
            
            //log time
            const logTimeout = setTimeout(() => {
              log();
              clearTimeout(logTimeout);
              done();
            }, 500);
          });
        } else {
          //server check
          console.log("No server to close");
          const logTimeout = setTimeout(() => {
            console.log("Inside process tracker");
            log();
            clearTimeout(logTimeout);
            done();
          }, 500);
        }
      } catch (err) {
        console.error("Error during test teardown:", err);
        done(err);
      }
    })();
  });

  it('should return a successful health check', async () => {
    const res = await chai.request(app).get('/healthz');
    expect(res).to.have.status(200);
    //expect(res.body).to.deep.equal({ message: 'Database Connection Status : Successful' });
  });
});
