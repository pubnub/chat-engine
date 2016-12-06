"use strict";

module.exports = (config) => {

    config = config || {};

    config.publish = config.publish || " pub_append";
    config.subscribe = config.subscribe || " sub_append";

    let publish = {
        message: function(payload, next) {

            payload.data.text += config.publish;
            next(null, payload);

        }
    };

    let subscribe = {
        message: function(payload, next) {
        
            payload.data.text += config.subscribe;

            next(null, payload);

        }
    };

    return {
        middleware: {
            publish: publish, 
            subscribe: subscribe
        }
    }

}
