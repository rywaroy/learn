const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  const html = fs.readFileSync('./index.html', 'utf8');

  res.end(html);
  
}).listen(8080);