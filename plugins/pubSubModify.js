"use strict";

const defaults = {timeout: 1000};

module.exports = function(config) {

    var publish = function(payload, next) {
        
        console.log(payload.chat.me.id);
        next(null, payload);

    }

    var subscribe = function(payload, next) {
        
        console.log(payload.chat.me.id);
        next(null, payload);

    }

    return {
        middleware: {publish, subscribe}
    }

}
