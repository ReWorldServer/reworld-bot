FROM node:24
WORKDIR ./
COPY . ./
RUN npm install
RUN node src/register-commands.js
CMD ["node", "src/index.js"]