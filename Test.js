const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 5000;

app.use(bodyParser.json());


const apiKeys = {
    user1: 'apikey1',
    user2: 'apiKey2',
    user3: 'apiKey3',
};
const clients = {};

// const authenticate = ((req, res, next) => {
//     const apiKey = req.body.apiKey;
//     if (Object.values(apiKeys).includes(apiKey)) {
//         return next();
//     }
//     res.status(401).json({ error: 'Invalid API Key' });

// })

const writeMessaage = ((roomId, message) => {
    if (clients[roomId]) {
      clients[roomId].forEach(client => client.res.write(`${JSON.stringify(message)}\n\n`));
    }
  });

app.post('/send', (req, res) => {
    const {apiKey, message, id} = req.body;
    if(!apiKey || !message || !id){
      res.sendStatus(FORBIDDEN);
      return;
    }else if(!Object.values(apiKeys).includes(apiKey)){
      res.sendStatus(UNAUTHORIZED);
      return;
    }
    writeMessaage(id, message);
    return res.json({status: 'Message sent'});
  
  });

app.get('/listen', (req, res) => {
    const {apiKey, id} = req.query;
    if(!apiKey || !id){
      res.sendStatus(FORBIDDEN);
      return;
    } else if(!Object.values(apiKeys).includes(apiKey)){
      res.sendStatus(UNAUTHORIZED);
      return;
    }
  
    const headers = {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache',
    };
  
    res.writeHead(200, headers);
  
    if(!clients[id]){
      clients[id] = [];
    }
  
    clients[id].push({res});
  
    req.on('close', () => {
      if(clients[id]){
        clients[id] = clients[id].filter(client => client !== res);
      }
      if(clients[id].length === 0){
        delete clients[id];
      }
    });
  
});

app.get('/', (req, res) => {
    res.send("hello shit!");
});



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});