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
let globalChannel = 'global'; //  + new Date().getTime();

let examplePlugin = () => {

    class extension {
        construct() {
            this.parent.constructWorks = true;
        }
        newMethod() {
            return this.parent.constructWorks;
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

    it('should be identified as new user', function beIdentified(done) {

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


    it('should get me as join event', function getMe(done) {

        this.timeout(10000);

        chat = new ChatEngine.Chat('chat-teser');

        chat.once('$.online.*', (p) => {
            assert(p.user.uuid === ChatEngine.me.uuid, 'this online event is me');
            done();
        });
    });

    it('should get the list of chats', (done) => {
        const chats = ChatEngine.listOfChats();
        assert(chats.length >= 1, 'return the list of chats for the user');
        assert(chats[0].name === 'chat-teser', 'get the name of the chat expected');
        done();
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

describe('history', () => {

    it('should get 50 messages', function get50(done) {

        let count = 0;

        this.timeout(10000);

        let chatHistory = new ChatEngine.Chat('chat-history-2', false);

        chatHistory.on('$.history.tester', (a) => {

            assert.equal(a.event, 'tester');

            count += 1;

            if (count >= 50) {
                done();
            }

        });
        chatHistory.on('$.history.not-tester', () => {
            assert.isNotOk('history returning wrong events');
        });

        let i = 0;
        while (i < 200) {

            chatHistory.emit('tester', {
                text: 'hello world ' + i
            });
            chatHistory.emit('not-tester', {
                text: 'hello world ' + i
            });

            i += 1;

        }

        chatHistory.history('tester', {
            max: 50,
            reverse: false
        });
    });

    it('should get 200 messages', function get200(done) {

        let count = 0;

        this.timeout(10000);

        let chatHistory2 = new ChatEngine.Chat('chat-history-3', false);

        chatHistory2.on('$.history.tester', (a) => {

            assert.equal(a.event, 'tester');

            count += 1;

            if (count >= 200) {
                done();
            }

        });

        chatHistory2.on('$.history.not-tester', () => {
            assert.isNotOk('history returning wrong events');
        });

        let i = 1;
        while (i < 200) {

            chatHistory2.emit('tester', {
                text: 'hello world ' + i
            });
            chatHistory2.emit('not-tester', {
                text: 'hello world ' + i
            });

            i += 1;
        }

        chatHistory2.history('tester', {
            max: 200,
            reverse: false
        });
    });

});

let ChatEngineClone;
let syncChat;

describe('remote chat list', () => {

    it('should be get notified of new chats', function getNotifiedOfNewChats(done) {

        this.timeout(10000);

        // first instance looking or new chats
        ChatEngine.me.once('$.session.chat.join', () => {
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

    it('should keep delete in sync', function deleteSync(done) {

        this.timeout(10000);

        ChatEngine.me.once('$.session.chat.leave', () => {

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
        // assert.isObject(ChatEngine.me.session.fixed);
        done();
    });
});

let myChat;

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

        ChatEngineYou.on('$.ready', () => {
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

    it('two users are able to talk to each other in private channel', function twoUsersTalk(done) {

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

            illegalAccessChat.once('$.error.publish', () => {
                done();
            });

            illegalAccessChat.emit('message', 'test');

        });
    });
});
