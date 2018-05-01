module.exports = (chatEngine) => {

    return {
        middleware: {
            on: {
                '*': (payload, next) => {

                    // if we should try to restore the sender property
                    if (payload.sender && typeof payload.sender === 'string') {

                        // get the user from ChatEngine
                        payload.sender = new chatEngine.User(payload.sender);

                        payload.sender._getStoredState(() => {
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

