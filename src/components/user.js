const Emitter = require('../modules/emitter');

/**
 This is our User class which represents a connected client. User's are automatically created and managed by {@link Chat}s, but you can also instantiate them yourself.
 If a User has been created but has never been authenticated, you will recieve 403s when connecting to their feed or direct Chats.
 @class User
 @extends Emitter
 @extends RootEmitter
 @param uuid
 @param state
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
         * let state = user.state;
         */
        this.state = {};

        this._stateFetched = false;

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
        this.feed = new this.chatEngine.Chat([chatEngine.global.channel, 'user', uuid, 'read.', 'feed'].join('#'), false, this.constructor.name === 'Me', {}, 'system');

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
        this.direct = new this.chatEngine.Chat([chatEngine.global.channel, 'user', uuid, 'write.', 'direct'].join('#'), false, this.constructor.name === 'Me', {}, 'system');

        // if the user does not exist at all and we get enough
        // information to build the user
        if (!chatEngine.users[uuid]) {
            chatEngine.users[uuid] = this;
        }

        // update this user's state in it's created context
        this.assign(state);

        return this;

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
    Get stored user state from remote server.
    @private
    */
    _getState(callback) {

        if (!this._stateFetched) {

            this.chatEngine.pubnub.getState({
                uuid: this.uuid,
                channels: [this.chatEngine.global.channel]
            }, (status, response) => {

                if (status.statusCode === 200) {

                    let pnState = response.channels[this.chatEngine.global.channel];
                    if (Object.keys(pnState).length) {

                        this.assign(response.data);

                        this._stateFetched = true;
                        callback(this.state);

                    } else {

                        this.chatEngine.request('get', 'user_state', {
                            user: this.uuid
                        })
                            .then((res) => {

                                this.assign(res.data);

                                this._stateFetched = true;
                                callback(this.state);

                            })
                            .catch((err) => {
                                // console.log('this is hte err', err);
                                this.chatEngine.throwError(this, 'trigger', 'getState', err);
                            });

                    }

                } else {
                    this.chatEngine.throwError(this, 'trigger', 'getState', new Error('There was a problem getting state from the PubNub network.'));
                }

            });

        } else {
            callback(this.state);
        }

    }

}

module.exports = User;
