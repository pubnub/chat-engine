const ChatEngineCore = require('../../src/index.js');
const deepThought = require('../deep-thought').init();

const raw = process.argv.slice(2);

let params = {};

for (let x = 0; x < raw.length; x += 2) {
    params[raw[x]] = parseInt(raw[x + 1], 10);
}

let numberOfUsers = params.users;
let users = [];

let globalChannel = new Date().getTime();
let myChat = null;
let chats = [];

deepThought.identifyGlobal(globalChannel, 'profiling-2-users=' + numberOfUsers);

console.log('creating instance of uuid ian');

let ChatEngine = ChatEngineCore.create({
    publishKey: process.env.PUB_KEY_0,
    subscribeKey: process.env.SUB_KEY_0
}, {
    globalChannel,
    throwErrors: true,
    debug: false
});

ChatEngine.on('$.ready', () => {

    console.log('ian ready');
    console.log('ian making new chat "mychat"');

    myChat = new ChatEngine.Chat('mychat');

    let others = [];

    myChat.on('$.connected', () => {

        console.log('looping through other users')

        for (let u = 1; u <= numberOfUsers; u += 1) {

            console.log('creating user', u)

            let x = ChatEngineCore.create({
                publishKey: process.env.PUB_KEY_0,
                subscribeKey: process.env.SUB_KEY_0
            }, {
                globalChannel,
                throwErrors: true,
                debug: false
            });

            x.on('$.ready', (data) => {

                console.log('user', u, 'ready')

                users.push(data);

                data.me.direct.on('$.invite', (payload) => {

                    console.log('user', u, 'got invite')
                    console.log('user', u, 'creating chat')

                    let chat = new x.Chat(payload.data.channel);
                    chats.push(chat);

                });

                console.log('inviting user', u, 'to "mychat"')

                myChat.invite(data.me);

            });

            x.connect(`user-${u + 1}`, { works: true }, `user-${u + 1}-authtoken`);
        }

    });

});

ChatEngine.connect('ian', { works: true }, 'ian-authtoken');
