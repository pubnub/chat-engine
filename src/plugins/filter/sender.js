module.exports = (user) => {
    return {
        middleware: {
            on: {
                '*': (payload, next) => {
                    let matches = payload && payload.sender && payload.sender.uuid === user.uuid;
                    next(!matches, payload);
                }
            }
        }
    };
};
