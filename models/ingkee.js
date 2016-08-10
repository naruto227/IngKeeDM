/**
 * Created by hzq on 16-7-27.
 */
var WebSocketClient = require('websocket').client;
var upload = require('../upload');
// var source = require('./source');
// var rid = "1469582769476266";
// var slot = 6;
// var uid = 2;
// var host = "60.205.82.61:81";
// var iplist;
// var json = {"b": {"ev": "c.jr"}, "rid": rid, "city": "西安市", "from": "hot"};

function Ingkee(rid, slot, user) {
    this.rid = rid;
    this.slot = slot;
    this.user = user;
    this.start()
}

module.exports = Ingkee;

Ingkee.prototype.start = function () {
    var rid = this.rid;
    var slot = this.slot;
    var user = this.user;
    var iplist;
    var reconnectCount = 0;
    var url;
    var ts;
    var json = {"b": {"ev": "c.jr"}, "rid": rid, "city": "西安市", "from": "hot"};
    var values = [];
    var client = new WebSocketClient();
    client.on('connectFailed', function (error) {
        console.log('Connect Error: ' + error.toString());
    });

    client.on('connect', function (connection) {

        console.log('WebSocket Client Connected');
        connection.on('error', function (error) {
            console.log("Connection Error: " + error.toString());
        });
        connection.on('close', function () {
            if (reconnectCount > 5)
                return;
            reconnect();
            console.log('echo-protocol Connection Closed');

        });
        connection.on('message', function (message) {
            if (message.type === 'utf8') {
                var data = message.utf8Data;


                //console.log(data);
                var ts = data.slice(0, 3);

                switch (ts) {
                    case "1::":
                        // console.log(rid+"--roomid--"+data);
                        setInterval(function () {
                            sendData("3:::" + JSON.stringify(json));
                        }, 45000);
                        break;
                    case "2::":
                        // console.log(rid+"--roomid--"+data);
                        setInterval(function () {
                            sendData("2:::");
                        }, 45000);
                        break;
                    case "3::":
                        var parse = JSON.parse(data.slice(4));
                        // console.log(JSON.stringify(parse));
                        if (parse.liveid == json.rid) {
                            parse.ctime = new Date().getTime();
                            // console.log(parse.ms["0"].tp);
                            try {
                                /*if ('like' == parse.ms["0"].tp || 'usernu' == parse.ms["0"].tp) {
                                    values.push(parse);
                                }*/
                                if ('pub'==parse.ms["0"].tp)
                                    values.push(parse);
                            } catch (e) {
                                // console.log(parse.b.c);
                            }


                            if (values.length > 100) {
                                upload.uploadServe(rid, 'ingkee', values);
                                values = [];
                            }
                            //console.log(rid);
                            //console.log(rid + "--roomid--" + data);
                        }
                        break;
                    case "4::":
                        // console.log(rid+"--roomid--"+data);
                        break;
                    case "5::":
                        // console.log(rid+"--roomid--"+data);
                        break;
                    case "7::":
                        // console.log(rid+"--roomid--"+data);
                        /*if (reconnectCount > 5){
                            return;
                        }
                        reconnect();*/
                        console.log("socket 连接关闭");
                        // console.log("信息过期鸟,seeyou lala");
                        connection.close();
                        break;
                    default:
                        break;

                }
            }
        });
        function sendData(data) {
            try {
                if (connection.connected) {

                    connection.send((data));
                }
            } catch (e) {
                console.log(e.message);
            }

        }

        /*setInterval(function () {
            sendData();
        }, 45000);*/
        //function sendNumber() {
        //    if (connection.connected) {
        //        var number = Math.round(Math.random() * 0xFFFFFF);
        //        connection.sendUTF(number.toString());
        //        setTimeout(sendNumber, 1000);
        //    }
        //}
        // sendNumber();
    });
// var liveid = 1469517322542243;
// // var liveid = 1469501731231101;
// // var host="101.201.58.187:81";
// var uid = 144559824;
//var s = "http://101.201.58.189:81/socket.io/1/?lc=3000000000005860&cv=IK2.9.50_Android&cc=TG36011&ua=Meizum2note&uid=150531691&sid=20BrU6jPAikmx7EZSP6A0i0LoWki2RNxhkAdrXEr1BoM9IsVBjPC&devi=867570028396103&imsi=460026208089352&imei=867570028396103&icc=898600f2261478202497&conn=WIFI&vv=1.0.3-2016060211417.android&aid=caf33cfb45b6cd66&osversion=android_22&proto=4&smid=DuRCYMJK7iW%2BsDMckPgAXpsIRqhtVX0LftNnFOymKTNUnHwA9%2F0COYdTgdEiGrNGcojZSgBQPQStfvxmVPjaX5Cw&city=";
//var url = "http://host+
// /socket.io/1/?lc=3000000000005860&rid=" + liveid +"&roomid="+liveid+
//    "&cv=IK2.9.50_Android&cc=TG36011&ua=Meizum2note&uid=" + uid +
//    "&sid=20BrU6jPAikmx7EZSP6A0i0LoWki2RNxhkAdrXEr1BoM9IsVBjPC&devi=867570028396103&imsi=460026208089352&imei=867570028396103&icc=898600f2261478202497&conn=WIFI&vv=1.0.3-2016060211417.android&aid=caf33cfb45b6cd66&osversion=android_22&proto=4&smid=DuRCYMJK7iW%2BsDMckPgAXpsIRqhtVX0LftNnFOymKTNUnHwA9%2F0COYdTgdEiGrNGcojZSgBQPQStfvxmVPjaX5Cw&city=";
    var request = require('request');
// var options = {
//     headers: {"Connection": "close"},
//     url: url,
//     method: 'POST'
// };
    request("http://service.ingkee.com/api/chat/iplist", function (err, response, body) {
        if (err) {
            return console.log(err.message);
        }
        iplist = JSON.parse(body);
        url = "http://" + iplist.cfg[slot - 1].addr.split('|')[0] + "/socket.io/1/?" + user;
        //http://60.205.82.8:81/socket.io/1/?lc=3000000000005860&cv=IK2.9.50_Android&cc=TG36011&ua=Meizum2note&uid=150531691&sid=20BrU6jPAikmx7EZSP6A0i0LoWki2RNxhkAdrXEr1BoM9IsVBjPC&devi=867570028396103&imsi=460026208089352&imei=867570028396103&icc=898600f2261478202497&conn=WIFI&vv=1.0.3-2016060211417.android&aid=caf33cfb45b6cd66&osversion=android_22&proto=4&smid=DuRCYMJK7iW%2BsDMckPgAXpsIRqhtVX0LftNnFOymKTNUnHwA9%2F0COYdTgdEiGrNGcojZSgBQPQStfvxmVPjaX5Cw&city=%E8%A5%BF%E5%AE%89%E5%B8%82
        request(url, function (error, response, body) {
            if (error) {
                return console.log(error.message);
            }
            ts = body.slice(0, 20);
            // console.log(ts);

            // client.connect("ws://60.205.82.49:81/socket.io/1/websocket/" +ts+
            //     "?uid=144559824&place=room&sid=8a4624439c87d7e4d088fbf9a969522286e8e934d55ded46c9e4072cc2d1b867574aadf9bc290fdbf01fbcc014e0ef2981b199474006f1ec&roomid=" +blob+
            //     "&token=f8384213e582d538acb65cf6b5ea396f&time=1469432354&nonce=ctIPY9whoM&sec=f23b8e0a67da38ef70d4b3bd612c83b1");
            client.connect("http://" + iplist.cfg[slot - 1].addr.split('|')[0] + "/socket.io/1/websocket/" + ts +
                "?" + user);
        });
        //http://60.205.82.8:81/socket.io/1/websocket/juKcubITomzvOGGgxxra?lc=3000000000005860&cv=IK2.9.50_Android&cc=TG36011&ua=Meizum2note&uid=150531691&sid=20BrU6jPAikmx7EZSP6A0i0LoWki2RNxhkAdrXEr1BoM9IsVBjPC&devi=867570028396103&imsi=460026208089352&imei=867570028396103&icc=898600f2261478202497&conn=WIFI&vv=1.0.3-2016060211417.android&aid=caf33cfb45b6cd66&osversion=android_22&proto=4&smid=DuRCYMJK7iW%2BsDMckPgAXpsIRqhtVX0LftNnFOymKTNUnHwA9%2F0COYdTgdEiGrNGcojZSgBQPQStfvxmVPjaX5Cw&city=%E8%A5%BF%E5%AE%89%E5%B8%82
    });
    function reconnect() {
        reconnectCount++;
        client.connect("http://" + iplist.cfg[slot - 1].addr.split('|')[0] + "/socket.io/1/websocket/" + ts +
            "?" + user);
    }
};


