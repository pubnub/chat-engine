const init = require('./bootstrap');

/**
Global object used to create an instance of {@link ChatEngine}.

@alias ChatEngineCore
@param pnConfig {Object} ChatEngine is based off PubNub. Supply your PubNub configuration parameters here. See the getting started tutorial and [the PubNub docs](https://www.pubnub.com/docs/web-javascript/api-reference-configuration).
@param ceConfig {Object} A list of ChatEngine specific configuration options.
@param [ceConfig.globalChannel=chat-engine] {String} The root channel. See {@link ChatEngine.global}
@param [ceConfig.enableSync] {Boolean} Synchronizes chats between instances with the same {@link Me#uuid}. See {@link Me#sync}.
@param [ceConfig.enableMeta] {Boolean} Persists {@link Chat#meta} on the server. See {@link Chat#update}.
@param [ceConfig.throwErrors=true] {Boolean} Throws errors in JS console.
@param [ceConfig.endpoint='https://pubsub.pubnub.com/v1/blocks/sub-key/YOUR_SUB_KEY/chat-engine-server'] {String} The root URL of the server used to manage permissions for private channels. Set by default to match the PubNub functions deployed to your account. See {@tutorial privacy} for more.
@param [ceConfig.debug] {Boolean} Logs all ChatEngine events to the console This should not be enabled in production.
@param [ceConfig.profile] {Boolean} Sums event counts and outputs a table to the console every few seconds.
@return {ChatEngine} Returns an instance of {@link ChatEngine}
@example
ChatEngine = ChatEngineCore.create({
    publishKey: 'YOUR_PUB_KEY',
    subscribeKey: 'YOUR_SUB_KEY'
});
*/

const create = (pnConfig, ceConfig = {}) => {

    if (ceConfig.globalChannel) {
        ceConfig.globalChannel = ceConfig.globalChannel.toString();
    } else {
        ceConfig.globalChannel = 'chat-engine';
    }

    if (typeof ceConfig.throwErrors === 'undefined') {
        ceConfig.throwErrors = true;
    }

    if (typeof ceConfig.enableSync === 'undefined') {
        ceConfig.enableSync = false;
    }

    if (typeof ceConfig.enableMeta === 'undefined') {
        ceConfig.enableMeta = false;
    }

    ceConfig.endpoint = ceConfig.endpoint || 'https://pubsub.pubnub.com/v1/blocks/sub-key/' + pnConfig.subscribeKey + '/chat-engine-server';

    pnConfig.heartbeatInterval = pnConfig.heartbeatInterval || 0;

    // return an instance of ChatEngine
    return init(ceConfig, pnConfig);

};

// export the ChatEngine api
const ChatEngineCore = {
    plugin: {},
    create: create
};

module.exports = ChatEngineCore;

module.exports.ChatEngineCore = ChatEngineCore;
