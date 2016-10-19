"use strict";

const defaults = {timeout: 1000};

module.exports = function(config) {

    var publish = function(payload, next) {
        next(null, payload);
    }

    var subscribe = function(payload, next) {
        next(null, payload);
    }

    return {
        middleware: {publish, subscribe}
    }

}
