# FROM ghcr.io/puppeteer/puppeteer:22.9.
FROM node:20.9.0
# Set environment variables to skip Chromium download and specify the path to the executable
# Set the working directory
# RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /serevr
# Create a new user 'admin'
# RUN useradd -m -s /bin/bash admin
# Copy package.json first to leverage Docker cache
COPY package.json . 
# Install npm dependencies
RUN npm install
# Copy the remaining files
COPY  . .
# Change ownership of the working directory to 'admin'
# RUN chmod -R 777 /backend-system-database/src/upload_Data
# Ensure the 'admin' user has the necessary permissions
# RUN mkdir -p /backend-system-database/src/upload_Data && chmod -R 777 /backend-system-database/src/upload_Data
# Switch to the 'admin' user
# USER admin
# Specify the command to run the application
EXPOSE 4000
CMD [ "node", "server.js" ]
