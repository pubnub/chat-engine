const axios = require('axios');
const PubNub = require('pubnub');
const pack = require('../package.json');

const RootEmitter = require('./modules/root_emitter');
const Chat = require('./components/chat');
const Me = require('./components/me');
const User = require('./components/user');
const waterfall = require('async/waterfall');

/**
@class ChatEngine
@extends RootEmitter
@fires ChatEngine#$"."ready
@return {ChatEngine} Returns an instance of {@link ChatEngine}
*/
module.exports = (ceConfig = {}, pnConfig = {}) => {

    // Create the root ChatEngine object
    let ChatEngine = new RootEmitter();

    ChatEngine.ceConfig = ceConfig;
    ChatEngine.pnConfig = pnConfig;

    /**
     * A map of all known {@link User}s in this instance of ChatEngine.
     * @type {Object}
     * @memberof ChatEngine
     */
    ChatEngine.users = {};

    /**
     * A map of all known {@link Chat}s in this instance of ChatEngine.
     * @memberof ChatEngine
     * @type {Object}
     */
    ChatEngine.chats = {};

    /**
     * This instance of ChatEngine represented as a special {@link User} know as {@link Me}.
     * @member {Me} me
     * @memberof ChatEngine
     */
    ChatEngine.me = false;

    /**
     * An instance of PubNub, the networking infrastructure that powers the realtime communication between {@link User}s in {@link Chats}.
     * @member {Object} pubnub
     * @memberof ChatEngine
     */
    ChatEngine.pubnub = false;

    /**
     * A global {@link Chat} that all {@link User}s join when they connect to ChatEngine. Useful for announcements, alerts, and global events.
     * @member {Chat} global
     * @memberof ChatEngine
     */
    ChatEngine.global = false;

    /**
     * Indicates if ChatEngine has fired the {@link ChatEngine#$"."ready} event.
     * @member {Object} ready
     * @memberof ChatEngine
     */
    ChatEngine.ready = false;

    /**
     * The package.json for ChatEngine. Used mainly for detecting package version.
     * @type {Object}
     */
    ChatEngine.package = pack;

    ChatEngine.throwError = (self, cb, key, ceError, payload = false) => {

        if (ceConfig.throwErrors) {
            // throw ceError;
            console.error(payload || ceError);
        }

        payload = payload || {};
        payload.ceError = ceError.toString();

        self[cb](['$', 'error', key].join('.'), payload);

    };

    if (ceConfig.debug) {

        ChatEngine.onAny((event, payload) => {
            console.info('debug:', event, payload);
        });

    }

    if (ceConfig.profile) {

        let countObject = {};

        ChatEngine.onAny((event) => {
            countObject['event: ' + event] = countObject[event] || 0;
            countObject['event: ' + event] += 1;
        });

        setInterval(() => {

            countObject.chats = Object.keys(ChatEngine.chats).length;
            countObject.users = Object.keys(ChatEngine.users).length;

            console.table(countObject);

        }, 3000);

    }

    ChatEngine.protoPlugins = {};

    /**
     * Bind a plugin to all future instances of a Class.
     * @method ChatEngine#proto
     * @param  {String} className The string representation of a class to bind to
     * @param  {Class} plugin The plugin function.
     */
    ChatEngine.proto = (className, plugin) => {
        ChatEngine.protoPlugins[className] = ChatEngine.protoPlugins[className] || [];
        ChatEngine.protoPlugins[className].push(plugin);
    };

    /**
     * @private
     */
    ChatEngine.request = (method, route, inputBody = {}, inputParams = {}) => {

        let body = {
            uuid: ChatEngine.pnConfig.uuid,
            global: ceConfig.globalChannel,
            authKey: ChatEngine.pnConfig.authKey,
            ttl: ChatEngine.pnConfig.ttl,
            namespace: ceConfig.namespace,
            authKey: ChatEngine.pnConfig.authKey
        };

        let params = {
            route
        };

        body = Object.assign(body, inputBody);
        params = Object.assign(params, inputParams);

        if (method === 'get' || method === 'delete') {
            params = Object.assign(params, body);
            return axios[method](ceConfig.endpoint, { params });
        } else {
            return axios[method](ceConfig.endpoint, body, { params });
        }


    };

    /**
     * Parse a channel name into chat object parts
     * @private
     */
    ChatEngine.parseChannel = (channel) => {

        let info = channel.split('#');

        return {
            namespace: info[0],
            group: info[1],
            private: info[2] === 'private.'
        };

    };

    /**
     * Get the internal channel name of supplied string
     * @private
     */
    ChatEngine.augmentChannel = (original = new Date().getTime(), config = {}) => {

        let channel = original.toString();

        // public.* has PubNub permissions for everyone to read and write
        // private.* is totally locked down and users must be granted access one by one
        let chanPrivString = 'public.';

        if (config.isPrivate) {
            chanPrivString = 'private.';
        }

        if (channel.indexOf(ChatEngine.ceConfig.namespace) === -1) {
            channel = [ChatEngine.ceConfig.namespace, 'chat', chanPrivString, channel].join('#');
        }

        return channel;

    };

    /**
     * Initial communication with the server. Server grants permissions to
     * talk in chats, etc.
     * @private
     */
    ChatEngine.handshake = (complete) => {

        let handshakeError = (error) => {
            /**
             * There was a problem during the initial connection with the server
             * @event Chat#$"."error"."connect"."handshake
             */
            ChatEngine.throwError(ChatEngine, '_emit', 'connect.handshake', new Error('There was a problem logging into the auth server (' + ceConfig.endpoint + ').' + error && error.response && error.response.data), { error });
        };

        waterfall([
            (next) => {
                ChatEngine.request('post', 'bootstrap').then(() => {
                    next(null);
                }).catch(handshakeError);
            },
            (next) => {
                ChatEngine.request('post', 'user_read').then(() => {
                    next(null);
                }).catch(handshakeError);
            },
            (next) => {
                ChatEngine.request('post', 'user_write').then(() => {
                    next(null);
                }).catch(handshakeError);
            },
            (next) => {
                ChatEngine.request('post', 'group').then(() => {
                    next();
                }).catch(handshakeError);
            }
        ], (error) => {

            if (error) {
                ChatEngine.throwError(ChatEngine, '_emit', 'connect.unhandled', new Error('Error thrown during connect handshake.'));
            } else {
                complete();
            }

        });

    };

    /**
     * Listen to PubNub events and forward them into ChatEngine system.
     * @private
     */
    ChatEngine.listenToPubNub = () => {

        ChatEngine.pubnub.addListener({
            message: (m) => {

                // assign the message timetoken as a property of the payload
                m.message.timetoken = m.timetoken;

                if (ChatEngine.chats[m.channel]) {
                    ChatEngine.chats[m.channel].trigger(m.message.event, m.message);
                }

            },
            presence: (payload) => {

                if (ChatEngine.chats[payload.channel]) {
                    ChatEngine.chats[payload.channel].onPresence(payload);
                }

            },
            status: (statusEvent) => {

                /**
                 * SDK detected that network is online.
                 * @event ChatEngine#$"."network"."up"."online
                 */

                /**
                 * SDK detected that network is down.
                 * @event ChatEngine#$"."network"."down"."offline
                 */

                /**
                 * A subscribe event experienced an exception when running.
                 * @event ChatEngine#$"."network"."down"."issue
                 */

                /**
                 * SDK was able to reconnect to pubnub.
                 * @event ChatEngine#$"."network"."up"."reconnected
                 */

                /**
                 * SDK subscribed with a new mix of channels.
                 * @event ChatEngine#$"."network"."up"."connected
                 */

                /**
                 * JSON parsing crashed.
                 * @event ChatEngine#$"."network"."down"."malformed
                 */

                /**
                 * Server rejected the request.
                 * @event ChatEngine#$"."network"."down"."badrequest
                 */

                /**
                 * If using decryption strategies and the decryption fails.
                 * @event ChatEngine#$"."network"."down"."decryption
                 */

                /**
                 * Request timed out.
                 * @event ChatEngine#$"."network"."down"."timeout
                 */

                /**
                 * PAM permission failure.
                 * @event ChatEngine#$"."network"."down"."denied
                 */

                // map the pubnub events into ChatEngine events
                let categories = {
                    PNNetworkUpCategory: 'up.online',
                    PNNetworkDownCategory: 'down.offline',
                    PNNetworkIssuesCategory: 'down.issue',
                    PNReconnectedCategory: 'up.reconnected',
                    PNConnectedCategory: 'up.connected',
                    PNAccessDeniedCategory: 'down.denied',
                    PNMalformedResponseCategory: 'down.malformed',
                    PNBadRequestCategory: 'down.badrequest',
                    PNDecryptionErrorCategory: 'down.decryption',
                    PNTimeoutCategory: 'down.timeout'
                };

                let eventName = ['$', 'network', categories[statusEvent.category] || 'other'].join('.');

                ChatEngine._emit(eventName, statusEvent);

            }
        });

    };

    /**
     * Subscribe to PubNub and begin receiving events.
     * @private
     */
    ChatEngine.subscribeToPubNub = () => {

        let chanGroups = [
            ceConfig.namespace + '#' + ChatEngine.me.uuid + '#rooms',
            ceConfig.namespace + '#' + ChatEngine.me.uuid + '#system',
            ceConfig.namespace + '#' + ChatEngine.me.uuid + '#custom'
        ];

        ChatEngine.pubnub.subscribe({
            channelGroups: chanGroups,
            withPresence: true
        });

    };

    /**
     * Initialize ChatEngine modules on first time boot.
     * @private
     */
    ChatEngine.firstConnect = (globalChannel = 'global') => {

        // create the PubNub instance but don't connect
        ChatEngine.pubnub = new PubNub(ChatEngine.pnConfig);

        let firstConnection = () => {

            // build the current user
            ChatEngine.me = new Me(ChatEngine, ChatEngine.pnConfig.uuid);

            /**
            * Fired when a {@link Me} has been created within ChatEngine.
            * @event ChatEngine#$"."created"."me
            * @example
            * ChatEngine.on('$.created.me', (data, me) => {
            *     console.log('Me was created', me);
            * });
            */
            ChatEngine.me.onConstructed();

            // Set the internal state as ready
            ChatEngine.ready = true;

            /**
             *  Fired when ChatEngine is connected to the internet and ready to go!
             * @event ChatEngine#$"."ready
             * @example
             * ChatEngine.on('$.ready', (me) => {
             *     console.log('I am ', me.uuid);
             * })
             */
            ChatEngine._emit('$.ready', ChatEngine.me);

            // Bind to PubNub events
            ChatEngine.listenToPubNub();

            // Subscribe to PubNub
            ChatEngine.subscribeToPubNub();

            // Restore the session
            if (ChatEngine.ceConfig.enableSync) {
                ChatEngine.me.session.subscribe();
                ChatEngine.me.session.restore();
            }

        };

        if (ChatEngine.ceConfig.enableGlobal) {
            ChatEngine.global = new ChatEngine.Chat(globalChannel);
            ChatEngine.global.once('$.connected', firstConnection);
        } else {
            firstConnection();
        }

    };

    /**
     * Disconnect from all {@link Chat}s and mark them as asleep.
     * @method ChatEngine#disconnect
     * @example
     *
     * // create a new chat
     * let chat = new ChatEngine.Chat(new Date().getTime());
     *
     * // disconnect from ChatEngine
     * ChatEngine.disconnect();
     *
     * // every individual chat will be disconnected
     * chat.on('$.disconnected', () => {
     *     done();
     * });
     *
     * // Changing User:
     * ChatEngine.disconnect()
     * ChatEngine = new ChatEngine({}, {});
     * ChatEngine.connect()
     */
    ChatEngine.disconnect = () => {

        // Unsubscribe from all PubNub chats
        ChatEngine.pubnub.unsubscribeAll();

        // for every chat in ChatEngine.chats, signal disconnected
        Object.keys(ChatEngine.chats).forEach((key) => {
            ChatEngine.chats[key].sleep();
        });

    };

    /**
     * Performs authentication with server and restores connection
     * to all sleeping chats.
     * @method ChatEngine#reconnect
     * @example
     *
     * // create a new chat
     * let chat = new ChatEngine.Chat(new Date().getTime());
     *
     * // disconnect from ChatEngine
     * ChatEngine.disconnect();
     *
     * // reconnect sometime later
     * ChatEngine.reconnect();
     *
     */
    ChatEngine.reconnect = (authKey) => {

        if (authKey) {
            // do the whole auth flow with the new authKey
            ChatEngine.handshake(() => {
                // for every chat in ChatEngine.chats, call .connect()
                Object.keys(ChatEngine.chats).forEach((key) => {
                    ChatEngine.chats[key].wake();
                });

                ChatEngine.subscribeToPubNub();
            });
        } else {
            Object.keys(ChatEngine.chats).forEach((key) => {
                ChatEngine.chats[key].wake();
            });

            ChatEngine.subscribeToPubNub();
        }
    };

    /**
    @private
    */
    ChatEngine.setAuth = (authKey) => {

        ChatEngine.pnConfig.authKey = authKey;
        ChatEngine.pubnub.setAuthKey(authKey);

    };

    /**
     * Disconnects, changes authentication token, performs handshake with server
     * and reconnects with new auth key. Used for extending logged in sessions
     * for active users.
     * @method ChatEngine#reauthorize
     * @example
     * // early
     * ChatEngine.connect(...);
     *
     * ChatEngine.once('$.ready', () => {
     *     // first connection established
     * });
     *
     * // some time passes, session token expires
     * ChatEngine.reauthorize(authKey);
     *
     * // we are connected again
     * ChatEngine.once('$.ready', () => {
     *     // we are connected again
     * });
     */
    ChatEngine.reauthorize = (authKey) => {

        ChatEngine.disconnect();
        ChatEngine.setAuth(authKey);
        ChatEngine.reconnect();

    };

    /**
     * Connect to realtime service and create instance of {@link Me}
     * @method ChatEngine#connect
     * @param {String} uuid A unique string for {@link Me}. It can be a device id, username, user id, email, etc. Must be alphanumeric.
     * @param {String} [authKey] A authentication secret. Will be sent to authentication backend for validation. This is usually an access token. See {@tutorial auth} for more.
     * @param {String} [globalChannel='global'] The channel to be used for ChatEngine#global.
     * @fires $"."connected
     */
    ChatEngine.connect = (uuid, authKey = PubNub.generateUUID(), globalChannel = 'global') => {
        if (typeof authKey === 'number' || typeof authKey === 'string') {
            ChatEngine.handshake(() => {
                ChatEngine.firstConnect(state);
            });
        } else {
            ChatEngine.firstConnect(state);
        }
            // this creates a user known as Me and
            // connects to the global chatroom
            ChatEngine.pnConfig.uuid = uuid;
            ChatEngine.pnConfig.authKey = authKey;

            ChatEngine.handshake(() => {
                ChatEngine.firstConnect(globalChannel);
            });

        } else {

            /**
             * Invalid auth key provided. Auth key must be a string or integer.
             * @event Chat#$"."error"."connect"."invalidAuthKey
             */
            ChatEngine.throwError(ChatEngine, '_emit', 'connect.invalidAuthKey', new Error('Auth key must be a string or integer. You may be using a connect call from v0.9, please migrate your .connect() call to v0.10.'));

        }
    };

    ChatEngine.destroy = () => {

        Object.keys(ChatEngine.chats).forEach((chat) => {
            ChatEngine.chats[chat].emitter.removeAllListeners();
        });

        Object.keys(ChatEngine.users).forEach((user) => {
            ChatEngine.users[user].emitter.removeAllListeners();
        });

        ChatEngine.emitter.removeAllListeners();

    };

    /**
     * The {@link Chat} class. Creates a new Chat when initialized, or returns an existing instance if chat has already been created.
     * @member {Chat} Chat
     * @memberof ChatEngine
     * @see {@link Chat}
     */
    ChatEngine.Chat = function createChat(...args) {

        let internalChannel = ChatEngine.augmentChannel(args[0], args[1]);

        if (ChatEngine.chats[internalChannel]) {
            return ChatEngine.chats[internalChannel];
        } else {

            let newChat = new Chat(ChatEngine, ...args);

            // assign the chat to internal memory store
            ChatEngine.chats[internalChannel] = ChatEngine.chats[internalChannel] || newChat;

            /**
            * Fired when a {@link Chat} has been created within ChatEngine.
            * @event ChatEngine#$"."created"."chat
            * @example
            * ChatEngine.on('$.created.chat', (data, chat) => {
            *     console.log('Chat was created', chat);
            * });
            */
            newChat.onConstructed();

            return newChat;

        }

    };

    /**
     * The {@link User} class. Creates a new User when initialized, or returns an existing instance if chat has already been created.
     * @member {User} User
     * @memberof ChatEngine
     * @see {@link User}
     */
    ChatEngine.User = function createUser(...args) {

        if (ChatEngine.me.uuid === args[0]) {
            return ChatEngine.me;
        } else if (ChatEngine.users[args[0]]) {
            return ChatEngine.users[args[0]];
        } else {

            let newUser = new User(ChatEngine, ...args);

            // assign the user to internal memory store
            ChatEngine.users[args[0]] = ChatEngine.users[args[0]] || newUser;

            /**
            * Fired when a {@link User} has been created within ChatEngine.
            * @event ChatEngine#$"."created"."user
            * @example
            * ChatEngine.on('$.created.user', (data, user) => {
            *     console.log('Chat was created', user);
            * });
            */
            newUser.onConstructed();

            return newUser;

        }

    };

    return ChatEngine;

};
