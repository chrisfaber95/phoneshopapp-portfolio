const express = require('express');
const https = require('https');
const http = require('http');
const routes = require('./routes');
const store_routes = require('./store_routes');
const app = express();
const path = require('path')
const fs = require("fs");
require('dotenv').config();

var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: "10mb"}));
app.use(bodyParser.urlencoded({limit: "10mb", extended: true, parameterLimit:10000}));
require('./routes/middleware/express_compat')(app);
app.use(require('./routes/middleware/request_timeout')(30000));

const Logger = require('./config/logging.js')

// a rejected promise nobody handles (e.g. a route's database query) must not take the whole server down
process.on('unhandledRejection', (reason) => Logger.log(1, reason));

app.use(function(req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', false);
    // Pass to next layer of middleware
    next();
});

app.use('/api/back-images/', express.static('public'));
app.use('/api/v1/', routes);
app.use('/api/v2/', store_routes);
try {
    const port = process.env.PORT || 3001;
    http.createServer({
        //        key: fs.readFileSync(path.resolve('./key.pem')),
         //       cert: fs.readFileSync(path.resolve('./cert.pem')),
         //       passphrase: 'wachtwoord',
          //      rejectUnauthorized: false
            },
            app)
        .listen(port);
    Logger.log(2, 'Starting Server at port 3001')
} catch (err) {
    Logger.log(1, err)
}
//app.listen(3000, () => console.log('listening at port 3000'));
