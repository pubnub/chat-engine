
module.exports = (config) => {

    config.timeout = config.timeout || 1000;

    return {
        Chat: {
            startTyping: function() {
                this.publish('startTyping');
                setTimeout (() => {
                    this.stopTyping();
                }, config.timeout);
            },
            stopTyping: function() {
                this.publish('stopTyping');
            }   
        }
    }

}
