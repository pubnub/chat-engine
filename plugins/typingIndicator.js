"use strict";

const plugin = (config) => {

    config = config || {timeout: 1000};

    let isTyping = false;
    let stopTypingTimeout = null;
    
    let typer = {
        startTyping: function() {

            if(!isTyping) {

                isTyping = true;

                this.parent.send('startTyping');

                setTimeout (() => {
                    this.stopTyping();   
                }, config.timeout);

            }

        },
        stopTyping: function() {

            if(isTyping) {
                clearTimeout(stopTypingTimeout);
                this.parent.send('stopTyping');   
                isTyping = false;
            }

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
