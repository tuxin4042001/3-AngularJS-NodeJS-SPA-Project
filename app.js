//Set up logging
var winston = require('winston');






//Defining general logging
winston.configure({
    transports: [new(winston.transports.Console) ({
        level: 'debug',
        timestamp: true,
        colorize: true,
        handleExceptions: true,
        humanReadableUnhandledException: true
    }), new(winston.transports.File) ({
        level: 'debug',
        timestamp: true,
        colorize: true,
        maxsize: 10000000,
        maxFiles: 10,
        prettyPrint: true,
        handleExceptions: true,
        humanReadableUnhandledException: true,
        json: false,
        filename: './logs/vx-general.log'
    })]
  });

winston.info("Initializing system...");

// connect to our database
winston.debug("Setting up the database...");
var mongoose = require('mongoose');
var configDB = require('./config/database.js');
mongoose.connect(configDB.url);
winston.debug("Database ready!");

winston.debug("Setting up Express server...");
var express = require("express");
var app = express();
winston.debug("Express ready!");

winston.debug("Setting up session management...");
var session = require('client-sessions');
app.use(session({
  cookieName: 'session',
  secret: 'r;sdgmomspgempowrkwopgspoho',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));
winston.debug("Session management ready");

//Set up communication with the browser
winston.debug("Setting up communications...");
var bodyParser = require('body-parser'); //Support passing data
app.use(bodyParser.json()); //Support JSON data
app.use(bodyParser.urlencoded({ extended: true })); //Support encoding for special characters
winston.debug("Communications ready!");

//Set up the UI
winston.debug("Setting up UI...");
app.use(express.static("public")); // Specify the root location of static files (HTML, CSS, etc)
app.set("view engine", "html"); // Specify how the UI will be displayed
winston.debug("UI ready!");

//Register the URL handlers
winston.debug("Setting up URL handlers...");
require('./routes')(app);
winston.debug("URL handlers ready!");

//Start the web server
winston.debug("Starting web server...");
var server = require("http").createServer(app);

server = app.listen(process.env.PORT || 8020, function () {
   var host = server.address().address
   var port = server.address().port
   winston.info("Example app listening at http://%s:%s", host, port)
});
