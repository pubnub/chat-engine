(function() {

    const namespace = 'append';

    // this is an example of middleware used in our test.js
    // adds some text to message before it's sent and when it's received
    const plugin = (config) => {

        // create empty config object if not supplied
        config = config || {};

        // define defaults if config is empty
        config.send = config.send || " pub_append";
        config.subscribe = config.subscribe || " sub_append";

        // define middleware to run right before a message leaves the client
        // all OCF functions have run by now
        let send = {
            message: function(payload, next) {

                // append config.send to the text supplied in the event
                payload.data.text += config.send;

                // continue along middleware
                next(null, payload);

            }
        };

        // define middleware to run after a message has been received and OCF has processed it
        let broadcast = {
            message: function(payload, next) {
            
                // append config.broadcast text to the payload
                payload.data.text += config.broadcast;

                // continue along middleware
                next(null, payload);

            }
        };

        // middleware tells the framework to use these functions when 
        // messages are sent or received
        return {
            namespace,
            middleware: {
                send: send, 
                broadcast: broadcast
            }
        }
    }

    if(typeof module !== "undefined") {
        module.exports = plugin;
    } else {
        window.OpenChatFramework.plugin[namespace] = plugin;
    }

})();
