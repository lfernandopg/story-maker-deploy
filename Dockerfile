# Use Node.js 20 as the base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

RUN apk add --no-cache git nano

# Install dependencies
RUN npm install -g npm@latest

# Expose port 5173 for Vite dev server
EXPOSE 5173

# Command to run the development server
# CMD ["npm", "run", "dev", "--", "--host"]

CMD ["sleep", "infinity"]