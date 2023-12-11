FROM node:16.13.2
WORKDIR /app
COPY package*.json ./
RUN npm install --save
COPY . .
EXPOSE 5555 3939
CMD ["npm", "start"]