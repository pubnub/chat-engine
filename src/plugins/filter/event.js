module.exports = (event) => {
    return {
        middleware: {
            on: {
                '*': (payload, next) => {

                    let matches = payload && payload.event && payload.event === event;

                    next(!matches, payload);
                }
            }
        }
    };
};

