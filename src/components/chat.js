
const waterfall = require('async/waterfall');
const Emitter = require('../modules/emitter');
const Event = require('../components/event');
const Search = require('../components/search');

const augmentChat = require('../plugins/augment/chat');

/**
 This is the root {@link Chat} class that represents a chat room

 @param {String} [channel=new Date().getTime()] A unique identifier for this chat {@link Chat}. Must be alphanumeric. The channel is the unique name of a {@link Chat}, and is usually something like "The Watercooler", "Support", or "Off Topic". See [PubNub Channels](https://support.pubnub.com/support/solutions/articles/14000045182-what-is-a-channel-).
 @param {Boolean} [isPrivate=false] Attempt to authenticate ourselves before connecting to this {@link Chat}.
 @param {Boolean} [autoConnect=true] Connect to this chat as soon as its initiated. If set to ```false```, call the {@link Chat#connect} method to connect to this {@link Chat}.
 @param {Object} [meta={}] Chat metadata that will be persisted on the server and populated on creation.
 @param {String} [group='default'] Groups chat into a "type". This is the key which chats will be grouped into within {@link Me.session} object.
 @class Chat
 @extends Emitter
 @extends RootEmitter
 @fires Chat#$"."ready
 @fires Chat#$"."state
 @fires Chat#$"."online"."*
 @fires Chat#$"."offline"."*
 */
class Chat extends Emitter {

    constructor(chatEngine, channel = new Date().getTime(), isPrivate = false, autoConnect = true, meta = {}, group = 'custom') {

        super(chatEngine);

        this.chatEngine = chatEngine;

        this.name = 'Chat';

        this.plugin(augmentChat(this));

        /**
        * Classify the chat within some group, Valid options are 'system', 'fixed', or 'custom'.
        * @type Boolean
        * @readonly
        * @private
        */
        this.group = group;

        /**
        * Excludes all users from reading or writing to the {@link chat} unless they have been explicitly invited via {@link Chat#invite};
        * @type Boolean
        * @readonly
        */
        this.isPrivate = isPrivate;

        /**
         * Chat metadata persisted on the server. Useful for storing things like the name and description. Call {@link Chat#update} to update the remote information.
         * @type Object
         * @readonly
         */
        this.meta = meta || {};

        /**
         * A string identifier for the Chat room. Any chat with an identical channel will be able to communicate with one another.
         * @type String
         * @readonly
         * @see [PubNub Channels](https://support.pubnub.com/support/solutions/articles/14000045182-what-is-a-channel-)
         */
        this.channel = this.chatEngine.augmentChannel(channel, this.isPrivate);

        /**
         A list of users in this {@link Chat}. Automatically kept in sync as users join and leave the chat.
         Use [$.join](/Chat.html#event:$%2522.%2522join) and related events to get notified when this changes

         @type Object
         @readonly
         */
        this.users = {};

        /**
         * Boolean value that indicates of the Chat is connected to the network
         * @type {Boolean}
         */
        this.connected = false;

        /**
         * Keep a record if we've every successfully connected to this chat before.
         * @type {Boolean}
         */
        this.hasConnected = false;

        /**
         * If user manually disconnects via {@link ChatEngine#disconnect}, the
         * chat is put to "sleep". If a connection is reestablished
         * via {@link ChatEngine#reconnect}, sleeping chats reconnect automatically.
         * @type {Boolean}
         */
        this.asleep = false;

        this.chatEngine.chats[this.channel] = this;

        if (autoConnect) {
            this.connect();
        }

        return this;

    }

    /**
     Updates list of {@link User}s in this {@link Chat}
     based on who is online now.

     @private
     @param {Object} status The response status
     @param {Object} response The response payload object
     */
    onHereNow(status, response) {

        if (status.error) {

            /**
             * There was a problem fetching the presence of this chat
             * @event Chat#$"."error"."presence
             */
            this.chatEngine.throwError(this, 'trigger', 'presence', new Error('Getting presence of this Chat. Make sure PubNub presence is enabled for this key'));

        } else {

            // get the list of occupants in this channel
            let occupants = response.channels[this.channel].occupants;

            // format the userList for rltm.js standard
            occupants.forEach((occupant) => {
                this.userUpdate(occupant.uuid, occupant.state);
            });

        }

    }

    /**
    * Turns a {@link Chat} into a JSON representation.
    * @return {Object}
    */
    objectify() {

        return {
            channel: this.channel,
            group: this.group,
            private: this.isPrivate,
            meta: this.meta
        };

    }

    /**
     * Invite a user to this Chat. Authorizes the invited user in the Chat and sends them an invite via {@link User#direct}.
     * @param {User} user The {@link User} to invite to this chatroom.
     * @fires Me#event:$"."invite
     * @example
     * // one user running ChatEngine
     * let secretChat = new ChatEngine.Chat('secret-channel');
     * secretChat.invite(someoneElse);
     *
     * // someoneElse in another instance of ChatEngine
     * me.direct.on('$.invite', (payload) => {
     *     let secretChat = new ChatEngine.Chat(payload.data.channel);
     * });
     */
    invite(user) {

        this.chatEngine.request('post', 'invite', {
            to: user.uuid,
            chat: this.objectify()
        })
            .then(() => {

                let send = () => {

                    /**
                     * Notifies {@link Me} that they've been invited to a new private {@link Chat}.
                     * Fired by the {@link Chat#invite} method.
                     * @event Me#$"."invite
                     * @tutorial private
                     * @example
                     * me.direct.on('$.invite', (payload) => {
                     *    let privChat = new ChatEngine.Chat(payload.data.channel));
                     * });
                     */
                    user.direct.emit('$.invite', {
                        channel: this.channel
                    });

                };

                if (!user.direct.connected) {
                    user.direct.connect();
                    user.direct.on('$.connected', send);
                } else {
                    send();
                }

            })
            .catch((error) => {
                this.chatEngine.throwError(this, 'trigger', 'search', new Error('Something went wrong while making a request to authentication server.'), { error });
            });

    }

    /**
     Keep track of {@link User}s in the room by subscribing to PubNub presence events.

     @private
     @param {Object} data The PubNub presence response for this event
     */
    onPresence(presenceEvent) {

        // make sure channel matches this channel

        // someone joins channel
        if (presenceEvent.action === 'join') {
            this.userJoin(presenceEvent.uuid, presenceEvent.state);
        }

        // someone leaves channel
        if (presenceEvent.action === 'leave') {
            this.userLeave(presenceEvent.uuid);
        }

        // someone timesout
        if (presenceEvent.action === 'timeout') {
            this.userDisconnect(presenceEvent.uuid);
        }

        // someone's state is updated
        if (presenceEvent.action === 'state-change') {
            this.userUpdate(presenceEvent.uuid, presenceEvent.state);
        }

    }

    /**
     * Update the {@link Chat} metadata on the server.
     * @param  {object} data JSON object representing chat metadta.
     */
    update(data) {

        let oldMeta = this.meta || {};
        this.meta = Object.assign(oldMeta, data);

        this.chatEngine.request('post', 'chat', {
            chat: this.objectify()
        }).then(() => {
        }).catch((error) => {
            this.chatEngine.throwError(this, 'trigger', 'chat', new Error('Something went wrong while making a request to chat server.'), { error });
        });

    }

    /**
     * Send events to other clients in this {@link User}.
     * Events are trigger over the network  and all events are made
     * on behalf of {@link Me}
     *
     * @param {String} event The event name
     * @param {Object} data The event payload object
     * @example
     * chat.emit('custom-event', {value: true});
     * chat.on('custom-event', (payload) => {
      *     console.log(payload.sender.uuid, 'emitted the value', payload.data.value);
      * });
     */
    emit(event, data) {

        if (event === 'message' && typeof data !== 'object') {
            throw new Error('the payload has to be an object');
        }

        // create a standardized payload object
        let payload = {
            data, // the data supplied from params
            sender: this.chatEngine.me.uuid, // my own uuid
            chat: this, // an instance of this chat
            event,
            chatengineSDK: this.chatEngine.package.version
        };

        let tracer = new Event(this.chatEngine, this, event);

        // run the plugin queue to modify the event
        this.runPluginQueue('emit', event, (next) => {
            next(null, payload);
        }, (err, pluginResponse) => {

            // remove chat otherwise it would be serialized
            // instead, it's rebuilt on the other end.
            // see this.trigger
            delete pluginResponse.chat;

            // publish the event and data over the configured channel
            tracer.publish(pluginResponse);

        });

        return tracer;

    }

    /**
     Add a user to the {@link Chat}, creating it if it doesn't already exist.

     @private
     @param {String} uuid The user uuid
     @param {Object} state The user initial state
     @param {Boolean} trigger Force a trigger that this user is online
     */
    userJoin(uuid, state) {

        // Ensure that this user exists in the global list
        // so we can reference it from here out
        this.chatEngine.users[uuid] = this.chatEngine.users[uuid] || new this.chatEngine.User(uuid);
        this.chatEngine.users[uuid].assign(state);

        // check if the user already exists within the chatroom
        // so we know if we need to notify or not
        let userAlreadyHere = this.users[uuid];

        // assign the user to the chatroom
        this.users[uuid] = this.chatEngine.users[uuid];

        // trigger the join event over this chatroom
        if (userAlreadyHere) {

            /**
             * Broadcast that a {@link User} has come online. This is when
             * the framework firsts learn of a user. This can be triggered
             * by, ```$.join```, or other network events that
             * notify the framework of a new user.
             *
             * @event Chat#$"."online"."here
             * @param {Object} data The payload returned by the event
             * @param {User} data.user The {@link User} that came online
             * @example
             * chat.on('$.online.here', (data) => {
                      *     console.log('User has come online:', data.user);
                      * });
             */

            this.trigger('$.online.here', { user: this.users[uuid] });

        } else {

            /**
             * Fired when a {@link User} has joined the room.
             *
             * @event Chat#$"."online"."join
             * @param {Object} data The payload returned by the event
             * @param {User} data.user The {@link User} that came online
             * @example
             * chat.on('$.join', (data) => {
             *     console.log('User has joined the room!', data.user);
             * });
             */

            this.trigger('$.online.join', { user: this.users[uuid] });

        }

        // return the instance of this user
        return this.chatEngine.users[uuid];

    }

    /**
     * Update a user's state.
     * @private
     * @param {String} uuid The {@link User} uuid
     * @param {Object} state State to update for the user
     */
    userUpdate(uuid, state) {

        // ensure the user exists within the global space
        this.chatEngine.users[uuid] = this.chatEngine.users[uuid] || new this.chatEngine.User(uuid);

        // if we don't know about this user
        if (!this.users[uuid]) {
            // do the whole join thing
            this.userJoin(uuid, state);
        }

        // update this user's state in this chatroom
        this.users[uuid].assign(state);

        /**
         * Broadcast that a {@link User} has changed state.
         * @event ChatEngine#$"."state
         * @param {Object} data The payload returned by the event
         * @param {User} data.user The {@link User} that changed state
         * @param {Object} data.state The new user state
         * @example
         * ChatEngine.on('$.state', (data) => {
         *     console.log('User has changed state:', data.user, 'new state:', data.state);
         * });
         */
        this.chatEngine._emit('$.state', {
            user: this.users[uuid],
            state: this.users[uuid].state
        });

    }

    /**
     * Called by {@link ChatEngine#disconnect}. Fires disconnection notifications
     * and stores "sleep" state in memory. Sleep means the Chat was previously connected.
     * @private
     */
    sleep() {

        if (this.connected) {
            this.onDisconnected();
            this.asleep = true;
        }
    }

    /**
     * Called by {@link ChatEngine#reconnect}. Wakes the Chat up from sleep state.
     * Re-authenticates with the server, and fires connection events once established.
     * @private
     */
    wake() {

        if (this.asleep) {
            this.handshake(() => {
                this.onConnected();
            });
        }

    }

    /**
     * Fired upon successful connection to the network.
     * @private
     */
    onConnected() {
        this.connected = true;
        this.trigger('$.connected');
    }

    /**
     * Fires upon disconnection from the network through any means.
     * @private
     */
    onDisconnected() {
        this.connected = false;
        this.trigger('$.disconnected');
    }
    /**
     * Fires upon manually invoked leaving.
     * @private
     */
    onLeave() {
        this.trigger('$.left');
        this.onDisconnected();
    }

    /**
     * Leave from the {@link Chat} on behalf of {@link Me}. Disconnects from the {@link Chat} and will stop
     * receiving events.
     * @fires Chat#event:$"."offline"."leave
     * @example
     * chat.leave();
     */
    leave() {

        // unsubscribe from the channel locally
        this.chatEngine.pubnub.unsubscribe({
            channels: [this.channel]
        });

        // tell the server we left
        this.chatEngine.request('post', 'leave', { chat: this.objectify() })
            .then(() => {

                // trigger the disconnect events and update state
                this.onLeave();

                // tell the chat we've left
                this.emit('$.system.leave', { subject: this.objectify() });

                // tell session we've left
                if (this.chatEngine.me.session) {
                    this.chatEngine.me.session.leave(this);
                }

            })
            .catch((error) => {
                this.chatEngine.throwError(this, 'trigger', 'chat', new Error('Something went wrong while making a request to chat server.'), { error });
            });

    }

    /**
     Perform updates when a user has left the {@link Chat}.

     @private
     */
    userLeave(uuid) {

        // store a temporary reference to send with our event
        let user = this.users[uuid];

        // remove the user from the local list of users
        // we don't remove the user from the global list,
        // because they may be online in other channels
        delete this.users[uuid];

        // make sure this event is real, user may have already left
        if (user) {

            // if a user leaves, trigger the event

            /**
             * Fired when a {@link User} intentionally leaves a {@link Chat}.
             *
             * @event Chat#$"."offline"."leave
             * @param {Object} data The data payload from the event
             * @param {User} user The {@link User} that has left the room
             * @example
             * chat.on('$.offline.leave', (data) => {
                      *     console.log('User left the room manually:', data.user);
                      * });
             */
            this.trigger('$.offline.leave', { user });

        }

    }

    /**
     Fired when a user disconnects from the {@link Chat}

     @private
     @param {String} uuid The uuid of the {@link Chat} that left
     */
    userDisconnect(uuid) {

        let user = this.users[uuid];
        delete this.users[uuid];

        // make sure this event is real, user may have already left
        if (user) {

            /**
             * Fired specifically when a {@link User} looses network connection
             * to the {@link Chat} involuntarily.
             *
             * @event Chat#$"."offline"."disconnect
             * @param {Object} data The {@link User} that disconnected
             * @param {Object} data.user The {@link User} that disconnected
             * @example
             * chat.on('$.offline.disconnect', (data) => {
             *     console.log('User disconnected from the network:', data.user);
             * });
             */
            this.trigger('$.offline.disconnect', { user });

        }

    }

    /**
     Set the state for {@link Me} within this {@link User}.
     Broadcasts the ```$.state``` event on other clients

     @private
     @param {Object} state The new state {@link Me} will have within this {@link User}
     */
    setState(state, callback) {
        this.chatEngine.pubnub.setState({ state, channels: [this.chatEngine.global.channel] }, callback);
    }

    /**
     Search through previously emitted events. Parameters act as AND operators. Returns an instance of the emitter based {@link History}. Will
     which will emit all old events unless ```config.event``` is supplied.
     @param {Object} [config] Our configuration for the PubNub history request. See the [PubNub History](https://www.pubnub.com/docs/web-javascript/storage-and-history) docs for more information on these parameters.
     @param {Event} [config.event] The {@link Event} to search for.
     @param {User} [config.sender] The {@link User} who sent the message.
     @param {Number} [config.pages=10] The maximum number of history requests which {@link ChatEngine} will do automatically to fulfill `limit` requirement.
     @param {Number} [config.limit=20] The maximum number of results to return that match search criteria. Search will continue operating until it returns this number of results or it reached the end of history. Limit will be ignored in case if both 'start' and 'end' timetokens has been passed in search configuration.
     @param {Number} [config.count=100] The maximum number of messages which can be fetched with single history request.
     @param {Number} [config.start=0] The timetoken to begin searching between.
     @param {Number} [config.end=0] The timetoken to end searching between.
     @param {Boolean} [config.reverse=false] Search oldest messages first.
     @return {Search}
     @example
    chat.search({
        event: 'my-custom-event',
        sender: ChatEngine.me,
        limit: 20
    }).on('my-custom-event', (event) => {
        console.log('this is an old event!', event);
    }).on('$.search.finish', () => {
        console.log('we have all our results!')
    });
     */
    search(config) {

        if (this.hasConnected) {
            return new Search(this.chatEngine, this, config);
        } else {
            this.chatEngine.throwError(this, 'trigger', 'search', new Error('You must wait for the $.connected event before calling Chat#search'));
        }

    }

    /**
     * Fired when the chat first connects to network.
     * @private
     */
    connectionReady() {

        this.connected = true;
        this.hasConnected = true;

        /**
         * Broadcast that the {@link Chat} is connected to the network.
         * @event Chat#$"."connected
         * @example
         * chat.on('$.connected', () => {
         *     console.log('chat is ready to go!');
         * });
         */
        this.onConnected();

        if (this.chatEngine.me.session) {
            this.chatEngine.me.session.join(this);
        }

        // add self to list of users
        this.users[this.chatEngine.me.uuid] = this.chatEngine.me;

        // trigger my own online event
        this.trigger('$.online.join', {
            user: this.chatEngine.me
        });

        // global channel updates are triggered manually, only get presence on custom chats
        if (this.channel !== this.chatEngine.global.channel && this.group === 'custom') {

            this.getUserUpdates();

            // we may miss updates, so call this again 5 seconds later
            setTimeout(() => {
                this.getUserUpdates();
            }, 5000);

        }

        this.on('$.system.leave', (payload) => {
            this.userLeave(payload.sender.uuid);
        });

    }

    /**
     * Ask PubNub for information about {@link User}s in this {@link Chat}.
     * @private
     */
    getUserUpdates() {

        // get a list of users online now
        // ask PubNub for information about connected users in this channel
        this.chatEngine.pubnub.hereNow({
            channels: [this.channel],
            includeUUIDs: true,
            includeState: true
        }, (s, r) => {
            this.onHereNow(s, r);
        });

    }

    /**
     * Establish authentication with the server, then subscribe with PubNub.
     * @fires Chat#$"."ready
     * @example
     * // create a new chatroom, but don't connect to it automatically
     * let chat = new Chat('some-chat', false, false);
     *
     * // connect to the chat when we feel like it
     * chat.connect();
     */
    connect() {

        // establish good will with the server
        this.handshake(() => {

            // now that we've got connection, do everything else via connectionReady
            this.connectionReady();

        });

    }

    /**
     * Connect to PubNub servers to initialize the chat.
     * @private
     */
    handshake(complete) {

        waterfall([
            (next) => {
                if (!this.chatEngine.pubnub) {
                    next('You must call ChatEngine.connect() and wait for the $.ready event before creating new Chats.');
                } else {
                    next();
                }
            },
            (next) => {

                this.chatEngine.request('post', 'grant', { chat: this.objectify() })
                    .then(() => {
                        next();
                    })
                    .catch(next);

            },
            (next) => {

                this.chatEngine.request('post', 'join', { chat: this.objectify() })
                    .then(() => {
                        next();
                    })
                    .catch(next);

            },
            (next) => {


                if (this.chatEngine.ceConfig.enableMeta) {

                    this.chatEngine.request('get', 'chat', {}, { channel: this.channel })
                        .then((response) => {

                            // asign metadata locally
                            if (response.data.found) {
                                this.meta = response.data.chat.meta;
                            } else {
                                this.update(this.meta);
                            }

                            next();

                        })
                        .catch(next);

                } else {
                    next();
                }

            }
        ], (error) => {

            if (error) {
                this.chatEngine.throwError(this, 'trigger', 'auth', new Error('Something went wrong while making a request to authentication server.'), { error });
            } else {
                complete();
            }
        });

    }

}

module.exports = Chat;
