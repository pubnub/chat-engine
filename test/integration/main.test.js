const assert = require('chai').assert;
let decache = require('decache');

const pubkey = 'pub-c-fab5d74d-8118-444c-b652-4a8ee0beee92';
const subkey = 'sub-c-696d9116-c668-11e7-afd4-56ea5891403c';

let ChatEngine;
let ChatEngineYou;
let ChatEngineClone;
let ChatEngineSync;
let ChatEngineHistory;

let globalChannel;
let username;
let yousername;

let iterations = 0;

let version = process.version.replace(/\./g, '-');

function reset(done) {

    this.timeout(60000);

    globalChannel = ['test', version, iterations].join('-');
    username = ['ian', version, iterations].join('-');
    yousername = ['stephen', version, iterations].join('-');

    iterations++;

    decache('../../src/index.js');

    done();

}

function createChatEngine(done) {

    this.timeout(60000);

    ChatEngine = require('../../src/index.js').create({
        publishKey: pubkey,
        subscribeKey: subkey
    }, {
        globalChannel,
        throwErrors: true
    });
    ChatEngine.connect(username, { works: true }, username);
    ChatEngine.on('$.ready', () => done());

}

function createChatEngineSync(done) {

    this.timeout(60000);
    ChatEngineSync = require('../../src/index.js').create({
        publishKey: pubkey,
        subscribeKey: subkey
    }, {
        globalChannel,
        enableSync: true,
        throwErrors: true
    });

    ChatEngineSync.connect(username, { works: false }, username);
    ChatEngineSync.on('$.ready', () => done());

}


function createChatEngineClone(done) {

    this.timeout(60000);

    ChatEngineClone = require('../../src/index.js').create({
        publishKey: pubkey,
        subscribeKey: subkey
    }, {
        globalChannel,
        enableSync: true,
        throwErrors: true
    });

    ChatEngineClone.connect(username, { works: true }, username);
    ChatEngineClone.on('$.ready', () => done());

}

function createChatEngineYou(done) {

    this.timeout(60000);

    ChatEngineYou = require('../../src/index.js').create({
        publishKey: pubkey,
        subscribeKey: subkey
    }, {
        globalChannel,
        throwErrors: true,
        enableSync: false
    });
    ChatEngineYou.connect(yousername, { works: true }, yousername);
    ChatEngineYou.on('$.ready', () => done());

}

function createChatEngineHistory(done) {

    this.timeout(60000);

    ChatEngineHistory = require('../../src/index.js').create({
        publishKey: pubkey,
        subscribeKey: subkey
    }, {
        globalChannel: 'global',
        throwErrors: true
    });
    ChatEngineHistory.connect(yousername, { works: true }, yousername);
    ChatEngineHistory.on('$.ready', () => done());

}

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

describe('connect', () => {

    beforeEach(reset);
    beforeEach(createChatEngine);

    it('should be identified as new user', function beIdentified() {
        this.timeout(60000);
        assert.isObject(ChatEngine.me);
    });

    it('should notify chatengine on created', function join(done) {

        this.timeout(60000);

        let newChat = 'this-is-only-a-test-3' + new Date().getTime();
        let a = false;

        ChatEngine.on('$.created.chat', (data, source) => {

            let lookingFor = globalChannel + '#chat#public.#' + newChat;

            if (source.channel === lookingFor) {
                done();
            }

        });

        a = new ChatEngine.Chat(newChat);

        a.on('$.connected', () => {
            setTimeout(() => a.leave(), 1000);
        });

    });

    it('should notify chatengine on connected', function join(done) {

        this.timeout(60000);
        let createdEventChat1;

        ChatEngine.on('$.connected', (data, source) => {

            assert.isObject(source);
            if (source.channel === createdEventChat1.channel) {
                done();
            }
        });

        createdEventChat1 = new ChatEngine.Chat('this-is-only-a-test' + new Date().getTime());

    });

    it('should notify chatengine on disconnected', function disconnected(done) {

        this.timeout(60000);
        let createdEventChat2;

        ChatEngine.on('$.disconnected', (data, source) => {

            assert.isObject(source);

            if (source.channel === createdEventChat2.channel) {
                done();
            }
        });

        createdEventChat2 = new ChatEngine.Chat('this-is-only-a-test-2' + new Date().getTime());

        createdEventChat2.on('$.connected', () => createdEventChat2.leave());

    });

});

describe('chat', () => {

    beforeEach(reset);
    beforeEach(createChatEngine);

    it('should get me as join event', function getMe(done) {

        this.timeout(60000);

        let chat = new ChatEngine.Chat('chat-teser' + new Date().getTime());

        chat.on('$.online.*', (p) => {

            if (p.user.uuid === ChatEngine.me.uuid) {
                done();
            }

        });

    });

    it('should get connected callback', function getReadyCallback(done) {
        this.timeout(60000);

        let chat2 = new ChatEngine.Chat('chat2' + new Date().getTime());
        chat2.on('$.connected', () => done());
    });

    it('should get message', function shouldGetMessage(done) {

        this.timeout(60000);

        let chat = new ChatEngine.Chat('chat-teser3' + new Date().getTime());

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

        let chat = new ChatEngine.Chat('chat-teser' + new Date().getTime());
        chat.plugin(examplePlugin());

        assert(chat.constructWorks, 'bound to construct');
        assert(chat.testPlugin.newMethod(), 'new method added');

    });

    it('should bind a prototype plugin', () => {

        ChatEngine.proto('Chat', examplePlugin());

        let newChat = new ChatEngine.Chat('some-other-chat' + new Date().getTime());

        assert(newChat.constructWorks, 'bound to construct');
        assert(newChat.testPlugin.newMethod(), 'new method added');

    });

});

describe('history', () => {

    beforeEach(reset);
    beforeEach(createChatEngineHistory);

    it('should get 50 messages', function get50(done) {

        this.timeout(60000);
        let count = 0;

        let chatHistory = new ChatEngineHistory.Chat('chat-history');

        chatHistory.on('$.connected', () => {

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

    });

    it('should get 200 messages', function get200(done) {

        let count = 0;

        this.timeout(60000);
        let chatHistory2 = new ChatEngineHistory.Chat('chat-history');

        chatHistory2.on('$.connected', () => {

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

    });

    it('should get messages without event', function get50(done) {

        this.timeout(60000);

        let chatHistory = new ChatEngineHistory.Chat('chat-history-8');

        chatHistory.on('$.connected', () => {

            chatHistory.search({
                limit: 10
            }).on('tester', (a) => {

                assert.equal(a.event, 'tester');

            }).on('$.search.finish', () => done());

        });

    });

});

describe('remote chat list', () => {

    beforeEach(reset);
    beforeEach(createChatEngineClone);
    beforeEach(createChatEngineSync);

    it('should be get notified of new chats', function getNotifiedOfNewChats(done) {

        this.timeout(60000);
        let newChannel = 'sync-chat' + new Date().getTime();

        // first instance looking or new chats
        ChatEngineSync.me.on('$.session.chat.join', (payload) => {

            if (payload.chat.channel.indexOf(newChannel) > -1) {
                done();
            }

        });

        setTimeout(() => {
            let newChatToNotify = new ChatEngineClone.Chat(newChannel);
        }, 5000);

    });

    it('should be populated', function shouldBePopulated(done) {

        this.timeout(60000);

        ChatEngineSync.me.once('$.session.group.restored', (payload) => {

            assert.isObject(ChatEngineSync.me.session[payload.group]);

            done();

        });

    });

    it('should get delete event', function deleteSync(done) {

        this.timeout(60000);

        let newChannel2 = 'sync-chat2' + new Date().getTime();
        let syncChat;

        ChatEngineSync.me.on('$.session.chat.leave', (payload) => {

            if (payload.chat.channel.indexOf(newChannel2) > -1) {
                done();
            }

        });

        ChatEngineSync.me.once('$.session.chat.join', () => syncChat.leave());
        syncChat = new ChatEngineClone.Chat(newChannel2);

    });

});

describe('invite', () => {

    beforeEach(reset);
    beforeEach(createChatEngine);
    beforeEach(createChatEngineYou);

    it('two users are able to talk to each other in private channel', function shouldInvite(done) {

        this.timeout(60000);

        let myChat;
        let yourChat;
        let privChannel = 'predictable-secret-channel';

        yourChat = new ChatEngineYou.Chat(privChannel, true);
        yourChat.on('$.connected', () => yourChat.invite(ChatEngine.me));

        let done2 = false;

        yourChat.on('message', (payload) => {

            if (!done2) {

                assert.equal(payload.data.text, 'sup?');
                done();
                done2 = true;

            }

        });

        ChatEngine.me.direct.on('$.invite', (payload) => {

            myChat = new ChatEngine.Chat(payload.data.channel);

            myChat.on('$.connected', () => {

                myChat.emit('message', {
                    text: 'sup?'
                });

            });

        });

    });

});
