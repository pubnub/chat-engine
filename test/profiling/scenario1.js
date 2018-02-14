const ChatEngineCore = require('../../src/index.js');

let globalChannel = 'global';

let ChatEngine = ChatEngineCore.create({
    publishKey: process.env.PUB_KEY_0,
    subscribeKey: process.env.SUB_KEY_0,
}, {
    endpoint: 'http://localhost:3000/insecure',
    globalChannel,
    throwErrors: false
});

const raw = process.argv.slice(2);

let params = {};

for (let x = 0; x < raw.length; x += 2) {
    params[raw[x]] = parseInt(raw[x + 1], 10);
}

let numberOfChats = params.chats;
let numberOfMessages = params.messages;
let chats = [];

function connectChat(chat) {
    chat.on('$.connected', () => {
        numberOfChats -= 1;
        console.log(numberOfChats);

        if (numberOfChats === 0) {
            console.log('ready');
            for (let f = 0; f <= chats.length - 1; f += 1) {
                for (let m = 1; m <= numberOfMessages; m += 1) {
                    chats[f].emit('message', { text: `chat: ${f} - message: ${m}` });
                }
            }
        }
    });

    chat.on('message', (payload) => {
        console.log(payload.data);
    });
}

ChatEngine.on('$.ready', () => {
    for (let c = 1; c <= numberOfChats; c += 1) {
        let chat = new ChatEngine.Chat(`chat-${c}`);

        console.log(`creating chat-${c}`);

        connectChat(chat);

        chats.push(chat);
    }
});

ChatEngine.connect('ian', { works: true }, 'ian-authtoken');
