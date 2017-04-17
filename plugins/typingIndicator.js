(function() {

    const namespace = 'typingIndicator';

    // adds shortcuts to build "ianjennings is typing..." functionality into your app
    const plugin = (config) => {

        // set the default for typing
        // if the client types input, we wont fire "stopTyping" unless the client 
        // doesn't type anything for this timeout
        config = config || {timeout: 1000};

        // create a place to store the setTimeout in
        let stopTypingTimeout = null;
        
        // define the methods that will be attached to the class Chat
        class extension  {
            construct() {

                // keep comms on a new channel so we don't flood chat channel
                this.chat = new this.OCF.Chat('$' + namespace + new Date());

                // forward events via broadcast
                this.chat.on('$typingIndicator.startTyping', (event) => {
                    this.parent.broadcast('$typingIndicator.startTyping', event);
                });

                this.chat.on('$typingIndicator.stopTyping', (event) => {
                    this.parent.broadcast('$typingIndicator.stopTyping', event);
                });

                // will set Chat.typing.isTyping to false immediately
                this.isTyping = false;

            }
            startTyping() {

                // this is called manually by the client

                // set boolean that we're in middle of typing
                this.isTyping = true;

                // send an event over the network that this user started typing
                this.chat.send(['$' + namespace, 'startTyping'].join('.'));

                // kill any existing timeouts
                clearTimeout(stopTypingTimeout);

                // create a new timeout
                stopTypingTimeout = setTimeout (() => {

                    // trigger stop typing after a set amount of time
                    this.stopTyping();   

                }, config.timeout);

            }
            stopTyping() {

                // we must be currently typing to stop typing
                if(this.isTyping) {
                    
                    // remove the timeout
                    clearTimeout(stopTypingTimeout);
                    
                    // broadcast a stoptyping event
                    this.chat.send(['$' + namespace, 'stopTyping'].join('.'));      

                    // stop typing indicator
                    this.isTyping = false;

                }

            }
        }

        // define send middleware
        let send = {
            message: (payload, next) => {

                // it's worth noting here, we can't access ```extension``` here
                // because this function runs in a different context

                // on every message, tell the chat to stop typing
                payload.chat.typingIndicator.stopTyping();

                // continue on
                next(null, payload);
            }
        };

        // define both the extended methods and the middleware in our plugin
        return {
            namespace: 'typingIndicator',
            extends: {
                Chat: extension,
                GlobalChat: extension
            },
            middleware: {
                send
            }
        }

    }

    if(typeof module !== "undefined") {
        module.exports = plugin;
    } else {
        window.OpenChatFramework.plugin[namespace] = plugin;
    }

})();
