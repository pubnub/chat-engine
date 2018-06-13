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

        let someChat = new chatEngineInstance.Chat('state-chat');

        userInstance.update(someChat, { typing: true });
        assert(userInstance.state(someChat).typing, 'got the expected value');
        done();
    });

});
