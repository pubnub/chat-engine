"use strict";

let plugin = (config) => {

    config = config || {timeout: 1000};

    let stopTypingTimeout = null;
    
    let typer = {
        startTyping: function() {

            this.parent.send('startTyping');

            stopTypingTimeout = setTimeout (() => {
                this.stopTyping();   
            }, config.timeout);

        },
        stopTyping: function() {

            clearTimeout(stopTypingTimeout);
            this.parent.send('stopTyping');   

        }

    }

    let publish = {
        message: (payload, next) => {
            payload.chat.typing.stopTyping();
            next(null, payload);
        }
    };

    return {
        namespace: 'typing',
        middleware: {
            publish
        },
        extends: {
            Chat: typer,
            GroupChat: typer
        }
    }

}

if(typeof module !== "undefined") {
    module.exports = plugin;
} else {
    window.OCF.plugin.typingIndicator = plugin;
}
