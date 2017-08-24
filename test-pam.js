const ChatEngineCore = require('./src/index.js');

const ChatEngine = ChatEngineCore.create({
  publishKey: 'pub-c-5f1e0d9d-89e5-485f-8f05-ad92a0fdb083',
  subscribeKey: 'sub-c-2fc37408-81fd-11e7-b8cd-f652352d4e79'
});

ChatEngine.connect('ian');

ChatEngine.on('$.ready', (p) => {

    let me = p.me;

    let chat = new ChatEngine.Chat('tutorial-room' + new Date());

    chat.once('$.online.*', (p) => {
        console.log('online', p.user.uuid, ChatEngine.me.uuid)
    });


});
