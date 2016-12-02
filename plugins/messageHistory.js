"use strict";

const defaults = {timeout: 1000};

let messageHistory = (config) => {

    let extender = {
        shift: function(data) {
            this.parent.history.messages.unshift(data);
        },
        messages: []
    }

    let subscribe = {
        message: function(payload, next) {

            payload.chat.history.shift(payload);
            next(null, payload);

        }
    };

    return {
        namespace: 'history',
        middleware: {subscribe},
        extends: {
            Chat: extender,
            GroupChat: extender
        }
    }

}


if(typeof module !== "undefined") {
    module.exports = messageHistory;
} else {
    window.OCF.plugin.messageHistory = messageHistory;
}
