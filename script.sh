#!/bin/bash

# Update package repositories
sudo apt-get update

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs npm

# Create a dedicated non-privileged user for the application, but without a predefined home directory if /opt/webapp already exists
if [ -d "/opt/webapp" ]; then
    sudo useradd -r -M -d /home/webappuser webappuser
else
    sudo useradd -r -m -d /opt/webapp webappuser
fi

# Create cwagent users if they don't already exist
id -u cwagent &>/dev/null || sudo useradd -r -M -s /sbin/nologin cwagent

sudo mkdir -p /home/webappuser
sudo chown webappuser:webappuser /home/webappuser
sudo chmod 755 /home/webappuser

# Create a group for log access and add both appUser and cwagent to it
sudo groupadd -f grouplog
sudo usermod -a -G grouplog webappuser
sudo usermod -a -G grouplog cwagent

# Ensure /opt/webapp directory exists and set permissions
sudo mkdir -p /opt/webapp
sudo chown -R webappuser:webappuser /opt/webapp
sudo chmod -R 755 /opt/webapp

# Ensure log and environment files exist with correct permissions
sudo mkdir -p /var/log/webapp
sudo chown -R webappuser:grouplog /var/log/webapp
sudo chmod -R 775 /var/log/webapp

# Ensure /opt/webapp directory exists
# sudo mkdir -p /opt/webapp
# # Adjust permissions for the webapp directory
# # sudo chown -R $(whoami):$(whoami) /opt/webapp
# sudo chown -R webappuser:webappuser /opt/webapp
# sudo chmod -R 755 /opt/webapp

# # Ensure log and environment files exist with correct permissions
# sudo touch /var/log/userdata.log
# sudo chown webappuser:webappuser /var/log/userdata.log
# sudo chmod 664 /var/log/userdata.log

sudo touch /etc/webapp.env
sudo chown webappuser:webappuser /etc/webapp.env
sudo chmod 644 /etc/webapp.env

# # Touch webapp.ev
# sudo touch /etc/webapp.env
# if [ -f /etc/webapp.env ]; then
#     sudo chmod 644 /etc/webapp.env
# fi
# sudo chmod -R o+rx /opt/webapp

# Sequelize and mysql are npm packages, you should be able to cd into your app directory and install them using npm
cd /opt/webapp || exit

# Run npm commands as webappuser
# Install other npm dependencies
sudo -u webappuser npm uninstall bcrypt --prefix /opt/webapp
sudo -u webappuser npm install bcrypt --prefix /opt/webapp
sudo -u webappuser npm install sequelize mysql2 --prefix /opt/webapp
sudo -u webappuser npm install dotenv --prefix /opt/webapp
sudo -u webappuser npm install --prefix /opt/webapp

# Ensure log and environment files exist with correct permissions
sudo mkdir -p /var/log/webapp
sudo chown -R webappuser:grouplog /var/log/webapp
sudo chmod -R 775 /var/log/webapp
sudo touch /var/log/webapp/access.log
sudo touch /var/log/webapp/application.log

# Ensure log and environment files exist with correct permissions
sudo touch /var/log/userdata.log
sudo chown webappuser:webappuser /var/log/userdata.log
sudo chmod 775 /var/log/userdata.log

# Create the log files after npm installations
sudo touch /var/log/webapp/access.log
sudo touch /var/log/webapp/application.log
sudo chown webappuser:grouplog /var/log/webapp/access.log
sudo chown webappuser:grouplog /var/log/webapp/application.log
sudo chmod 775 /var/log/webapp/access.log
sudo chmod 775 /var/log/webapp/application.log

# Create environment file and set correct permissions
sudo touch /etc/webapp.env
sudo chown webappuser:webappuser /etc/webapp.env
sudo chmod 644 /etc/webapp.env

# List the permissions and ownership of the log files
echo "Listing Permissions of Log Files before script"
ls -l /var/log/webapp

# Remove current bcrypt module, and then reinstall
# npm uninstall bcrypt
# npm install bcrypt

# # You can install sequelize and mysql using npm now
# npm install sequelize mysql
# npm install

# Optionally, you can include additional application-specific setup steps here.

# Add Node.js app to startup using systemd:
# user_data_script=f"""#!/bin/bash
# cat << 'EOF' | sudo tee /etc/systemd/system/webapp.service
# [Unit]
# Description=Node.js WebApp
# # After=network.target
# After=cloud-final.service
# Wants=cloud-final.service

# [Service]
# ExecStart=/usr/bin/node /opt/webapp/index.js
# Environment="DB_HOST={rds_instance.endpoint}"
# Environment="DB_USER=root"
# Environment="DB_PASSWORD={db_password}" #Check this variable is present or not
# Environment="DB_NAME=csye6225"
# WorkingDirectory=/opt/webapp
# StandardOutput=syslog
# StandardError=syslog
# Restart=always
# User=nobody

# [Install]
# WantedBy=cloud-init.target
# EOF

# sudo systemctl daemon-reload
# sudo systemctl start webapp.service
# sudo systemctl status webapp.service
# sudo systemctl enable webapp.service
# """


sudo bash -c "cat > /etc/systemd/system/webapp.service <<EOL
[Unit]
Description=Node.js WebApp
After=/lib/systemd/system/cloud-final.service /lib/systemd/system/network.target
Wants=/lib/systemd/system/cloud-final.service

[Service]
ExecStartPre=/bin/sleep 20
EnvironmentFile=/etc/webapp.env
ExecStart=/usr/bin/node /opt/webapp/index.js
WorkingDirectory=/opt/webapp
StandardOutput=journal
StandardError=journal
Restart=always
RestartSec=30s
User=webappuser
Group=grouplog

[Install]
WantedBy=multi-user.target
EOL"

# Write logs using sudo
# sudo bash -c '{
#     echo "RDS Endpoint without port: ${hostname}";
#     echo "Complete RDS Endpoint: ${endpoint}";
#     echo "DB Password: ${db_password}";
# } >> /var/log/userdata.log'

# List the permissions and ownership of the log files
echo "Listing Permissions of Log Files after script"
ls -l /var/log/webapp

# Enable and start the service (optional as the user data might handle this)
sudo systemctl daemon-reload
sudo systemctl enable webapp.service
sudo systemctl start webapp.service

# Clean up any unnecessary packages
sudo apt-get autoremove -y
sudo apt-get autoclean -y
sudo apt-get clean -y
sudo apt purge -y git
sudo apt clean

echo "Setup completed successfully."
# End of script

# sudo tee /etc/systemd/system/webapp.service
# Modify the 50-server.cnf to change bind-address
# sudo sed -i 's/^bind-address\s*=.*$/bind-address = ::/' /etc/mysql/mariadb.conf.d/50-server.cnf
# Restart mariadb
# sudo systemctl restart mariadb
# Set password for root user in MariaDB and update privileges
# sudo mysql -u root <<-EOF
# USE mysql;
# ALTER USER 'root'@'localhost' IDENTIFIED BY 'root1234';
# FLUSH PRIVILEGES;
# EOF

# Check if git is installed and uninstall if it is
# if which git > /dev/null; then
#     echo "Git is installed. Uninstalling..."
#     sudo apt purge -y git
# else
#     echo "Git is not installed."
# fi
