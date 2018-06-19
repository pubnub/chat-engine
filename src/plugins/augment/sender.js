module.exports = (chatEngine) => {

    return {
        middleware: {
            on: {
                '*': (payload, next) => {

                    // if we should try to restore the sender property
                    let senderDefined = payload.sender && typeof payload.sender === 'string';
                    if (senderDefined || payload.user) {

                        let uuid = payload.sender || payload.user.uuid;

                        // get the user from ChatEngine
                        let workingUser = new chatEngine.User(uuid);

                        workingUser._getStoredState(payload.chat, () => {
                            next(null, payload);
                        });

                    } else {
                        // there's no "sender" in this object, move on
                        next(null, payload);
                    }

                }
            }
        }
    };

};

