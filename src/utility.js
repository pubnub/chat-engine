const axios = require('axios');

class Utility {

    constructor(chatEngine) {

        this.chatEngine = chatEngine;
        this.countObject = {};

        this.chatEngine.onAny((event, payload) => {

            this.countObject['event: ' + event] = this.countObject[event] || 0;
            this.countObject['event: ' + event] += 1;

            if (this.chatEngine.debug) {
                console.info('debug:', event, payload);
            }

        });

        this.profilingLoop();

    }

    throwError(self, cb, key, ceError, payload = {}) {

        if (this.chatEngine.ceConfig.throwErrors) {
            // throw ceError;
            console.error(payload);
            throw ceError;
        }

        payload.ceError = ceError.toString();

        self[cb](['$', 'error', key].join('.'), payload);

    }

    profilingLoop() {

        setInterval(() => {

            if (this.chatEngine.ceConfig.profiling) {

                this.countObject.chats = Object.keys(this.ChatEngine.chats).length;
                this.countObject.users = Object.keys(this.ChatEngine.users).length;

                console.table(this.countObject);

            }

        }, 3000);

    }

    /**
     * @private
     */
    request(method, route, inputBody = {}, inputParams = {}) {

        let body = {
            uuid: this.chatEngine.pnConfig.uuid,
            global: this.chatEngine.ceConfig.globalChannel,
            authKey: this.chatEngine.pnConfig.authKey
        };

        let params = {
            route
        };

        body = Object.assign(body, inputBody);
        params = Object.assign(params, inputParams);

        if (method === 'get' || method === 'delete') {
            params = Object.assign(params, body);
            return axios[method](this.chatEngine.ceConfig.endpoint, { params });
        } else {
            return axios[method](this.chatEngine.ceConfig.endpoint, body, { params });
        }


    }

    /**
     * Parse a channel name into chat object parts
     * @private
     */
    parseChannel(channel) {

        let info = channel.split('#');

        return {
            global: info[0],
            type: info[1],
            private: info[2] === 'private.'
        };

    }

    /**
     * Get the internal channel name of supplied string
     * @private
     */
    augmentChannel(original = new Date().getTime(), isPrivate = true) {

        let channel = original.toString();

        // public.* has PubNub permissions for everyone to read and write
        // private.* is totally locked down and users must be granted access one by one
        let chanPrivString = 'public.';

        if (isPrivate) {
            chanPrivString = 'private.';
        }

        if (channel.indexOf(this.chatEngine.ceConfig.globalChannel) === -1) {
            channel = [this.chatEngine.ceConfig.globalChannel, 'chat', chanPrivString, channel].join('#');
        }

        return channel;

    }

}

module.exports = Utility;
