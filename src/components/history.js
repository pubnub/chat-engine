const Emitter = require('../modules/emitter');
const Event = require('../components/event');
/**
 This is our User class which represents a connected client. User's are automatically created and managed by {@link Chat}s, but you can also instantiate them yourself.
 If a User has been created but has never been authenticated, you will recieve 403s when connecting to their feed or direct Chats.
 @class
 @extends Emitter
 @param uuid
 @param state
 @param chat
 */
module.exports = class History extends Emitter {

    constructor(chatEngine, chat, config = {}) {

        super();

        this.chatEngine = chatEngine;

        this.name = 'History';
        this.chat = chat;

        this.config = config;
        this.config.event = config.event;
        this.config.channel = this.chat.channel;
        this.config.includeTimetoken = true;
        this.config.stringifiedTimeToken = true;

        this.needleCount = 0;

        this.sortHistory = (messages, desc) => {

            messages.sort((a, b) => {
                let e1 = desc ? b : a;
                let e2 = desc ? a : b;
                return parseInt(e1.timetoken, 10) - parseInt(e2.timetoken, 10);
            });

            return messages;

        };

        /**
         * Call PubNub history in a loop.
         * Unapologetically stolen from https://www.pubnub.com/docs/web-javascript/storage-and-history
         * @param  {[type]}   args     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         * @private
         */
        this.page = (pageDone, allDone) => {

            this.trigger('$.history.page.request');

            this.startToken = this.config.reverse ? this.lastTT : this.firstTT;

            this.chatEngine.pubnub.history(this.config, (status, response) => {

                this.trigger('$.history.page.response');

                if (status.error) {

                    /**
                     * There was a problem fetching the history of this chat
                     * @event Chat#$"."error"."history
                     */
                    chatEngine.throwError(this, 'trigger', 'history', new Error('There was a problem fetching the history. Make sure history is enabled for this PubNub key.'), status);

                } else {

                    // timetoken of the first message in response
                    this.firstTT = response.startTimeToken;
                    // timetoken of the last message in response
                    this.lastTT = response.endTimeToken;

                    // console.log(response)

                    console.log(this.firstTT, this.lastTT)

                    response.messages = this.sortHistory(response.messages);

                    pageDone(response);

                }

            });
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

        this.needleCount = 0;
        this.find = () => {

            this.trigger('$.history.start');

            this.page((response) => {

                Object.keys(response.messages).forEach((key) => {

                    if (response.messages[key].entry.event === this.config.event && this.needleCount < this.config.limit) {

                        /**
                         * Fired by the {@link Chat#history} call. Emits old events again. Events are prepended with
                         * ```$.history.``` to distinguish it from the original live events.
                         * @event Chat#$"."history"."*
                         * @tutorial history
                         */
                        this.needleCount += 1;

                        this.trigger(response.messages[key].entry.event, response.messages[key].entry);

                    }

                });

                if (response.messages && response.messages.length && this.needleCount < this.config.limit) {
                    this.find();
                } else {
                    this.trigger('$.history.finish');
                }

            });

            return this;

        };

        this.find();

    }

};
