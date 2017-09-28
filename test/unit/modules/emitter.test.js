const assert = require('chai').assert;
const sinon = require('sinon');
const Bootstrap = require('../../../src/bootstrap');
const Emitter = require('../../../src/modules/emitter');

describe('#emitter', () => {
    let emitterInstance = null;
    let chatEngineInstance = null;

    beforeEach(() => {
        chatEngineInstance = Bootstrap({ publishKey: 'demo', subscribeKey: 'demo' });
        emitterInstance = new Emitter(chatEngineInstance);

        // mock pubnub
        chatEngineInstance.pubnub = {
            addListener: sinon.spy()
        };

    });

    it('Emitter should be instanced', (done) => {
        assert.isObject(emitterInstance, 'was successfully created');
        done();
    });

    it('Emitter should be listened an event', (done) => {
        emitterInstance.on('foo', (msg) => {
            assert(msg === 'hello world', 'got the expected value');
            done();
        });

        emitterInstance._emit('foo', 'hello world');
    });

    it('Emitter should be received a plugin', (done) => {
        let plugin = () => {
            class extension {
            }

            return {
                namespace: 'demo',
                extends: {
                    User: extension,
                    Me: extension
                }
            };
        };

        emitterInstance.plugin(plugin);
        assert(emitterInstance.plugins.length === 1, 'was received the pluging');
        done();
    });
});
