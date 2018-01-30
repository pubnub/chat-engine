// js-on-after-presence
export default (request) => {
    const kvstore = require('kvstore');
    const xhr = require('xhr');

    if(request.message.action == 'state-change') {
        let key = request.channels[0].replace('-pnpres', '') + ':' + request.message.uuid + ':state';
        console.log('key is', key);
        kvstore.set(key, request.message.data);
    }

    return request.ok(); // Return a promise when you're done
}
