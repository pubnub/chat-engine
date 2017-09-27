const axios = require('axios');
const PubNub = require('pubnub');

const RootEmitter = require('./modules/root_emitter');
const Chat = require('./components/chat');
const Me = require('./components/me');
const User = require('./components/user');

/**
 Provides the base Widget class...

 @class ChatEngine
 @extends RootEmitter
 @return {ChatEngine} Returns an instance of {@link ChatEngine}
 */
module.exports = (ceConfig, pnConfig) => {

    // Create the root ChatEngine object
    let ChatEngine = new RootEmitter();

    ChatEngine.ceConfig = ceConfig;
    ChatEngine.pnConfig = pnConfig;

    /**
     * A map of all known {@link User}s in this instance of ChatEngine
     * @memberof ChatEngine
     */
    ChatEngine.users = {};

    /**
     * A map of all known {@link Chat}s in this instance of ChatEngine
     * @memberof ChatEngine
     */
    ChatEngine.chats = {};

    /**
     * A global {@link Chat} that all {@link User}s join when they connect to ChatEngine. Useful for announcements, alerts, and global events.
     * @member {Chat} global
     * @memberof ChatEngine
     */
    ChatEngine.global = false;

    /**
     * This instance of ChatEngine represented as a special {@link User} know as {@link Me}
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
     * Indicates if ChatEngine has fired the {@link ChatEngine#$"."ready} event
     * @member {Object} ready
     * @memberof ChatEngine
     */
    ChatEngine.ready = false;

    /**
    * A map of {@link Chat}s that this instance of ChatEngine is representing.
    * @type {Object}
    */
    ChatEngine.session = {};

    ChatEngine.throwError = (self, cb, key, ceError, payload = {}) => {

        if (ceConfig.throwErrors) {
            // throw ceError;
            throw ceError;
        }

        payload.ceError = ceError.toString();

        self[cb](['$', 'error', key].join('.'), payload);

    };

    /**
    Stores {@link Chat} within ```ChatEngine.session``` keyed based on the ```chat.group``` property.
    @param {Object} chat JSON object representing {@link Chat}. Originally supplied via {@link Chat#objectify}.
    @private
    */
    ChatEngine.addChatToSession = (chat) => {

        // create the chat if it doesn't exist
        ChatEngine.session[chat.group] = ChatEngine.session[chat.group] || {};

        // check the chat exists within the global list but is not grouped
        let existingChat = ChatEngine.chats[chat.channel];

        // if it exists
        if (existingChat) {
            // assign it to the group
            ChatEngine.session[chat.group][chat.channel] = existingChat;
        } else {
            // otherwise, try to recreate it with the server information
            ChatEngine.session[chat.group][chat.channel] = new Chat(ChatEngine, chat.channel, chat.private, false, chat.group);

            /**
            * Fired when another identical instance of {@link ChatEngine} and {@link Me} joins a {@link Chat} that this instance of {@link ChatEngine} is unaware of.
            * Used to synchronize ChatEngine sessions between desktop and mobile, duplicate windows, etc.
            * @event ChatEngine#$"."session"."chat"."join
            */
            ChatEngine._emit('$.session.chat.join', {
                chat: ChatEngine.session[chat.group][chat.channel]
            });
        }

    };


    /**
    Removes {@link Chat} within ChatEngine.session
    @private
    */
    ChatEngine.removeChatFromSession = (chat) => {

        let targetChat = ChatEngine.session[chat.group][chat.channel] || chat;

        /**
        * Fired when another identical instance of {@link ChatEngine} and {@link Me} leaves a {@link Chat}.
        * @event ChatEngine#$"."session"."chat"."leave
        */
        ChatEngine._emit('$.session.chat.leave', {
            chat: targetChat
        });

        // don't delete from chatengine.chats, because we can still get events from this chat
        delete ChatEngine.chats[chat.channel];
        delete ChatEngine.session[chat.group][chat.channel];

    };

    /**
     * Connect to realtime service and create instance of {@link Me}
     * @method ChatEngine#connect
     * @param {String} uuid A unique string for {@link Me}. It can be a device id, username, user id, email, etc.
     * @param {Object} state An object containing information about this client ({@link Me}). This JSON object is sent to all other clients on the network, so no passwords!
     * * @param {Strung} authKey A authentication secret. Will be sent to authentication backend for validation. This is usually an access token or password. This is different from UUID as a user can have a single UUID but multiple auth keys.
     * @param {Object} [authData] Additional data to send to the authentication endpoint. Not used by ChatEngine SDK.
     * @fires $"."connected
     */
    ChatEngine.connect = (uuid, state = {}, authKey = false, authData) => {

        // this creates a user known as Me and
        // connects to the global chatroom

        pnConfig.uuid = uuid;

        let complete = (chatData) => {

            ChatEngine.pubnub = new PubNub(pnConfig);

            // create a new chat to use as global chat
            // we don't do auth on this one because it's assumed to be done with the /auth request below
            ChatEngine.global = new Chat(ChatEngine, ceConfig.globalChannel, false, true, 'global');

            // create a new instance of Me using input parameters
            ChatEngine.global.createUser(pnConfig.uuid, state);


            /**
             *  Fired when ChatEngine is connected to the internet and ready to go!
             * @event ChatEngine#$"."ready
             */
            ChatEngine.global.on('$.connected', () => {

                // create a new user that represents this client
                ChatEngine.me = new Me(ChatEngine, pnConfig.uuid, authData);

                ChatEngine.me.update(state);

                ChatEngine._emit('$.ready', {
                    me: ChatEngine.me
                });

                ChatEngine.ready = true;

                chatData.forEach((chatItem) => {
                    ChatEngine.addChatToSession(chatItem);
                });
            });

            // chats.session =

            /**
             Fires when PubNub network connection changes

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

        let getChats = () => {

            axios.get(ceConfig.endpoint + '/chats?uuid=' + pnConfig.uuid)
                .then((response) => { complete(response.data); })
                .catch((error) => {

                    /**
                     * There was a problem logging in
                     * @event ChatEngine#$"."error"."session
                     */
                    ChatEngine.throwError(ChatEngine, '_emit', 'session', new Error('There was a problem getting session from the server (' + ceConfig.endpoint + ').'), {
                        error
                    });

                });
        };

        pnConfig.authKey = authKey;

        axios.post(ceConfig.endpoint + '/grant', {
            uuid: pnConfig.uuid,
            channel: ceConfig.globalChannel,
            authData: ChatEngine.me.authData,
            authKey: pnConfig.authKey
        })
            .then((response) => { getChats(response.data); })
            .catch((error) => {

                /**
                 * There was a problem logging in
                 * @event ChatEngine#$"."error"."auth
                 */
                ChatEngine.throwError(ChatEngine, '_emit', 'auth', new Error('There was a problem logging into the auth server (' + ceConfig.endpoint + ').'), { error });
            });

    };

    /**
     * The {@link Chat} class.
     * @member {Chat} Chat
     * @memberof ChatEngine
     * @see {@link Chat}
     */
    ChatEngine.Chat = class extends Chat {
        constructor(...args) {
            super(ChatEngine, ...args);
        }
    };

    /**
     * The {@link User} class.
     * @member {User} User
     * @memberof ChatEngine
     * @see {@link User}
     */
    ChatEngine.User = class extends User {
        constructor(...args) {

            if (ChatEngine.me.uuid === args[0]) {
                return ChatEngine.me;
            } else {
                super(ChatEngine, ...args);
            }

        }
    };

    // add an object as a subobject under a namespoace
    ChatEngine.addChild = (ob, childName, childOb) => {

        // assign the new child object as a property of parent under the
        // given namespace
        ob[childName] = childOb;

        // the new object can use ```this.parent``` to access
        // the root class
        childOb.parent = ob;

    };

    return ChatEngine;

};
