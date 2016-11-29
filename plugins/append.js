"use strict";

const defaults = {timeout: 1000};

module.exports = function(config) {

    config = config || {};

    config.publish = config.publish || " pub_append";
    config.subscribe = config.subscribe || " sub_append";

    let publish = {
        message: (payload, next) => {

            payload.data.text += config.publish;
            next(null, payload);

        }
    };

    let subscribe = {
        message: (payload, next) => {
        
            payload.data.text += config.subscribe;

            next(null, payload);

        }
    };

    return {
        middleware: {publish, subscribe}
    }

}
