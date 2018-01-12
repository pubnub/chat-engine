const ChatEngineCore = require('../../src/index.js');
const assert = require('chai').assert;

const pubkey = 'pub-c-df1f983b-8334-44aa-b32b-2fa23eff1f8f';
const subkey = 'sub-c-bf3164ba-f737-11e7-b8a6-46d99af2bb8c';

let ChatEngine;
let ChatEngineYou;
let ChatEngineClone;
let ChatEngineAlt;

let logVerbosity = false;
let origin = 'ssp.pubnub.com';
let globalChannel = 'global3';

let cleanup = function () {
    ChatEngine = false;
    ChatEngineYou = false;
    ChatEngineClone = false;
    ChatEngineAlt = false;
};

let username = 'ian' + new Date().getTime();
let yousername = 'stephen' + new Date().getTime();

let ceConfig = {
    globalChannel,
    throwErrors: true,
    endpoint: 'https://ssp.pubnub.com/v1/blocks/sub-key/'+subkey+'/chat-engine-server'
};

function createChatEngine(done) {

    this.timeout(25000);

    ChatEngine = ChatEngineCore.create({
        publishKey: pubkey,
        subscribeKey: subkey,
        logVerbosity: logVerbosity,
        origin: origin,
        useRequestId: true
    }, ceConfig);
    ChatEngine.connect(username, { works: true }, username);
    ChatEngine.on('$.ready', () => {
        done();
    });

}

function createChatEngineClone(done) {

    this.timeout(25000);

    ChatEngineClone = ChatEngineCore.create({
        publishKey: pubkey,
        subscribeKey: subkey,
        logVerbosity: logVerbosity,
        origin: origin,
        useRequestId: true
    }, ceConfig);
    ChatEngineClone.connect(username, { works: true }, username);
    ChatEngineClone.on('$.ready', () => {
        done();
    });

}

function createChatEngineYou(done) {

    this.timeout(25000);

    ChatEngineYou = ChatEngineCore.create({
        publishKey: pubkey,
        subscribeKey: subkey,
        logVerbosity: logVerbosity,
        origin: origin,
        useRequestId: true
    }, ceConfig);
    ChatEngineYou.connect(yousername, { works: true }, yousername);
    ChatEngineYou.on('$.ready', () => {
        done();
    });

}

describe('setup', () => {

    beforeEach(createChatEngine);

    it('ChatEngine should be imported', () => {
        assert.isObject(ChatEngineCore, 'was successfully created');
    });

    // it('Should populate history tests', function populateSecondHistory(done) {

    //     this.timeout(80000);

    //     let k = new ChatEngine.moc'chat-history', false);

    //     for (let i = 0; i < 200; i++) {

    //         k.emit('tester', {
    //             text: 'hello world ' + i
    //         });
    //         k.emit('not-tester', {
    //             text: 'hello world ' + i
    //         });

    //     }

    //     setTimeout(() => {
    //         done();
    //     }, 60000);

    // });

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
    afterEach(cleanup);

    it('should be identified as new user', function beIdentified() {

        this.timeout(16000);

        assert.isObject(ChatEngine.me);

    });

    it('should notify chatengine on created', function join(done) {

        this.timeout(6000);

        let newChat = 'chatengine-created' + new Date().getTime();
        let a = false;

        ChatEngine.on('$.created.chat', (data, source) => {

            let lookingFor = globalChannel + '#chat#public.#' + newChat;

            if (source.channel === lookingFor) {
                done();
            }

        });

        a = new ChatEngine.Chat(newChat);

    });

    it('should notify chatengine on connected', function join(done) {

        this.timeout(10000);

        ChatEngine.on('$.connected', (data, source) => {

            assert.isObject(source);
            if (source.channel === createdEventChat1.channel) {
                done();
            }
        });

        createdEventChat1 = new ChatEngine.Chat('chatengine-connected' + new Date().getTime());

    });

    it('should notify chatengine on disconnected', function disconnected(done) {

        this.timeout(4000);

        ChatEngine.on('$.disconnected', (data, source) => {

            assert.isObject(source);

            if (source.channel === createdEventChat2.channel) {
                done();
            }
        });

        createdEventChat2 = new ChatEngine.Chat('chatengine-disconnected' + new Date().getTime());

        createdEventChat2.on('$.connected', () => {
            createdEventChat2.leave();
        });

    });

});

let chat;

describe('chat', () => {

    beforeEach(createChatEngine);
    afterEach(cleanup);

    it('should get me as join event', function getMe(done) {

        this.timeout(10000);

        chat = new ChatEngine.Chat('chatengine-join' + new Date().getTime());

        chat.once('$.online.*', (p) => {

            if (p.user.uuid === ChatEngine.me.uuid) {
                done();
            }

        });

    });

    it('should get connected callback', function getReadyCallback(done) {

        this.timeout(5000);

        let chat2 = new ChatEngine.Chat('chatengine-connected-cb' + new Date().getTime());
        chat2.on('$.connected', () => {

            done();

        });

    });

    it('should get message', function shouldGetMessage(done) {

        this.timeout(12000);

        let chat3 = new ChatEngine.Chat('chatengine-get-message' + new Date().getTime());

        chat3.once('something', (payload) => {

            assert.isObject(payload);
            done();

        });

        let emit = () => {

            chat3.emit('something', {
                text: 'sup?'
            });

        };

        if (chat3.connected) {
            emit();
        } else {
            // it's already in our session
            chat3.connect();
            chat3.on('$.connected', () => {
                emit();
            });
        }

    });

    it('should bind a plugin', () => {

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

let chatHistory;
describe('history', () => {

    beforeEach(createChatEngine);
    afterEach(cleanup);

    it('should get 50 messages', function get50(done) {

        let count = 0;

        this.timeout(30000);

        chatHistory = new ChatEngine.Chat('chat-history', false);

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

        let chatHistory2 = new ChatEngine.Chat('chat-history', false);

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

describe('remote chat list', () => {

    beforeEach(createChatEngine);
    beforeEach(createChatEngineClone);
    afterEach(cleanup);

    it('should be get notified of new chats', function getNotifiedOfNewChats(done) {

        this.timeout(20000);

        let callback = (payload) => {

            if (payload.chat.channel.indexOf(newChannel) > -1) {

                assert.isObject(ChatEngine.me.session.system);
                assert.isObject(ChatEngine.me.session.custom);

                done();
            }

        };

        // first instance looking or new chats
        ChatEngine.me.on('$.session.chat.join', callback);

        setTimeout(() => {

            syncChat = new ChatEngineClone.Chat(newChannel, true, true);

        }, 1000);

    });

    it('should get leave event', function deleteSync(done) {

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

let privChannel = 'secret-channel-' + new Date().getTime();

describe('invite', () => {

    beforeEach(createChatEngine);
    beforeEach(createChatEngineYou);
    afterEach(cleanup);

    it('two users are able to talk to each other in private channel', function shouldInvite(done) {

        this.timeout(60000);

        yourChat = new ChatEngineYou.Chat(privChannel, false, false);

        yourChat.on('$.connected', () => {

            // me is the current context
            yourChat.invite(ChatEngine.me);

        });

        yourChat.on('message', (payload) => {

            assert.equal(payload.data.text, 'sup?');
            done();

        });

        ChatEngine.me.direct.on('$.invite', (payload) => {

            console.log('got invite event direct')

            myChat = new ChatEngine.Chat(payload.data.channel);

            let emit2 = () => {

                console.log('emitting sup')

                myChat.emit('message', {
                    text: 'sup?'
                });

            };

            myChat.onAny((a) => {
                console.log(a)
            })

            if (myChat.connected) {
                console.log('mychat already connected')
                emit2();
            } else {
                console.log('not conencted, connecting')
                // it's already in our session
                // myChat.connect();
                myChat.on('$.connected', () => {
                    console.log('mychat conencted cb')
                    emit2();
                });
            }

        });

        yourChat.connect();

    });

});

describe('connection management', () => {

    beforeEach(createChatEngine);
    afterEach(cleanup);

    it('change user', function beIdentified(done) {

        this.timeout(20000);

        let newUsername = 'stephen' + new Date().getTime();

        ChatEngine.once('$.disconnected', () => {

            ChatEngine = ChatEngineCore.create({
                publishKey: pubkey,
                subscribeKey: subkey,
                logVerbosity: logVerbosity,
                origin: origin,
                useRequestId: true
            }, ceConfig);

            ChatEngine.once('$.ready', () => {

                done();

            });

            ChatEngine.connect(newUsername);

        });

        ChatEngine.disconnect();

    });

    it('should disconnect', function beIdentified(done) {

        this.timeout(6000);

        let chat2 = new ChatEngine.Chat('disconnect'+new Date().getTime());

        chat2.on('$.disconnected', () => {
            done();
        });

        chat2.on('$.connected', () => {
            ChatEngine.disconnect();
        });

    });

    it('should refresh auth', function beIdentified(done) {

        this.timeout(6000);

        let authKey = new Date().getTime();

        ChatEngine.reauthorize(authKey);

        ChatEngine.once('$.connected', () => {
            done();
        });

    });

});
