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
let globalChannel = 'global';

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
            publishKey: 'pub-c-311175ef-cdc1-4da9-9b70-f3e129bb220e',
            subscribeKey: 'sub-c-a3da7f1c-bfe7-11e7-a9bc-9af884579700',
        }, {
            endpoint: 'https://pubsub.pubnub.com/v1/blocks/sub-key/sub-c-a3da7f1c-bfe7-11e7-a9bc-9af884579700/insecure',
            globalChannel,
            throwErrors: true
        });

        assert.isOk(ChatEngine);

    });

});

let createdEventChat1;
let createdEventChat2;
describe('connect', () => {

    it('should be identified as new user', function beIdentified(done) {

        this.timeout(4000);

        ChatEngine.on('$.ready', (data) => {

            assert.isObject(data.me);
            me = data.me;

            done();
        });

        ChatEngine.connect('ian' + new Date().getTime(), { works: true }, 'ian-authtoken' + new Date().getTime());

        ChatEngine.on('$.network.*', (data) => {
            console.log(data.operation);
        });

    });


    it('should notify chatengine on created', function join(done) {

        this.timeout(4000);

        ChatEngine.on('$.created.chat', (data, source) => {

            assert.isObject(source);

            if (source.channel === 'global#chat#private.#this-is-only-a-test-3') {
                done();
            }

        });

        setTimeout(() => {
            let a = new ChatEngine.Chat('this-is-only-a-test-3');
            a.leave();
        }, 1000);

    });

    it('should notify chatengine on connected', function join(done) {

        this.timeout(4000);

        ChatEngine.on('$.connected', (data, source) => {

            assert.isObject(source);
            if (source.channel === createdEventChat1.channel) {
                done();
            }
        });

        createdEventChat1 = new ChatEngine.Chat('this-is-only-a-test');

    });

    it('should notify chatengine on disconnected', (done) => {

        ChatEngine.once('$.disconnected', (data, source) => {
            assert.isObject(source);
            if (source.channel === createdEventChat2.channel) {
                done();
            }
        });

        createdEventChat2 = new ChatEngine.Chat('this-is-only-a-test-2');

        createdEventChat2.on('$.connected', () => {
            createdEventChat2.leave();
        });

    });

});

let chat;

describe('chat', () => {


    it('should get me as join event', function getMe(done) {

        this.timeout(10000);

        chat = new ChatEngine.Chat('chat-teser');

        chat.on('$.online.*', (p) => {

            if (p.user.uuid === ChatEngine.me.uuid) {
                done();
            }

        });

    });

    it('should get ready callback', function getReadyCallback(done) {

        this.timeout(5000);

        let chat2 = new ChatEngine.Chat('chat2');
        chat2.on('$.connected', () => {

            done();

        });

    });

    it('should get message', (done) => {

        chat.once('something', (payload) => {

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

        ChatEngine.proto('Chat', examplePlugin());

        let newChat = new ChatEngine.Chat('some-other-chat');

        assert(newChat.constructWorks, 'bound to construct');
        assert(newChat.testPlugin.newMethod(), 'new method added');

    });

});

let chatHistory;
describe('history', () => {

    it('should get 50 messages', function get50(done) {

        let count = 0;

        this.timeout(10000);

        chatHistory = new ChatEngine.Chat('chat-history-8', false);

        let i = 0;
        // while (i < 200) {

        //     chatHistory.emit('tester', {
        //         text: 'hello world ' + i
        //     });
        //     chatHistory.emit('not-tester', {
        //         text: 'hello world ' + i
        //     });

        //     i += 1;

        // }

        chatHistory.search({
            event: 'tester',
            limit: 50
        }).on('tester', (a) => {

            assert.equal(a.event, 'tester');

            count += 1;

        }).on('$.search.finish', () => {
            assert.equal(count, 50, 'correct # of results');
            done();
        });

    });
    it('should get 200 messages', function get200(done) {

        let count = 0;

        this.timeout(10000);

        let chatHistory2 = new ChatEngine.Chat('chat-history-3', false);


        let i = 0;
        // while (i < 200) {

        //     chatHistory2.emit('tester', {
        //         text: 'hello world ' + i
        //     });
        //     chatHistory2.emit('not-tester', {
        //         text: 'hello world ' + i
        //     });

        //     i += 1;

        // }

        chatHistory2.search({
            event: 'tester',
            limit: 200
        }).on('tester', (a) => {

            assert.equal(a.event, 'tester');
            count += 1;

        }).on('$.search.finish', () => {
            assert.equal(count, 200, 'correct # of results');
            done();
        });

    });

    it('should get messages without event', function get50(done) {

        this.timeout(10000);

        chatHistory.search({
            limit: 10
        }).on('tester', (a) => {

            assert.equal(a.event, 'tester');

        }).on('$.search.finish', () => {
            done();
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

        ChatEngineClone = ChatEngineCore.create({
            publishKey: 'pub-c-311175ef-cdc1-4da9-9b70-f3e129bb220e',
            subscribeKey: 'sub-c-a3da7f1c-bfe7-11e7-a9bc-9af884579700',
        }, {
            endpoint: 'https://pubsub.pubnub.com/v1/blocks/sub-key/sub-c-a3da7f1c-bfe7-11e7-a9bc-9af884579700/insecure',
            globalChannel,
            throwErrors: false
        });

        ChatEngineClone.connect('ian' + new Date().getTime(), { works: true }, 'ian-authtoken'  + new Date().getTime());

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
            publishKey: 'pub-c-311175ef-cdc1-4da9-9b70-f3e129bb220e',
            subscribeKey: 'sub-c-a3da7f1c-bfe7-11e7-a9bc-9af884579700',
        }, {
            endpoint: 'https://pubsub.pubnub.com/v1/blocks/sub-key/sub-c-a3da7f1c-bfe7-11e7-a9bc-9af884579700/insecure',
            globalChannel,
            throwErrors: false
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

    it('should not be able to join another chat', function dontJoin(done) {

        this.timeout(10000);

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
