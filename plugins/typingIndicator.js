"use strict";

const defaults = {timeout: 1000};

let plugin = function(config) {
    
    OCF.Chat.prototype.startTyping = function() {

        this.publish('startTyping');
        setTimeout (() => {
            this.stopTyping();
        }, config.timeout);

    }

    OCF.Chat.prototype.stopTyping = function() {

        this.publish('stopTyping');
        
    }

}

OCF.typingIndicator = new OCF.Plugin(plugin, plugin);
