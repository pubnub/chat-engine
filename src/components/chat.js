const axios = require('axios');

const Emitter = require('../modules/emitter');
const Event = require('../components/event');
const User = require('../components/user');
const Search = require('../components/search');

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
module.exports = class Chat extends Emitter {

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

        if (this.channel.indexOf(this.chatEngine.ceConfig.globalChannel) === -1) {
            this.channel = [this.chatEngine.ceConfig.globalChannel, 'chat', chanPrivString, channel].join('#');
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
         * Boolean value that indicates of the Chat is connected to the network
         * @type {Boolean}
         */
        this.connected = false;

        if (autoConnect) {
            this.connect();
        }

        this.chatEngine.chats[this.channel] = this;

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
            this.chatEngine.throwError(this, 'trigger', 'presence', new Error('Getting presence of this Chat. Make sure PubNub presence is enabled for this key'), status);

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
     * Call PubNub history in a loop.
     * Unapologetically stolen from https://www.pubnub.com/docs/web-javascript/storage-and-history
     * @param  {[type]}   args     [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     * @private
     */
    _pageHistory(event, args, callback) {

        args.pagesize = args.pagesize || 100;
        args.countEmitted = args.countEmitted || 0;

        this.chatEngine.pubnub.history({
            // search starting from this timetoken
            // start: args.startToken,
            channel: args.channel,
            // false - search forwards through the timeline
            // true - search backwards through the timeline
            reverse: args.reverse,
            // limit number of messages per request to this value; default/max=100
            count: args.pagesize,
            // include each returned message's publish timetoken
            includeTimetoken: true,
            // prevents JS from truncating 17 digit timetokens
            stringifiedTimeToken: true
        }, (status, response) => {

            if (status.error) {

                /**
                 * There was a problem fetching the history of this chat
                 * @event Chat#$"."error"."history
                 */
                this.chatEngine.throwError(this, 'trigger', 'history', new Error('There was a problem fetching the history. Make sure history is enabled for this PubNub key.'), status);

            } else {

                // holds the accumulation of resulting messages across all iterations
                let count = args.count || 0;
                // timetoken of the first message in response
                let firstTT = response.startTimeToken;
                // timetoken of the last message in response
                let lastTT = response.endTimeToken;
                // if no max results specified, default to 500
                args.max = !args.max ? 500 : args.max;

                Object.keys(response.messages).forEach((key) => {

                    if (response.messages[key]
                        && response.messages[key].entry.event === event) {

                        let thisEvent = ['$', 'history', event].join('.');

                        if (count < args.max) {

                            /**
                             * Fired by the {@link Chat#history} call. Emits old events again. Events are prepended with
                             * ```$.history.``` to distinguish it from the original live events.
                             * @event Chat#$"."history"."*
                             * @tutorial history
                             */
                            this.trigger(thisEvent, response.messages[key].entry);
                            count += 1;

                        }

                    }

                });

                // we keep asking for more messages if # messages returned by last request is the
                // same at the pagesize AND we still have reached the total number of messages requested
                // same as the opposit of !(msgs.length < pagesize || total == max)
                if (response.messages.length === args.pagesize && count < args.max) {

                    this._pageHistory(event, {
                        channel: args.channel,
                        max: args.max,
                        reverse: args.reverse,
                        pagesize: args.pagesize,
                        startToken: args.reverse ? lastTT : firstTT,
                        event: args.event,
                        count,
                        countEmitted: args.countEmitted
                    }, callback);

                } else {
                    // we've reached the end of possible messages to retrieve or hit the 'max' we asked for
                    // so invoke the callback to the original caller of getMessages providing the total message results
                    callback();
                }

            }

        });
    }

    /**
     * Get messages that have been published to the network before this client was connected.
     * Events are published with the ```$history``` prefix. So for example, if you had the event ```message```,
     * you would call ```Chat.history('message')``` and subscribe to history events via ```chat.on('$history.message', (data) => {})```.
     *
     * @param {String} event The name of the event we're getting history for
     * @param {Object} [config] The PubNub history config for this call
     * @tutorial history
     */
    history(event, config = {}, done = () => {}) {

        // create the event if it does not exist
        this.events[event] = this.events[event] || new Event(this.chatEngine, this, event);

        // set the PubNub configured channel to this channel
        config.channel = this.events[event].channel;

        this._pageHistory(event, config, done);

    }

    /**
    * Turns a {@link Chat} into a JSON representation.
    * @return {Object}
    */
    objectify() {

        return {
            channel: this.channel,
            group: this.group,
            private: this.isPrivate
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

        axios.post(this.chatEngine.ceConfig.endpoint + '/chat/invite', {
            authKey: this.chatEngine.pnConfig.authKey,
            uuid: user.uuid,
            myUUID: this.chatEngine.me.uuid,
            authData: this.chatEngine.me.authData,
            chat: this.objectify()
        })
            .then(() => {
                complete();
            })
            .catch((error) => {
                this.chatEngine.throwError(this, 'trigger', 'auth', new Error('Something went wrong while making a request to authentication server.'), { error });
            });

    }

    /**
     Keep track of {@link User}s in the room by subscribing to PubNub presence events.

     @private
     @param {Object} data The PubNub presence response for this event
     */
    onPresence(presenceEvent) {

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

                // It's possible for PubNub to send us both a join and have the user appear in here_now
                // Avoid firing duplicate $.online events.
                if (!this.users[user.uuid]) {
                    this.trigger('$.online.join', { user });
                }

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

    }

    /**
     * @private
     */
    onPrep() {

        if (!this.connected) {

            if (!this.chatEngine.pubnub) {
                this.chatEngine.throwError(this, 'trigger', 'setup', new Error('You must call ChatEngine.connect() and wait for the $.ready event before creating new Chats.'));
            }

            // this will trigger ready callbacks

            // subscribe to the PubNub channel for this Chat
            this.chatEngine.pubnub.subscribe({
                channels: [this.channel],
                withPresence: true
            });

        }

    }

    /**
     * @private
     */
    grant() {

        let createChat = () => {

            axios.post(this.chatEngine.ceConfig.endpoint + '/chats', {
                globalChannel: this.chatEngine.ceConfig.globalChannel,
                authKey: this.chatEngine.pnConfig.authKey,
                uuid: this.chatEngine.pnConfig.uuid,
                authData: this.chatEngine.me.authData,
                chat: this.objectify()
            })
                .then(() => {
                    this.onPrep();
                })
                .catch((error) => {
                    this.chatEngine.throwError(this, 'trigger', 'auth', new Error('Something went wrong while making a request to authentication server.'), { error });
                });
        };

        axios.post(this.chatEngine.ceConfig.endpoint + '/chat/grant', {
            globalChannel: this.chatEngine.ceConfig.globalChannel,
            authKey: this.chatEngine.pnConfig.authKey,
            uuid: this.chatEngine.pnConfig.uuid,
            authData: this.chatEngine.me.authData,
            chat: this.objectify()
        })
            .then(() => {
                createChat();
            })
            .catch((error) => {
                this.chatEngine.throwError(this, 'trigger', 'auth', new Error('Something went wrong while making a request to authentication server.'), { error });
            });

    }

    /**
     * Connect to PubNub servers to initialize the chat.
     * @example
     * // create a new chatroom, but don't connect to it automatically
     * let chat = new Chat('some-chat', false)
     *
     * // connect to the chat when we feel like it
     * chat.connect();
     */
    connect() {
        this.grant();
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

        this.chatEngine.users[uuid].assign(state);

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


        this.connected = false;

        this.trigger('$.disconnected');

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

    /**
     Search through previously emitted events. Parameters act as AND operators. Returns an instance of the emitter based {@link History}. Will
     which will emit all old events unless ```config.event``` is supplied.
     @param {Object} [config] The search configuration object.
     @param {Object} [config] Our configuration for the PubNub history request. See the [PubNub History](https://www.pubnub.com/docs/web-javascript/storage-and-history) docs for more information on these parameters.
     @param {Event} [config.event] The {@link Event} to search for.
     @param {User} [config.sender] The {@link User} who sent the message.
     @param {Number} [config.limit=20] The maximum number of results to return that match search criteria. Search will continue operating until it returns this number of results or it reached the end of history.
     @param {Number} [config.start=0] The timetoken to begin searching between.
     @param {Number} [config.end=0] The timetoken to end searching between.
     @param {Boolean} [config.reverse=false] Search oldest messages first.
     @return {@link History}
     @example
    chat.search({
        event: 'my-custom-event',
        sender: ChatEngine.me,
        limit: 20
    }).on('my-custom-event', (a) => {
        console.log('this is an old event!');
    }).on('$.search.finish', () => {
        assert.equal(count, 50, 'correct # of results');
        done();
    });
     */
    search(config) {
        return new Search(this.chatEngine, this, config);
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
        this.trigger('$.connected');

        this.connected = true;

        // get a list of users online now
        // ask PubNub for information about connected users in this channel
        this.chatEngine.pubnub.hereNow({
            channels: [this.channel],
            includeUUIDs: true,
            includeState: true
        }, this.onHereNow.bind(this));

        // listen to all PubNub events for this Chat
        this.chatEngine.pubnub.addListener({
            presence: this.onPresence.bind(this)
        });

    }

};
