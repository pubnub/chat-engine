const User = require('./User');

/**
* Same as User, but has permission to update state on network
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
    * @param {Object} chat
    */
    update(state, chat = OCF.globalChat) {

        // run the root update function
        super.update(state, chat);

        // publish the update over the global channel
        chat.setState(state);

    }

}
