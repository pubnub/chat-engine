const axios = require('axios');

const Emitter = require('../modules/emitter');

/**
 This is our User class which represents a connected client. User's are automatically created and managed by {@link Chat}s, but you can also instantiate them yourself.
 If a User has been created but has never been authenticated, you will recieve 403s when connecting to their feed or direct Chats.
 @class
 @extends Emitter
 @param uuid
 @param state
 @param chat
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
        this.uuid = uuid;

        /**
         * Gets the user state. See {@link Me#update} for how to assign state values.
         * @return {Object} Returns a generic JSON object containing state information.
         * @example
         *
         * // State
         * let state = user.state();
         */
        this.state = {};

        /**
         * An object containing the Chats this {@link User} is currently in. The key of each item in the object is the {@link Chat.channel} and the value is the {@link Chat} object. Note that for privacy, this map will only contain {@link Chat}s that the client ({@link Me}) is also connected to.
         *
         * @readonly
         * @type Object
         * @example
         *{
                *    "globalChannel": {
                *        channel: "globalChannel",
                *        users: {
                *            //...
                *        },
                *    },
                *    // ...
                * }
         */
        this.chats = {};

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

        const Chat = require('../components/chat');

        // grants for these chats are done on auth. Even though they're marked private, they are locked down via the server
        this.feed = new Chat(chatEngine, [chatEngine.global.channel, 'user', uuid, 'read.', 'feed'].join('#'), false, this.constructor.name === 'Me', 'feed');

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
        this.direct = new Chat(chatEngine, [chatEngine.global.channel, 'user', uuid, 'write.', 'direct'].join('#'), false, this.constructor.name === 'Me', 'direct');

        // if the user does not exist at all and we get enough
        // information to build the user
        if (!chatEngine.users[uuid]) {
            chatEngine.users[uuid] = this;
        }

        // update this user's state in it's created context
        this.assign(state);

    }

    /**
     * @private
     * @param {Object} state The new state for the user
     * @param {Chat} chat Chatroom to retrieve state from
     */
    update(state) {
        let oldState = this.state || {};
        this.state = Object.assign(oldState, state);
    }

    /**
     this is only called from network updates

     @private
     */
    assign(state) {
        this.update(state);
    }

    /**
     adds a chat to this user

     @private
     */
    addChat(chat, state) {

        // store the chat in this user object
        this.chats[chat.channel] = chat;

        // updates the user's state in that chatroom
        this.assign(state, chat);
    }

    /**
    Get stored user state from remote server.
    @private
    */
    _getState(chat, callback) {
        const url = 'https://pubsub.pubnub.com/v1/blocks/sub-key/' + this.chatEngine.pnConfig.subscribeKey + '/state?globalChannel=' + this.chatEngine.ceConfig.globalChannel + '&uuid=' + this.uuid;
        axios.get(url)
            .then((response) => {
                this.assign(response.data);
                callback();
            })
            .catch(() => {
                this.chatEngine.throwError(chat, 'trigger', 'getState', new Error('There was a problem getting state from the PubNub network.'));
            });

    }

}

module.exports = User;
