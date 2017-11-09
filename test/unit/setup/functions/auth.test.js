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
    "params": {},
    "json": () => {
        return Promise.resolve(JSON.parse(this.body || null));
    }
};

describe('#auth', () => {
    let auth;

    beforeEach(() => {
        auth = Mock('./setup/functions/auth.js');
    });

    it('creates auth event handler of type Function', (done) => {
        assert.isFunction(auth, 'was successfully created');
        done();
    });

    it('requests auth invite', (done) => {

        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);

        let testChannel = "testChannel";
        let testUuid = "testUuid";

        let proxyBody = JSON.stringify({
            "chat": {
                "private": true,
                "channel": testChannel
            },
            "uuid": testUuid
        });

        request.body = JSON.stringify({
            "body": proxyBody,
            "params": {
                "route": "invite"
            }
        });

        let preExistingValue = {};

        preExistingValue['authed:' + testChannel] = [testUuid];

        auth.mockKVStoreData(preExistingValue);

        let correctResult = {
            "status": 200
        };

        auth(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');

            done();
        }).catch(done);

    });

    it('requests auth invite unauthorized', (done) => {

        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);

        let testChannel = "testChannel";
        let testUuid = "testUuid";
        let wrongUuid = "wrongUuid";

        let proxyBody = JSON.stringify({
            "chat": {
                "private": true,
                "channel": testChannel
            },
            "uuid": testUuid
        });

        request.body = JSON.stringify({
            "body": proxyBody,
            "params": {
                "route": "invite"
            }
        });

        let preExistingValue = {};

        preExistingValue['authed:' + testChannel] = [wrongUuid];

        auth.mockKVStoreData(preExistingValue);

        let correctResult = {
            "status": 200
        };

        auth(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');

            done();
        }).catch(done);

    });

    it('requests auth invite not private', (done) => {

        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);
        let proxyBody = JSON.stringify({
            "chat": {}
        });

        request.body = JSON.stringify({
            "body": proxyBody,
            "params": {
                "route": "invite"
            }
        });

        let correctResult = {
            "status": 200
        };

        auth(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');

            done();
        }).catch(done);

    });

    it('requests auth grant', (done) => {

        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);

        let testChannel = "testChannel";
        let testUuid = "testUuid";

        let proxyBody = JSON.stringify({
            "chat": {
                "private": true,
                "channel": testChannel
            },
            "uuid": testUuid
        });

        request.body = JSON.stringify({
            "body": proxyBody,
            "params": {
                "route": "grant"
            }
        });

        let preExistingValue = {};

        preExistingValue['authed:' + testChannel] = [testUuid];

        auth.mockKVStoreData(preExistingValue);

        let correctResult = {
            "status": 200
        };

        auth(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');

            done();
        }).catch(done);

    });

    it('requests auth grant unauthorized', (done) => {

        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);

        let testChannel = "testChannel";
        let testUuid = "testUuid";
        let wrongUuid = "wrongUuid";

        let proxyBody = JSON.stringify({
            "chat": {
                "private": true,
                "channel": testChannel
            },
            "uuid": testUuid
        });

        request.body = JSON.stringify({
            "body": proxyBody,
            "params": {
                "route": "grant"
            }
        });

        let preExistingValue = {};

        preExistingValue['authed:' + testChannel] = [wrongUuid];

        auth.mockKVStoreData(preExistingValue);

        let correctResult = {
            "status": 200
        };

        auth(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');

            done();
        }).catch(done);

    });

    it('requests auth grant not private', (done) => {

        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);
        let proxyBody = JSON.stringify({
            "chat": {}
        });

        request.body = JSON.stringify({
            "body": proxyBody,
            "params": {
                "route": "grant"
            }
        });

        let correctResult = {
            "status": 200
        };

        auth(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');

            done();
        });

    });

    it('requests auth invalid route', (done) => {

        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);
        request.body = JSON.stringify({
            "body": "\"\"",
            "params": {
                "route": ""
            }
        });

        let correctResult = {
            "status": 200
        };

        auth(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');

            done();
        });

    });

});
