const assert = require('chai').assert;
const sinon = require('sinon');
const Bootstrap = require('../../../src/bootstrap');
const Event = require('../../../src/components/event');
const Chat = require('../../../src/components/chat');


describe('#event', () => {

    let chatEngineInstance = null;
    let chat = null;

    beforeEach(() => {
        chatEngineInstance = Bootstrap({ globalChannel: 'common', insecure: true }, { publishKey: 'demo', subscribeKey: 'demo' });

        // mock pubnub
        chatEngineInstance.pubnub = {
            addListener: sinon.spy(),
            publish: sinon.spy()
        };

        chat = new Chat(chatEngineInstance);
        chatEngineInstance.connect();
    });

    it('should be instanced', (done) => {
        const instance = new Event(chatEngineInstance, chat);

        assert.isObject(instance, 'was successfully created');
        done();
    });

    it('should emit a message', (done) => {
        const instance = new Event(chatEngineInstance, chat);

        chat.on('$.publish.success', () => {
            done();
        });

        instance.publish({ m: 'hello world' });

        // simulate a good publish
        chatEngineInstance.pubnub.publish.args[0][1]({ statusCode: 200 });

    });
});
