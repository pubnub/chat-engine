"use strict";

const defaults = {timeout: 1000};

let plugin = function(config) {

    let isTyping = false;
    let stopTypingTimeout = null;
    
    OCF.Chat.prototype.startTyping = function() {

        if(!isTyping) {

            isTyping = true;

            this.publish('startTyping');

            setTimeout (() => {
                this.stopTyping();
            }, config.timeout);

        }

    }

    OCF.Chat.prototype.stopTyping = function() {

        if(isTyping) {
            clearTimeout(stopTypingTimeout);
            this.publish('stopTyping');   
            isTyping = false;
        }

    }

}

OCF.typingIndicator = new OCF.Plugin(defaults, plugin);
