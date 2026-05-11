# Use a small Node base image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files first and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose default application port
EXPOSE 8000

# Use environment variables provided at runtime
CMD ["node", "src/index.js"]
