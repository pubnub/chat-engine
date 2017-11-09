const assert = require('chai').assert;
const sinon = require('sinon');
const Bootstrap = require('../../../src/bootstrap');
const Me = require('../../../src/components/me');

describe('#me', () => {
    let chatEngineInstance = null;
    let me = null;

    beforeEach(() => {
        chatEngineInstance = Bootstrap({ globalChannel: 'common', insecure: true }, { publishKey: 'demo', subscribeKey: 'demo' });

        // mock pubnub
        chatEngineInstance.pubnub = {
            addListener: sinon.spy(),
            publish: sinon.spy()
        };

        chatEngineInstance.connect();

        me = new Me(chatEngineInstance, 'user1');
    });

    it('chat created', (done) => {
        assert.isObject(me, 'was successfully created');
        done();
    });

    it('add chat to session', (done) => {

        chatEngineInstance.on('$.session.chat.join', (payload) => {
            assert.isObject(payload.chat, 'was successfully created');
            done();
        });

        me.sync.trigger('$.session.chat.join', { chat: { group: 'default', channel: 'test' } });

    });

    it('remove a chat from session', (done) => {

        me.addChatToSession({ group: 'default', channel: 'test' });

        chatEngineInstance.on('$.session.chat.leave', (payload) => {
            assert.isObject(payload.chat, 'was successfully remove');
            done();
        });

        me.sync.trigger('$.session.chat.leave', { chat: { group: 'default', channel: 'test' } });

    });
});
