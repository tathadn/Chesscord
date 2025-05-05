const http = require('http'),
      path = require('path'),
      express = require('express'),
      handlebars = require('express-handlebars'),
      socket = require('socket.io');

const myIo = require('./sockets/io'),
      routes = require('./routes/routes');

const app = express(),
      server = http.Server(app),
      io = socket(server);

const mongoose = require('mongoose'),
      passport = require("passport");

const session = require("express-session"),
      FileStore = require('session-file-store')(session);

const sessionMiddleware = session({
  name: 'server-session-cookie-id',
  secret: process.env.EXPRESS_SECRET,
  saveUninitialized: false,
  resave: true,
  store: new FileStore()
})

const Handlebars = handlebars.create({
  extname: '.html', 
  partialsDir: path.join(__dirname, '..', 'front', 'views', 'partials'), 
  defaultLayout: false,
  helpers: {},
  runtimeOptions: {
    allowProtoPropertiesByDefault: true
  }
});

require('./authStrategies/local-strategy');

mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true}).catch(error => 
console.log("Something went wrong: " + error));

app.engine('html', Handlebars.engine);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, '..', 'front', 'views'));
app.use('/public', express.static(path.join(__dirname, '..', 'front', 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(sessionMiddleware);
app.use(passport.session());

let games = {};

routes(app, games); 
myIo(io, sessionMiddleware, games)

server.listen(process.env.PORT);

console.log(`Server listening on port ${process.env.PORT}`);