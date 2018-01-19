const ChatEngineCore = require('../../src/index.js');
const assert = require('chai').assert;

const pubkey = 'pub-c-fab5d74d-8118-444c-b652-4a8ee0beee92';
const subkey = 'sub-c-696d9116-c668-11e7-afd4-56ea5891403c';

let ChatEngine;
let ChatEngineYou;
let ChatEngineClone;
let ChatEngineSync;
let globalChannel = 'global';

let username = 'ian' + new Date().getTime();
let yousername = 'stephen' + new Date().getTime();

function createChatEngine(done) {

    this.timeout(15000);

    ChatEngine = ChatEngineCore.create({
        publishKey: pubkey,
        subscribeKey: subkey
    }, {
        globalChannel,
        throwErrors: true
    });
    ChatEngine.connect(username, { works: true }, username);
    ChatEngine.on('$.ready', () => {
        done();
    });

}

function createChatEngineSync(done) {

    this.timeout(15000);

    ChatEngineSync = ChatEngineCore.create({
        publishKey: pubkey,
        subscribeKey: subkey
    }, {
        globalChannel,
        enableSync: true,
        throwErrors: true
    });

    ChatEngineSync.connect(username, { works: false }, username);
    ChatEngineSync.on('$.ready', () => {
        done();
    });

}


function createChatEngineClone(done) {

    this.timeout(15000);

    ChatEngineClone = ChatEngineCore.create({
        publishKey: pubkey,
        subscribeKey: subkey
    }, {
        globalChannel,
        enableSync: true,
        throwErrors: true
    });
    ChatEngineClone.connect(username, { works: true }, username);
    ChatEngineClone.on('$.ready', () => {
        done();
    });

}

function createChatEngineYou(done) {

    this.timeout(15000);

    ChatEngineYou = ChatEngineCore.create({
        publishKey: pubkey,
        subscribeKey: subkey
    }, {
        globalChannel,
        throwErrors: true,
        enableSync: false
    });
    ChatEngineYou.connect(yousername, { works: true }, yousername);
    ChatEngineYou.on('$.ready', () => {
        done();
    });

}

function reset() {

    ChatEngine = false;
    ChatEngineYou = false;
    ChatEngineClone = false;
    ChatEngineSync = false;

}

describe('import', () => {

    it('ChatEngine should be imported', () => {
        assert.isObject(ChatEngineCore, 'was successfully created');
    });

});

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

let createdEventChat1;
let createdEventChat2;
describe('connect', () => {

    beforeEach(createChatEngine);
    afterEach(reset);

    it('should be identified as new user', function beIdentified() {

        this.timeout(16000);

        assert.isObject(ChatEngine.me);

        ChatEngine.on('$.network.*', (data) => {
            console.log(data.operation);
        });

    });

    it('should notify chatengine on created', function join(done) {

        this.timeout(6000);

        let newChat = 'this-is-only-a-test-3' + new Date().getTime();
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

        this.timeout(10000);

        ChatEngine.on('$.connected', (data, source) => {

            assert.isObject(source);
            if (source.channel === createdEventChat1.channel) {
                done();
            }
        });

        createdEventChat1 = new ChatEngine.Chat('this-is-only-a-test' + new Date());

    });

    it('should notify chatengine on disconnected', function disconnected(done) {

        this.timeout(4000);

        ChatEngine.on('$.disconnected', (data, source) => {

            assert.isObject(source);

            if (source.channel === createdEventChat2.channel) {
                done();
            }
        });

        createdEventChat2 = new ChatEngine.Chat('this-is-only-a-test-2' + new Date());

        createdEventChat2.on('$.connected', () => {
            createdEventChat2.leave();
        });

    });

});

let chat;

describe('chat', () => {

    beforeEach(createChatEngine);
    afterEach(reset);

    it('should get me as join event', function getMe(done) {

        this.timeout(10000);

        chat = new ChatEngine.Chat('chat-teser' + new Date().getTime());

        chat.on('$.online.*', (p) => {

            if (p.user.uuid === ChatEngine.me.uuid) {
                done();
            }

        });

    });

    it('should get connected callback', function getReadyCallback(done) {

        this.timeout(5000);

        let chat2 = new ChatEngine.Chat('chat2' + new Date().getTime());
        chat2.on('$.connected', () => {

            done();

        });

    });

    it('should get message', function shouldGetMessage(done) {

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

    beforeEach(createChatEngine);
    afterEach(reset);

    it('should get 50 messages', function get50(done) {

        let count = 0;

        this.timeout(30000);

        chatHistory = new ChatEngine.Chat('chat-history-8', false);

        chatHistory.on('$.connected', () => {

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

            }, 5000);

        });

    });

    it('should get 200 messages', function get200(done) {

        let count = 0;

        this.timeout(60000);

        let chatHistory2 = new ChatEngine.Chat('chat-history-3', false);

        chatHistory2.on('$.connected', () => {

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

            }, 5000);

        });

    });

    it('should get messages without event', function get50(done) {

        this.timeout(30000);

        chatHistory.search({
            limit: 10
        }).on('tester', (a) => {

            assert.equal(a.event, 'tester');

        }).on('$.search.finish', () => {
            done();
        });

    });

});

let syncChat;

let newChannel = 'sync-chat' + new Date().getTime();
let newChannel2 = 'sync-chat2' + new Date().getTime();

describe('remote chat list', () => {

    beforeEach(createChatEngineClone);
    beforeEach(createChatEngineSync);
    afterEach(reset);

    it('should be get notified of new chats', function getNotifiedOfNewChats(done) {

        this.timeout(60000);

        // first instance looking or new chats
        ChatEngineSync.me.on('$.session.chat.join', (payload) => {

            if (payload.chat.channel.indexOf(newChannel) > -1) {
                done();
            }

        });

        syncChat = new ChatEngineClone.Chat(newChannel);

    });

    it('should be populated', function shouldBePopulated(done) {

        this.timeout(20000);

        ChatEngineSync.me.once('$.session.group.restored', (payload) => {

            assert.isObject(ChatEngineSync.me.session[payload.group]);

            done();

        });

    });

    it('should get delete event', function deleteSync(done) {

        this.timeout(60000);

        ChatEngineSync.me.on('$.session.chat.leave', (payload) => {

            if (payload.chat.channel.indexOf(newChannel2) > -1) {
                done();
            }

        });

        // first instance looking or new chats
        ChatEngineSync.me.once('$.session.chat.join', () => {

            syncChat.leave();

        });

        syncChat = new ChatEngineClone.Chat(newChannel2);

    });

});

let myChat;

let yourChat;

let privChannel = 'secret-channel-' + new Date().getTime();

describe('invite', () => {

    beforeEach(createChatEngine);
    beforeEach(createChatEngineYou);
    afterEach(reset);

    it('two users are able to talk to each other in private channel', function shouldInvite(done) {

        this.timeout(60000);

        yourChat = new ChatEngineYou.Chat(privChannel);

        yourChat.on('$.connected', () => {

            // me is the current context
            yourChat.invite(ChatEngine.me);

        });

        yourChat.on('message', (payload) => {

            assert.equal(payload.data.text, 'sup?');
            done();

        });

        ChatEngine.me.direct.on('$.invite', (payload) => {

            myChat = new ChatEngine.Chat(payload.data.channel);

            myChat.on('$.connected', () => {

                setTimeout(() => {

                    myChat.emit('message', {
                        text: 'sup?'
                    });

                }, 5000);

            });

        });

    });

});
