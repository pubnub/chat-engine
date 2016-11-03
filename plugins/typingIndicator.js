"use strict";

const defaults = {timeout: 1000};

var plugin = function(config) {

    config = config || {timeout: 1000};

    let isTyping = false;
    let stopTypingTimeout = null;
    
    let typer = {
        startTyping: function() {

            if(!isTyping) {

                isTyping = true;

                console.log('start typing');
                this.parent.publish('startTyping');

                setTimeout (() => {
                    this.stopTyping();   
                }, config.timeout);

            }

        },
        stopTyping: function() {

            if(isTyping) {
                clearTimeout(stopTypingTimeout);
                console.log('stop typing');
                this.parent.publish('stopTyping');   
                isTyping = false;
            }

        }

    }

    return {
        namespace: 'typing',
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
