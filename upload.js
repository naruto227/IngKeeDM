/**
 * Created by hzq on 16-7-27.
 */
var request = require("request");
// var config = require("../config.js");

exports.uploadServe = function (room_id, paltform, data) {
    var options = {
        headers: {"Connection": "close"},
        url: "http://120.27.94.166:2999/" + "dmLaiFeng" + "?room_id=" + room_id,
        // url: "http://localhost:2999/" + "dmLaiFeng" + "?room_id=" + room_id,

        method: 'POST',
        json: true,
        body: {data: data}
    };

    function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log('----info------', body);
        }
    }

    request(options, callback);
};
/**
 * 1469609999795193
 * 1469610027703007
 * 1469609914864803
 */