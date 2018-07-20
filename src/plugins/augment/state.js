module.exports = () => {

    return {
        middleware: {
            on: {
                '*': (payload, next) => {

                    let workingUser = payload.sender || payload.user;

                    if (workingUser) {

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

