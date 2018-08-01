module.exports = (chat) => {

    let middleware = function (payload, next) {

        console.log('_restoreState called', payload)

        let workingUser = payload.sender || payload.user;

        if (workingUser) {

            workingUser._restoreState(chat, () => {
                next(null, payload);
            });

        } else {

            // there's no "sender" in this object, move on
            next(null, payload);
        }

    };

    return {
        middleware: {
            on: {
                '*': middleware
            }
        }
    };

};

