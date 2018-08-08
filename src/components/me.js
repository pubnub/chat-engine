const User = require('./user');
const Session = require('./session');
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

    constructor(chatEngine, uuid) {

        // call the User constructor
        super(chatEngine, uuid);

        this.chatEngine = chatEngine;

        /**
         * The {@link Session} Class for {@link Me}
         * @type {Boolean}
         */
        this.session = false;

        this.name = 'Me';

        // only fill in session if enabled via config
        if (this.chatEngine.ceConfig.enableSync) {
            this.session = new Session(chatEngine);
        }

        return this;

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
    update(state, chat = this.chatEngine.global) {

        if (!chat) {
            this.chatEngine.throwError(this, 'trigger', 'state', new Error('No chat specified for state update.'));
        } else {
            this.assign(state, chat);
            chat.setState(state);
        }

    }

}

module.exports = Me;
