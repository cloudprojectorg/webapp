# Node.js Web Application

This is a Node.js web application that serves as a platform for managing assignments with user authentication, logging, and interaction with a MySQL database.

## Features

- User login and authentication system.
- CRUD operations for managing assignments.
- Health check endpoint for the application.
- Environment-based configuration for deployment.
- Logging with rotation and controlled access.
- Data import utility using CSV files.
- Systemd service integration for app lifecycle management.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine or production system.

### Prerequisites

Before starting, ensure you have the following installed:
- Node.js (v16.x)
- npm (comes with Node.js)

### Installing

A step-by-step series of examples that tell you how to get a development environment running.

1. Clone the repository to your local machine or server.

2. Run the installation script which will set up Node.js, npm, and configure all necessary environment settings.
    ```bash
    chmod +x script.sh
    ./script.sh
    ```

3. Create an environment configuration file `/etc/webapp.env` and populate it with your database credentials and other necessary environment variables.

### Configuration Example

```env
DB_HOST=localhost
DB_USERNAME=myuser
DB_PASSWORD=mypassword
DB_NAME=mydatabase
NODE_ENV=development

4. API Endpoints
GET /: Home endpoint, returns a welcome message.
POST /login: Endpoint for user authentication.
GET /v1/assignments: Retrieve all assignments.
GET /v1/assignments/:id: Get details for a specific assignment.
POST /v1/assignments: Create a new assignment.
PUT /v1/assignments/:id: Update an existing assignment.
DELETE /v1/assignments/:id: Delete an assignment.

5. Logs
Logs are stored in /var/log/webapp/. Access and application logs are rotated to maintain file size and ensure security.

6. Health Checks
The application provides a health check endpoint at /healthz, verifying database connectivity and correct API functioning.

## Logging

The application uses a custom logging module to write logs to the filesystem. This is facilitated by `logger.js`, which is configured to write logs to `/var/log/webapp/application.log` for production and to `./logs/application.log` for testing environments. The logger ensures that all log entries are timestamped for better traceability.

### Log Files

- **Application Logs**: Track the application's operational events. Log location:
  - Production: `/var/log/webapp/application.log`
  - Testing: `./logs/application.log`

### Logger Module Usage

To log a message, import the `applicationLog` function from `logger.js` and pass your message to it:

```javascript
const applicationLog = require('./path/to/logger');
applicationLog('Your log message here');
