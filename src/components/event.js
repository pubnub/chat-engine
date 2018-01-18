/**
 * @class Event
 * Represents an event that may be emitted or subscribed to.
 */
class Event {

    constructor(chatEngine, chat, event) {

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

        // call onMessage when PubNub receives an event
        this.chatEngine.pubnub.addListener({
            message: this.onMessage.bind(this)
        });

        return this;

    }

    onMessage(m) {

        if (this.channel === m.channel && m.message.event === this.event) {
            this.chat.trigger(m.message.event, m.message);
        }

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
        }, (status) => {

            if (status.statusCode === 200) {

                /**
                 * Message successfully published
                 * @event Chat#$"."publish"."success
                 * @param {Object} data The message object
                 */
                this.chat.trigger('$.publish.success', m);
            } else {

                /**
                 * There was a problem publishing over the PubNub network.
                 * @event Chat#$"."error"."publish
                 */
                this.chatEngine.throwError(this.chat, 'trigger', 'publish', new Error('There was a problem publishing over the PubNub network.'), status);
            }

        });

    }

}

module.exports = Event;
