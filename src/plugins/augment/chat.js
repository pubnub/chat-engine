module.exports = (chat) => {

    return {
        middleware: {
            on: {
                '*': (payload, next) => {

                    // restore chat in payload
                    if (!payload.chat) {
                        payload.chat = chat;
                    }

                    next(null, payload);
                }
            }
        }
    };

};

