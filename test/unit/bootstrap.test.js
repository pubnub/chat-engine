const assert = require('chai').assert;
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const mock = {
    get: () => {
        return Promise.resolve({ data: {} });
    },
    post: () => {
        return Promise.resolve({ data: {} });
    }
};

describe('#bootstrap', () => {
    let chatEngineInstance = null;
    let Bootstrap = null;

    beforeEach(() => {
        Bootstrap = proxyquire('../../src/bootstrap', { axios: mock });

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
        setTimeout(() => {
            assert.isNotNull(Bootstrap, 'was successfully imported');
        }, 1000);
    });

    it('chat created', (done) => {
        let chat = new chatEngineInstance.Chat();
        assert.isObject(chat, 'was successfully created');
        done();
    });

    it('connect', function itConnect(done) {

        this.timeout(20000);

        chatEngineInstance.on('$.ready', (data) => {
            assert(data.me.uuid === 'user1', 'was assigned uuid to me');
            done();
        });

        chatEngineInstance.connect('user1');
    });
});
