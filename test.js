 "use strict";
const assert = require('chai').assert;

const typingIndicator = require('ocf-typing-indicator');
// const append = require('ocf-append');
const messageHistory = require('ocf-history');

const OpenChatFramework = require('./src/index.js');

let agentInput = process.env.AGENT || 'pubnub';

describe('import', function() {

    it('ocf should be imported', function() {
        assert.isObject(OpenChatFramework, 'was successfully created');
    });

});

const pub_append = 'pub' + new Date().getTime();
const sub_append = 'sub' + new Date().getTime();

let me;
let OCF;

describe('config', function() {

    it('should be configured', function() {

        OCF = OpenChatFramework.create({
            publishKey: 'demo',
            subscribeKey: 'demo'
        }, 'test-channel');

        assert.isOk(OCF);

    });

});

describe('connect', function() {

    it('should be identified as new user', function() {

        me = OCF.connect('robot-tester', {works: true});
        assert.isObject(me);

    });

});

let chat;

describe('chat', function() {

    it('should be created', function(done) {

        chat = new OCF.Chat(new Date() + 'chat');
        done();

    });

    it('should get ready callback', function(done) {

        chat.on('$ocf.ready', () => {

            done();

        });

    });

    it('should get message', function(done) {

        chat.on('something', (payload) => {

            assert.isObject(payload);
            done();

        });

        chat.emit('something', {
            text: 'hello world'
        });

    });

});


let historyChan = 'history-chat-4';

describe('history plugin', function() {

    it('should be created', function(done) {

        let historychat = new OCF.Chat(historyChan);
        let ready = false;

        historychat.on('$ocf.ready', () => {

            historychat.emit('message', {
                text: 'hello world'
            });

            historychat.emit('message', {
                text: 'hello world'
            });

            historychat.emit('message', {
                text: 'hello world'
            });

            if(!ready) {
                done();
                ready = true;
            }

        })

    });

    it('history', function(done) {

        this.timeout(10000);

        let historychat2 = new OCF.Chat(historyChan);

        historychat2.history('message');

        historychat2.once("$history.message", (message) => {
            assert.isOk(message);
            done();
        });

    });

});


// let pluginchat;

// describe('plugins', function() {

//     it('should be created', function() {

//         pluginchat = new OCF.Chat('pluginchat' + new Date().getTime());

//         pluginchat.plugin(typingIndicator({
//             timeout: 5000
//         }));

//         pluginchat.plugin(append({
//             send: pub_append,
//             broadcast: sub_append
//         }));

//     });

//     it('publish and subscribe hooks should be called', function(done) {

//         pluginchat.ready(() => {

//             pluginchat.on('message', (payload) => {

//                 assert.isObject(payload);
//                 assert.isAbove(payload.data.text.indexOf(pub_append), 0, 'publish hook executed');
//                 assert.isAbove(payload.data.text.indexOf(sub_append), 0, 'subscribe hook executed');
//                 assert.isAbove(payload.data.text.indexOf(sub_append), payload.data.text.indexOf(pub_append), 'subscribe hook was called before publish hook');
//                 done();

//             });

//             pluginchat.send('message', {
//                 text: 'hello world'
//             });

//         });

//     });

//     it('typing indicator', function(done) {

//         pluginchat.once('$typingIndicator.startTyping', () => {
//             done();
//         });

//         pluginchat.typingIndicator.startTyping();

//     });

//     it('wildcard event', function(done) {

//         pluginchat.once('$typingIndicator.*', () => {
//             done();
//         });

//         pluginchat.typingIndicator.startTyping();

//     });

// });

// let historyChan = 'history-chat-4';

// describe('history plugin', function() {

//     it('should be created', function(done) {

//         let historychat = new OCF.Chat(historyChan);

//         historychat.on('$ocf.ready', () => {

//             historychat.send('message', {
//                 text: 'hello world'
//             });

//             historychat.send('message', {
//                 text: 'hello world'
//             });

//             historychat.send('message', {
//                 text: 'hello world'
//             });

//             done();

//         })

//     });

//     it('history', function(done) {

//         this.timeout(10000);

//         let historychat2 = new OCF.Chat(historyChan);
//         historychat2.plugin(messageHistory())

//         let responded = false;

//         historychat2.once("$history.message", (message) => {

//             done();

//         });

//     });

// });
