const ChatEngineCore = require('../../src/index.js');
const assert = require('chai').assert;

const pubkey = 'pub-c-fab5d74d-8118-444c-b652-4a8ee0beee92';
const subkey = 'sub-c-696d9116-c668-11e7-afd4-56ea5891403c';

describe('import', () => {

    it('ChatEngine should be imported', () => {
        assert.isObject(ChatEngineCore, 'was successfully created');
    });

});

let me;
let ChatEngine;
let ChatEngineYou;
let globalChannel = 'global' + new Date().getTime();

let username = 'ian' + new Date().getTime();

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
            publishKey: pubkey,
            subscribeKey: subkey
        }, {
            globalChannel,
            throwErrors: false
        });

        assert.isOk(ChatEngine);

    });

});

let createdEventChat1;
let createdEventChat2;
describe('connect', () => {

    it('should be identified as new user', function beIdentified(done) {

        this.timeout(6000);

        ChatEngine.on('$.ready', (data) => {

            assert.isObject(data.me);
            me = data.me;

            done();
        });

        ChatEngine.connect(username, { works: true });

        ChatEngine.on('$.network.*', (data) => {
            console.log(data.operation);
        });

    });

    it('should notify chatengine on created', function join(done) {

        this.timeout(6000);

        let newChat = 'public-chat';
        let a = false;

        ChatEngine.on('$.created.chat', (data, source) => {

            let lookingFor = globalChannel + '#chat#public.#' + newChat;

            if (source.channel === lookingFor) {
                done();
            }

        });

        a = new ChatEngine.Chat(newChat);

        setTimeout(() => {
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

        createdEventChat1 = new ChatEngine.Chat('test-connection');

    });

    it('should notify chatengine on disconnected', function disconnected(done) {

        this.timeout(4000);

        ChatEngine.on('$.disconnected', (data, source) => {

            assert.isObject(source);

            if (source.channel === createdEventChat2.channel) {
                done();
            }
        });

        createdEventChat2 = new ChatEngine.Chat('test-disconnection');

        createdEventChat2.on('$.connected', () => {
            createdEventChat2.leave();
        });

    });

});

let chat;

describe('chat', () => {


    it('should get me as join event', function getMe(done) {

        this.timeout(10000);

        chat = new ChatEngine.Chat('get-self-event');

        chat.on('$.online.*', (p) => {

            if (p.user.uuid === ChatEngine.me.uuid) {
                done();
            }

        });

    });

    it('should get connected callback', function getReadyCallback(done) {

        this.timeout(5000);

        let chat2 = new ChatEngine.Chat('connected-callback');
        chat2.on('$.connected', () => {

            done();

        });

    });

    it('should get message', function (done) {

        this.timeout(12000);

        chat.once('something', (payload) => {

            assert.isObject(payload);
            done();

        });

        setTimeout(() => {
            chat.emit('something', {
                text: 'hello world'
            });
        }, 1000);

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

        this.timeout(20000);

        chatHistory = new ChatEngine.Chat('chat-history');

        for (let i = 0; i < 50; i++) {

            chatHistory.emit('tester', {
                text: 'hello world ' + i
            });
            chatHistory.emit('not-tester', {
                text: 'hello world ' + i
            });

        }

        setTimeout(() => {

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

        }, 6000);

    });

    it('should get 200 messages', function get200(done) {

        let count = 0;

        this.timeout(20000);

        let chatHistory2 = new ChatEngine.Chat('chat-history-2');

        for (let i = 0; i < 200; i++) {

            chatHistory2.emit('tester', {
                text: 'hello world ' + i
            });
            chatHistory2.emit('not-tester', {
                text: 'hello world ' + i
            });

        }

        setTimeout(() => {

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

        }, 6000);

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

let newChannel = 'session-chat';

describe('remote chat list', () => {

    it('should be get notified of new chats', function getNotifiedOfNewChats(done) {

        this.timeout(10000);

        ChatEngineClone = ChatEngineCore.create({
            publishKey: pubkey,
            subscribeKey: subkey

        }, {
            globalChannel,
            throwErrors: false
        });

        ChatEngineClone.connect(username, { works: true });

        // first instance looking or new chats
        ChatEngine.me.on('$.session.chat.join', (payload) => {

            if (payload.chat.channel.indexOf(newChannel) > -1) {
                done();
            }

        });

        ChatEngineClone.on('$.ready', () => {

            syncChat = new ChatEngineClone.Chat(newChannel, true, true);

        });

    });

    it('should be populated', (done) => {

        assert.isObject(ChatEngine.me.session.system);
        assert.isObject(ChatEngine.me.session.custom);
        // assert.isObject(ChatEngine.me.session.fixed);
        done();

    });

    it('should get delete event', function deleteSync(done) {

        this.timeout(10000);

        ChatEngine.me.on('$.session.chat.leave', (payload) => {

            if (payload.chat.channel.indexOf(newChannel) > -1) {

                done();
            }

        });

        setTimeout(() => {
            syncChat.leave();
        }, 3000);


    });

});

let myChat;

let yourChat;

let privChannel = 'private-chat';

describe('invite', () => {

    it('should be created', function createIt(done) {

        this.timeout(5000);

        ChatEngineYou = ChatEngineCore.create({
            publishKey: pubkey,
            subscribeKey: subkey
        }, {
            globalChannel,
            throwErrors: false
        });

        ChatEngineYou.connect('stephen' + new Date().getTime(), { works: true });

        ChatEngineYou.on('$.ready', () => {
            done();
        });

    });

    it('should create chat', (done) => {

        yourChat = new ChatEngineYou.Chat(privChannel);

        yourChat.on('$.connected', () => {
            done();
        });

    });

    it('should invite other users', (done) => {

        me.direct.on('$.invite', (payload) => {

            myChat = new ChatEngine.Chat(payload.data.channel);

            myChat.on('$.connected', () => {
                done();
            });

        });

        // me is the current context
        yourChat.invite(me);

    });

    it('two users are able to talk to each other in private channel', function twoUsersTalk(done) {

        this.timeout(16000);

        yourChat.on('message', (payload) => {

            assert.equal(payload.data.text, 'sup?');
            done();
        });

        setTimeout(() => {
            myChat.emit('message', {
                text: 'sup?'
            });
        }, 1000);

    });

});
