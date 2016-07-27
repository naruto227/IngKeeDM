var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var request = require('request');
var ingkee = require('./models/ingkee');
var source = require('./models/source');

var eventEmitter = require('events').EventEmitter;
var myEvents = new eventEmitter();

var schedule = require('node-schedule');
var rule = new schedule.RecurrenceRule();

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var rooms = [];
var slots = [];
var times = [];
var user = source.source;
var length = user.length;

myEvents.on("ingkee", function (room, slot, user) {
    console.log('rid=' + room + ' slot=' + slot + ' user=' + user);
    new ingkee(room, slot, user);
});

request('http://service.ingkee.com/api/live/simpleall', function (error, response, body) {
    if (error) {
        return console.log(error);
    }
    var parse = JSON.parse(body);
    for (var i = 0; i < length; i++) {
        var roomId = parse.lives[i].id;
        var slot = parse.lives[i].slot;
        rooms.push(roomId);
        slots.push(slot);
    }

    rule.second = times;
    for (var i = 0; i < 60; i+=1) {
        times.push(i);
    }

    // console.log("-------------");
    var count = 0;
    schedule.scheduleJob(rule, function () {
        if (count >= rooms.length) {
            this.cancel();
            return;
        }
        myEvents.emit("ingkee", rooms[count], slots[count], user[count].user);
        count++;
    });

});

module.exports = app;
