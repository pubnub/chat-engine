
const waterfall = require('async/waterfall');
const axios = require('axios');

const Emitter = require('../modules/emitter');
const Event = require('../components/event');
const User = require('../components/user');

/**
 This is the root {@link Chat} class that represents a chat room

 @param {String} [channel=new Date().getTime()] A unique identifier for this chat {@link Chat}. The channel is the unique name of a {@link Chat}, and is usually something like "The Watercooler", "Support", or "Off Topic". See [PubNub Channels](https://support.pubnub.com/support/solutions/articles/14000045182-what-is-a-channel-).
 @param {Boolean} [needGrant=true] This Chat has restricted permissions and we need to authenticate ourselves in order to connect.
 @param {Boolean} [autoConnect=true] Connect to this chat as soon as its initiated. If set to ```false```, call the {@link Chat#connect} method to connect to this {@link Chat}.
 @param {String} [group='default'] Groups chat into a "type". This is the key which chats will be grouped into within {@link ChatEngine.session} object.
 @extends Emitter
 @fires Chat#$"."ready
 @fires Chat#$"."state
 @fires Chat#$"."online
 @fires Chat#$"."offline
 */
class Chat extends Emitter {

    constructor(chatEngine, channel = new Date().getTime(), needGrant = true, autoConnect = true, group = 'default') {

        super(chatEngine);

        this.chatEngine = chatEngine;

        this.name = 'Chat';

        /**
         * A string identifier for the Chat room.
         * @type String
         * @readonly
         * @see [PubNub Channels](https://support.pubnub.com/support/solutions/articles/14000045182-what-is-a-channel-)
         */
        this.channel = channel.toString();

        // public.* has PubNub permissions for everyone to read and write
        // private.* is totally locked down and users must be granted access one by one
        let chanPrivString = 'public.';

        if (needGrant) {
            chanPrivString = 'private.';
        }

        if (this.channel.indexOf(chatEngine.ceConfig.globalChannel) === -1) {
            this.channel = [chatEngine.ceConfig.globalChannel, 'chat', chanPrivString, channel].join('#');
        }

        /**
        * Does this chat require new {@link User}s to be granted explicit access to this room?
        * @type Boolean
        * @readonly
        */
        this.isPrivate = needGrant;

        /**
        * This is the key which chats will be grouped into within {@link ChatEngine.session} object.
        * @type String
        * @readonly
        */
        this.group = group;

        /**
         A list of users in this {@link Chat}. Automatically kept in sync as users join and leave the chat.
         Use [$.join](/Chat.html#event:$%2522.%2522join) and related events to get notified when this changes

         @type Object
         @readonly
         */
        this.users = {};

        /**
         A map of {@link Event} bound to this {@link Chat}

         @private
         @type Object
         @readonly
         */
        this.events = {};

        /**
         Updates list of {@link User}s in this {@link Chat}
         based on who is online now.

         @private
         @param {Object} status The response status
         @param {Object} response The response payload object
         */
        this.onHereNow = (status, response) => {

            if (status.error) {

                /**
                 * There was a problem fetching the presence of this chat
                 * @event Chat#$"."error"."presence
                 */
                chatEngine.throwError(this, 'trigger', 'presence', new Error('Getting presence of this Chat. Make sure PubNub presence is enabled for this key'), {
                    error: status.errorData,
                    errorText: status.errorData.response.text
                });

            } else {

                // get the list of occupants in this channel
                let occupants = response.channels[this.channel].occupants;

                // format the userList for rltm.js standard
                occupants.forEach((occupant) => {
                    this.userUpdate(occupant.uuid, occupant.state);
                });

            }

        };

        /**
         * Get messages that have been published to the network before this client was connected.
         * Events are published with the ```$history``` prefix. So for example, if you had the event ```message```,
         * you would call ```Chat.history('message')``` and subscribe to history events via ```chat.on('$history.message', (data) => {})```.
         *
         * @param {String} event The name of the event we're getting history for
         * @param {Object} [config] The PubNub history config for this call
         * @tutorial history
         */
        this.history = (event, config = {}) => {

            // create the event if it does not exist
            this.events[event] = this.events[event] || new Event(chatEngine, this, event);

            // set the PubNub configured channel to this channel
            config.channel = this.events[event].channel;

            // run the PubNub history method for this event
            chatEngine.pubnub.history(config, (status, response) => {

                if (status.error) {

                    /**
                     * There was a problem fetching the history of this chat
                     * @event Chat#$"."error"."history
                     */
                    chatEngine.throwError(this, 'trigger', 'history', new Error('There was a problem fetching the history. Make sure history is enabled for this PubNub key.'), {
                        errorText: status.errorData.response.text,
                        error: status.error,
                    });

                } else {

                    response.messages.forEach((message) => {

                        if (message.entry.event === event) {

                            /**
                             * Fired by the {@link Chat#history} call. Emits old events again. Events are prepended with
                             * ```$.history.``` to distinguish it from the original live events.
                             * @event Chat#$"."history"."*
                             * @tutorial history
                             */
                            this.trigger(['$', 'history', event].join('.'), message.entry);

                        }

                    });

                }
            });

        };

        /**
        * Turns a {@link Chat} into a JSON representation.
        * @return {Object}
        */
        this.objectify = () => {

            return {
                channel: this.channel,
                group: this.group,
                private: this.isPrivate
            };

        };

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
        this.invite = (user) => {

            let complete = () => {

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

            };

            axios.post(chatEngine.ceConfig.endpoint + '/chat/invite', {
                authKey: chatEngine.pnConfig.authKey,
                uuid: user.uuid,
                myUUID: chatEngine.me.uuid,
                authData: chatEngine.me.authData,
                chat: this.objectify()
            })
                .then(() => {
                    complete();
                })
                .catch((error) => {
                    chatEngine.throwError(this, 'trigger', 'auth', new Error('Something went wrong while making a request to authentication server.'), { error });
                });

        };

        /**
         Keep track of {@link User}s in the room by subscribing to PubNub presence events.

         @private
         @param {Object} data The PubNub presence response for this event
         */
        this.onPresence = (presenceEvent) => {

            // make sure channel matches this channel
            if (this.channel === presenceEvent.channel) {

                // someone joins channel
                if (presenceEvent.action === 'join') {

                    let user = this.createUser(presenceEvent.uuid, presenceEvent.state);

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
                    this.trigger('$.online.join', { user });

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

        };

        /**
         * Boolean value that indicates of the Chat is connected to the network
         * @type {Boolean}
         */
        this.connected = false;

        /**
         * @private
         */
        this.onPrep = () => {

            if (!this.connected) {

                if (!chatEngine.pubnub) {
                    chatEngine.throwError(this, 'trigger', 'setup', new Error('You must call ChatEngine.connect() and wait for the $.ready event before creating new Chats.'));
                }

                // listen to all PubNub events for this Chat
                chatEngine.pubnub.addListener({
                    message: this.onMessage,
                    presence: this.onPresence
                });

                // subscribe to the PubNub channel for this Chat
                chatEngine.pubnub.subscribe({
                    channels: [this.channel],
                    withPresence: true
                });

            }

        };

        /**
         * @private
         */
        this.grant = () => {

            let createChat = () => {

                axios.post(chatEngine.ceConfig.endpoint + '/chats', {
                    globalChannel: chatEngine.ceConfig.globalChannel,
                    authKey: chatEngine.pnConfig.authKey,
                    uuid: chatEngine.pnConfig.uuid,
                    authData: chatEngine.me.authData,
                    chat: this.objectify()
                })
                    .then(() => {
                        this.onPrep();
                    })
                    .catch((error) => {
                        chatEngine.throwError(this, 'trigger', 'auth', new Error('Something went wrong while making a request to authentication server.'), { error });
                    });
            };

            axios.post(chatEngine.ceConfig.endpoint + '/chat/grant', {
                globalChannel: chatEngine.ceConfig.globalChannel,
                authKey: chatEngine.pnConfig.authKey,
                uuid: chatEngine.pnConfig.uuid,
                authData: chatEngine.me.authData,
                chat: this.objectify()
            })
                .then(() => {
                    createChat();
                })
                .catch((error) => {
                    chatEngine.throwError(this, 'trigger', 'auth', new Error('Something went wrong while making a request to authentication server.'), { error });
                });

        };

        /**
         * Connect to PubNub servers to initialize the chat.
         * @example
         * // create a new chatroom, but don't connect to it automatically
         * let chat = new Chat('some-chat', false)
         *
         * // connect to the chat when we feel like it
         * chat.connect();
         */
        this.connect = () => {
            this.grant();
        };

        if (autoConnect) {
            this.grant();
        }

        chatEngine.chats[this.channel] = this;

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

        // create a standardized payload object
        let payload = {
            data, // the data supplied from params
            sender: this.chatEngine.me.uuid, // my own uuid
            chat: this, // an instance of this chat
        };

        // run the plugin queue to modify the event
        this.runPluginQueue('emit', event, (next) => {
            next(null, payload);
        }, (err, pluginResponse) => {

            // remove chat otherwise it would be serialized
            // instead, it's rebuilt on the other end.
            // see this.trigger
            delete pluginResponse.chat;

            // publish the event and data over the configured channel

            // ensure the event exists within the global space
            this.events[event] = this.events[event] || new Event(this.chatEngine, this, event);

            this.events[event].publish(pluginResponse);

        });

    }

    /**
     Broadcasts an event locally to all listeners.

     @private
     @param {String} event The event name
     @param {Object} payload The event payload object
     */

    trigger(event, payload) {

        let complete = () => {

            // let plugins modify the event
            this.runPluginQueue('on', event, (next) => {
                next(null, payload);
            }, (err, pluginResponse) => {
                // emit this event to any listener
                this._emit(event, pluginResponse);
            });

        };

        // this can be made into plugin
        if (typeof payload === 'object') {

            // restore chat in payload
            if (!payload.chat) {
                payload.chat = this;
            }

            // if we should try to restore the sender property
            if (payload.sender) {

                // this use already exists in memory
                if (this.chatEngine.users[payload.sender]) {
                    payload.sender = this.chatEngine.users[payload.sender];
                    complete();
                } else {

                    // the user doesn't exist, create it
                    payload.sender = new User(this.chatEngine, payload.sender);

                    // try to get stored state from server
                    payload.sender._getState(this, () => {
                        console.log('state not set', payload.sender.state);
                        complete();
                    });

                }

            } else {
                // there's no "sender" in this object, move on
                complete();
            }

        } else {
            // payload is not an object, we want nothing to do with it.
            complete();
        }

    }

    /**
     Add a user to the {@link Chat}, creating it if it doesn't already exist.

     @private
     @param {String} uuid The user uuid
     @param {Object} state The user initial state
     @param {Boolean} trigger Force a trigger that this user is online
     */
    createUser(uuid, state) {

        // Ensure that this user exists in the global list
        // so we can reference it from here out
        this.chatEngine.users[uuid] = this.chatEngine.users[uuid] || new User(this.chatEngine, uuid);

        this.chatEngine.users[uuid].addChat(this, state);

        // trigger the join event over this chatroom
        if (!this.users[uuid]) {

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
            this.trigger('$.online.here', {
                user: this.chatEngine.users[uuid]
            });

        }

        // store this user in the chatroom
        this.users[uuid] = this.chatEngine.users[uuid];

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
        this.chatEngine.users[uuid] = this.chatEngine.users[uuid] || new User(this.chatEngine, uuid);

        // if we don't know about this user
        if (!this.users[uuid]) {
            // do the whole join thing
            this.createUser(uuid, state);
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
     * Leave from the {@link Chat} on behalf of {@link Me}.
     * @fires Chat#event:$"."offline"."leave
     * @example
     * chat.leave();
     */
    leave() {

        // unsubscribe from the channel locally
        this.chatEngine.pubnub.unsubscribe({
            channels: [this.channel]
        });

        // delete the chat in the remote list
        axios.delete(this.chatEngine.ceConfig.endpoint + '/chats', {
            data: {
                globalChannel: this.chatEngine.ceConfig.globalChannel,
                authKey: this.chatEngine.pnConfig.authKey,
                uuid: this.chatEngine.pnConfig.uuid,
                authData: this.chatEngine.me.authData,
                chat: this.objectify()
            } })
            .then(() => {})
            .catch((error) => {
                this.chatEngine.throwError(this, 'trigger', 'auth', new Error('Something went wrong while making a request to chat server.'), { error });
            });

    }

    /**
     Perform updates when a user has left the {@link Chat}.

     @private
     */
    userLeave(uuid) {

        // make sure this event is real, user may have already left
        if (this.users[uuid]) {

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
            this.trigger('$.offline.leave', {
                user: this.users[uuid]
            });

            // remove the user from the local list of users
            delete this.users[uuid];

            // we don't remove the user from the global list,
            // because they may be online in other channels

        } else {

            // that user isn't in the user list
            // we never knew about this user or they already left

            // console.log('user already left');
        }
    }

    /**
     Fired when a user disconnects from the {@link Chat}

     @private
     @param {String} uuid The uuid of the {@link Chat} that left
     */
    userDisconnect(uuid) {

        // make sure this event is real, user may have already left
        if (this.users[uuid]) {

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

            this.trigger('$.offline.disconnect', { user: this.users[uuid] });
        }

    }

    /**
     Load plugins and attach a queue of functions to execute before and
     after events are trigger or received.

     @private
     @param {String} location Where in the middleeware the event should run (emit, trigger)
     @param {String} event The event name
     @param {String} first The first function to run before the plugins have run
     @param {String} last The last function to run after the plugins have run
     */
    runPluginQueue(location, event, first, last) {

        // this assembles a queue of functions to run as middleware
        // event is a triggered event key
        let pluginQueue = [];

        // the first function is always required
        pluginQueue.push(first);

        // look through the configured plugins
        this.plugins.forEach((pluginItem) => {
            // if they have defined a function to run specifically
            // for this event
            if (pluginItem.middleware && pluginItem.middleware[location] && pluginItem.middleware[location][event]) {
                // add the function to the queue
                pluginQueue.push(pluginItem.middleware[location][event]);
            }
        });

        // waterfall runs the functions in assigned order
        // waiting for one to complete before moving to the next
        // when it's done, the ```last``` parameter is called
        waterfall(pluginQueue, last);

    }

    /**
     Set the state for {@link Me} within this {@link User}.
     Broadcasts the ```$.state``` event on other clients

     @private
     @param {Object} state The new state {@link Me} will have within this {@link User}
     */
    setState(state) {
        this.chatEngine.pubnub.setState({ state, channels: [this.chatEngine.global.channel] }, () => {
            // handle status, response
        });
    }

    onConnectionReady() {

        /**
         * Broadcast that the {@link Chat} is connected to the network.
         * @event Chat#$"."connected
         * @example
         * chat.on('$.connected', () => {
                *     console.log('chat is ready to go!');
                * });
         */
        this.connected = true;

        // get a list of users online now
        // ask PubNub for information about connected users in this channel
        this.chatEngine.pubnub.hereNow({
            channels: [this.channel],
            includeUUIDs: true,
            includeState: true
        }, (status, response) => {
            // trigger that SDK is ready before emitting online events
            this.trigger('$.connected');
            this.onHereNow(status, response);
        });

    }

}

module.exports = Chat;
