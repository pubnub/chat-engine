(function() {

    // adds support for restoring old events at boot
    // these events occurred before the client was loaded
    const namespace = 'history';

    // define our plugin values in root
    const defaults = {timeout: 1000};

    const plugin = (config) => {

        // define the methods that will exist within our namespace
        class extension {

            // construct is run automatically when plugin is added to Class
            construct(data) {

                // we can access the rltm room connection and call it's history method
                this.parent.room.history().then((response) => {

                    response.reverse();

                    // for every message we get back
                    for(let i in response) {


                        if(response[i].data) {
                            
                            // broadcast the same event with the same data
                            // but the event name is now history:name rather than just name
                            // to distinguish it from the original live events
                            this.parent.broadcast(
                                ['$' + namespace, response[i].data.message[0]].join('.'), 
                                response[i].data.message[1]);

                        } else {

                            // something went wrong, person probably doesn't have history enabled
                            throw new Error(response[i]);

                        }

                    }

                }, (error) => {
                    throw new Error('There was a problem getting message history', error);
                });

            }
        };

        // attach methods to Chat
        return {
            namespace,
            extends: {
                Chat: extension,
                GlobalChat: extension
            }
        }

    }


    if(typeof module !== "undefined") {
        module.exports = plugin;
    } else {
        window.OpenChatFramework.plugin[namespace] = plugin;
    }

})();
