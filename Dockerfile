FROM node:slim
WORKDIR /app
COPY . /app
ENV NODE_ENV=prod
RUN cd /app && npm install 
CMD node bin/www
EXPOSE 3001