const ChatEngineCore = require('./src/index.js');

const assert = require('chai').assert;

describe('import', function() {

    it('ChatEngine should be imported', function() {
        assert.isObject(ChatEngineCore, 'was successfully created');
    });

});

let me;
let ChatEngine;
let ChatEngineYou;
let globalChannel  = 'chat-engine-demo-test';

describe('config', function() {

    it('should be configured', function() {

        ChatEngine = ChatEngineCore.create({
            publishKey: 'pub-c-c6303bb2-8bf8-4417-aac7-e83b52237ea6',
            subscribeKey: 'sub-c-67db0e7a-50be-11e7-bf50-02ee2ddab7fe',
        }, {
            authUrl: 'http://localhost:3000/insecure',
            globalChannel: globalChannel,
            throwErrors: false
        });

        assert.isOk(ChatEngine);

    });

});

describe('connect', function() {

    it('should be identified as new user', function(done) {

        ChatEngine.connect('ian', {works: true}, 'ian-authtoken');

        ChatEngine.on('$.ready', (data) => {
            assert.isObject(data.me);
            me = data.me;
            done();
        });

        ChatEngine.on('$.network.*', (data) => {
            // console.log(data.operation)
        })

    });

});

let chat;

describe('chat', function() {

    it('should be created', function(done) {

        chat = new ChatEngine.Chat('chat', false);

        chat.onAny((event) => {
            // console.log(event)
        })

        done();

    });

    it('should get ready callback', function(done) {

        chat.onAny((e) => {
            // console.log(e)
        })

        chat.on('$.connected', () => {

            done();

        });

    });

    it('should get me as join event', function(done) {

        this.timeout(10000);

        chat.once('$.online.*', (p) => {
            assert(p.user.uuid == ChatEngine.me.uuid, 'this online event is me')
            done();
        });

    })

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

let chat2;

// describe('myself-presence', function() {

//     it('should be created', function(done) {

//         chat2 = new ChatEngine.Chat(new Date() + 'chat');

//         it('should get self as online event', function(done) {

//             chat2.on('$.online.*', (event) => {
//                 console.log(event);
//             })

//         });

//         done();

//     });


// });

let myChat;

let you;
let yourChat;

describe('invite', function() {

    it('should be created', function(done) {

        ChatEngineYou = ChatEngineCore.create({
            publishKey: 'pub-c-c6303bb2-8bf8-4417-aac7-e83b52237ea6',
            subscribeKey: 'sub-c-67db0e7a-50be-11e7-bf50-02ee2ddab7fe',
        }, {
            authUrl: 'http://localhost:3000/insecure',
            globalChannel: globalChannel
        });

        ChatEngineYou.connect('stephen', {works: true}, 'stephen-authtoken');

        ChatEngineYou.on('$.ready', (data) => {
            you = data.me;
            done();
        });

    });

    it('should create chat', function(done) {

        yourChat = new ChatEngineYou.Chat('secret-channel-');

        yourChat.on('$.connected', () => {
            done();
        });

    });

    it('should invite other users', function(done) {

        me.direct.on('$.invite', (payload) => {

            assert.isObject(payload.chat);

            myChat = new ChatEngine.Chat(payload.data.channel);

            done();
        });

        // me is the current context
        yourChat.invite(me);

    });

    it('two users are able to talk to each other in private channel', function(done) {

        myChat.emit('message', {
            text: 'sup?'
        });

        yourChat.on('message', (payload) => {
            assert.equal(payload.data.text, 'sup?');
            done();
        });

    });

    it('should not be able to join another chat', function(done) {

        let targetChan = 'super-secret-channel-';

        let yourSecretChat = new ChatEngineYou.Chat(targetChan);

        yourSecretChat.on('$.connected', () => {

            let illegalAccessChat = new ChatEngine.Chat(targetChan);

            illegalAccessChat.on('$.connected', () => {

                done(new Error('This user should not be able to join', illegalAccessChat.channel))

            });

            illegalAccessChat.onAny((event, packet) => {
                console.log('illegal ---', event)
            })

            illegalAccessChat.once('$.error.publish', () => {
                done();
            });

            illegalAccessChat.emit('message', 'test');

        });

    });

});
