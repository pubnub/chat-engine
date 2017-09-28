const assert = require('chai').assert;
const RootEmitter = require('../../../src/modules/root_emitter');

let instance = null;

describe('#root_emitter', () => {
    it('should successfully create an instance', (done) => {
        instance = new RootEmitter();
        assert.isObject(instance, 'was successfully created');
        done();
    });

    it('should respond on event fired', (done) => {
        instance.on('foo', () => {
            done();
        });

        instance._emit('foo');
    });

    it('should get a value within an event', (done) => {
        instance.on('specialized', (value) => {
            assert(value === 'hello world', 'got the expected value');
            done();
        });

        instance._emit('specialized', 'hello world');
    });

    it('should accept a wildcard event', (done) => {
        instance.on('foo.*', () => {
            done();
        });

        instance._emit('foo.happy');
    });

    it('should get an event only once', (done) => {
        instance.once('bar', () => {
            done();
        });

        instance._emit('bar');
    });

    it('should get generic event', (done) => {
        instance.onAny((event) => {
            assert(event === 'bar', 'expected event fired');
            done();
        });

        instance._emit('bar');
    });
});
