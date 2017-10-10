const Emitter = require('../modules/emitter');
const Event = require('../components/event');
const eachSeries = require('async/eachSeries');
/**
 This is our User class which represents a connected client. User's are automatically created and managed by {@link Chat}s, but you can also instantiate them yourself.
 If a User has been created but has never been authenticated, you will recieve 403s when connecting to their feed or direct Chats.
 @class
 @extends Emitter
 @param uuid
 @param state
 @param chat
 */
module.exports = class Search extends Emitter {

    constructor(chatEngine, chat, config = {}) {

        super();

        this.chatEngine = chatEngine;

        this.name = 'Search';
        this.chat = chat;

        this.config = config;
        this.config.event = config.event;
        this.config.limit = config.limit || 20;
        this.config.channel = this.chat.channel;
        this.config.includeTimetoken = true;
        this.config.stringifiedTimeToken = true;
        this.config.count = this.config.count || 100;

        this.needleCount = 0;

        this.firstTT = 0;
        this.lastTT = 0;

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
        this.page = (pageDone) => {

            this.trigger('$.search.page.request');

            this.config.start = this.config.reverse ? this.lastTT : this.firstTT;

            this.chatEngine.pubnub.history(this.config, (status, response) => {

                this.trigger('$.search.page.response');

                if (status.error) {

                    /**
                     * There was a problem fetching the history of this chat
                     * @event Chat#$"."error"."history
                     */
                    this.chatEngine.throwError(this, 'trigger', 'search', new Error('There was a problem searching history. Make sure your request parameters are valid and history is enabled for this PubNub key.'), status);

                } else {

                    // timetoken of the first message in response
                    this.firstTT = response.startTimeToken;
                    // timetoken of the last message in response
                    this.lastTT = response.endTimeToken;

                    response.messages = this.sortHistory(response.messages);

                    pageDone(response);

                }

            });
        };

        let eventFilter = (event) => {
            return {
                middleware: {
                    on: {
                        '*': (payload, next) => {
                            let matches = payload && payload.event && payload.event === event;
                            next(!matches, payload);
                        }
                    }
                }
            };
        };

        let senderFilter = (user) => {
            return {
                middleware: {
                    on: {
                        '*': (payload, next) => {

                            let matches = payload && payload.sender && payload.sender.uuid === user.uuid;
                            next(!matches, payload);
                        }
                    }
                }
            };
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
        this.triggerHistory = (message, cb) => {

            console.log(this.needleCount)

            if (this.needleCount < this.config.limit) {

                this.trigger(message.entry.event, message.entry, (reject, payload) => {

                    if (!reject) {
                        this.needleCount += 1;
                    }
                    cb();

                });

            } else {
                cb()
            }

        };

        this.find = () => {

            this.page((response) => {

                if (!this.config.reverse) {
                    response.messages.reverse();
                }

                eachSeries(response.messages, this.triggerHistory, (err) => {

                    if (
                        response.messages &&
                        response.messages.length === this.config.count &&
                        this.needleCount < this.config.limit) {
                        this.find();
                    } else {
                        this.trigger('$.search.finish');
                    }

                });

            });

            return this;

        };

        if(this.config.event) {
            this.plugin(eventFilter(this.config.event));
        }

        if(this.config.sender) {
            this.plugin(senderFilter(this.config.sender));
        }

        this.trigger('$.search.start');
        this.find();

    }

};
