module.exports = (conifg) => {

    return {
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
