const Emitter = require('../modules/emitter');

/**
This is our User class which represents a connected client. User's are automatically created and managed by {@link Chat}s, but you can also instantiate them yourself.
If a User has been created but has never been authenticated, you will recieve 403s when connecting to their feed or direct Chats.
@class User
@extends Emitter
@extends RootEmitter
@param {User#uuid} uuid A unique identifier for this user.
@param {User#state} state The {@link User}'s state object synchronized between all clients of the chat.
 */
class User extends Emitter {

    constructor(chatEngine, uuid, state = {}) {

        super();

        this.chatEngine = chatEngine;

        this.name = 'User';

        /**
         The User's unique identifier, usually a device uuid. This helps ChatEngine identify the user between events. This is public id exposed to the network.
         Check out [the wikipedia page on UUIDs](https://en.wikipedia.org/wiki/Universally_unique_identifier).

         @readonly
         @type String
         */
        this.uuid = uuid.toString();

        /**
         * Gets the user state. See {@link Me#update} for how to assign state values.
         * @return {Object} Returns a generic JSON object containing state information.
         * @example
         *
         * // State
         * let state = user.state;
         */
        this.states = {};

        this._stateSet = {};

        /**
         * Feed is a Chat that only streams things a User does, like
         * 'startTyping' or 'idle' events for example. Anybody can subscribe
         * to a User's feed, but only the User can publish to it. Users will
         * not be able to converse in this channel.
         *
         * @type Chat
         * @example
         * // me
         * me.feed.emit('update', 'I may be away from my computer right now');
         *
         * // another instance
         * them.feed.connect();
         * them.feed.on('update', (payload) => {})
         */

        // grants for these chats are done on auth. Even though they're marked private, they are locked down via the server
        this.feed = new this.chatEngine.Chat([this.chatEngine.ceConfig.namespace, 'user', uuid, 'read.', 'feed'].join('#'), false, this.constructor.name === 'Me', {}, 'system');

        /**
         * Direct is a private channel that anybody can publish to but only
         * the user can subscribe to. Great for pushing notifications or
         * inviting to other chats. Users will not be able to communicate
         * with one another inside of this chat. Check out the
         * {@link Chat#invite} method for private chats utilizing
         * {@link User#direct}.
         *
         * @type Chat
         * @example
         * // me
         * me.direct.on('private-message', (payload) -> {
        *     console.log(payload.sender.uuid, 'sent your a direct message');
        * });
         *
         * // another instance
         * them.direct.connect();
         * them.direct.emit('private-message', {secret: 42});
         */
        this.direct = new this.chatEngine.Chat([this.chatEngine.ceConfig.namespace, 'user', uuid, 'write.', 'direct'].join('#'), false, this.constructor.name === 'Me', {}, 'system');

        // if the user does not exist at all and we get enough
        // information to build the user
        if (!chatEngine.users[uuid]) {
            chatEngine.users[uuid] = this;
        }

        return this;

    }

    state(chat = this.chatEngine.global) {

        console.log(chat)

        if (!chat) {
            this.chatEngine.throwError(this, 'trigger', 'state', new Error('No chat specified for state lookup.'));
        } else {
            return this.states[chat.channel] || {};
        }

    }

    /**
     * @private
     * @param {Object} state The new state for the user
     */
    assign(state, chat = this.chatEngine.global) {

        if (!chat) {
            this.chatEngine.throwError(this, 'trigger', 'state', new Error('No chat specified for state assign.'));
        } else if (state && Object.keys(state).length) {

            let oldState = this.states[chat.channel] || {};
            this.states[chat.channel] = Object.assign(oldState, state);

            this._stateSet[chat.channel] = true;

        }

    }

    /**
     this is only called from network updates

     @private
     */
    update(state, chat = this.chatEngine.global) {

        if (!chat) {
            this.chatEngine.throwError(this, 'trigger', 'state', new Error('No chat specified for state update.'));
        } else {
            this.assign(state, chat);
        }
    }

    /**
    Get stored user state from remote server.
    @private
    */
    _getStoredState(chat = false, callback) {

        if (!chat) {
            this.chatEngine.throwError(this, 'trigger', 'getState', new Error('No chat supplied'));
        } else if (!this._stateSet[chat.channel]) {

            this.chatEngine.request('get', 'user_state', {
                user: this.uuid,
                channel: chat.channel
            }).then((res) => {

                this.assign(res.data, chat);
                callback(this.states[chat.channel]);

            }).catch((err) => {
                this.chatEngine.throwError(this, 'trigger', 'getState', err);
            });

        } else {
            callback(this.states[chat.channel]);
        }

    }


}

module.exports = User;
