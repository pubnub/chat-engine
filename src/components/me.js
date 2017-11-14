const User = require('./user');

/**
 Represents the client connection as a special {@link User} with write permissions.
 Has the ability to update it's state on the network. An instance of
 {@link Me} is returned by the ```ChatEngine.connect()```
 method.

 @class Me
 @extends User
 @extends Emitter
 @extends RootEmitter
 @param {String} uuid The uuid of this user
 */
class Me extends User {

    constructor(chatEngine, uuid, authData) {

        // call the User constructor
        super(chatEngine, uuid);

        this.name = 'Me';

        this.authData = authData;
        this.chatEngine = chatEngine;

        /**
         * Stores a map of {@link Chat} objects that this {@link Me} has joined across all clients.
         * @type {Object}
         */
        this.session = {};

        this.sync = new this.chatEngine.Chat([chatEngine.global.channel, 'user', uuid, 'me.', 'sync'].join('#'), false, true, {}, 'system');

        this.sync.on('$.session.chat.join', (payload) => {
            this.addChatToSession(payload.data.subject);
        });

        this.sync.on('$.session.chat.leave', (payload) => {
            this.removeChatFromSession(payload.data.subject);
        });

        return this;

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
    update(state) {

        // run the root update function
        super.update(state);

        // publish the update over the global channel
        this.chatEngine.global.setState(state);

    }

    /**
    Stores {@link Chat} within ```ChatEngine.session``` keyed based on the ```chat.group``` property.
    @param {Object} chat JSON object representing {@link Chat}. Originally supplied via {@link Chat#objectify}.
    @private
    */
    addChatToSession(chat) {

        // create the chat group if it doesn't exist
        this.session[chat.group] = this.session[chat.group] || {};

        // check the chat exists within the global list but is not grouped
        let existingChat = this.chatEngine.chats[chat.channel];

        // if it exists
        if (existingChat) {
            // assign it to the group
            this.session[chat.group][chat.channel] = existingChat;
        } else {

            // otherwise, try to recreate it with the server information
            this.session[chat.group][chat.channel] = new this.chatEngine.Chat(chat.channel, chat.private, false, chat.meta, chat.group);

            /**
            Fired when another identical instance of {@link ChatEngine} and {@link Me} joins a {@link Chat} that this instance of {@link ChatEngine} is unaware of.
            Used to synchronize ChatEngine sessions between desktop and mobile, duplicate windows, etc.
            ChatEngine stores sessions on the server side identified by {@link User#uuid}.
            @event Me#$"."session"."chat"."join
            @example
            *
            * // Logged in as "Ian" in first window
            * ChatEngine.me.on('$.session.chat.join', (data) => {
            *     console.log('I joined a new chat in a second window!', data.chat);
            * });
            *
            * // Logged in as "Ian" in second window
            * new ChatEngine.Chat('another-chat');
            */
            // this.trigger('$.session.chat.join', {
            //     chat: this.session[chat.group][chat.channel]
            // });
            //
            this.trigger('$.session.chat.join', { chat: this.session[chat.group][chat.channel] });

        }

    }

    /**
    Removes {@link Chat} within this.session
    @private
    */
    removeChatFromSession(chat) {

        if (this.session[chat.group] && this.session[chat.group][chat.channel]) {

            chat = this.session[chat.group][chat.channel] || chat;

            /**
            * Fired when another identical instance of {@link ChatEngine} with an identical {@link Me} leaves a {@link Chat} via {@link Chat#leave}.
            * @event Me#$"."session"."chat"."leave
            */

            delete this.chatEngine.chats[chat.channel];
            delete this.session[chat.group][chat.channel];

            this.trigger('$.session.chat.leave', { chat });

        }

    }

}

module.exports = Me;
