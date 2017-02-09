(function() {

    const namespace = 'uploadcare';

    // allows you to search the online user list by username
    const plugin = (config) => {

        // these are new methods that will be added to the extended class
        class extension {
            bind(widget) {

                if(!widget) {
                    console.error('Must supply an uploadcare widget.');
                }

                widget.onUploadComplete((info) => {

                    this.parent.send(['$' + namespace, 'upload'].join('.'), info);
                    widget.value(null);

                });

            }
        }

        // add this plugin to the Chat classes
        return {
            namespace,
            extends: {
                Chat: extension,
                GlobalChat: extension
            }
        }

    }

    if(typeof module !== "undefined") {
        module.exports = plugin;
    } else {
        window.OpenChatFramework.plugin[namespace] = plugin;
    }

})();
