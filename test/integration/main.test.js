const ChatEngineCore = require('../../src/index.js');

const assert = require('chai').assert;

describe('import', () => {

    it('ChatEngine should be imported', () => {
        assert.isObject(ChatEngineCore, 'was successfully created');
    });

});

let me;
let ChatEngine;
let ChatEngineYou;
let globalChannel = 'thisistheglobalchannel-whatever' + new Date().getTime();

let examplePlugin = (config) => {

    class extension {
        construct(options) {
            this.parent.constructWorks = true;
        }
        newMethod () {
            return true;
        }
    }

    return {
        namespace: 'testPlugin',
        extends: {
            Chat: extension
        },
        middleware: {
            send: {
                message: (payload, next) => {
                    payload.send = true;
                    next(null, payload);
                }
            },
            broadcast: {
                message: (payload, next) => {
                    payload.broadcast = true;
                    next(null, payload);
                }
            }
        }
    };

};

describe('config', () => {

    it('should be configured', () => {

        ChatEngine = ChatEngineCore.create({
            publishKey: 'pub-c-c6303bb2-8bf8-4417-aac7-e83b52237ea6',
            subscribeKey: 'sub-c-67db0e7a-50be-11e7-bf50-02ee2ddab7fe',
        }, {
            endpoint: 'http://localhost:3000/insecure',
            globalChannel,
            throwErrors: false
        });

        assert.isOk(ChatEngine);

    });

});

describe('connect', () => {

    it('should be identified as new user', function (done) {

        this.timeout(4000);

        ChatEngine.on('$.ready', (data) => {

            assert.isObject(data.me);
            me = data.me;

            done();
        });

        ChatEngine.connect('ian', { works: true }, 'ian-authtoken');

        ChatEngine.on('$.network.*', (data) => {
            console.log(data.operation);
        });

    });

});

let chat;

describe('chat', () => {


    it('should get me as join event', function (done) {

        this.timeout(10000);

        chat = new ChatEngine.Chat('chat');

        chat.once('$.online.*', (p) => {
            assert(p.user.uuid === ChatEngine.me.uuid, 'this online event is me');
            done();
        });

    });

    it('should get ready callback', (done) => {

        let chat2 = new ChatEngine.Chat('chat2');
        chat2.on('$.connected', () => {

            done();

        });

    });

    it('should get message', (done) => {

        chat.on('something', (payload) => {

            assert.isObject(payload);
            done();

        });

        chat.emit('something', {
            text: 'hello world'
        });

    });

    it('should bind a plugin', () => {

        chat.plugin(examplePlugin());

        assert(chat.constructWorks, 'bound to construct');
        assert(chat.testPlugin.newMethod(), 'new method added');

    });

    it('should bind a prototype plugin', () => {

        ChatEngine.protoPlugin('Chat', examplePlugin());

        let newChat = new ChatEngine.Chat('some-other-chat');

        assert(newChat.constructWorks, 'bound to construct');
        assert(newChat.testPlugin.newMethod(), 'new method added');

    });

});

let ChatEngineClone;
let syncChat;
describe('remote chat list', () => {

    it('should be get notified of new chats', function (done) {

        this.timeout(10000);

        // first instance looking or new chats
        ChatEngine.me.on('$.session.chat.join', (payload) => {
            done();
        });

        // create a new chat within some other instance
        ChatEngineClone = ChatEngineCore.create({
            publishKey: 'pub-c-c6303bb2-8bf8-4417-aac7-e83b52237ea6',
            subscribeKey: 'sub-c-67db0e7a-50be-11e7-bf50-02ee2ddab7fe',
        }, {
            endpoint: 'http://localhost:3000/insecure',
            globalChannel,
            throwErrors: false
        });

        ChatEngineClone.connect('ian', { works: true }, 'ian-authtoken');

        ChatEngineClone.on('$.ready', () => {
            syncChat = new ChatEngineClone.Chat('some channel' + new Date().getTime(), true, true);
        });

    });

    it('should keep delete in sync', function (done) {

        this.timeout(10000);

        ChatEngine.me.on('$.session.chat.leave', (payload) => {

            setTimeout(() => {

                assert.isUndefined(ChatEngine.chats[syncChat.channel]);
                assert.isUndefined(ChatEngine.me.session.default[syncChat.channel]);

            }, 1000);

            done();
        });

        setTimeout(() => {

            syncChat.leave();

        }, 1000);


    });

    it('should be populated', (done) => {

        assert.isObject(ChatEngine.me.session.global);
        assert.isObject(ChatEngine.me.session.default);
        assert.isObject(ChatEngine.me.session.fixed);
        done();

    });

});

let myChat;

let you;
let yourChat;

describe('invite', () => {

    it('should be created', (done) => {

        ChatEngineYou = ChatEngineCore.create({
            publishKey: 'pub-c-c6303bb2-8bf8-4417-aac7-e83b52237ea6',
            subscribeKey: 'sub-c-67db0e7a-50be-11e7-bf50-02ee2ddab7fe',
        }, {
            endpoint: 'http://localhost:3000/insecure',
            globalChannel
        });

        ChatEngineYou.connect('stephen', { works: true }, 'stephen-authtoken');

        ChatEngineYou.on('$.ready', (data) => {
            you = data.me;
            done();
        });

    });

    it('should create chat', (done) => {

        yourChat = new ChatEngineYou.Chat('secret-channel-');

        yourChat.on('$.connected', () => {
            done();
        });

    });

    it('should invite other users', (done) => {

        me.direct.on('$.invite', (payload) => {

            assert.isObject(payload.chat);

            myChat = new ChatEngine.Chat(payload.data.channel);

            myChat.on('$.connected', () => {
                done();
            });

        });

        // me is the current context
        yourChat.invite(me);

    });

    it('two users are able to talk to each other in private channel', function (done) {

        this.timeout(5000);

        yourChat.on('message', (payload) => {
            assert.equal(payload.data.text, 'sup?');
            done();
        });

        myChat.emit('message', {
            text: 'sup?'
        });

    });

    it('should not be able to join another chat', (done) => {

        let targetChan = 'super-secret-channel-';

        let yourSecretChat = new ChatEngineYou.Chat(targetChan);

        yourSecretChat.on('$.connected', () => {

            let illegalAccessChat = new ChatEngine.Chat(targetChan);

            illegalAccessChat.on('$.connected', () => {

                done(new Error('This user should not be able to join', illegalAccessChat.channel));

            });

            illegalAccessChat.onAny((event, packet) => {
                // console.log('illegal ---', event)
            });

            illegalAccessChat.once('$.error.publish', () => {
                done();
            });

            illegalAccessChat.emit('message', 'test');

        });

    });

});
