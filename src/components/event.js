/**
 Represents an event that may be emitted or subscribed to.
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

        this.name = 'Event';
        /**
         Publishes the event over the PubNub network to the {@link Event} channel

         @private
         @param {Object} data The event payload object
         */
        this.publish = (m) => {

            m.event = event;

            chatEngine.pubnub.publish({
                message: m,
                channel: this.channel
            }, (status) => {

                if (status.statusCode === 200) {
                    chat.trigger('$.publish.success');
                } else {
                    /**
                     * There was a problem publishing over the PubNub network.
                     * @event Chat#$"."error"."publish
                     */
                    chatEngine.throwError(chat, 'trigger', 'publish', new Error('There was a problem publishing over the PubNub network.'), {
                        errorText: status.errorData.response.text,
                        error: status.errorData,
                    });
                }

            });

        };

        /**
         Forwards events to the Chat that registered the event {@link Chat}

         @private
         @param {Object} data The event payload object
         */
        this.onMessage = (m) => {

            if (this.channel === m.channel && m.message.event === event) {
                chat.trigger(m.message.event, m.message);
            }

        };

        // call onMessage when PubNub receives an event
        chatEngine.pubnub.addListener({
            message: this.onMessage
        });

    }

}

module.exports = Event;
