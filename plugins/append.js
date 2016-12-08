"use strict";

// this is an example of middleware used in our test.js
// adds some text to message before it's sent and when it's received
module.exports = (config) => {

    // create empty config object if not supplied
    config = config || {};

    // define defaults if config is empty
    config.publish = config.publish || " pub_append";
    config.subscribe = config.subscribe || " sub_append";

    // define middleware to run right before a message leaves the client
    // all OCF functions have run by now
    let publish = {
        message: function(payload, next) {

            // append config.publish to the text supplied in the event
            payload.data.text += config.publish;

            // continue along middleware
            next(null, payload);

        }
    };

    // define middleware to run after a message has been received and OCF has processed it
    let subscribe = {
        message: function(payload, next) {
        
            // append config.subscribe text to the payload
            payload.data.text += config.subscribe;

            // continue along middleware
            next(null, payload);

        }
    };

    // middleware tells the framework to use these functions when 
    // messages are sent or received
    return {
        middleware: {
            publish: publish, 
            subscribe: subscribe
        }
    }

}
