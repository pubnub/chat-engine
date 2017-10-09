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

        this.reverse = config.reverse || false;
        this.pageSize = config.pageSize || 100;

        this.limit = config.limit || 50;

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

            this.startToken = this.reverse ? this.lastTT : this.firstTT;

            console.log('start token', this.startToken)

            this.chatEngine.pubnub.history({
                // search starting from this timetoken
                // start: args.startToken,
                channel: this.chat.channel,
                // false - search forwards through the timeline
                // true - search backwards through the timeline
                reverse: this.reverse,
                // limit number of messages per request to this value; default/max=100
                count: this.pagesize,
                // include each returned message's publish timetoken
                includeTimetoken: true,
                // prevents JS from truncating 17 digit timetokens
                stringifiedTimeToken: true
                ,
                start: this.startToken
            }, (status, response) => {

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

                    pageDone(response);

                    response.messages = this.sortHistory(response.messages);

                    // we keep asking for more messages if # messages returned by last request is the
                    // same at the pagesize AND we still have reached the total number of messages requested
                    // same as the opposit of !(msgs.length < pagesize || total == max)
                    if (response.messages.length < this.pagesize) {

                        // we've reached the end of possible messages to retrieve or hit the 'max' we asked for
                        // so invoke the callback to the original caller of getMessages providing the total message results
                        allDone(response);
                        this.trigger('$.history.page.last');

                    }

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

        this.start = () => {
            this.trigger('$.history.start');
        };

        this.finish = () => {
            this.trigger('$.history.finish');
        };

        this.find = (event) => {

            this.page((response) => {

                Object.keys(response.messages).forEach((key) => {

                    if (response.messages[key] && this.needleCount < this.limit) {

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

                if (this.needleCount < this.limit) {
                    this.find(event);
                } else {
                    this.finish();
                }

            }, this.finish);

            return this;

        };

        this.between = (start, end = new Date()) => {

            console.log('between called')

            this.startToken = start.getTime();

            let overTime = false;

            this.page((response) => {

                Object.keys(response.messages).forEach((key) => {

                    if (response.messages[key] && this.needleCount < this.limit
                        && new Date(response.messages[key].timetoken/1e4).getTime() < end.getTime()
                        && new Date(response.messages[key].timetoken/1e4).getTime() > this.startToken) {

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

                if (this.needleCount < this.limit) {
                    this.between(start, end);
                } else {
                    this.finish();
                }

            }, this.finish);

            return this;

        };

        if (config.event) {
            this.find(config.event);
        } else {
            this.between(config.start, config.end);
        }

    }

};
