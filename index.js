// Imports
require('dotenv').config({ path: '/etc/webapp.env', override: true });
const express = require('express');
//const emailService = require('./email');
const applicationLog = require('./log/logger');
// const { User, Assignment } = require('../Models');
//const bcrypt = require('bcrypt');
const fs = require('fs');
const morgan = require('morgan');
const path = require('path');
const StatsD = require('hot-shots');
const assignmentController = require('./Controller/assignmentController');
const healthzController = require('./health/healthzController');
const authController = require('./auth/auth');
const { initializeDatabase } = require('./database/database');
const { csvLoader } = require('./utils/csvUtils');
const { checkNoPayload } = require('./health/healthzController');
let server;

// Initialize Express Application
const app = express();
const PORT = 8080;

app.get('/', (req, res) => {
    res.send('Web Application');
});

// Create a write stream for logging in append mode
//const directoryLog = '/var/log/webapp';
const directoryLog = process.env.NODE_ENV === 'test' ? './logs' : '/var/log/webapp';
const logPathAccess = path.join(directoryLog, 'access.log');
//const logPathApplication = path.join(directoryLog, 'application.log');

// Check if the log directory exists, if not create it
if (!fs.existsSync(directoryLog)) {
    fs.mkdirSync(directoryLog, { recursive: true });
}

// Check if the access log file exists, if not create it
try {
    fs.accessSync(logPathAccess, fs.constants.R_OK | fs.constants.W_OK);
} catch (err) {
    fs.closeSync(fs.openSync(logPathAccess, 'w'));
}

// Check if the application log file exists, if not create it
// try {
//     fs.accessSync(logPathApplication, fs.constants.R_OK | fs.constants.W_OK);
// } catch (err) {
//     fs.closeSync(fs.openSync(logPathApplication, 'w'));
// }

const logStreamAccess = fs.createWriteStream(logPathAccess, { flags: 'a' });
//const logStreamApplication = fs.createWriteStream(logPathApplication, { flags: 'a' });


// Setup morgan to log all requests to access.log
app.use(morgan('combined', { stream: logStreamAccess }));

// StatsD client for sending metrics
const statsd = new StatsD();

// Middleware to parse incoming JSON bodies
app.use(express.json());

// Increment StatsD metric for each API call
app.use((req, res, next) => {
    statsd.increment('api_call', 1, [`method:${req.method}`, `path:${req.path}`]);
    next();
});

app.use((req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT') {
        const contentType = req.headers['content-type'];
        if (contentType !== 'application/json') {
            return res.status(400).json({ error: 'Content-Type should be application/json' });
        }
    }
    next();
});

// API Health Check
app.all('/healthz', checkNoPayload, healthzController.checkMethod);
app.get('/healthz', checkNoPayload, healthzController.checkDatabase);

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({ error: "Malformed JSON" });
    }
    next();
});

// Login User
app.post('/login', authController.login);

// Middleware to authenticate the user
app.use('/v1/assignments', authController.authenticateUser);

// Routes
app.get('/v1/assignments', authController.authenticateUser, assignmentController.getAllAssignments);
app.get('/v1/assignments/:id', authController.authenticateUser, assignmentController.getAssignmentDetails);
app.post('/v1/assignments', authController.authenticateUser, assignmentController.createAssignment);
app.put('/v1/assignments/:id', authController.authenticateUser, assignmentController.updateAssignment);
app.delete('/v1/assignments/:id', authController.authenticateUser, assignmentController.deleteAssignment);
app.patch('/v1/assignments/:id', (req, res) => {
    res.status(405).send({ error: "PATCH method not allowed." });
});

// //Start Server Method
// const startServer = async () => {
//     try {
//         await initializeDatabase();
//         console.log('Database synchronized.');
//         await csvLoader('opt/users.csv');

//         // await sequelize.sync({ alter: true }).then(()=>csvLoader('opt/users.csv')); 
//         console.log("Finished processing CSV");
//         server = app.listen(PORT, () => {
//             console.log(`Server started running on http://localhost:${PORT}`);
//         });
//     } catch (err) {
//         console.error('Error:', err);
//     }
// };

// function applicationLog(message) {
//     const timestamp = new Date().toISOString();
//     logStreamApplication.write(`${timestamp} - ${message}\n`);
// }

//Start Server Method

const startServer = async () => {
    applicationLog("Application start");
    applicationLog(process.env.DB_HOST);
    applicationLog(process.env.DB_USERNAME);
    //console.log(process.env.DB_PASSWORD);
    applicationLog(process.env.DB_NAME);
    //applicationLog(`Access log path: ${logPathAccess}`);
    applicationLog(`Log directory: ${directoryLog}`);
    //applicationLog(`Application log path: ${logPathApplication}`);
    try {
        await initializeDatabase();
        applicationLog('Synchronized Database.');
        await csvLoader('opt/users.csv');
        applicationLog("Processed CSV");
        server = app.listen(PORT, () => {
            applicationLog(`Server started running on http://localhost:${PORT}`);
        });
    } catch (err) {
        applicationLog('Error:', err);
    }
};

if (process.env.NODE_ENV !== 'test') {
    startServer();
}

process.on('exit', () => {
    logStreamAccess.close();
    //logStreamApplication.close();
});

module.exports = {
    app,
    startServer,
    getServer: () => server
};
