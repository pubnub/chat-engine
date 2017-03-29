const Emitter = require('./Emitter');
const OCF = require('./OCF');
const Chat = require('./Chat');

/**
* This is our User class which represents a connected client
*
* @class User
* @constructor
* @extend Emitter
*/

module.exports = class User extends Emitter {

    constructor(uuid, state = {}, chat = OCF.globalChat) {

        super();

        // this is public id exposed to the network
        this.uuid = uuid;

        // keeps account of user state in each channel
        this.states = {};

        // keep a list of chatrooms this user is in
        this.chats = {};

        // every user has a couple personal rooms we can connect to
        // feed is a list of things a specific user does that 
        // many people can subscribe to
        this.feed = new Chat(
            [OCF.globalChat.channel, 'feed', uuid].join('.'));

        // direct is a private channel that anybody can publish to
        // but only the user can subscribe to
        // this permission based system is not implemented yet
        this.direct = new Chat(
            [OCF.globalChat.channel, 'direct', uuid].join('.'));

        // if the user does not exist at all and we get enough 
        // information to build the user
        if(!OCF.users[uuid]) {
            OCF.users[uuid] = this;
        }

        // update this user's state in it's created context
        this.assign(state, chat)
        
    }

    // get the user's state in a chatroom
    state(chat = OCF.globalChat) {
        return this.states[chat.channel] || {};
    }

    // update the user's state in a specific chatroom
    // this is called from the client
    update(state, chat = OCF.globalChat) {
        let chatState = this.state(chat) || {};
        this.states[chat.channel] = Object.assign(chatState, state);
    }

    // this is only called from network updates
    assign(state, chat) {
        this.update(state, chat);
    }

    // adds a chat to this user
    addChat(chat, state) {

        // store the chat in this user object
        this.chats[chat.channel] = chat;
    
        // updates the user's state in that chatroom
        this.assign(state, chat);
    }

}
