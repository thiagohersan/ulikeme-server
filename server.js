var WebSocketServer = require('ws').Server
  , http = require('http')
  , port = process.env.PORT || 5000;

var server = http.createServer(function(request,response){
    response.writeHeader(200, {"Content-Type": "text/plain"});
    response.write("Get Out!!!");
    response.end();
});

server.listen(port);

console.log('http server listening on %d', port);

var wss = new WebSocketServer({server: server});
console.log('websocket server created');
wss.on('connection', function(ws) {
    var id = setInterval(function() {
        ws.send(JSON.stringify(new Date()), function() {  });
    }, 1000);

    console.log('websocket connection open');

    ws.on('close', function() {
        console.log('websocket connection close');
        clearInterval(id);
    });
});
