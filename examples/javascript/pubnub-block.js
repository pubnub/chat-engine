// this is a pubnub block that will sms a given phone number every time a user
// sends a new message to the chatroom

// this should be a "After Publish" event handler 
// hooked up to your chat channel (ocf-javascript-demo)

const pubnub = require('pubnub');

// require xhr 
const xhr = require('xhr');
const auth = require('codec/auth');

export default (request) => {
    
    if(!request.message.data || !request.message.data.message || request.message.data.message[0] !== 'message') {
        return request.ok();
    }
    
    //  api key
    const apiUsername = 'YOUR_API_USERNAME';
    const apiKey = 'YOUR_API_KEY'

    // api endpoint
    const apiUrl = 'https://rest.clicksend.com/v3/sms/send';


    const channel = request.channels[0];

    // require for unit tests only
    const responseChannel = channel + '-response';

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: auth.basic(apiUsername, apiKey)
        },
        body: JSON.stringify({messages: [{
            source: "blocks",
            body: request.message.data.message[1].sender + 'says ' +  request.message.data.message[1].data.text,
            from: "clicksend",
            to: "+15128675309"
        }]})

    };

    // create a HTTP POST request to the sendgrid API
    return xhr.fetch(apiUrl, options).then((r) => {
        console.log(r);

        let testResponse = 0;
        if (r.status == 200) {
            testResponse = 1;
        }
        pubnub.publish({
            channel: responseChannel,
            message: testResponse
        });
        return request.ok()
    })
    .catch(e => {
        console.error(e);
        pubnub.publish({
            channel: responseChannel,
            message: 0
        });
        return request.ok();
    });
};
