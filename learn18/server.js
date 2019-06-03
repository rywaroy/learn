const http = require('http');
const querystring = require('querystring');

http.createServer((req, res) => {
  let data = '';

  req.on('data', (chunk) => {
    data += chunk;
  });

  req.on('end', () => {
    const body = querystring.parse(data);
    console.log(body);
    res.end(JSON.stringify(body));
  });
}).listen(8080);