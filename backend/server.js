
const app = require('./src/app');
const connectDb = require('./src/db/config');
const httpServer = require('http').createServer(app);
const { setupSocket } = require('./src/socket/socket.service');

setupSocket(httpServer);

httpServer.listen(3000, () => {
  connectDb();
  console.log('Server is running on port 3000');
});

