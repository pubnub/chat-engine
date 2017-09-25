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
    assign(state, chat) {
        // we call "update" because calling "super.assign"
        // will direct back to "this.update" which creates
        // a loop of network updates
        super.update(state, chat);
    }

    /**
     * Update {@link Me}'s state in a {@link Chat}. All {@link User}s in
     * the {@link Chat} will be notified of this change via ($.update)[Chat.html#event:$%2522.%2522state].
     * Retrieve state at any time with {@link User#state}.
     * @param {Object} state The new state for {@link Me}
     * @param {Chat} chat An instance of the {@link Chat} where state will be updated.
     * Defaults to ```ChatEngine.global```.
     * @fires Chat#event:$"."state
     * @example
     * // update global state
     * me.update({value: true});
     *
     * // update state in specific chat
     * let chat = new ChatEngine.Chat('some-chat');
     * me.update({value: true}, chat);
     */
    update(state, chat = this.chatEngine.global) {

        // run the root update function
        super.update(state, chat);

        // publish the update over the global channel
        this.chatEngine.global.setState(state);

    }

}

module.exports = Me;
