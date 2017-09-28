const assert = require('chai').assert;
const Bootstrap = require('../../../src/bootstrap');
const User = require('../../../src/components/user');

describe('#user', () => {
    let chatEngineInstance = null;
    let userInstance = null;

    beforeEach(() => {
        chatEngineInstance = Bootstrap({ globalChannel: 'common', insecure: true }, { publishKey: 'demo', subscribeKey: 'demo' });
        userInstance = new User(chatEngineInstance, '123456');
    });

    it('should be instance', (done) => {

        assert.isObject(userInstance, 'was successfully created');
        done();
    });

    it('should be updated with the state', (done) => {
        userInstance.update({ typing: true });
        assert(userInstance.state.typing, 'got the expected value');
        done();
    });
});
