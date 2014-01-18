var WebSocketServer = require('ws').Server
  , http = require('http')
  , port = process.env.PORT || 5000;

var server = http.createServer(function(request,response){
    response.writeHeader(200, {"Content-Type": "text/plain"});
    response.write("Get Out!!!");
    response.end();
});

server.listen(port);

var wss = new WebSocketServer({server: server});
var clients = {};
var observers = {}

wss.on('connection', function(ws) {
    // client
    if(String(ws.upgradeReq.url).indexOf("client") != -1){
      var clientId = String(ws.upgradeReq.url).replace("/client?id=","");
      clients[clientId] = ws;
      ws.on('close', function() { delete clients[clientId]; });
      ws.on("message", function(msg){
        if(msg == "PING") return;
        var message = JSON.parse(msg);
        if(observers[message['observer']]){
          observers[message['observer']].send(JSON.stringify({postIds:message['ids']}));
        }
      });
    }

    // observer
    else if(String(ws.upgradeReq.url).indexOf("observer") != -1){
      var observerId = String(ws.upgradeReq.url).replace("/observer?id=","");
      observers[observerId] = ws;
      ws.on('close', function() { delete observers[observerId]; });
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
