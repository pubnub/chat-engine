const assert = require('chai').assert;
const sinon = require('sinon');
const Bootstrap = require('../../../src/bootstrap');
const Emitter = require('../../../src/modules/emitter');

describe('#emitter', () => {
    let emitterInstance = null;
    let chatEngineInstance = null;

    beforeEach(() => {
        chatEngineInstance = Bootstrap({ globalChannel: 'common', insecure: true }, { publishKey: 'demo', subscribeKey: 'demo' });
        emitterInstance = new Emitter(chatEngineInstance);

        // mock pubnub
        chatEngineInstance.pubnub = {
            addListener: sinon.spy()
        };

    });

    it('should successfully create an instance', (done) => {
        assert.isObject(emitterInstance, 'was successfully created');
        done();
    });

    it('should listen to an event', (done) => {
        emitterInstance.on('foo', (msg) => {
            assert(msg === 'hello world', 'got the expected value');
            done();
        });

        emitterInstance._emit('foo', 'hello world');
    });

    it('should accept a plugin', (done) => {
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
        assert(emitterInstance.plugins.length === 1, 'plugin works!');
        done();
    });

    it('should get a string state', (done) => {
        emitterInstance.setState('stringKey', 'hello world');
        assert(emitterInstance.getState('stringKey') === 'hello world', 'got the expected value');
        done();
    });

    it('should get an object state', (done) => {
        emitterInstance.setState('objectKey', { users: 12, chatName: 'test' });
        assert.deepEqual(emitterInstance.getState('objectKey'), { users: 12, chatName: 'test' });
        done();
    });

    it('should get the list of states', (done) => {
        emitterInstance.setState('integerKey', 10);
        emitterInstance.setState('stringKey', 'hello world');
        emitterInstance.setState('booleanKey', true);
        assert.deepEqual(emitterInstance.listStates(), ['integerKey', 'stringKey', 'booleanKey']);
        done();
    });

    it('should remove a state', (done) => {
        emitterInstance.setState('integerKey', 10);
        emitterInstance.setState('integerKey', null);

        assert.isUndefined(emitterInstance.getState('integerKey'));
        done();
    });

    it('should manage state from a plugin', (done) => {

        let plugin = () => {
            class extension {
                construct() {
                    this.setState('stringKey', 'plugin state');
                }
            }

            return {
                namespace: 'statePlugin',
                extends: {
                    Emitter: extension
                }
            };
        };

        emitterInstance.plugin(plugin());

        assert(emitterInstance.plugins.length === 1, 'plugin works!');
        assert(emitterInstance.getState('stringKey') === 'hello world', 'got the expected value');
        assert(emitterInstance.statePlugin.getState('stringKey') === 'plugin state', 'got the expected value');

        done();

    });

    it('plugin should reset scope', (done) => {

        let plugin = () => {
            class extension {
                construct() {
                }
                test() {
                    this.stringKey = 'plugin state';
                }
            }

            return {
                namespace: 'statePlugin',
                extends: {
                    Emitter: extension
                }
            };
        };

        // call test() on first instance
        emitterInstance.plugin(plugin());
        emitterInstance.statePlugin.test();

        // key should match
        assert(emitterInstance.statePlugin.stringKey === 'plugin state', 'got the expected value');
        // attach plugin to second instance, do not call test
        let emitterInstance2 = new Emitter(chatEngineInstance);
        emitterInstance2.plugin(plugin());

        console.log('should be defined', emitterInstance.statePlugin.stringKey);
        console.log('should be undefined', emitterInstance.statePlugin.stringKey);

        // this should have fresh state
        assert(emitterInstance.statePlugin.stringKey === undefined, 'got the expected value');

        done();

    });

});
