const app = require('./app');
const sequelize = require('./Models/db');
const loadUsersFromCSV = require('./Utils/csvLoaders');
const processUsers = require('./Utils/processUsers');
const User = require('./Models/User');
const Assignment = require('./Models/Assignment');
const PORT = 8080;

loadUsersFromCSV('../opt/users.csv')
    .then(users => {
        return processUsers(users);
    })
    .then(() => {
        console.log("Finished processing users.");
        
        // Setup model relationships
        User.hasMany(Assignment, { foreignKey: 'userId', as: 'assignments' });
        Assignment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

        // Sync models with database and start the server
        sequelize.sync().then(() => {
            app.listen(PORT, () => {
                console.log(`Server started on http://localhost:${PORT}`);
            });
        });
    })
    .catch(err => {
        console.error("Error:", err);
    });



    