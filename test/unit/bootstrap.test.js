const assert = require('chai').assert;
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const mock = {
    get: () => {
        return new Promise((resolve) => {
            resolve({ data: [] });
        });
    },
    post: () => {
        return new Promise((resolve) => {
            resolve({ data: {} });
        });
    }
};

const Bootstrap = proxyquire('../../src/bootstrap', { axios: mock });

describe('#bootstrap', () => {
    let chatEngineInstance = null;
    let testChat = null;

    beforeEach(() => {
        chatEngineInstance = Bootstrap({ globalChannel: 'common', insecure: true }, { publishKey: 'demo', subscribeKey: 'demo' });

        // mock pubnub
        chatEngineInstance.pubnub = {
            addListener: sinon.spy(),
            publish: sinon.spy(),
            history: sinon.spy(),
            hereNow: sinon.spy()
        };
    });

    it('imported', () => {
        assert.isNotNull(Bootstrap, 'was successfully imported');
    });

    it('chat created', (done) => {
        let chat = new chatEngineInstance.Chat();
        assert.isObject(chat, 'was successfully created');
        done();
    });

    it('connect', (done) => {
        chatEngineInstance.on('$.ready', (data) => {
            assert(data.me.uuid === 'user1', 'was assigned uuid to me');
            done();
        });

        chatEngineInstance.connect('user1');
    });

    it('add a chat to session', (done) => {
        chatEngineInstance.on('$.session.chat.join', (payload) => {
            testChat = payload.chat;
            assert.isObject(payload.chat, 'was successfully created');
            done();
        });

        chatEngineInstance.addChatToSession({ chat: { group: 'default', channel: 'test' } });
    });

    it('remove a chat from session', (done) => {
        chatEngineInstance.on('$.session.chat.leave', (payload) => {
            assert.isObject(payload.chat, 'was successfully removed');
            done();
        });

        chatEngineInstance.removeChatFromSession(testChat);
    });
});
