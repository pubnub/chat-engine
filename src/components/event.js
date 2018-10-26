const Emitter = require('../modules/emitter');

/**
 * @class Event
 * Represents an {@link Chat} event.
 * @fires $"."emitted
 * @extends Emitter
 * @extends RootEmitter
 */
class Event extends Emitter {

    constructor(chatEngine, chat, event) {

        super(chatEngine);

        /**
         * @private
         */
        this.chatEngine = chatEngine;

        /**
         * The {@link Chat#channel} that this event is registered to.
         * @type String
         * @see [PubNub Channels](https://support.pubnub.com/support/solutions/articles/14000045182-what-is-a-channel-)
         * @readonly
         */
        this.channel = chat.channel;

        /**
         * Events are always a property of a {@link Chat}. Responsible for
         * listening to specific events and firing events when they occur.
         * @readonly
         * @type {Chat}
         */
        this.chat = chat;

        /**
         * The string representation of the event. This is supplied as the first parameter to {@link Chat#on}
         * @type {String}
         */
        this.event = event;

        /**
         * A name that identifies this class
         * @type {String}
         */
        this.name = 'Event';

        return this;

    }

    /**
     Publishes the event over the PubNub network to the {@link Event} channel

     @private
     @param {Object} data The event payload object
     */
    publish(m) {

        m.event = this.event;

        let storeInHistory = true;

        // don't store in history if $.system event
        if (!this.event.indexOf('$.system')) {
            storeInHistory = false;
        }

        this.chatEngine.pubnub.publish({
            message: m,
            channel: this.channel,
            storeInHistory
        }, (status, response) => {

            if (status.statusCode === 200) {

                if (response) {
                    m.timetoken = response.timetoken;
                }

                m.chat = this.chat;

                /**
                 * Message successfully published
                 * @event Event#$"."emitted"
                 * @param {Object} data The message payload
                 */
                this.trigger('$.emitted', m);

            } else {

                /**
                 * There was a problem publishing over the PubNub network.
                 * @event Chat#$"."error"."publish
                 */
                this.chatEngine.throwError(this, '_emit', 'emitter', new Error('There was a problem publishing over the PubNub network.'), status);
            }

        });

    }

}

module.exports = Event;

