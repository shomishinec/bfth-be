const ws = require('websocket-lib');
const request = require('request');
const instaJobId = "7882e351-a513-496c-9ca3-e7ae3362eaa2";
const vkJobId = "5ab6b4b0fd644c2e5481a10d";
const deviceKey = "e9515167-5824-4856-9dfd-69fcdff12012";
const pairsApiEndpoint = "http://sharaeebina.herokuapp.com/pairList";
const instaJob = require('./insta-job');
// const vkJob = require('');

let currentJobId = "",
    count = 0,
    itemsToSend = 0;

var server = ws.createServer(function (session) {
    session.on('open', function (data) {
        this.send('session open');
    });

    session.on('data', function (data) {
        console.log('get request');
        // this.send("4");
        request(pairsApiEndpoint, function (error, responce) {
            if (!error && itemsToSend === 0) {

                instaJob.run().then(function (newCount) {
                    let delta = newCount - count;
                    count += delta;
                    if (count < 0) {
                        itemsToSend = 0;
                    }
                    itemsToSend += delta;
                    if (itemsToSend < 0) {
                        itemsToSend = 0;
                    }
                    if (itemsToSend > 0) {
                        this.send('4');
                        itemsToSend = --itemsToSend;
                    }
                }.bind(this));
            } else {
                this.send('4');
                itemsToSend = --itemsToSend;
            }
        }.bind(this));

    });

    session.on('close', function () {
        console.log('session closed');
    });

});

server.listen(process.env.PORT || 8000);
