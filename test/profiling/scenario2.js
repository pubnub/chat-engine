const ChatEngineCore = require('../../src/index.js');

const raw = process.argv.slice(2);

let params = {};

for (let x = 0; x < raw.length; x += 2) {
    params[raw[x]] = parseInt(raw[x + 1], 10);
}

let numberOfUsers = params.users;
let users = [];

let globalChannel = 'global';
let myChat = null;
let chats = [];

let ChatEngine = ChatEngineCore.create({
    publishKey: process.env.PUB_KEY_0,
    subscribeKey: process.env.SUB_KEY_0
}, {
    throwErrors: true,
    debug: false
});


ChatEngine.on('$.ready', () => {
    myChat = new ChatEngine.Chat('mychat');

    let others = [];

    for (let u = 1; u <= numberOfUsers; u += 1) {
        let ChatEngineYou = ChatEngineCore.create({
            publishKey: process.env.PUB_KEY_0,
            subscribeKey: process.env.SUB_KEY_0
        }, {
            throwErrors: true,
            debug: false
        });

        others.push(ChatEngineYou);
        console.log('created:' + u);
    }

    others.forEach((x, i) => {

        x.on('$.ready', (data) => {
            users.push(data);

            data.me.direct.on('$.invite', (payload) => {
                let chat = new ChatEngine.Chat(payload.data.channel);
                chats.push(chat);
                console.log('accepted: ' + (i + 1));
            });

            myChat.invite(data.me);
        });

        x.connect(`'user-'${i + 1}`, { works: true }, `user-${i + 1}-authtoken`);
    });


});

ChatEngine.connect('ian', { works: true }, 'ian-authtoken');
