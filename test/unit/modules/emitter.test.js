const assert = require('chai').assert;
const Bootstrap = require('../../../src/bootstrap');
const Emitter = require('../../../src/modules/emitter');

let instance = null;

describe('#emitter', () => {
    it('Emitter should be instanced', (done) => {
        instance = new Emitter(Bootstrap({ publishKey: 'demo', subscribeKey: 'demo' }));
        assert.isObject(instance, 'was successfully created');
        done();
    });

    it('Emitter should be listened an event', (done) => {
        instance.on('foo', (msg) => {
            assert(msg === 'hello world', 'got the expected value');
            done();
        });

        instance._emit('foo', 'hello world');
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

        instance.plugin(plugin);
        assert(instance.plugins.length === 1, 'was received the pluging');
        done();
    });
});

