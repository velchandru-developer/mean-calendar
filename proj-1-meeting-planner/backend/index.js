const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const http = require('http');
const fs = require('fs');
const appConfig = require('./config/appConfig');
const routeLogger = require('./app/middlewares/routeLogger');
const globalError = require('./app/middlewares/appErrorHandler');
const logger = require('./app/libs/loggerLib');
const rateLimit = require("express-rate-limit");

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

const modelsPath = './app/models';
const routesPath = './app/routes';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(routeLogger.logIp);
app.use(globalError.globalErrorHandler);
app.use(limiter);


app.all("*", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With", "Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    next();
});

fs.readdirSync(modelsPath).forEach((file) => {
    if (~file.indexOf('.js')) require(modelsPath + '/' + file);
});

fs.readdirSync(routesPath).forEach((file) => {
    if (~file.indexOf('.js')) {
        let route = require(routesPath + '/' + file);
        route.setRouter(app);
    }
});

app.use(globalError.globalNotFoundHandler);

const socketLib = require('./app/libs/socketLib');
const socketServer = socketLib.setServer(server);

server.listen(appConfig.port);
server.on('listening', onListening);

function onListening() {
    let address = server.address();
    let bind = (typeof address === "string") ? 'pipe' + address.port : 'port' + address.port;
    ("Listening on " + bind);
    logger.info("Server listening on port" + appConfig.port, "serverOnListeningHandler", 10);
    mongoose.connect(appConfig.db.uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
}

module.exports = app;