(function() {

    const namespace = 'unread';

    const plugin = (config) => {

        class extension {

            construct(data) {

            }

        };

        // define broadcast middleware
        let broadcast = {
            message: (payload, next) => {

                // console.log(this)

                console.log('test')

                // continue on
                next(null, payload);
            }
        };

        // attach methods to Chat
        return {
            namespace,
            extends: {
                Chat: extension
            },
            middleware: {
                broadcast
            }
        }

    }


    if(typeof module !== "undefined") {
        module.exports = plugin;
    } else {
        window.OpenChatFramework.plugin[namespace] = plugin;
    }

})();
