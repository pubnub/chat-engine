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
     * A global {@link Chat} that all {@link User}s join when they connect to ChatEngine. Useful for announcements, alerts, and global events.
     * @member {Chat} global
     * @memberof ChatEngine
     */
    ChatEngine.global = false;

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

    ChatEngine.throwError = (self, cb, key, ceError, payload = {}) => {

        if (ceConfig.throwErrors) {
            // throw ceError;
            console.error(payload);
            throw ceError;
        }

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
            global: info[0],
            type: info[1],
            private: info[2] === 'private.'
        };

    };

    /**
     * Get the internal channel name of supplied string
     * @private
     */
    ChatEngine.augmentChannel = (original = new Date().getTime(), isPrivate = true) => {

        let channel = original.toString();

        // public.* has PubNub permissions for everyone to read and write
        // private.* is totally locked down and users must be granted access one by one
        let chanPrivString = 'public.';

        if (isPrivate) {
            chanPrivString = 'private.';
        }

        if (channel.indexOf(ChatEngine.ceConfig.globalChannel) === -1) {
            channel = [ChatEngine.ceConfig.globalChannel, 'chat', chanPrivString, channel].join('#');
        }

        return channel;

    };

    /**
     * Initial communication with the server. Server grants permissions to
     * talk in chats, etc.
     * @private
     */
    ChatEngine.handshake = (complete) => {

        waterfall([
            (next) => {
                ChatEngine.request('post', 'bootstrap').then(() => {
                    next(null);
                }).catch(next);
            },
            (next) => {
                ChatEngine.request('post', 'user_read').then(() => {
                    next(null);
                }).catch(next);
            },
            (next) => {
                ChatEngine.request('post', 'user_write').then(() => {
                    next(null);
                }).catch(next);
            },
            (next) => {
                ChatEngine.request('post', 'group').then(() => {
                    next();
                }).catch(next);
            }
        ], (error) => {

            if (error) {
                ChatEngine.throwError(ChatEngine, '_emit', 'auth', new Error('There was a problem logging into the auth server (' + ceConfig.endpoint + ').' + error && error.response && error.response.data), { error });
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
            ceConfig.globalChannel + '#' + ChatEngine.me.uuid + '#rooms',
            ceConfig.globalChannel + '#' + ChatEngine.me.uuid + '#system',
            ceConfig.globalChannel + '#' + ChatEngine.me.uuid + '#custom'
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
    ChatEngine.firstConnect = (state) => {

        ChatEngine.pubnub = new PubNub(ChatEngine.pnConfig);

        // create a new chat to use as global chat
        // we don't do auth on this one because it's assumed to be done with the /auth request below
        ChatEngine.global = new ChatEngine.Chat(ceConfig.globalChannel, false, true, {}, 'system');

        ChatEngine.global.once('$.connected', () => {

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

            if (ChatEngine.ceConfig.enableSync) {
                ChatEngine.me.session.subscribe();
            }

            ChatEngine.me.update(state, () => {

                /**
                 *  Fired when ChatEngine is connected to the internet and ready to go!
                 * @event ChatEngine#$"."ready
                 * @example
                 * ChatEngine.on('$.ready', (data) => {
                 *     let me = data.me;
                 * })
                 */
                ChatEngine._emit('$.ready', {
                    me: ChatEngine.me
                });

                ChatEngine.ready = true;

                ChatEngine.listenToPubNub();
                ChatEngine.subscribeToPubNub();

                ChatEngine.global.getUserUpdates();

                if (ChatEngine.ceConfig.enableSync) {
                    ChatEngine.me.session.restore();
                }

            });

        });

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
    ChatEngine.reconnect = () => {

        // do the whole auth flow with the new authKey
        ChatEngine.handshake(() => {
            // for every chat in ChatEngine.chats, call .connect()
            Object.keys(ChatEngine.chats).forEach((key) => {
                ChatEngine.chats[key].wake();
            });

            ChatEngine.subscribeToPubNub();
        });
    };

    /**
    @private
    */
    ChatEngine.setAuth = (authKey = PubNub.generateUUID()) => {

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
     * ChatEngine.once('$.connected', () => {
     *     // first connection established
     * });
     *
     * // some time passes, session token expires
     * ChatEngine.reauthorize(authKey);
     *
     * // we are connected again
     * ChatEngine.once('$.connected', () => {
     *     // we are connected again
     * });
     */
    ChatEngine.reauthorize = (authKey = PubNub.generateUUID()) => {

        ChatEngine.global.once('$.disconnected', () => {

            ChatEngine.setAuth(authKey);
            ChatEngine.reconnect();

        });

        ChatEngine.disconnect();

    };

    /**
     * Connect to realtime service and create instance of {@link Me}
     * @method ChatEngine#connect
     * @param {String} uuid A unique string for {@link Me}. It can be a device id, username, user id, email, etc. Must be alphanumeric.
     * @param {Object} [state={}] An object containing information about this client ({@link Me}). This JSON object is sent to all other clients on the network, so no passwords!
     * @param {String} [authKey] A authentication secret. Will be sent to authentication backend for validation. This is usually an access token. See {@tutorial auth} for more.
     * @fires $"."connected
     */
    ChatEngine.connect = (uuid, state = {}, authKey = PubNub.generateUUID()) => {

        // this creates a user known as Me and
        // connects to the global chatroom
        ChatEngine.pnConfig.uuid = uuid;
        ChatEngine.pnConfig.authKey = authKey;

        ChatEngine.handshake(() => {
            ChatEngine.firstConnect(state);
        });

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
