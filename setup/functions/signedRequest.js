export default (request, response) => {

    const pubnub = require('pubnub');
    const kvstore = require('kvstore');
    const xhr = require('xhr');
    const crypto = require('crypto');
    const queryStringCodec = require('codec/query_string');
    const base64Codec = require('codec/base64');

    let keys = {
        "subKey": "sub-c-a3da7f1c-bfe7-11e7-a9bc-9af884579700",
        "pubKey": "pub-c-311175ef-cdc1-4da9-9b70-f3e129bb220e",
        "secKey": "sec-c-ZjVlYmI3MTktMjQ0OS00YzUyLWI5ZDgtY2JmZmViZWE2MzAy"
    };

    function quote(s) {
      return encodeURIComponent(s).replace(/[!~*'()]/g, (c) => `%${c.charCodeAt(0).toString(16)}`);
    }

    let path = `/v1/channel-registration/sub-key/${keys.subKey}/channel-group/group1`;
    let options = {};

    options.add = 'test-channel';
    options.uuid = 'some-uuid';

    options.timestamp = Math.floor(Date.now() / 1000);

    const params = Object.keys(options).sort().map((k) => `${k}=${quote(options[k])}`).join('&');
    const signString = `${keys.subKey}\n${keys.pubKey}\n${path}\n${params}`;

    return crypto.hmac(base64Codec.btoa(keys.secKey), signString, crypto.ALGORITHM.HMAC_SHA256).then((signature) => {

        options.signature = signature;

        const query = queryStringCodec.stringify(options);

        console.log(query);

        return xhr.fetch(`https://ps.pndsn.com${path}?${query}`)
        .then((serverResponse) => {
            console.log(serverResponse)

            return response.send();
        }).catch((err) => {
            console.log(err)
            return response.send();
        });


    }).catch((error) => {
        console.log(error)
        return response.send();
    });


};
