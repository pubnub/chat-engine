const assert = require('chai').assert;
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const mock = {
    get: () => {
        return new Promise((resolve) => {
            resolve({ data: [] });
        });
    },
    post: () => {
        return new Promise((resolve) => {
            resolve({ data: {} });
        });
    }
};

const Bootstrap = proxyquire('../../src/bootstrap', { axios: mock });

describe('#bootstrap', () => {
    let chatEngineInstance = null;

    beforeEach(() => {
        chatEngineInstance = Bootstrap({ globalChannel: 'common' }, { publishKey: 'demo', subscribeKey: 'demo' });

        // mock pubnub
        chatEngineInstance.pubnub = {
            addListener: sinon.spy(),
            publish: sinon.spy(),
            history: sinon.spy(),
            hereNow: sinon.spy()
        };
    });

    it('imported', () => {
        assert.isNotNull(Bootstrap, 'was successfully imported');
    });

    it('chat created', (done) => {
        let chat = new chatEngineInstance.Chat();
        assert.isObject(chat, 'was successfully created');
        done();
    });

    it('connect', (done) => {

        chatEngineInstance.on('$.ready', (data) => {
            assert(data.me.uuid === 'user1', 'was assigned uuid to me');
            done();
        });

        chatEngineInstance.connect('user1');
    });
});
