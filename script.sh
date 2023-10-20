#!/bin/bash

# Update package repositories
sudo apt-get update

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs npm

# Install MariaDB
sudo debconf-set-selections <<< 'mariadb-server-10.5 mysql-server/root_password password root1234'
sudo debconf-set-selections <<< 'mariadb-server-10.5 mysql-server/root_password_again password root1234'
sudo apt-get -y install mariadb-server

# Start MariaDB service
sudo systemctl start mysql

# Secure MariaDB installation (set root password and remove anonymous users)
sudo mysql_secure_installation <<EOF

root1234
n
n
y
y
y
y
EOF

# Configure your web application here, e.g., copy application files, create databases, etc.
# Initialize the web application database (if required)
# Example:
#mysql -u root -proot1234 -e "CREATE DATABASE webappdb;"

# Ensure /opt/webapp directory exists
sudo mkdir -p /opt/webapp
# Adjust permissions for the webapp directory
sudo chown -R $(whoami) /opt/webapp

# Set up database, user creation, etc. as per your needs

# At this point, since sequelize and mysql are npm packages, you should be able to cd into your app directory and install them using npm
cd /opt/webapp || exit

# You can install sequelize and mysql using npm now
npm install sequelize mysql

# Optionally, you can include additional application-specific setup steps here.

# Add Node.js app to startup using systemd:
echo "[Unit]
Description=Node.js WebApp
After=network.target

[Service]
ExecStart=/usr/bin/node /opt/webapp/index.js
WorkingDirectory=/opt/webapp
StandardOutput=syslog
StandardError=syslog
Restart=always
User=nobody

[Install]
WantedBy=multi-user.target" | sudo tee /etc/systemd/system/webapp.service

# Enable the webapp service
# sudo systemctl enable webapp.service

# Restart MariaDB for changes to take effect
sudo systemctl restart mysql

# Clean up (remove unnecessary packages and clear cache)
sudo apt-get autoremove -y
sudo apt-get clean

# End of the script
