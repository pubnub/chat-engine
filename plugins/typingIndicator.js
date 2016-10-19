"use strict";

const defaults = {timeout: 1000};

module.exports = function(config) {

    let isTyping = false;
    let stopTypingTimeout = null;
    
    let Chat = {
        startTyping: function() {

            if(!isTyping) {

                isTyping = true;

                this.publish('startTyping');

                setTimeout (() => {
                    this.stopTyping();   

                }, config.timeout);

            }

        },
        stopTyping: function() {

            if(isTyping) {
                clearTimeout(stopTypingTimeout);
                this.publish('stopTyping');   
                isTyping = false;
            }

        }

    }

    return {
        namespace: 'typing',
        extends: {
            Chat
        }
    }

}
