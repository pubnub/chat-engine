module.exports = {
    Chat: {
        doStuff: function() {
            
            this.emitter.on('message', function(message) {
                console.log('plugin got message', message);
            });
            
        }   
    }
}
