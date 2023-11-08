//required files
const fs = require('fs');
const path = require('path');

//const directoryLog = '/var/log/webapp';
const directoryLog = process.env.NODE_ENV === 'test' ? './logs' : '/var/log/webapp';
const logPathApplication = path.join(directoryLog, 'application.log');

// Ensure the log directory exists
if (!fs.existsSync(directoryLog)) {
    fs.mkdirSync(directoryLog, { recursive: true });
}

// Create a write stream in append mode
const logStreamApplication = fs.createWriteStream(logPathApplication, { flags: 'a' });

const applicationLog = (message) => {
    const timestamp = new Date().toISOString();
    logStreamApplication.write(`${timestamp} - ${message}\n`);
};

process.on('exit', () => {
    logStreamApplication.close();
});

module.exports = applicationLog;
