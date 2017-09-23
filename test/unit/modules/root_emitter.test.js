const assert = require('chai').assert;
const RootEmitter = require('../../../src/modules/root_emitter');

let instance = null;

describe('#root_emitter', () => {
    it('RootEmitter should be instanced', (done) => {
        instance = new RootEmitter();
        assert.isObject(instance, 'was successfully created');
        done();
    });

    it('RootEmmiter should be gotten an event fired', (done) => {
        instance.on('foo', () => {
            done();
        });

        instance._emit('foo');
    });

    it('RootEmmiter should be gotten a value within an event', (done) => {
        instance.on('specialized', (value) => {
            assert(value === 'hello world', 'got the expected value');
            done();
        });

        instance._emit('specialized', 'hello world');
    });

    it('RootEmmiter should be gotten an wildcare event fired', (done) => {
        instance.on('foo.*', () => {
            done();
        });

        instance._emit('foo.happy');
    });

    it('RootEmmiter should be gotten an event only once', (done) => {
        instance.once('bar', () => {
            done();
        });

        instance._emit('bar');
    });

    it('RootEmmiter should be gotten whatever event fired', (done) => {
        instance.onAny((event) => {
            assert(event === 'bar', 'listened the expected event');
            done();
        });

        instance._emit('bar');
    });
});
