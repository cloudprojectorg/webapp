const fs = require('fs');
const csv = require('csv-parser');
const { User } = require('../models');
const bcrypt = require('bcrypt');

const csvLoader = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv({
                delimiter: '\t',
                mapHeaders: ({ header }) => header.trim(),
            }))
            .on('data', (row) => {
                delete row.account_created;
                delete row.account_updated;
                const {
                    first_name,
                    last_name,
                    email,
                    password
                } = row;

                // Hashing the password
                bcrypt.hash(password, 10, (err, hashedPassword) => {
                    if (err) {
                        console.error("Error hashing password:", err);
                        return reject(err);
                    }
                    // Use hashedPassword here
                    User.findOrCreate({
                        where: { email: email },
                        defaults: {
                            first_name,
                            last_name,
                            email,
                            password: hashedPassword
                        }
                    }).then(([user, created]) => {
                        if (created) {
                            console.log(`New user created: ${user.email}`);
                        } else {
                            console.log(`User already exists: ${user.email}`);
                        }
                    }).catch(error => {
                        console.error("Error creating or finding user:", error);
                        reject(error);
                    });
                });
            })
            .on('end', () => {
                console.log('CSV file successfully processed');
                resolve();
            })
            .on('error', (error) => {
                console.error('Error processing CSV file:', error);
                reject(error);
            });
    });
}

module.exports = {
    csvLoader
};
