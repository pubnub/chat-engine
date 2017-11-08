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

// endpointRequestObject.json = () => {
//     return Promise.resolve(JSON.parse(endpointRequestObject.body || null));
// }

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
            "to": testUuid,
            "chat": {
                "private": true,
                "channel": testChannel
            }
        });

        request.body = JSON.stringify({
            "body": proxyBody,
            "params": {
                "route": "invite"
            },
            "uuid": testUuid
        });

        let preExistingValue = {};

        preExistingValue['authed:' + testChannel] = testUuid;

        auth.mockKVStoreData(preExistingValue);

        let correctResult = {
            "status": 401 
        };

        auth(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');

            done();
        });

    });

    it('requests auth invite unauthorized', (done) => {

        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);

        let proxyBody = JSON.stringify({
            "chat": {
                "private": true
            }
        });

        request.body = JSON.stringify({
            "body": proxyBody,
            "params": {
                "route": "invite"
            }
        });

        let correctResult = {
            "status": 401 
        };

        auth(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');

            done();
        });

    });

    it('requests auth invite not private', (done) => {

        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);
        request.body = `{
            \"body\":\"{\\\"chat\\\":{}}\",
            \"message\":{},
            \"params\":{ \"route\":\"invite\" },
            \"chat\":{},
            \"uuid\":\"test\",
            \"to\":\"test\",
            \"method\":\"POST\"
        }`;

        let correctResult = {
            "status": 200 
        };

        auth(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');

            done();
        });

    });

    it('requests auth grant', (done) => {

        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);
        request.body = `{
            \"body\":\"{\\\"chat\\\":{}}\",
            \"message\":{},
            \"params\":{ \"route\":\"grant\" },
            \"chat\":{},
            \"uuid\":\"test\",
            \"to\":\"test\",
            \"method\":\"POST\"
        }`;

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
        request.body = `{
            \"body\":\"{\\\"chat\\\":{}}\",
            \"message\":{},
            \"params\":{ \"route\":\"\" },
            \"chat\":{},
            \"uuid\":\"test\",
            \"to\":\"test\",
            \"method\":\"POST\"
        }`;

        let correctResult = {
            "status": 200 
        };

        auth(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');

            done();
        });

    });

});
