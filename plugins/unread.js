(function() {

    const namespace = 'unread';

    const plugin = (config) => {

        class extension {

            construct(data) {

                this.parent.isFocused = false;
                this.parent.unreadCount = 0;

                this.parent.on('message', (event) => {

                    if(!this.isActive) {

                        this.parent.unreadCount++;
                        this.parent.broadcast('$unread', {
                            chat: this.parent,
                            sender: event.sender,
                            event: event
                        });

                    }

                });

            }

            active() {

                this.isActive = true;
                this.parent.unreadCount = 0;
            }

            inactive() {
                this.isActive = false;
            }

        };

        // attach methods to Chat
        return {
            namespace,
            extends: {
                Chat: extension
            }
        }

    }


    if(typeof module !== "undefined") {
        module.exports = plugin;
    } else {
        window.OpenChatFramework.plugin[namespace] = plugin;
    }

})();
