OCF.typingIndicator = function(config) {

    config.timeout = config.timeout || 1000;
    
    OCF.Chat.prototype.startTyping = function() {
        this.publish('startTyping');
        setTimeout (() => {
            this.stopTyping();
        }, 1000);
    }
    OCF.Chat.prototype.stopTyping = function() {
        this.publish('stopTyping');
    }   

}
