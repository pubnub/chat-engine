const ChatEngineCore = require('../../src/index.js');
const assert = require('chai').assert;

const pubkey = 'pub-c-fab5d74d-8118-444c-b652-4a8ee0beee92';
const subkey = 'sub-c-696d9116-c668-11e7-afd4-56ea5891403c';

let ChatEngine;
let ChatEngineYou;
let ChatEngineClone;
let ChatEngineAlt;
let globalChannel = 'global' + new Date().getTime();

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
    throwErrors: true
};

function createChatEngine(done) {

    this.timeout(25000);

    ChatEngine = ChatEngineCore.create({
        publishKey: pubkey,
        subscribeKey: subkey,
        logVerbosity: true
    }, ceConfig);
    ChatEngine.connect(username, { works: true }, username);
    ChatEngine.on('$.ready', () => {
        done();
    });
    ChatEngine.onAny((a) => {
        console.log(a);
    });

}

function createChatEngineClone(done) {

    this.timeout(25000);

    ChatEngineClone = ChatEngineCore.create({
        publishKey: pubkey,
        subscribeKey: subkey,
        logVerbosity: true
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
        logVerbosity: true
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

    it('Should populate history tests', function populateSecondHistory(done) {

        this.timeout(80000);

        let k = new ChatEngine.Chat('chat-history', false);

        for (let i = 0; i < 200; i++) {

            k.emit('tester', {
                text: 'hello world ' + i
            });
            k.emit('not-tester', {
                text: 'hello world ' + i
            });

        }

        setTimeout(() => {
            done();
        }, 60000);

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

    it('should be identified as new user', function beIdentified() {

        this.timeout(16000);

        assert.isObject(ChatEngine.me);

        ChatEngine.on('$.network.*', (data) => {
            console.log(data.operation);
        });

    });

    it('should notify chatengine on created', function join(done) {

        this.timeout(6000);

        let newChat = 'notify-on-created' + new Date().getTime();
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

        createdEventChat1 = new ChatEngine.Chat('notify-on-connected');

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

        let chat2 = new ChatEngine.Chat('get-connected-callback' + new Date().getTime());
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

        }, 5000);

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

    it('should be get notified of new chats', function getNotifiedOfNewChats(done) {

        this.timeout(20000);

        // first instance looking or new chats
        ChatEngine.me.on('$.session.chat.join', (payload) => {

            console.log('session chat joined called')

            console.log(payload)

            if (payload.chat.channel.indexOf(newChannel) > -1) {
                done();
            }

        });

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

    it('two users are able to talk to each other in private channel', function shouldInvite(done) {

        this.timeout(60000);

        yourChat = new ChatEngineYou.Chat(privChannel);
        // console.log(privChannel);
        // yourChat.onAny((a) => {
        //     console.log('yourchat', a);
        // });

        yourChat.on('$.connected', () => {

            // me is the current context
            yourChat.invite(ChatEngine.me);

        });

        yourChat.on('message', (payload) => {

            assert.equal(payload.data.text, 'sup?');
            done();

        });

        ChatEngine.me.direct.on('$.invite', (payload) => {

            console.log(payload.data.channel);

            myChat = new ChatEngine.Chat(payload.data.channel);
            // myChat.onAny((a) => {
            //     console.log('myChat', a);
            // });

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

// describe('connection management', () => {

//     beforeEach(createChatEngine);
//     afterEach(cleanup);

//     it('change user', function beIdentified(done) {

//         this.timeout(20000);

//         let newUsername = 'stephen' + new Date().getTime();

//         ChatEngine.once('$.disconnected', () => {

//             ChatEngine = ChatEngineCore.create({
//                 publishKey: pubkey,
//                 subscribeKey: subkey
//             }, ceConfig);

//             ChatEngine.once('$.ready', () => {

//                 done();

//             });

//             ChatEngine.connect(newUsername);

//         });

//         ChatEngine.disconnect();

//     });

//     it('should disconnect', function beIdentified(done) {

//         this.timeout(6000);

//         let chat2 = new ChatEngine.Chat(new Date().getTime());

//         chat2.on('$.disconnected', () => {
//             done();
//         });

//         chat2.on('$.connected', () => {
//             ChatEngine.disconnect();
//         });

//     });

//     it('should refresh auth', function beIdentified(done) {

//         this.timeout(6000);

//         let authKey = new Date().getTime();

//         ChatEngine.reauthorize(authKey);

//         ChatEngine.once('$.connected', () => {
//             done();
//         });

//     });

// });
