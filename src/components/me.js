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
         * Link sessions between multiple identical instances of ChatEngine. Returns {@link Session} when ```enableSync: true``` supplied to ```ChatEngine.create()```..
         * @see Session
         * @type {Boolean}
         */
        this.session = false;

        this.name = 'Me';

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
    update(state, callback = () => {}) {

        // assign state values locally before broadcasting them over the network
        this.assign(state);

        // publish the update over the global channel
        this.chatEngine.global.setState(state, callback);
    }

    /**
     * assign updates from network
     * @private
     */
    assign(state) {

        // run the root update function
        super.assign(state);

    }

}

module.exports = Me;
