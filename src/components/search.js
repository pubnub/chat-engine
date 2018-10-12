const Emitter = require('../modules/emitter');
const eachSeries = require('async/eachSeries');

const eventFilter = require('../plugins/filter/event');
const senderFilter = require('../plugins/filter/sender');
/**
Returned by {@link Chat#search}. This is our Search class which allows one to search the backlog of messages.
Powered by [PubNub History](https://www.pubnub.com/docs/web-javascript/storage-and-history).
@class Search
@extends Emitter
@extends RootEmitter
@param {ChatEngine} chatEngine This instance of the {@link ChatEngine} object.
@param {Chat} chat The {@link Chat} object to search.
@param {Object} config The configuration object. See {@link Chat#search} for a list of parameters.
*/
class Search extends Emitter {

    constructor(chatEngine, chat, config = {}) {

        super(chatEngine);

        this.chatEngine = chatEngine;

        this.name = 'Search';

        /**
        The {@link Chat} used for searching.
        @type Chat
        */
        this.chat = chat;

        /**
        An object containing configuration parameters supplied by {@link Chat#search}. See {@link Chat#search} for possible parameters.
        @type {Object}
        */
        this.config = config;
        this.config.event = config.event;
        this.config.limit = config.limit || 20;
        this.config.channel = this.chat.channel;
        this.config.includeTimetoken = true;
        this.config.stringifiedTimeToken = true;
        this.config.count = this.config.count || 100;
        this.config.pages = this.config.pages || 10;

        /** @private */
        this.maxPage = this.config.pages;
        /** @private */
        this.numPage = 0;

        /** @private */
        this.referenceDate = this.config.end || 0;

        /**
         * Flag which represent whether there is potentially more data available in {@link Chat} history. This flag can
         * be used for conditional call of {@link Chat#search}.
         * @type {boolean}
         */
        this.hasMore = true;
        /** @private */
        this.messagesBetweenTimetokens = this.config.start > '0' && this.config.end > '0';
        /** @private */
        this.needleCount = 0;

        /**
         * Call PubNub history in a loop.
         * @private
         */
        this.page = (pageDone) => {
            let searchConfiguration = Object.assign({}, this.config, { start: this.referenceDate });
            delete searchConfiguration.reverse;
            delete searchConfiguration.end;

            /**
             * Requesting another page from PubNub History.
             * @event Search#$"."page"."request
             */
            this._emit('$.search.page.request');

            this.chatEngine.pubnub.history(searchConfiguration, (status, response) => {

                /**
                 * PubNub History returned a response.
                 * @event Search#$"."page"."response
                 */
                this._emit('$.search.page.response');

                if (status.error) {

                    /**
                     * There was a problem fetching the history of this chat
                     * @event Chat#$"."error"."history
                     */
                    this.chatEngine.throwError(this, 'trigger', 'search', new Error('There was a problem searching history. Make sure your request parameters are valid and history is enabled for this PubNub key.'), status);
                } else {
                    const startDate = response.startTimeToken;
                    this.referenceDate = response.startTimeToken;
                    this.hasMore = response.messages.length === this.config.count && startDate !== '0';

                    response.messages.sort((left, right) => (left.timetoken < right.timetoken ? -1 : 1));

                    if (this.config.start && startDate < this.config.start) {
                        this.hasMore = false;
                        response.messages = response.messages.filter(event => event.timetoken >= this.config.start);
                    }

                    pageDone(response);
                }

            });
        };

        /**
         * @private
         */
        this.triggerHistory = (message, cb) => {

            if (this.needleCount < this.config.limit || this.messagesBetweenTimetokens) {

                message.entry.timetoken = message.timetoken;

                this.trigger(message.entry.event, message.entry, (reject) => {

                    if (!reject) {
                        this.needleCount += 1;
                    }

                    cb();

                });

            } else {
                cb();
            }

        };

        /**
         * Continue searching the next batch of pages.
         * @see $.search.pause
         */
        this.next = () => {

            if (this.hasMore) {

                this.maxPage = this.maxPage + this.config.pages;
                this.find();

            } else {

                /**
                 * Search has returned all results or reached the end of history.
                 * @event Search#$."search"."finish"
                 */
                this._emit('$.search.finish');

            }
        };

        /**
         * @private
         */
        this.find = () => {
            this.page((response) => {
                response.messages.reverse();
                this.numPage += 1;

                eachSeries(response.messages, this.triggerHistory, () => {

                    if (this.hasMore && this.numPage === this.maxPage) {

                        /**
                         * PubNub History has reached the maximum allocated pages and requires user input to continue.
                         * @see Search#next
                         * @event Search#$"."search"."pause"
                         */
                        this._emit('$.search.pause');
                    } else if (this.hasMore && (this.needleCount < this.config.limit || this.messagesBetweenTimetokens)) {
                        this.find();
                    } else {

                        if (this.needleCount >= this.config.limit && !this.messagesBetweenTimetokens) {
                            this.hasMore = false;
                        }

                        /**
                         * Search has returned all results or reached the end of history.
                         * @event Search#$"."search"."finish
                         */
                        this._emit('$.search.finish');

                    }

                });
            });

            return this;
        };

        if (this.config.event) {
            this.plugins.unshift(eventFilter(this.config.event));
        }

        if (this.config.sender) {
            this.plugins.unshift(senderFilter(this.config.sender));
        }

        /**
         * Search has started.
         * @event Search#$"."search"."start
         */
        this._emit('$.search.start');
        this.find();
    }
}

module.exports = Search;
