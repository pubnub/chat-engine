angular.module('chatApp', ['open-chat-framework'])
    .run(['$rootScope', 'ngOCF', function($rootScope, ngOCF) {
        
        console.log(ngOCF)

        // OCF Configure
        $rootScope.OCF = OpenChatFramework.create({
            rltm: {
                service: 'pubnub', 
                config: {
                    publishKey: 'pub-c-4d01656a-cdd2-4474-adc3-30692132915c',
                    subscribeKey: 'sub-c-a59afd1c-a85b-11e6-af18-02ee2ddab7fe',
                    restore: false
                }
            },
            globalChannel: 'ocf-javascript-demo'
        });

        $rootScope.OCF.loadPlugin(OpenChatFramework.plugin.typingIndicator({
            timeout: 5000
        }));
        $rootScope.OCF.loadPlugin(OpenChatFramework.plugin.onlineUserSearch());
        $rootScope.OCF.loadPlugin(OpenChatFramework.plugin.history());

        ngOCF.bind($rootScope.OCF);

        // get username from query string
        let username = location.search.split('username=')[1];

        // create a user for myself and store as ```me```
        $rootScope.me = $rootScope.OCF.connect(username, {username: username});

        $rootScope.chats = [];

    }])
    .controller('Chat', function($scope) {

        $scope.leave = (index) => {
            
            $scope.chat.leave();
            $scope.chats.splice(index, 1);

        }

        $scope.sendMessage = () => {
            $scope.chat.send('message', $scope.messageDraft);
            $scope.messageDraft = '';
        }

        $scope.chat.on('$typingIndicator.startTyping', (event) => {
            event.sender.isTyping = true;
        });
        $scope.chat.on('$typingIndicator.stopTyping', (event) => {
            event.sender.isTyping = false;
        });

        $scope.messages = [];
        $scope.lastSender = null;

        addMessage = (payload, isHistory) => {

            payload.isHistory = isHistory;
            payload.sameUser = false;
            
            payload.sameUser = $scope.messages.length > 0 && payload.sender.data.uuid == $scope.messages[$scope.messages.length - 1].sender.data.uuid;
            payload.isSelf = payload.sender.data.uuid == $scope.me.data.uuid;

            $scope.messages.push(payload);

        }

        // if this chat receives a message that's not from this sessions
        $scope.chat.on('$history.message', function(payload) {
            // render it in the DOM with a special class
            addMessage(payload, true);
        });

        // when this chat gets a message
        $scope.chat.on('message', function(payload) {
            // render it in the DOM
            addMessage(payload, false);

        });

    })
    .controller('OnlineUser', function($scope) {

        $scope.newChat = function(user) {

            // define a channel using the clicked user's username and this client's username
            let chan = $scope.OCF.globalChat.channel + '.' + [user.data.uuid, $scope.me.data.uuid].sort().join(':');

            // create a new chat with that channel
            let newChat = new $scope.OCF.Chat(chan);

            // send the clicked user a private message telling them we invited them
            user.direct.send('private-invite', {channel: newChat.channel});

            // add the chat to the list
            $scope.chats.push(newChat);

        };

    })
    .controller('ChatAppController', function($scope) {

        // bind chat to updates
        $scope.chat = $scope.OCF.globalChat;

        // when I get a private invite
        $scope.me.direct.on('private-invite', (payload) => {

            // create a new chat and render it in DOM
            $scope.chats.push(new $scope.OCF.Chat(payload.data.channel));

        });

        // hide / show usernames based on input
        $scope.userSearch = {
            input: '',
            fire: () => { 

                // get a list of our matching users
                let found = $scope.OCF.globalChat.onlineUserSearch.search($scope.userSearch.input);
                
                // hide every user
                for(let uuid in $scope.chat.users) {
                    $scope.chat.users[uuid].hideWhileSearch = true;
                }

                // show all found users
                for(let i in found) {
                    $scope.chat.users[found[i].data.uuid].hideWhileSearch = false;
                }

            }
        };

    });
