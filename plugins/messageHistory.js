"use strict";

// adds support for restoring old events at boot
// these events occurred before the client was loaded

// define our plugin values in root
const defaults = {timeout: 1000};

let messageHistory = (config) => {

    // define the methods that will exist within our namespace
    let extension = {

        // construct is run automatically when plugin is added to Class
        construct: function(data) {

            // we can access the rltm room connection and call it's history method
            this.parent.room.history((response) => {

                // for every message we get back
                for(let i in response) {

                    // broadcast the same event with the same data
                    // but the event name is now history:name rather than just name
                    // to distinguish it from the original live events
                    this.parent.broadcast(
                        ['history', response[i].data.message[0]].join(':'), 
                        response[i].data.message[1]);

                }

            });

        }
    };

    // attach methods to Chat and GroupChat
    return {
        namespace: 'history',
        extends: {
            Chat: extension,
            GroupChat: extension
        }
    }

}


if(typeof module !== "undefined") {
    module.exports = messageHistory;
} else {
    window.OCF.plugin.messageHistory = messageHistory;
}
