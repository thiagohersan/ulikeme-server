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

var clients = {};

wss.on('connection', function(ws) {
    // client
    if(String(ws.upgradeReq.url).indexOf("client") != -1){
      var clientId = String(ws.upgradeReq.url).replace("/client?id=","");
      clients[clientId] = ws;
      ws.on('close', function() { delete clients[clientId]; });
    }

    // observer
    else if(String(ws.upgradeReq.url).indexOf("observer") != -1){
      // respond with available clients
      var clientIds = [];
      for(clientId in clients){
        clientIds.push(clientId);
      }
      ws.send(JSON.stringify({'clientIds' : clientIds}));
      ws.on("message", function(msg){
        if(msg == "PING") return;
        var message = JSON.parse(msg);
        if(clients[message['client']]){
          clients[message['client']].send(JSON.stringify({observer:message['observer']}));
        }
      });
    }
});
