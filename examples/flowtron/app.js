let sounds = {
    send: new Audio("send.wav"),
    broadcast: new Audio("broadcast.wav")
};

angular.module('chatApp', ['open-chat-framework', 'auth0.lock', 'ui.router', 'ngSanitize', 'ng-uploadcare'])
    .config(function(lockProvider) {

        lockProvider.init({
          clientID: 'BiY_C0X0jFeVZ8KlxFqMKwT1xrn96xTM',
          domain: 'pubnub-ocf.auth0.com',
            options: {
              _idTokenVerification: false
            }
        });

    })
    .run(function($rootScope, lock, Me, OCF, $state) {

        // For use with UI Router
        lock.interceptHash();

        let profile = localStorage.getItem('profile');

        if(profile && profile.length) {

            profile = JSON.parse(profile);
            Me.profile = OCF.connect(profile.user_id, profile);

        }

        lock.on('authenticated', function(authResult) {

            localStorage.setItem('id_token', authResult.idToken);

            lock.getProfile(authResult.idToken, function(error, profile) {

                if (error) {
                    console.log(error);
                }

                localStorage.setItem('profile', JSON.stringify(profile));

                // connect to OCF
                Me.profile = OCF.connect(profile.user_id, profile);

                $state.go('dash')

            });
        });

    })
    .factory('Me', function() {

        return {
            profile: false
        }

    })
    .factory('OCF', function(ngOCF) {

        // OCF Configure
        let OCF = OpenChatFramework.create({
            rltm: {
                service: 'pubnub',
                config: {
                    publishKey: 'pub-c-07824b7a-6637-4e6d-91b4-7f0505d3de3f',
                    subscribeKey: 'sub-c-43b48ad6-d453-11e6-bd29-0619f8945a4f',
                    restore: false
                }
            },
            globalChannel: 'ocf-demo-angular-3'
        });

        // bind open chat framework angular plugin
        ngOCF.bind(OCF);

        OCF.onAny((event, data) => {
            // console.log(event, data);
        });

        return OCF;

    })
    .config(function($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise('/login');

        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'views/login.html',
                controller: 'LoginCtrl'
            })
            .state('dash', {
                url: '/dash',
                templateUrl: 'views/dash.html',
                controller: 'ChatAppController'
            })
            .state('dash.chat', {
                url: '/:channel',
                templateUrl: 'views/chat.html',
                controller: 'Chat'
            })
    })
    .factory('Rooms', function(OCF, Me, $state) {

        let channels = ['Main', 'Portal', 'Blocks', 'Content', 'Support', 'Open Source', 'Client Eng', 'Docs', 'Marketing', 'Ops', 'Foolery'];

        let obj = {
            list: [],
            connect: false
        }

        obj.connect = () => {

            for(let i in channels) {
                obj.findOrCreate(channels[i])
            }

        }

        obj.find = (channel) => {

            let found = false;

            // if the chatroom is already in memory, use that one
            for(let i in obj.list) {
                if(obj.list[i].chat.channel == channel) {
                    found = obj.list[i];
                }
            }

            return found;

        }

        obj.findOrCreate = (channel) => {

            let foundRoom = obj.find(channel);

            if(foundRoom) {
                return foundRoom;
            } else {

                let room = {
                    name: channel,
                    chat: new OCF.Chat(channel),
                    isGroup: channels.indexOf(channel) > -1,
                    messages: [],
                    typingUsers: []
                }

                room.chat.plugin(OpenChatFramework.plugin['ocf-emoji']());
                room.chat.plugin(OpenChatFramework.plugin['ocf-markdown']());
                room.chat.plugin(OpenChatFramework.plugin['ocf-typing-indicator']());
                room.chat.plugin(OpenChatFramework.plugin['ocf-history']());
                room.chat.plugin(OpenChatFramework.plugin['ocf-unread-messages']());
                room.chat.plugin(OpenChatFramework.plugin['ocf-desktop-notifications']({
                    title: (event) => {
                        return 'New FlowTron Message In ' + room.name
                    },
                    message: (event) => {
                        return event.data.text;
                    },
                    icon: (event) => {
                        return '/examples/flowtron/logo@2x.png';
                    },
                    callback: (event) => {
                        $state.go('dash.chat', {channel: channel})
                        window.focus();
                    }
                }));

                // function to add a message to messages array
                let addMessage = (payload, type) => {

                    payload.type = type;

                    // if the last message was sent from the same user
                    payload.sameUser = room.messages.length > 0 && payload.sender.uuid == room.messages[room.messages.length - 1].sender.uuid;

                    // if this message was sent by this client
                    payload.isSelf = payload.sender.uuid == Me.profile.uuid;

                    console.log('added as ', payload)

                    if(!payload.isSelf && payload.type == 'message' || payload.type == 'history') {
                        sounds.broadcast.play();
                    }

                    // add the message to the array
                    room.messages.push(payload);

                }

                room.chat.on('$history.message', function(payload) {

                    // render it in the DOM with a special class
                    addMessage(payload, '$history.message');

                });

                room.chat.on('message', function(payload) {

                    // render it in the DOM
                    addMessage(payload, 'message');
                });

                room.chat.on('$history.upload', function(payload) {

                    // render it in the DOM with a special class
                    addMessage(payload, 'upload');

                });

                room.chat.on('upload', (payload) => {

                    addMessage(payload, 'upload');
                })

                let updateTyping = (user, isTyping) => {

                    let found = false;
                    for(let i in room.typingUsers) {

                        if(room.typingUsers[i].uuid == user.uuid) {

                            found = true;
                            if(!isTyping) {
                                room.typingUsers.splice(i, 1);
                            }

                        }

                    }

                    if(!found && isTyping) {
                        room.typingUsers.push(user);
                    }

                }

                room.chat.on('$typingIndicator.startTyping', (event) => {
                    updateTyping(event.sender, true);
                });
                room.chat.on('$typingIndicator.stopTyping', (event) => {
                    updateTyping(event.sender, false);
                });



                obj.list.push(room);

                return obj.list[obj.list.length - 1];

            }

        }

        return obj;

    })
    .controller('MainCtrl', function($scope, OCF, Me) {
    })
    .controller('LoginCtrl', function($scope, lock, OCF, Me, $state) {

        $scope.lock = lock;
        $scope.Me = Me;

        if(Me.profile) {
            return $state.go('dash');
        }

    })
    .controller('OnlineUser', function($scope, OCF, Me, $state) {

        $scope.invite = function(user, channel) {

            // send the clicked user a private message telling them we invited them
            user.direct.send('private-invite', {channel: channel});

        }

        // create a new chat
        $scope.newChat = function(user) {

            // define a channel using the clicked user's username and this client's username
            let chan = [OCF.globalChat.channel, Me.profile.state().user_id, user.state().user_id].sort().join(':')

            // create a new chat with that channel
            let newChat = new OCF.Chat(chan);

            $scope.invite(user, chan);

            $state.go('dash.chat', {channel: chan})

        };

    })
    .controller('ChatAppController', function($scope, $state, $stateParams, OCF, Me, Rooms) {

        Rooms.connect();

        $scope.rooms = Rooms.list;

        if(!Me.profile) {
            return  $state.go('login');
        }

        $scope.Me = Me;

        // bind chat to updates
        $scope.chat = OCF.globalChat;

        // when I get a private invite
        Me.profile.direct.on('private-invite', (payload) => {

            // create a new chat and render it in DOM
            $state.go('dash.chat', {channel: payload.data.channel});

        });

        OCF.globalChat.plugin(OpenChatFramework.plugin['ocf-online-user-search']({
            field: 'name'
        }));

        // hide / show usernames based on input
        $scope.userSearch = {
            input: '',
            fire: () => {

                // get a list of our matching users
                let found = OCF.globalChat.onlineUserSearch.search($scope.userSearch.input);

                // hide every user
                for(let uuid in $scope.chat.users) {
                    $scope.chat.users[uuid].hideWhileSearch = true;
                }

                // show all found users
                for(let i in found) {
                    $scope.chat.users[found[i].uuid].hideWhileSearch = false;
                }

            }
        };

    })
    .controller('Chat', function($scope, $stateParams, OCF, Me, $timeout, Rooms) {

        $scope.room = Rooms.findOrCreate($stateParams.channel);

        $scope.chat = $scope.room.chat;

        $scope.chat.unreadMessages.active();

        $scope.chat.on('message', () => {
            $scope.scrollToBottom();
        });

        $scope.chat.on('$history.*', () => {
            $scope.scrollToBottom();
        });

        $scope.uploadcare = {
            show: false,
            value: '',
            callback: (data) => {
                $scope.chat.send('upload', data);
                $scope.uploadcare.show = false;
            }
        };

        // we store the id of the lastSender
        $scope.lastSender = null;

        // leave a chatroom and remove from global chat list
        $scope.leave = (index) => {
            $scope.chat.leave();
        }

        $scope.isTyping = () => {

            if($scope.messageDraft.text) {
                $scope.chat.typingIndicator.startTyping();
            } else {
                $scope.chat.typingIndicator.stopTyping();
            }

        }

        $scope.chat.on('$typingIndicator.*', (event) => {
            $scope.scrollToBottom();
        });

        $scope.messageDraft = {
            text: '',
            suggestedEmoji: []
        }

        $scope.$watch('messageDraft.text', (newv, oldv) => {

            let words = newv.split(' ');
            let lastWord = words[words.length -1];

            if(lastWord[0] == ':' && lastWord[lastWord.length -1] !== ':') {
                $scope.messageDraft.suggestedEmoji = $scope.chat.emoji.search(lastWord);
            } else {
                $scope.messageDraft.suggestedEmoji = [];
            }

        });

        $scope.completeEmoji = (emoji) => {
            $scope.messageDraft.text = $scope.messageDraft.text.substring(0, $scope.messageDraft.text.lastIndexOf(" "));
            $scope.messageDraft.text = [$scope.messageDraft.text, emoji].join(' ');
        }

        // send a message using the messageDraft input
        $scope.sendMessage = () => {

            if($scope.messageDraft.text) {

                sounds.send.play();

                $scope.chat.send('message', {
                    text: $scope.messageDraft.text,
                    date: new Date()
                });

                $scope.messageDraft.text = '';

            }

        }

        $scope.scrollToBottom = () => {

            $timeout(function() {
              var scroller = document.getElementById("log");
              scroller.scrollTop = scroller.scrollHeight;
            }, 0, false);

        }
        $scope.scrollToBottom();

        $scope.$on('$destroy', function() {
            $scope.chat.unreadMessages.inactive();
        });

    });
