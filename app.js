var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var request = require('request');
var ingkee = require('./models/ingkee');
// var upload = require('./upload');
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
var times1 = [];
// var user = source.source;
var users = [];
var length = 0;
// var values = [];

myEvents.on("ingkee", function (room, slot, user, json) {
    try {
        json.fans = 0;
        /*var options = { method: 'GET',
         url: 'http://service5.inke.tv/api/user/relation/numrelations',
         qs: { id: json.owner_id },
         /!*headers:
         { 'postman-token': '5a30c0a1-9522-de30-2218-abe00a927008',
         'cache-control': 'no-cache' }*!/ };

         request(options, function (error, response, body) {
         if (error) throw new Error(error);
         var parse = JSON.parse(body);
         json.fans = parse.num_followers;
         var options = {
         method: 'POST',
         url: 'http://120.27.94.166:2999/spforIngkee',
         body: json,
         json: true
         };

         request(options, function (error, response, body) {
         if (error) throw new Error(error);

         console.log(body);
         });
         console.log(body);
         });*/
        var options1 = {
            method: 'GET',
            url: 'http://service5.inke.tv/api/user/relation/numrelations',
            qs: {id: json.owner_id}
        };

        request(options1, function (error, response, body) {
            if (error)
                return console.log(error.message);
            var parse = JSON.parse(body);
            json.fans = parse.num_followers;
            // values.push(json);
            // if (values.length > 50) {
            var options2 = {
                method: 'POST',
                url: 'http://120.27.94.166:2999/spforIngkee',
                body: json,
                json: true
            };

            request(options2, function (error, response, body) {
                if (error) return console.log(error.message);
//{ msg: 'spforIngkee success' }
//                 console.log(body);
            });
            // values = [];
            // }

        });
        new ingkee(room, slot, user);
        /*upload.uploadServe(room, 'ingkee', []);
        console.log('init table ' + room);*/

        //console.log('rid=' + room + ' slot=' + slot + ' user=' + user);
    } catch (E) {
        console.log(E.message);
    }

});

rule1.hour = times1;
for (var i = 0; i < 24; i = i + 2) {
    times1.push(i);
}
// schedule.scheduleJob(rule1, function () {
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
                var user = "lc=3000000000005852&cv=IK3.1.00_Android&cc=TG36001&ua=samsungSM-N7508V&uid=" + bodyjs.data[i].uid +
                    "&sid=" + bodyjs.data[i].session +
                    "&imsi=&imei=352203065389185&icc=&conn=WIFI&vv=1.0.3-2016060211417.android&aid=c0590722d45ca695&osversion=android_18&proto=4&smid=DuEdLy786y%2B5h9D0%2BOvvHjExiUJ0pOrcnuOkw6HK2riyVnTLWuq%2By4ds8D28Ueyx9%2BRElIe00SnoPSaLz1Zqs0sg&city=%E8%A5%BF%E5%AE%89%E5%B8%82";
                // "lc=3000000000008352&cv=IK3.1.00_Android&cc=TG36001&ua=samsungSM-N7508V&uid=150239714&sid=20sPA84LrKSEqAjMEyctoqmnVXQ8mho5cEm2ZIvxUoI6N3AFnJ&devi=352203065389185&imsi=&imei=352203065389185&icc=&conn=WIFI&vv=1.0.3-2016060211417.android&aid=c0590722d45ca695&osversion=android_18&mtid=4d76c65ec64097a5b105f7818443d5d6&mtxid=d0ee0714fcba&proto=4&smid=DuEdLy786y%2B5h9D0%2BOvvHjExiUJ0pOrcnuOkw6HK2riyVnTLWuq%2By4ds8D28Ueyx9%2BRElIe00SnoPSaLz1Zqs0sg"
                console.log(user);
                users.push(user);
                rooms.push(roomId);
                slots.push(slot);
            }
            var jsons = [];
            //{"room_id":"1470147724248188","room_name":"#我是火炬手#  谢谢大家送点火炬金牌谢谢","owner_id":"9515835","nickname":"我沒有胖嘟嘟只是很可愛","online":"18407","fans":"275833"}
            for (var i = 0; i < length; i++) {
                var json = {};
                json.room_id = parse.lives[i].id;
                json.room_name = parse.lives[i].name;
                json.owner_id = parse.lives[i].creator.id;
                json.nickname = parse.lives[i].creator.nick;
                json.online = parse.lives[i].online_users;
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
                myEvents.emit("ingkee", rooms[count], slots[count], users[count], jsons[count]);
                count++;
            });

        });
    });
// });
// schedule.scheduleJob(rule1, function () {

// });


module.exports = app;
