"use strict";
const assert = require('chai').assert;

const typingIndicator = require('./plugins/typingIndicator.js');
const append = require('./plugins/append.js');
const messageHistory = require('./plugins/messageHistory.js');

const Rltm = require('../rltm/src/index');

const OCF = require('./src/index.js'); 

let agentInput = process.env.AGENT || 'pubnub';

const agents = {
    pubnub: ['pubnub', {
        publishKey: 'pub-c-191d5212-dd99-4f2e-a8cf-fb63775232bc',
        subscribeKey: 'sub-c-aa1d9fe8-a85b-11e6-a397-02ee2ddab7fe',
        uuid: new Date(),
        state: {}
    }],
    socketio: ['socketio', {
        endpoint: 'http://localhost:8000',
        uuid: new Date(),
        state: {}
    }]    
};

describe('import', function() {

    it('ocf should be imported', function() {
        assert.isObject(OCF, 'was successfully created');
    });

});

const pub_append = 'pub' + new Date().getTime();
const sub_append = 'sub' + new Date().getTime();

let me;

describe('conifg', function() {

    it('should be configured', function() {

        OCF.config({
            globalChannel: new Date(),
            rltm: agents[agentInput]
        }, [
            typingIndicator({
                timeout: 2000
            }),
            append({
                publish: pub_append,
                subscribe: sub_append
            }),
            messageHistory()
        ]);

        assert.isOk(OCF);

    });

});

describe('identify', function() {

    it('should be identified as new user', function() {

        me = OCF.identify('robot-tester', {works: true});
        assert.isObject(me);

    });

});

let chat;

describe('chat', function() {

    it('should be created', function(done) {

        chat = new OCF.GroupChat(new Date() + 'chat');
        done();

    });

    it('should get ready callback', function(done) {
        
        chat.ready(() => {

            done();

        });

    });

    it('should get message', function(done) {

        chat.on('message', (payload) => {

            assert.isObject(payload);
            done();

        });

        chat.send('message', {
            text: 'hello world'
        });

    });

});

let pluginchat;

describe('plugins', function() {

    it('should be created', function() {
        pluginchat = new OCF.GroupChat('pluginchat' + new Date().getTime());
    });

    it('publish and subscribe hooks should be called', function(done) {

        pluginchat.ready(() => {

            pluginchat.on('message', (payload) => {

                assert.isObject(payload);
                assert.isAbove(payload.data.text.indexOf(pub_append), 0, 'publish hook executed');
                assert.isAbove(payload.data.text.indexOf(sub_append), 0, 'subscribe hook executed');
                assert.isAbove(payload.data.text.indexOf(sub_append), payload.data.text.indexOf(pub_append), 'subscribe hook was called before publish hook');
                done();

            });

            pluginchat.send('message', {
                text: 'hello world'
            });

        });

    });

    it('typing indicator', function(done) {

        pluginchat.on('startTyping', () => { 
            done();
        });

        pluginchat.typing.startTyping();

    });

});

let historyChan = 'history-chat-4';

describe('history plugin', function() {

    it('should be created', function(done) {

        this.timeout(10000);

        let historychat = new OCF.GroupChat(historyChan);

        historychat.ready(() => {

            historychat.send('message', {
                text: 'hello world'
            });

            historychat.send('message', {
                text: 'hello world'
            });

            historychat.send('message', {
                text: 'hello world'
            });

            done();

        })

    });

    it('history', function(done) {

        let historychat2 = new OCF.GroupChat(historyChan);

        let responded = false;

        historychat2.on("history:message", (message) => {

            if(!responded) {
                done();
            }

            responded = true;

        });

    });

});
