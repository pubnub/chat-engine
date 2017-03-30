const User = require('./User');

/**
* Represents the client connection as a {{#crossLink "User"}}{{/crossLink}}. 
* Has the ability to update it's state on the network. An instance of 
* {{#crossLink "Me"}}{{/crossLink}} is returned by the ```OCF.connect()```
* method. 
*
* @class Me
* @constructor
* @extend User
*/
module.exports = class Me extends User {

    constructor(uuid) {

        // call the User constructor
        super(uuid);

    }

    // assign updates from network
    assign(state, chat) {
        // we call "update" because calling "super.assign"
        // will direct back to "this.update" which creates
        // a loop of network updates
        super.update(state, chat);
    }

    /**
    * Update this user state over the network
    *
    * @method update
    * @param {Object} state The new state for {{#crossLink "Me"}}{{/crossLink}}
    * @param {Chat} chat An instance of the {{#crossLink "Chat"}}{{/crossLink}} where state will be updated.
    * Defaults to ```OCF.globalChat```.
    */
    update(state, chat = OCF.globalChat) {

        // run the root update function
        super.update(state, chat);

        // publish the update over the global channel
        chat.setState(state);

    }

}
