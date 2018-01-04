const ChatEngineCore = require('../../src/index.js');
const assert = require('chai').assert;

const pubkey = 'pub-c-fab5d74d-8118-444c-b652-4a8ee0beee92';
const subkey = 'sub-c-696d9116-c668-11e7-afd4-56ea5891403c';

let ChatEngine;
let ChatEngineYou;
let ChatEngineClone;
let globalChannel = 'global';

let username = 'ian' + new Date().getTime();
let yousername = 'stephen' + new Date().getTime();

let ceConfig = {
    globalChannel,
    throwErrors: false
};

function createChatEngine(done) {

    this.timeout(15000);

    ChatEngine = ChatEngineCore.create({
        publishKey: pubkey,
        subscribeKey: subkey
    }, ceConfig);
    ChatEngine.connect(username, { works: true }, username);
    ChatEngine.on('$.ready', () => {
        done();
    });

}

function createChatEngineClone(done) {

    this.timeout(15000);

    ChatEngineClone = ChatEngineCore.create({
        publishKey: pubkey,
        subscribeKey: subkey
    }, ceConfig);
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
    }, ceConfig);
    ChatEngineYou.connect(yousername, { works: true }, yousername);
    ChatEngineYou.on('$.ready', () => {
        done();
    });

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

    it('should be identified as new user', function beIdentified() {

        this.timeout(16000);

        assert.isObject(ChatEngine.me);

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

    it('should get me as join event', function getMe(done) {

        this.timeout(10000);

        chat = new ChatEngine.Chat('chat-teser' + new Date().getTime());

        chat.on('$.online.*', (p) => {

            if (p.user.uuid === ChatEngine.me.uuid) {
                done();
            }

        });

    });

    it('should connect and message', function getReadyCallback(done) {

        this.timeout(5000);

        let chat2 = new ChatEngine.Chat('chat2' + new Date().getTime());
        chat2.on('$.connected', () => {

            chat2.once('something', (payload) => {

                assert.isObject(payload);
                done();

            });

            setTimeout(() => {
                chat2.emit('something', {
                    text: 'hello world'
                });
            }, 1000);

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

    beforeEach(createChatEngine);

    it('should get 50 messages', function get50(done) {

        let count = 0;

        this.timeout(30000);

        chatHistory = new ChatEngine.Chat('chat-history-8', false);

        for (let i = 0; i < 200; i++) {

            chatHistory.emit('tester', {
                text: 'hello world ' + i
            });
            chatHistory.emit('not-tester', {
                text: 'hello world ' + i
            });

        }

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

        for (let i = 0; i < 200; i++) {

            chatHistory2.emit('tester', {
                text: 'hello world ' + i
            });
            chatHistory2.emit('not-tester', {
                text: 'hello world ' + i
            });

        }

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

        this.timeout(10000);

        // first instance looking or new chats
        ChatEngine.me.on('$.session.chat.join', (payload) => {

            if (payload.chat.channel.indexOf(newChannel) > -1) {
                done();
            }

        });

        syncChat = new ChatEngineClone.Chat(newChannel, true, true);

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

let privChannel = 'secret-channel-' + new Date().getTime();

describe('invite', () => {

    beforeEach(createChatEngine);
    beforeEach(createChatEngineYou);

    it('two users are able to talk to each other in private channel', function shouldInvite(done) {

        this.timeout(60000);

        yourChat = new ChatEngineYou.Chat(privChannel);
        console.log(privChannel);
        yourChat.onAny((a) => {
            console.log('yourchat', a);
        });

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
            myChat.onAny((a) => {
                console.log('myChat', a);
            });

            myChat.on('$.connected', () => {

                setTimeout(() => {

                    myChat.emit('message', {
                        text: 'sup?'
                    });

                }, 5000);

            });

        });

    });

    it('Get your leave event', function createIt(done) {

        this.timeout(90000);

        let newChan = 'leave' + new Date().getTime();
        let myLeaveChat = new ChatEngine.Chat(newChan);
        let yourLeaveChat = new ChatEngineYou.Chat(newChan);

        myLeaveChat.onAny((a) => {
            console.log(a);
        });

        myLeaveChat.on('$.offline.leave', () => {

            // make sure your user no longer in list of users
            if (Object.keys(myLeaveChat.users).indexOf(ChatEngineYou.me.uuid) === -1) {
                done();
            }

        });

        yourLeaveChat.on('$.connected', () => {

            setTimeout(() => {
                yourLeaveChat.leave();
            }, 10000);

        });

    });

});

let sharedChannel = 'offline-disconnect' + new Date().getTime();
let myChatter;
let yourChatter;
describe('network events', () => {

    it('get eachothers\'s online events', function createIt(done) {

        this.timeout(120000);

        myChatter = new ChatEngine.Chat(sharedChannel);

        myChatter.onAny((a) => {
            console.log(a);
        });

        yourChatter = new ChatEngineYou.Chat(sharedChannel);

        let meYou = false;
        let youMe = false;
        let notDone = true;

        let checkDone = () => {

            console.log('checkDone', meYou, youMe, notDone);

            if (meYou && youMe && notDone) {
                done();
                notDone = false;
            }
        };

        // I get your online event
        myChatter.on('$.online.*', () => {

            console.log('my online', Object.keys(myChatter.users));

            if (myChatter.users[ChatEngineYou.me.uuid]) {
                meYou = true;
                checkDone();
            }

        });

        // You get my online event
        yourChatter.on('$.online.*', () => {

            console.log('your online', Object.keys(yourChatter.users));

            if (yourChatter.users[ChatEngine.me.uuid]) {
                youMe = true;
                checkDone();
            }

        });
    });

    it('Get your disconnect event', function getDisconnect(done) {

        this.timeout(360000);

        myChatter.on('$.offline.disconnect', () => {

            // make sure your user no longer in list of users
            if (Object.keys(myChatter.users).indexOf(ChatEngineYou.me.uuid) === -1) {
                done();
            }

        });

        yourChatter._manualDisconnect();

    });

});
