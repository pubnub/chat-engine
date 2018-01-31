const assert = require('chai').assert;
const sinon = require('sinon');
const Bootstrap = require('../../../src/bootstrap');
const Event = require('../../../src/components/event');
const Chat = require('../../../src/components/chat');


describe('#event', () => {
    let chatEngineInstance = null;
    let chat = null;
    let event = null;

    beforeEach(() => {
        chatEngineInstance = Bootstrap({ globalChannel: 'common', insecure: true }, { publishKey: 'demo', subscribeKey: 'demo' });

        // mock pubnub
        chatEngineInstance.pubnub = {
            addListener: sinon.spy(),
            publish: sinon.spy()
        };

        chat = new Chat(chatEngineInstance);

        chatEngineInstance.connect();

        event = new Event(chatEngineInstance, chat, 'event_test');
    });

    it('should be instanced', (done) => {
        assert.isObject(event, 'was successfully created');
        done();
    });

    it('should emit a message', (done) => {
        chat.on('$.publish.success', () => {
            done();
        });

        event.publish({ m: 'hello world' });

        // simulate a good publish
        chatEngineInstance.pubnub.publish.args[0][1]({ statusCode: 200 });

    });

    it('should receive a message', (done) => {
        chat.on('event_test', (payload) => {
            assert(payload.message === 'hello', 'got the expected value');
            done();
        });

        event.onMessage({ channel: chat.channel, message: { event: 'event_test', message: 'hello' } });
    });
});
