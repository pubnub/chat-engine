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

    it('create chat', (done) => {
        chatEngineInstance.connect();
        assert.isObject(chatInstance, 'was successfully created');
        done();
    });

    it('connect chat', (done) => {
        chatInstance.on('$.connected', () => {
            done();
        });

        chatInstance.onConnectionReady();
        chatEngineInstance.pubnub.hereNow.args[0][1]({ error: false }, { channels: { [chatInstance.channel]: { occupants: [{ uuid: 'user123', state: { state: 'active' } }] } } });
    });

    it('should not allow to send string payload', (done) => {
        try {
            chatInstance.emit('message', 'hello');
        } catch (e) {
            done();
        }
    });

    it('disconnect chat', (done) => {
        chatInstance.users.user1 = {};

        chatInstance.on('$.offline.disconnect', () => {
            done();
        });

        chatInstance.userDisconnect('user1');
    });

    it('user join to chat', (done) => {

        chatInstance.on('$.online.here', () => {
            done();
        });

        chatInstance.createUser('user2', { state: 'active' });


    });

    it('user leave the chat', (done) => {
        chatInstance.users.user1 = {};
        chatInstance.on('$.offline.leave', () => {
            done();
        });

        chatInstance.userLeave('user1');
    });

    it('update state', (done) => {
        chatEngineInstance.on('$.state', (obj) => {
            assert(obj.user.uuid === 'user2', 'was updated to the right user');
            assert.deepEqual(obj.state, { state: 'not disturb' }, 'was updated the state correctly');
            done();
        });

        chatInstance.userUpdate('user2', { state: 'not disturb' });
    });

    describe('history', () => {
        it('fetches history', (done) => {

            chatEngineInstance.connect();

            let history = chatInstance.search({
                event: 'ev1'
            });
            history.on('ev1', (msg) => {
                assert(msg.payload === 'hi', 'got the expected value');
                done();
            });

            chatEngineInstance.pubnub.history.args[0][1]({ error: false }, { messages: [{ entry: { event: 'ev1', payload: 'hi' } }] });

        });
    });
});
