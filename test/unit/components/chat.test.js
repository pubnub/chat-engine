const assert = require('chai').assert;
const sinon = require('sinon');
const Bootstrap = require('../../../src/bootstrap');
const Chat = require('../../../src/components/chat');

describe('#chat', () => {

    let chatEngineInstance = null;
    let chatInstance = null;

    beforeEach(() => {
        chatEngineInstance = Bootstrap({ globalChannel: 'common', insecure: true }, { publishKey: 'demo', subscribeKey: 'demo' });

        // mock pubnub
        chatEngineInstance.pubnub = {
            addListener: sinon.spy(),
            publish: sinon.spy(),
            history: sinon.spy(),
            hereNow: sinon.spy()
        };

        chatInstance = new Chat(chatEngineInstance);

    });

    it('should be instanced', (done) => {
        chatEngineInstance.connect();
        assert.isObject(chatInstance, 'was successfully created');
        done();
    });

    it('broadcast connection status', (done) => {
        chatInstance.on('$.connected', () => {
            done();
        });

        chatInstance.onConnectionReady();
        chatEngineInstance.pubnub.hereNow.args[0][1]({ error: false }, { channels: { [chatInstance.channel]: { occupants: [{ uuid: 'user123', state: { state: 'active' } }] } } });
    });

    it('broadcast disconnection', (done) => {
        chatInstance.users.user1 = {};

        chatInstance.on('$.offline.disconnect', () => {
            done();
        });

        chatInstance.userDisconnect('user1');
    });

    it('broadcast a leaving the chat', (done) => {
        chatInstance.users.user1 = {};

        chatInstance.on('$.offline.leave', () => {
            done();
        });

        chatInstance.userLeave('user1');
    });

    it('update occupancies', (done) => {
        chatInstance.on('$.connected', () => {
            setTimeout(() => {
                assert(chatInstance.users.user123.state.state === 'active', 'got the expected value');
                done();
            }, 50);
        });

        chatInstance.onConnectionReady();
        chatEngineInstance.pubnub.hereNow.args[0][1]({ error: false }, { channels: { [chatInstance.channel]: { occupants: [{ uuid: 'user123', state: { state: 'active' } }] } } });
    });

    describe('history', () => {
        it('fetches history', (done) => {
            chatEngineInstance.connect();

            chatInstance.on('$.history.ev1', (msg) => {
                assert(msg.payload === 'hi', 'got the expected value');
                done();
            });

            chatInstance.history('ev1');
            chatEngineInstance.pubnub.history.args[0][1]({ error: false }, { messages: [{ entry: { event: 'ev1', payload: 'hi' } }] });

        });
    });
});
