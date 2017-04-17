(function() {

    const namespace = 'unread';

    const plugin = (config) => {

        class extension {

            construct(data) {

                this.parent.isFocused = false;
                this.parent.unread = 0;

                this.parent.on('message', (event) => {

                    console.log('message cb')
                    console.log(this.parent)

                    if(!this.isActive) {

                        this.parent.unread++;
                        this.parent.broadcast('$unread', this.parent.unread);

                        console.log('unread', this.parent.unread)

                        console.log(this.parent, this)

                    }

                });

            }

            active() {
                this.isActive = true;
            }

            inactive() {
                this.isActive = false;
            }

        };

        let broadcast = {
            message: (payload, next) => {

                console.log(payload);

                next(null, payload)

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
