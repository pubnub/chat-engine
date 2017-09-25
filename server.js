let PubNub = require('pubnub');

let pubnub = new PubNub({
    publishKey: 'pub-c-c6303bb2-8bf8-4417-aac7-e83b52237ea6',
    subscribeKey: 'sub-c-67db0e7a-50be-11e7-bf50-02ee2ddab7fe',
    secretKey: 'sec-c-MjU3YjEwOGYtYzVkNC00N2M4LTliYTktN2FhY2U1OGI0Y2Iw'
});

const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const request = require('request');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});


function logger(req,res,next){
  console.log('\n-----', req.method, req.url, '\n');
  // console.log(req.body)
  next();
}

app.use(logger);

let reset = function() {

    pubnub.grant({
        read: false,
        write: false,
        ttl: 0
    }, function (a,b,c) {
        console.log('ALL PAM PERMISSIONS RESET');
    });

}

let globalGrant = function(gChan, myUUID, myAuthKey, next) {

    console.log('granting global access for', myUUID, 'permissions on ', gChan, 'for uuid', myUUID, 'with auth key', myAuthKey)

    let chanMeRW = [
        gChan,
        gChan + '-pnpres',
        gChan + '#chat#public.*',
        gChan + '#user#' + myUUID + '#read.*',
        gChan + '#user#' + myUUID + '#write.*'
    ];

    let chanEverybodyR = [
        gChan + '#user:' + myUUID + '#read.*'
    ];

    let chanEverybodyW = [
        gChan + '#user:' + myUUID + '#write.*'
    ];

    pubnub.grant({
        channels: chanEverybodyR,
        read: true, // false to disallow
        write: false,
        ttl: 0
    }, function (a,b,c) {

        pubnub.grant({
            channels: chanEverybodyW,
            write: true, // false to disallow
            read: false,
            ttl: 0
        }, function (a,b,c) {

            pubnub.grant({
                channels: chanMeRW,
                read: true, // false to disallow
                write: true, // false to disallow,
                authKeys: [myAuthKey],
                ttl: 0
            }, function (a,b,c) {

                next();

            });

        });

    });

}

app.use('/facebook', function(req, res, next) {

    if ('OPTIONS' === req.method) {
     //respond with 200
     return res.sendStatus(200);
   }

    request.get('https://graph.facebook.com/debug_token', {
        qs: {
            input_token: req.body.authKey,
            access_token: '305450936585628|d86681ec056638c4e80ee0921ea3bc34'
        },
        json: true
    }, function(err, body, response){

        if(response.data.is_valid && response.data.user_id == req.body.uuid) {
            next();
        } else {
            res.sendStatus(401);
        }

    });

});

app.get('/', function (req, res) {
  res.send('Hello World!')
});

app.post('/facebook/auth', function (req, res) {

    globalGrant(req.body.channel, req.body.uuid, req.body.authKey, () => {
        res.sendStatus(200);
    });

});

app.use('/insecure', function(req, res, next) {

    if ('OPTIONS' === req.method) {
      //respond with 200
      return res.sendStatus(200);
    }

    if(true) { // not very secure
        next(null);
    } else {
        return res.status(401);
    }

});

let db = {};

let authUser = (uuid, authKey, channel, forceAuth, done) => {

    let key = ['authed', channel].join(':');

    db[key] = db[key] || [];

    let newChannels = [channel, channel + '-pnpres'];

    console.log('!!!!', channel, key, db[key])

    console.log('forceAuth?', forceAuth)
    console.log('in list of permissions?', (db[key].indexOf(uuid) > -1));
    console.log('auth key?',  authKey)
    console.log('people permitted in that room', db[key])
    console.log(channel)

    if(forceAuth || !db[key].length || (db[key].indexOf(uuid) > -1 && authKey)) {

    // if(!db[key].length || forceAuth || (db[key].indexOf(uuid) > -1 && authKey)) {

        console.log('new grant for', uuid, authKey, 'access on channel', channel)

        pubnub.grant({
            channels: newChannels,
            read: true, // false to disallow
            write: true,
            ttl: 0,
            authKeys: [authKey]
        }, function (a,b,c) {

            console.log('uuid', uuid, 'granted access to', key, 'with authkey', authKey)

            if(db[key].indexOf(uuid) == -1) {
                db[key].push(uuid);
            }

           done();

        });

    } else {

        console.log('unauthorized for that chan')

        done('no autheky supplied')
    }

}

app.post('/insecure/grant', function(req, res) {

    console.log('doing global grant')
    globalGrant(req.body.channel, req.body.uuid, req.body.authKey, () => {

        db['authkeys:' + req.body.uuid] = req.body.authKey;
        return res.sendStatus(200);

    });

});

// we logged in, grant
app.get('/insecure/chats', function (req, res) {

    let fixed = [
        {
            channel: 'Main',
            private: false,
            group: 'fixed'
        },
        {
            channel: 'Support',
            private: false,
            group: 'fixed'
        },
        {
            channel: 'Docs',
            private: false,
            group: 'fixed'
        },
        {
            channel: 'Foolery',
            private: false,
            group: 'fixed'
        },
    ];

    console.log('uuid found as', req.query.uuid)

    key2 = ['session', req.query.uuid].join(':');
    let myPublicChats = db[key2] || [];

    let chats = fixed.concat(myPublicChats);

    console.log('my chats found as', chats)

    return res.json(chats);

});

// new chat
app.post('/insecure/chats', function(req, res) {

    // if the client says this is public, add them to the list of public chats for this user

    // logic goes here to tell if user can create this specific chat
    console.log('new chat created on behalf of ', req.body.uuid, req.body.authKey, 'for channel', req.body.chat.channel, 'privatE?', req.body.chat.private);

    let newChan = [req.body.globalChannel, 'user', req.body.uuid, 'write.', 'direct'].join('#');

    pubnub.publish({
        channel: newChan,
        message: {
            event: '$.server.chat.created',
            chat: req.body.chat
        }
    }, function(a,b) {
        // console.log(a,b)
    });

    let key = ['session', req.body.uuid].join(':');
    db[key] = db[key] || [];

    let found = false;

    if(!db[key]) {
        db[key] = [];
    }

    db[key].forEach((chat) => {
        if(!found & chat.channel == req.body.chat.channel) {
            found = true;
        }
    })

    if(!found) {
        db[key].push(req.body.chat);
    }

    return res.sendStatus(200);

});

app.delete('/insecure/chats', function(req, res) {

    console.log(req.body)

    console.log('chat deleted on behalf of ', req.body.uuid, req.body.authKey, 'for channel', req.body.chat.channel, 'privatE?', req.body.chat.private);

    let newChan = [req.body.globalChannel, 'user', req.body.uuid, 'write.', 'direct'].join('#');

    let key = ['session', req.body.uuid].join(':');
    db[key] = db[key] || [];

    db[key].forEach((chat, index) => {

        if(chat.channel == req.body.chat.channel) {

            console.log('FOUND FOUND FOUND')

            db[key].splice(index, 1);

            pubnub.publish({
                channel: newChan,
                message: {
                    event: '$.server.chat.deleted',
                    chat: req.body.chat
                }
            }, function(a,b) {
                console.log(a,b)
            });

        }

    });

    return res.sendStatus(200);

});

app.post('/insecure/chat/grant', function(req, res) {

    if(req.body.chat.private) {

        authUser(req.body.uuid, req.body.authKey, req.body.chat.channel, false, () => {
            console.log('chat finished auth')
            return res.sendStatus(200);
        });

    } else {
        return res.sendStatus(200);
    }

});

app.post('/insecure/chat/invite', function (req, res) {

    // you can only invite if you're in the channel
    // grants the user permission in the channel

    let key = ['authed', req.body.chat.channel].join(':');

    // grants, grants, grants, grants, grants grants, grants everybody!
    authUser(req.body.uuid, db['authkeys:' + req.body.uuid], req.body.chat.channel, true, () => {
        res.sendStatus(200);
    });

});

// uuids are permitted in channels
// authKey is what is used to grant
// server should make sure that uuid or other auth params match authKey for security

app.post('/test', function (req, res) {

    if(req.body.authKey == 'open-sesame') {

        // grants everybody!
        globalGrant(req.body.channel, req.body.uuid, req.body.authKey, () => {
            res.sendStatus(200);
        });

    } else {
        res.status(401);
    }

});

reset();

app.listen(3000, () => {
    console.log('Example app listening on port 3000!');
});
