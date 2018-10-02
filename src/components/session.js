const Emitter = require('../modules/emitter');

/**
Automatically created by supplying ```enableSync: true``` in ```ChatEngineCore.create```.
Access via {@link Me#session}.

Used to synchronize ChatEngine sessions between desktop and mobile, duplicate windows, etc.
Sessions are the same when identical instance of {@link ChatEngine} and {@link Me} connects to ChatEngine.
Should not be created directly.
@class Session
@extends Emitter
@extends RootEmitter
*/
class Session extends Emitter {

    constructor(chatEngine) {

        super(chatEngine);

        this.name = 'Session';

        this.chatEngine = chatEngine;

        /**
         * Stores a map of {@link Chat} objects that this {@link Me} has joined across all clients.
         * @type {Object}
         */
        this.chats = {};

        /**
         * The {@link Chat} that syncs session between instances.
         * @type {this}
         */
        this.sync = null;

    }

    /**
     * Forwards sync events from other instances into callback functions
     * @private
     */
    subscribe() {

        this.sync = new this.chatEngine.Chat([this.chatEngine.global.channel, 'user', this.chatEngine.me.uuid, 'me.', 'sync'].join('#'), false, this.chatEngine.ceConfig.enableSync, {}, 'system');

        // subscribe to the events on our sync chat and forward them
        this.sync.on('$.session.notify.chat.join', (payload) => {
            this.onJoin(payload.data.subject);
        });

        this.sync.on('$.session.notify.chat.leave', (payload) => {
            this.onleave(payload.data.subject);
        });

    }

    /**
     * Uses PubNub channel groups to restore a session for this uuid
     * @private
     */
    restore() {

        // these are custom groups that separate custom chats from system chats
        // for better fitlering
        let groups = ['custom', 'system'];

        // loop through the groups
        groups.forEach((group) => {

            // generate the channel group string for PubNub using the current uuid
            let channelGroup = [this.chatEngine.ceConfig.globalChannel, this.chatEngine.me.uuid, group].join('#');

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
                        this.onJoin({
                            channel,
                            private: this.chatEngine.parseChannel(channel).private,
                            group
                        });

                        /**
                        Fired when session has been restored at boot. Fired once per
                        session group.
                        @event Me#$"."session"."group"."restored
                        */
                        this.trigger('$.group.restored', { group });

                    });

                }

            });

        });

    }

    /**
     * Callback fired when another instance has joined a chat
     * @private
     */
    join(chat) {

        // don't rebroadcast chats in session we've already heard about
        if (!this.chats[chat.group] || !this.chats[chat.group][chat.channel]) {
            this.sync.emit('$.session.notify.chat.join', { subject: chat.objectify() });
        }

    }

    /**
     * Callback fired when another instance has left a chat
     * @private
     */
    leave(chat) {
        this.sync.emit('$.session.notify.chat.leave', { subject: chat.objectify() });
    }

    /**
    Stores {@link Chat} within ```ChatEngine.session``` keyed based on the ```chat.group``` property.
    @param {Object} chat JSON object representing {@link Chat}. Originally supplied via {@link Chat#objectify}.
    @private
    */
    onJoin(chat) {

        // create the chat group if it doesn't exist
        this.chats[chat.group] = this.chats[chat.group] || {};

        // check the chat exists within the global list but is not grouped
        let existingChat = this.chatEngine.chats[chat.channel];

        // if it exists
        if (existingChat) {

            // assign it to the group
            this.chats[chat.group][chat.channel] = existingChat;
        } else {

            // otherwise, try to recreate it with the server information
            this.chats[chat.group][chat.channel] = new this.chatEngine.Chat(chat.channel, chat.private, false, chat.meta, chat.group);

            /**
            Fired when another identical instance of {@link ChatEngine} and {@link Me} joins a {@link Chat} that this instance of {@link ChatEngine} is unaware of.
            Used to synchronize ChatEngine sessions between desktop and mobile, duplicate windows, etc.
            ChatEngine stores sessions on the server side identified by {@link User#uuid}.
            @event Me#$"."session"."chat"."join
            @example
            *
            * // Logged in as "Ian" in first window
            * ChatEngine.me.session.on('$.chat.join', (data) => {
            *     console.log('I joined a new chat in a second window!', data.chat);
            * });
            *
            * // Logged in as "Ian" in second window
            * new ChatEngine.Chat('another-chat');
            */
            this.trigger('$.chat.join', { chat: this.chats[chat.group][chat.channel] });

        }

    }

    /**
    Removes {@link Chat} within this.chats
    @private
    */
    onleave(chat) {

        if (this.chats[chat.group] && this.chats[chat.group][chat.channel]) {

            chat = this.chats[chat.group][chat.channel] || chat;

            /**
            * Fired when another identical instance of {@link ChatEngine} with an identical {@link Me} leaves a {@link Chat} via {@link Chat#leave}.
            * @event Me#$"."session"."chat"."leave
            */

            delete this.chatEngine.chats[chat.channel];
            delete this.chats[chat.group][chat.channel];

        }

        this.trigger('$.chat.leave', { chat });

    }

}

module.exports = Session;
