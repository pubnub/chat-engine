(function() {

    const namespace = 'unread';

    const plugin = (config) => {

        class extension {

            construct(data) {

                this.isActive = false;

                this.parent.unread = 0;

                this.parent.on('message', (event) => {

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
