FROM amazonlinux:latest

# Update packet and install basic packages
RUN amazon-linux-extras install nginx1.12

# Install nodeJS 8
RUN curl --silent --location https://rpm.nodesource.com/setup_8.x | bash -
RUN yum -y install nodejs

# Copy nginx configuration file and create foler /var/app
COPY nginx.conf /tmp
RUN mv /tmp/nginx.conf /etc/nginx/nginx.conf
RUN mkdir -p /var/app

# Copy NodeJS App to container
COPY src/ /var/app
RUN npm install --prefix /var/app

# Expose port 80 and 443 for HTTP
EXPOSE 80 443
CMD sh -c "node /var/app/index.js & nginx -g 'daemon off;'"