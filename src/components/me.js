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

        this.session = false;

        this.name = 'Me';

        if (this.chatEngine.ceConfig.enableSync) {
            this.session = new Session(chatEngine);
        }

        return this;

    }

}

module.exports = Me;
