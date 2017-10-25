const assert   = require('chai').assert;
const Mock = require('pubnub-function-mock');

describe('#server', () => {
    let server = null;

    beforeEach(() => {
        server = new Mock('../../../../setup/functions/server');
    });

    it('server function created', (done) => {
        assert.isObject(server, 'was successfully created');
        done();
    });
});