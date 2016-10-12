module.exports = {
    Chat: {
        startTyping: function() {
            this.publish('startTyping');
            setTimeout (() => {
                this.stopTyping();
            }, 1000);
        },
        stopTyping: function() {
            this.publish('stopTyping');
        }   
    }
}
