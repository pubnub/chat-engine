"use strict";

const defaults = {timeout: 1000};

var plugin = function(config) {

    config = config || {timeout: 1000};

    let isTyping = false;
    let stopTypingTimeout = null;
    
    let GroupChat = {
        startTyping: function() {

            if(!isTyping) {

                isTyping = true;

                this.parent.publish('startTyping');

                setTimeout (() => {
                    this.stopTyping();   
                }, config.timeout);

            }

        },
        stopTyping: function() {

            if(isTyping) {
                clearTimeout(stopTypingTimeout);
                this.parent.publish('stopTyping');   
                isTyping = false;
            }

        }

    }

    return {
        namespace: 'typing',
        extends: {
            GroupChat
        }
    }

}

if(typeof module !== "undefined") {
    module.exports = plugin;
} else {
    window.OCF.plugin.typingIndicator = plugin;
}
