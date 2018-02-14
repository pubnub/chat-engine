const Emitter = require('../modules/root_emitter');

/**
 * @class Event
 * Represents an event that may be emitted or subscribed to.
 */
class Event extends Emitter {

    constructor(chatEngine, chat, event) {

        super();

        /**
         Events are always a property of a {@link Chat}. Responsible for
         listening to specific events and firing events when they occur.
         @readonly
         @type String
         @see [PubNub Channels](https://support.pubnub.com/support/solutions/articles/14000045182-what-is-a-channel-)
         */
        this.channel = chat.channel;

        this.chatEngine = chatEngine;

        this.chat = chat;

        this.event = event;

        this.name = 'Event';

        /**
         Forwards events to the Chat that registered the event {@link Chat}

         @private
         @param {Object} data The event payload object
         */

        return this;

    }

    /**
     Publishes the event over the PubNub network to the {@link Event} channel

     @private
     @param {Object} data The event payload object
     */
    publish(m) {

        m.event = this.event;

        this.chatEngine.pubnub.publish({
            message: m,
            channel: this.channel
        }, (status, response) => {

            if (status.statusCode === 200) {

                if (response) {
                    m.timetoken = response.timetoken;
                }

                /**
                 * Message successfully published
                 * @event Chat#$"."publish"."success
                 * @param {Object} data The message object
                 */
                this._emit('$.emitted', m);

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
