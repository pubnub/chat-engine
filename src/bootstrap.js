const axios = require('axios');
const PubNub = require('pubnub');
const pack = require('../package.json');

const RootEmitter = require('./modules/root_emitter');
const Chat = require('./components/chat');
const Me = require('./components/me');
const User = require('./components/user');
const async = require('async');

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

    ChatEngine.pnConfig.heartbeatInterval = ChatEngine.pnConfig.heartbeatInterval || 30;
    ChatEngine.pnConfig.presenceTimeout = ChatEngine.pnConfig.presenceTimeout || 60;

    ChatEngine.ceConfig.endpoint = ChatEngine.ceConfig.endpoint || 'https://pubsub.pubnub.com/v1/blocks/sub-key/' + ChatEngine.pnConfig.subscribeKey + '/chat-engine-server';
    ChatEngine.ceConfig.globalChannel = ChatEngine.ceConfig.globalChannel || 'chat-engine-global';

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

    ChatEngine.request = (method, route, inputBody = {}, inputParams = {}) => {

        let body = {
            uuid: pnConfig.uuid,
            global: ceConfig.globalChannel,
            authData: ChatEngine.me.authData,
            authKey: pnConfig.authKey
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
     * @param  {[type]}  original  [description]
     * @param  {Boolean} isPrivate [description]
     * @return {[type]}            [description]
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
     * Connect to realtime service and create instance of {@link Me}
     * @method ChatEngine#connect
     * @param {String} uuid A unique string for {@link Me}. It can be a device id, username, user id, email, etc.
     * @param {Object} state An object containing information about this client ({@link Me}). This JSON object is sent to all other clients on the network, so no passwords!
     * @param {String} [authKey] A authentication secret. Will be sent to authentication backend for validation. This is usually an access token or password. This is different from UUID as a user can have a single UUID but multiple auth keys.
     * @param {Object} [authData] Additional data to send to the authentication endpoint to help verify a valid session. ChatEngine SDK does not make use of this, but you might!
     * @fires $"."connected
     */
    ChatEngine.connect = (uuid, state = {}, authKey = false, authData) => {

        // this creates a user known as Me and
        // connects to the global chatroom

        pnConfig.uuid = uuid;

        pnConfig.authKey = authKey || pnConfig.uuid;

        let restoreSession = () => {

            let groups = ['custom', 'rooms', 'system'];

            groups.forEach((group) => {

                let channelGroup = [ceConfig.globalChannel, pnConfig.uuid, group].join('#');

                ChatEngine.pubnub.channelGroups.listChannels({
                    channelGroup
                }, (status, response) => {

                    if (status.error) {
                        console.log('operation failed w/ error:', status);
                        return;
                    }

                    response.channels.forEach((channel) => {

                        ChatEngine.me.addChatToSession({
                            channel,
                            private: ChatEngine.parseChannel(channel).private,
                            group
                        });

                    });

                });

            });

        };

        let complete = () => {

            ChatEngine.pubnub = new PubNub(pnConfig);

            // create a new chat to use as global chat
            // we don't do auth on this one because it's assumed to be done with the /auth request below
            ChatEngine.global = new ChatEngine.Chat(ceConfig.globalChannel, false, true, {}, 'system');

            // build the current user
            ChatEngine.me = new Me(ChatEngine, pnConfig.uuid, authData);
            ChatEngine.me.update(state);

            /**
            * Fired when a {@link Me} has been created within ChatEngine.
            * @event ChatEngine#$"."created"."me
            * @example
            * ChatEngine.on('$.created.me', (data, me) => {
            *     console.log('Me was created', me);
            * });
            */
            ChatEngine.me.onConstructed();

            ChatEngine.global.on('$.connected', () => {

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

                ChatEngine.global.getUserUpdates();

                let chanGroups = [
                    ceConfig.globalChannel + '#' + ChatEngine.me.uuid + '#rooms',
                    ceConfig.globalChannel + '#' + ChatEngine.me.uuid + '#system',
                    ceConfig.globalChannel + '#' + ChatEngine.me.uuid + '#custom'
                ];

                // listen to all PubNub events for this Chat
                ChatEngine.pubnub.addListener({
                    presence: (payload) => {

                        if (ChatEngine.chats[payload.channel]) {
                            ChatEngine.chats[payload.channel].onPresence(payload);
                        }

                    }
                });

                ChatEngine.pubnub.subscribe({
                    channelGroups: chanGroups,
                    withPresence: true
                });

                ChatEngine.ready = true;

                restoreSession();

            });

            /**
             Fires when PubNub network connection changes.

             @private
             @param {Object} statusEvent The response status
             */
            ChatEngine.pubnub.addListener({
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

                    // map the pubnub events into chat engine events
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

                    if (statusEvent.affectedChannels) {
                        statusEvent.affectedChannels.forEach((channel) => {

                            let chat = ChatEngine.chats[channel];

                            if (chat) {
                                // connected category tells us the chat is ready
                                if (statusEvent.category === 'PNConnectedCategory') {
                                    chat.onConnectionReady();
                                }

                                // trigger the network events
                                chat.trigger(eventName, statusEvent);

                            } else {
                                ChatEngine._emit(eventName, statusEvent);
                            }
                        });
                    } else {
                        ChatEngine._emit(eventName, statusEvent);
                    }
                }
            });
        };

        async.parallel([
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
                ChatEngine.request('post', 'group').then(complete).catch(next);
            }
        ], (error) => {
            if (error) {
                ChatEngine.throwError(ChatEngine, '_emit', 'auth', new Error('There was a problem logging into the auth server (' + ceConfig.endpoint + ').'), { error });
            }
        });

    };

    /**
     * The {@link Chat} class.
     * @member {Chat} Chat
     * @memberof ChatEngine
     * @see {@link Chat}
     */
    ChatEngine.Chat = function (...args) {

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
     * The {@link User} class.
     * @member {User} User
     * @memberof ChatEngine
     * @see {@link User}
     */
    ChatEngine.User = function (...args) {

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
