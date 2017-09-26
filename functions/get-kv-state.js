// rest endpoint/state
export default (request, response) => {

    const pubnub = require('pubnub');
    const kvstore = require('kvstore');
    const xhr = require('xhr');

    let headersObject = request.headers;
    let paramsObject = request.params;
    let methodString = request.method;
    let bodyString = request.body;

    console.log('request',request); // Log the request envelope passed
    // Query parameters passed are parsed into the request.params object for you
    // console.log(paramsObject.a) // This would print "5" for query string "a=5

    // Set the status code - by default it would return 200
    response.status = 200;

    let key = paramsObject.globalChannel + ':' + paramsObject.uuid + ':state';

    console.log(key)

    return kvstore.get(key).then((state) => {

        return response.send(state);
    })

    // return request.json().then((body) => {
    // }).catch((err) => {
    //     // console.log(err)
    //     return response.send("Malformed JSON body.");
    // });
};
