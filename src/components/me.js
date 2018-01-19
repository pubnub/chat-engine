const User = require('./user');

/**
 Represents the client connection as a special {@link User} with write permissions.
 Has the ability to update it's state on the network. An instance of
 {@link Me} is returned by the ```ChatEngine.connect()```
 method.

 @class Me
 @extends User
 @extends Emitter
 @extends RootEmitter
 @param {String} uuid The uuid of this user
 */
class Me extends User {

    constructor(chatEngine, uuid, authData) {

        // call the User constructor
        super(chatEngine, uuid);

        this.name = 'Me';

        this.authData = authData;
        this.chatEngine = chatEngine;

        /**
         * Stores a map of {@link Chat} objects that this {@link Me} has joined across all clients.
         * @type {Object}
         */
        this.session = {};

        /**
         * The {@link Chat} that syncs session between instances. Only connects
         * if "enableSync" has been set to true in ceConfig.
         * @type {this}
         */
        this.sync = new this.chatEngine.Chat([this.chatEngine.global.channel, 'user', this.uuid, 'me.', 'sync'].join('#'), false, this.chatEngine.ceConfig.enableSync, {}, 'system');

        return this;

    }

    /**
     * assign updates from network
     * @private
     */
    assign(state) {
        // we call "update" because calling "super.assign"
        // will direct back to "this.update" which creates
        // a loop of network updates
        super.update(state);
    }

    /**
     * Update {@link Me}'s state in a {@link Chat}. All other {@link User}s
     * will be notified of this change via ```$.state```.
     * Retrieve state at any time with {@link User#state}.
     * @param {Object} state The new state for {@link Me}
     * @param {Chat} chat An instance of the {@link Chat} where state will be updated.
     * Defaults to ```ChatEngine.global```.
     * @fires Chat#event:$"."state
     * @example
     * // update state
     * me.update({value: true});
     */
    update(state) {

        // run the root update function
        super.update(state);

        // publish the update over the global channel
        this.chatEngine.global.setState(state);

    }

    /**
     * Forwards sync events from other instances into callback functions
     * @private
     */
    subscribeToSession() {

        // if the option has been enabled
        if (this.chatEngine.ceConfig.enableSync) {

            // subscribe to the events on our sync chat and forward them
            this.sync.on('$.session.notify.chat.join', (payload) => {
                this.onSessionJoin(payload.data.subject);
            });

            this.sync.on('$.session.notify.chat.leave', (payload) => {
                this.onSessionLeave(payload.data.subject);
            });

        }

    }

    /**
     * Uses PubNub channel groups to restore a session for this uuid
     * @private
     */
    restoreSession() {

        if (this.chatEngine.ceConfig.enableSync) {

            // these are custom groups that separate custom chats from system chats
            // for better fitlering
            let groups = ['custom', 'system'];

            // loop through the groups
            groups.forEach((group) => {

                // generate the channel group string for PubNub using the current uuid
                let channelGroup = [this.chatEngine.ceConfig.globalChannel, this.uuid, group].join('#');

                // ask pubnub for a list of channels for this group
                this.chatEngine.pubnub.channelGroups.listChannels({
                    channelGroup
                }, (status, response) => {

                    if (status.error) {
                        this.chatEngine.throwError(this.chatEngine, '_emit', 'sync', new Error('There was a problem restoring your session from PubNub servers.'), { status });
                    } else {

                        // loop through the returned channels
                        response.channels.forEach((channel) => {

                            // call the same callback as if we were notified about them
                            this.onSessionJoin({
                                channel,
                                private: this.chatEngine.parseChannel(channel).private,
                                group
                            });

                            /**
                            Fired when session has been restored at boot. Fired once per
                            session group.
                            @event Me#$"."session"."group"."restored
                            */
                            this.trigger('$.session.group.restored', { group });

                        });

                    }

                });

            });

        }

    }

    /**
     * Callback fired when another instance has joined a chat
     * @private
     */
    sessionJoin(chat) {
        if (this.chatEngine.ceConfig.enableSync) {

            // don't rebroadcast chats in session we've already heard about
            if (!this.session[chat.group] || !this.session[chat.group][chat.channel]) {
                this.sync.emit('$.session.notify.chat.join', { subject: chat.objectify() });
            }
        }
    }

    /**
     * Callback fired when another instance has left a chat
     * @private
     */
    sessionLeave(chat) {
        if (this.chatEngine.ceConfig.enableSync) {
            this.sync.emit('$.session.notify.chat.leave', { subject: chat.objectify() });
        }
    }

    /**
    Stores {@link Chat} within ```ChatEngine.session``` keyed based on the ```chat.group``` property.
    @param {Object} chat JSON object representing {@link Chat}. Originally supplied via {@link Chat#objectify}.
    @private
    */
    onSessionJoin(chat) {

        // create the chat group if it doesn't exist
        this.session[chat.group] = this.session[chat.group] || {};

        // check the chat exists within the global list but is not grouped
        let existingChat = this.chatEngine.chats[chat.channel];

        // if it exists
        if (existingChat) {

            // assign it to the group
            this.session[chat.group][chat.channel] = existingChat;
        } else {

            // otherwise, try to recreate it with the server information
            this.session[chat.group][chat.channel] = new this.chatEngine.Chat(chat.channel, chat.private, false, chat.meta, chat.group);

            /**
            Fired when another identical instance of {@link ChatEngine} and {@link Me} joins a {@link Chat} that this instance of {@link ChatEngine} is unaware of.
            Used to synchronize ChatEngine sessions between desktop and mobile, duplicate windows, etc.
            ChatEngine stores sessions on the server side identified by {@link User#uuid}.
            @event Me#$"."session"."chat"."join
            @example
            *
            * // Logged in as "Ian" in first window
            * ChatEngine.me.on('$.session.chat.join', (data) => {
            *     console.log('I joined a new chat in a second window!', data.chat);
            * });
            *
            * // Logged in as "Ian" in second window
            * new ChatEngine.Chat('another-chat');
            */
            // this.trigger('$.session.chat.join', {
            //     chat: this.session[chat.group][chat.channel]
            // });
            //
            this.trigger('$.session.chat.join', { chat: this.session[chat.group][chat.channel] });

        }

    }

    /**
    Removes {@link Chat} within this.session
    @private
    */
    onSessionLeave(chat) {

        if (this.session[chat.group] && this.session[chat.group][chat.channel]) {

            chat = this.session[chat.group][chat.channel] || chat;

            /**
            * Fired when another identical instance of {@link ChatEngine} with an identical {@link Me} leaves a {@link Chat} via {@link Chat#leave}.
            * @event Me#$"."session"."chat"."leave
            */

            delete this.chatEngine.chats[chat.channel];
            delete this.session[chat.group][chat.channel];

        }

        this.trigger('$.session.chat.leave', { chat });

    }

}

module.exports = Me;
