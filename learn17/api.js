const http = require('http');

const server = http.createServer((req, res) => {

  res.writeHead(200, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PUT,DELETE',
    'Access-Control-Allow-Headers': 'Authorization',
    // 'Access-Control-Expose-Headers': 'abc',
    'Access-Control-Max-Age': 4,
    'abc': 111,
  });
  
  res.end('zhang');
  
}).listen(8081);