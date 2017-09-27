const User = require('./user');

/**
 Represents the client connection as a special {@link User} with write permissions.
 Has the ability to update it's state on the network. An instance of
 {@link Me} is returned by the ```ChatEngine.connect()```
 method.

 @class Me
 @param {String} uuid The uuid of this user
 @extends User
 */
class Me extends User {

    constructor(chatEngine, uuid, authData) {

        // call the User constructor
        super(chatEngine, uuid);

        this.name = 'Me';

        this.authData = authData;
        this.chatEngine = chatEngine;

        this.direct.on('$.server.chat.created', (payload) => {
            chatEngine.addChatToSession(payload.chat);
        });


        this.direct.on('$.server.chat.deleted', (payload) => {
            chatEngine.removeChatFromSession(payload.chat);
        });

    }

    // assign updates from network
    assign(state) {
        // we call "update" because calling "super.assign"
        // will direct back to "this.update" which creates
        // a loop of network updates
        super.update(state);
    }

    /**
     * Update {@link Me}'s state in a {@link Chat}. All other {@link User}s
     * will be notified of this change via ```$.state```.
     * Retrieve state at any time with {@link User#state}.
     * @param {Object} state The new state for {@link Me}
     * @param {Chat} chat An instance of the {@link Chat} where state will be updated.
     * Defaults to ```ChatEngine.global```.
     * @fires Chat#event:$"."state
     * @example
     * // update state
     * me.update({value: true});
     */
    update(state, chat = this.chatEngine.global) {

        // run the root update function
        super.update(state, chat);

        // publish the update over the global channel
        this.chatEngine.global.setState(state);

    }

}

module.exports = Me;
