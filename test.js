"use strict";
const assert = require('chai').assert;

const typingIndicator = require('./plugins/typingIndicator.js');
const append1 = require('./plugins/append1.js');
const append2 = require('./plugins/append2.js');

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

describe('conifg', function() {

    it('should be configured', function() {

        OCF.config({
            globalChannel: new Date(),
            rltm: agents[agentInput]
        }, [
            typingIndicator({
                timeout: 2000
            })
        ]);

        assert.isOk(OCF);

    });

});

describe('identify', function() {

    it('should be identified as new user', function() {

        let me = OCF.identify('robot-tester', {works: true});
        assert.isObject(me);

    });

});

let chat;

describe('chat', function() {

    it('should be created', function(done) {

        chat = new OCF.GroupChat(new Date());
        done();

    });

    it('should get ready callback', function(done) {
        
        chat.emitter.on('ready', () => {

            done();

        });

    });

    it('should get message', function(done) {

        chat.emitter.on('message', (payload) => {

            assert.isObject(payload);
            done();

        });

        chat.send('message', {
            text: 'hello world'
        });

    });

});
