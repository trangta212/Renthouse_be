const express = require('express');
const http = require('http');
const initSocket = require('./socket');

const app = express();
const server = http.createServer(app);

// Khởi tạo socket
initSocket(server);

// ... existing code ...

server.listen(5000, () => {
  console.log('Server is running on port 5000');
});