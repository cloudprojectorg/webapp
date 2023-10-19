// Imports
const express = require('express');
//const { User, Assignment } = require('./models');
//const bcrypt = require('bcrypt');
const assignmentController = require('./controller/assignmentController');
const healthzController = require('./health/healthzController');
const authController = require('./auth/auth');
const { sequelize, initializeDatabase } = require('./database/database');
const { csvLoader } = require('./utils/csvUtils');
const { checkNoPayload } = require('./health/healthzController');
let server;

// Initialize Express Application
const app = express();
const PORT = 8080;

// Middleware to parse incoming JSON bodies
app.use(express.json());

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

//Start Server Method
const startServer = async () => {
    try {
        await initializeDatabase();
        console.log('Database synchronized.');
        await csvLoader('opt/users.csv');
        console.log("Finished processing CSV");
        server = app.listen(PORT, () => {
            console.log(`Server started running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Error:', err);
    }
};

if (process.env.NODE_ENV !== 'test') {
    startServer();
}

module.exports = {
    app,
    startServer,
    getServer: () => server
};
