"use strict";

const defaults = {timeout: 1000};

module.exports = function(config) {

    var publish = {
        message: function(payload, next) {
            next(null, payload);
        }
    }

    var subscribe = {
        message: function(payload, next) {
            next(null, payload);
        }
    }

    return {
        middleware: {publish, subscribe}
    }

}
