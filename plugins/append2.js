"use strict";

const defaults = {timeout: 1000};

module.exports = function(config) {

    let send = {
        message: (payload, next) => {

            payload.data.text += " pub_append 2";

            next(null, payload);
        }
    };

    let subscribe = {
        message: (payload, next) => {
            
            payload.data.text += " sub_append 2";

            next(null, payload);
        }
    };

    return {
        middleware: {send, subscribe}
    }

}
