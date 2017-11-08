const assert   = require('chai').assert;
const Mock = require('pubnub-functions-mock');

const endpointResponseObject = {
    "headers": {},
    "status": 200,
    "send": function (body) {
        return new Promise((resolve, reject) => {
            resolve({
                "body": body || "",
                "status": this.status
            });
        });
    }
};

const endpointRequestObject = {
    "body": "{}",
    "message": {},
    "method": 'GET',
    "params": {}
};

describe('#server', () => {
    let server;

    // Overrides the default XHR and Crypto modules in all tests
    let xhr = {
        fetch: () => {
            return Promise.resolve({ "status": 200 });
        }
    };

    let crypto = {
        hmac: () => {
            return Promise.resolve({ "signature": "signature" });
        },
        ALGORITHM: {
            HMAC_SHA256: ""
        }
    };

    let vault = {
        get: () => {
            return Promise.resolve("testSignature");
        }
    };

    beforeEach(() => {
        server = Mock('./setup/functions/server.js', { xhr, crypto, vault });
    });

    it('creates server event handler of type Function', (done) => {
        assert.isFunction(server, 'was successfully created');
        done();
    });

    it('requests controllers.index.get', (done) => {

        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);

        let correctResult = {
            "status": 200 
        };

        server(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');

            done();
        }).catch(done);

    });

    it('requests invalid route - should return 404', (done) => {

        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);
        request.params.route = 'invalid-route';

        let correctResult = { "status": 404 };

        server(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');

            done();
        }).catch(done);

    });

    it('requests controllers.user_read.post', (done) => {

        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);
        request.params.route = 'user_read';
        request.method = 'POST';

        let correctResult = { "status": 200 };

        server(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');

            done();
        }).catch(done);

    });

    it('requests controllers.user_write.post', (done) => {

        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);
        request.params.route = 'user_write';
        request.method = 'POST';

        let correctResult = { "status": 200 };

        server(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');

            done();
        }).catch(done);

    });

    it('requests controllers.bootstrap.post', (done) => {

        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);
        request.params.route = 'bootstrap';
        request.method = 'POST';

        let correctResult = { "status": 200 };

        server(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');

            done();
        }).catch(done);

    });

    it('requests controllers.group.post', (done) => {

        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);
        request.params.route = 'group';
        request.method = 'POST';

        let correctResult = { "status": 200 };

        server(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');

            done();
        }).catch(done);

    });

    it('requests controllers.join.post', (done) => {

        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);
        request.params.route = 'join';
        request.method = 'POST';
        request.body = JSON.stringify({
            "global": "test",
            "uuid":"test",
            "chat": {
                "group":"test"
            }
        });

        let correctResult = { "status": 200 };

        server(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');

            done();
        }).catch(done);

    });

    it('requests controllers.leave.post', (done) => {

        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);
        request.params.route = 'leave';
        request.method = 'POST';
        request.body = JSON.stringify({
            "global": "test",
            "uuid":"test",
            "chat": {
                "group":"test"
            }
        });

        let correctResult = { "status": 200 };

        server(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');

            done();
        }).catch(done);

    });

    it('requests controllers.chat.post', (done) => {

        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);
        request.params.route = 'chat';
        request.method = 'POST';
        request.body = JSON.stringify({
            "global": "test",
            "uuid":"test",
            "chat": {
                "group":"test"
            }
        });

        let correctResult = { "status": 200 };

        server(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');

            done();
        }).catch(done);

    });

    it('requests controllers.chat.get', (done) => {

        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);
        request.params.route = 'chat';

        let correctResult = { "status": 200 };

        server(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');

            done();
        }).catch(done);

    });

    it('requests controllers.grant.post', (done) => {

        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);
        request.params.route = 'grant';
        request.method = 'POST';
        request.body = JSON.stringify({
            "chat": {
                "channel":"test"
            }
        });

        let correctResult = { "status": 200 };

        server(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');

            done();
        }).catch(done);

    });

    it('requests controllers.invite.post', (done) => {

        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);
        request.params.route = 'invite';
        request.method = 'POST';

        let correctResult = { "status": 200 };

        server(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');

            done();
        }).catch(done);

    });

    it('requests controllers.user_state.get', (done) => {

        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);
        request.params.route = 'user_state';

        let correctResult = { "status": 200 };

        server(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');

            done();
        }).catch(done);

    });

});
