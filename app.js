let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let hbs = require('express-handlebars');
let expressSession = require('express-session');

let index = require('./routes/index');
let issues = require('./routes/issues');
let logout = require('./routes/logout');
let oauth = require('./routes/oauth');
let singleIssue = require('./routes/singleIssue');

let app = express();

// view engine setup
app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'main', layoutsDir: __dirname + '/views/layouts/'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

let sessionMiddleware =expressSession({secret: 'g45fdg456fg4d5g4fd465xz1c2dr', saveUninitialized: false, resave: false, expires: false});
app.use(sessionMiddleware);

app.use('/', index);
app.use('/issues', issues);
app.use('/issue', singleIssue);

app.use('/logout', logout);
app.use('/oauth', oauth);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

/** WWW */
const request = require('request');
const git = require('./models/gitRequest');

const debug = require('debug')('edaa_gib:server');
const http = require('http');

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3000');
// var port = normalizePort(process.env.PORT || '3003');
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 *
 * SOCKET IO
 *
 * */

let io = require('socket.io')(server);

io.use(function(socket, next) {
  sessionMiddleware(socket.request, socket.request.res, next);
});

io.on('connection', function(client) {
  console.log('Client connected...');
  if(client.request.session.user === undefined || client.request.session.issue === undefined) { console.log("DISCONNECTED"); return; }

  client.on('join', function(data) {
    console.log('CLIENT JOINED');

  });
  client.on('send', function (data) {
    let reqBody = JSON.stringify({body: data.message});
    return new Promise(function (resolve, reject) {
      let options = {
        method: 'POST',
        uri: `https://api.github.com/repos/${client.request.session.issue.repoOwner}/${client.request.session.issue.repoName}/issues/${client.request.session.issue.number}/comments`,
        headers: {
          'user-agent': 'node.js',
          'Authorization' : `token ${client.request.session.user.access_token}`
        },
        body: reqBody
      };
      request(options, function (err, res, body) {
        if(err) reject(err);
        resolve(body);

      });
    })
    .then(() =>{
      io.emit('messages', {message: git.parseMarkdown(data.message, `${client.request.session.issue.repoOwner}/${client.request.session.issue.repoName}`),
                            login: client.request.session.user.login});    })
    .catch(err=>{
      console.log(err);
    })

  });
});


let cron = require('node-cron');

// every 8 min self-request, HEROKU server must live!
// cron.schedule('0 */8 * * * *', function(){
//   request("http://localhost:3000", function (err, req_res, body) {
//     if (err) {
//       console.error(err);
//       return;    }
//     console.log('~Callback');
//   });
// });
/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  let port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  let bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  let addr = server.address();
  let bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}


// module.exports = app;
