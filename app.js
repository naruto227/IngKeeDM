var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var request = require('request');
var ingkee = require('./models/ingkee');
// var source = require('./models/source');
var config = require('./config');

var eventEmitter = require('events').EventEmitter;
var myEvents = new eventEmitter();

var schedule = require('node-schedule');
var rule = new schedule.RecurrenceRule();
var rule1 = new schedule.RecurrenceRule();

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
//var times1 = [];
// var user = source.source;
var users = [];
var length = 0;

myEvents.on("ingkee", function (room, slot, user,json) {
    json.fans=0;
    var options = { method: 'GET',
        url: 'http://service5.inke.tv/api/user/relation/numrelations',
        qs: { id: json.owner_id }
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        var parse = JSON.parse(body);
        json.fans=parse.num_followers;
        var options = { method: 'POST',
            url: 'http://120.27.94.166:2999/spforIngkee',
            headers:
            { 'postman-token': '1791342a-e9cb-8589-6e85-43e5bcb6d91f',
                'cache-control': 'no-cache',
                'content-type': 'application/json' },
            body: json,
            json: true };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);

            console.log(body);
        });

    });

    //console.log('rid=' + room + ' slot=' + slot + ' user=' + user);
    new ingkee(room, slot, user);
});

//rule1.hour = times1;
//for (var i = 0; i < 24; i = i + 2) {
//    times1.push(i);
//}
//schedule.scheduleJob(rule1, function () {
    request('http://121.42.176.30:3000/getUsers?num=' + config.topn, function (error, response, body1) {
        if (error) {
            return console.log(error);
        }
        var bodyjs = JSON.parse(body1);
        length = bodyjs.data.length;
        request('http://service.ingkee.com/api/live/simpleall', function (error, response, body) {
            if (error) {
                return console.log(error);
            }
            var parse = JSON.parse(body);
            for (var i = 0; i < length; i++) {
                var roomId = parse.lives[i].id;
                var slot = parse.lives[i].slot;
                var user = "lc=3000000000005852&cv=IK2.9.50_Android&cc=TG36001&ua=samsungSM-N7508V&uid=" + bodyjs.data[i].uid +
                    "154010404&sid=" + bodyjs.data[i].session +
                    "&imsi=&imei=352203065389185&icc=&conn=WIFI&vv=1.0.3-2016060211417.android&aid=c0590722d45ca695&osversion=android_18&proto=4&smid=DuEdLy786y%2B5h9D0%2BOvvHjExiUJ0pOrcnuOkw6HK2riyVnTLWuq%2By4ds8D28Ueyx9%2BRElIe00SnoPSaLz1Zqs0sg&city=%E8%A5%BF%E5%AE%89%E5%B8%82"
                users.push(user);
                rooms.push(roomId);
                slots.push(slot);
            }
            var jsons=[];
            //{"room_id":"1470147724248188","room_name":"#我是火炬手#  谢谢大家送点火炬金牌谢谢","owner_id":"9515835","nickname":"我沒有胖嘟嘟只是很可愛","online":"18407","fans":"275833"}
            for (var i = 0; i < length; i++) {
                var json={};
                json.room_id=parse.lives[i].id;
                json.room_name=parse.lives[i].name;
                json.owner_id=parse.lives[i].creator.id;
                json.nickname=parse.lives[i].creator.id.nick;
                json.online=parse.lives[i].online_users;
                jsons.push(json);
            }
            rule.second = times;
            for (var i = 0; i < 60; i += 2) {
                times.push(i);
            }

            // console.log("-------------");
            var count = 0;
            schedule.scheduleJob(rule, function () {
                if (count >= rooms.length) {
                    this.cancel();
                    return;
                }
                myEvents.emit("ingkee", rooms[count], slots[count], users[count],jsons[count]);
                count++;
            });

        });
    });
//});
// schedule.scheduleJob(rule1, function () {

// });


module.exports = app;
