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


let ChatEngine = ChatEngineCore.create({
    publishKey: process.env.PUB_KEY_0,
    subscribeKey: process.env.SUB_KEY_0
}, {
    globalChannel,
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
            globalChannel,
            throwErrors: true,
            debug: false
        });

        others.push(ChatEngineYou);
        console.log('created:' + u);
    }

    others.forEach((x, i) => {

        x.on('$.ready', (data) => {

            users.push(data);

            x.onAny((a) => {
                console.log(a)
            });
            x.on('$.network.down.*', (a, b) => {
                console.log(a, b)
            })

            data.me.on('$.invite', (payload) => {

                console.log('invite')

                let chat = new ChatEngineYou.Chat(payload.data.channel);
                chats.push(chat);
                console.log('accepted: ' + (i + 1));
            });

            console.log('invit ing the new user')

            setTimeout(() => {

                myChat.invite(data.me);

            }, i * 100);

        });

        x.connect(`'user-'${i + 1}`, { works: true }, `user-${i + 1}-authtoken`);
    });


});

ChatEngine.connect('ian', { works: true }, 'ian-authtoken');
