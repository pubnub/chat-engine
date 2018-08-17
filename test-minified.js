let spawnClient = (uuid, invite) => {

    const ChatEngine = ChatEngineCore.create({
        publishKey: 'pub-c-d8599c43-cecf-42ba-a72f-aa3b24653c2b',
        subscribeKey: 'sub-c-6c6c021c-c4e2-11e7-9628-f616d8b03518'
    }, {
        globalChannel: 'minified-tester'
    });

    ChatEngine.on('$.ready', (data) => {

        let me = data.me;

        me.direct.on('$.something.hey', () => {
            console.info('it worked!');
        });

        let otherUser = new ChatEngine.User(invite);

        setTimeout(() => {
            otherUser.direct.emit('$.something.hey');
        });

    });

    ChatEngine.connect(uuid, {}, 'auth');

}
