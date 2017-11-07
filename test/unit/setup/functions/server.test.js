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

    beforeEach(() => {
        server = Mock('./setup/functions/server.js');
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
        });
    });

});