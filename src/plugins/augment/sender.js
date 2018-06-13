module.exports = (chatEngine) => {

    return {
        middleware: {
            on: {
                '*': (payload, next) => {

                    // if we should try to restore the sender property
                    if (payload.sender && typeof payload.sender === 'string' || payload.user) {

                        let uuid = payload.sender || payload.user.uuid;

                        // get the user from ChatEngine
                        payload.sender = new chatEngine.User(uuid);

                        payload.sender._getStoredState(payload.chat, () => {
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

