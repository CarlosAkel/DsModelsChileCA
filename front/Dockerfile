# Use official Node image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy React app code
COPY package*.json ./
RUN npm install

# Copy remaining app files
COPY . .

# Expose React development server port
EXPOSE 3000

# Start the React app
CMD [ "npm", "start" ]
