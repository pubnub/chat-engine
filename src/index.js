var rltm = new Realtime({
    publishKey: 'pub-c-72832def-4ca3-4802-971d-68112db1b30a',
    subscribeKey: 'sub-c-28e05466-8c18-11e6-a68c-0619f8945a4f'
});

let me;

const Chat = function(userIds) {

    this.onCreate = () => {
        rltm.subscribe();
    };

    this.startTyping = () => {
        rltm.publish();
    };

    this.startTyping = () => {
        rltm.publish();
    };

    this.onCreate();

};

const User = function(id, data) {

    this.id = id;
    this.data = data;

    this.createChat = (users) => {

    };

};

me = new User('ian', {value: true});

let chat = new Chat(['john', 'mary'], (chat) => {

    chat.startTyping();

    chat.stopTyping();

    chat.sendMessage({
        text: 'hello world'
    });

});

console.log(rltm);

var chatSDK = {};
