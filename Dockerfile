# Build step 1 (installing node modules and preparing compiled build)
FROM node:18 as builder

WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (ignore peer dependency conflicts)
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Build the Vue.js application
RUN npm run build

# Build step 2(Deploying build on NGINX)
FROM nginx:1.27-alpine

# Clean up default Nginx HTML content
RUN rm -rf /usr/share/nginx/html/*

# Copy configuration and built files from the builder stage
COPY --from=builder /usr/src/app/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
