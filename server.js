const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const clients = [];
const coinFlips = [];


app.get('/status', (req, res) => res.json({ clients: clients.length }));

app.get('/', (req, res) => {
    res.send("hello world!");
});

app.get('/flip-coin', (req, res) => {
    const coin = Math.random();
    const data = (coin < 0.5) ? { coin: "heads" } : { coin: "tails" };

    coinFlips.push(data);
    sendEventsToAll(data);

    res.json(data);
});

app.get('/flip-coins', (req, res) => {
    const times = parseInt(req.query.times, 10);
    let heads = 0;
    let tails = 0;

    for (let i = 0; i < times; i++) {
        const coin = Math.random();
        if (coin < 0.5) {
            heads++;
        } else {
            tails++;
        }
    }

    const data = { heads, tails };
    coinFlips.push(data);
    sendEventsToAll(data);

    res.json(data);
});

const eventsHandler = (req, res) => {
    const headers = {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    };
    res.writeHead(200, headers);

    const data = `data: ${JSON.stringify(coinFlips)}\n\n`;
    res.write(data);

    const clientId = Date.now();
    const newClient = {
        id: clientId,
        res
    };

    clients.push(newClient);

    req.on('close', () => {
        console.log(`${clientId} Connection closed`);
        clients = clients.filter(client => client.id !== clientId);
    });
};

function sendEventsToAll(data) {
    clients.forEach(client => client.res.write(`data: ${JSON.stringify(data)}\n\n`));
}

app.get('/events', eventsHandler);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
