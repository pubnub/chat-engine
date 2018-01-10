
const pubkey = 'pub-c-54787d29-dde3-435a-8c3b-b4fc8853c137';
const subkey = 'sub-c-a0b70450-f62d-11e7-b8a6-46d99af2bb8c';

let PubNub = require('pubnub');

let pubnub = new PubNub({
    publishKey: pubkey,
    subscribeKey: subkey
});

let s = 0;
let r = 0;

function publish() {

    pubnub.publish({
        channel: 'hello_world',
        message: 'test'
    }, function(status, response) {
        console.log(status, response);
        s++;
    });

};

pubnub.addListener({
    status: function(statusEvent) {
        console.log(statusEvent);
    },
    message: function(message) {
        r++;
        console.log('Sent / Received: ', s, '/', r, (s % r * 100));
    }
});

pubnub.subscribe({
    channels: ['hello_world']
});

let i = 0;

while(i < )
