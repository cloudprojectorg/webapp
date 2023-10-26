#!/bin/bash

# Debug: Print the variables
echo "DB_HOST: $DB_HOST"
echo "DB_USERNAME: $DB_USERNAME"
echo "DB_PASSWORD: $DB_PASSWORD"
echo "DB_NAME: $DB_NAME"

# Start Node.js application
NODE_ENV=development /usr/bin/node /opt/webapp/index.js