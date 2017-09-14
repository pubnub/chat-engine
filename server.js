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
  next();
});


function logger(req,res,next){
  console.log('\n-----', req.method, req.url, '\n');
  console.log(req.body)
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
        ttl: 0
    }, function (a,b,c) {

        pubnub.grant({
            channels: chanEverybodyW,
            write: true, // false to disallow
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

let db = {
    public: [],
    private: []
};

let authUser = (uuid, authKey, channel, done) => {

    console.log('new grant for ', uuid, authKey, 'access on channel', channel)

    let key = ['private', uuid].join(':');
    db[key] = db[key] || [];

    let newChannels = [channel, channel + '-pnpres'];

    if(authKey) {

        pubnub.grant({
            channels: newChannels,
            read: true, // false to disallow
            write: true,
            ttl: 0,
            authKeys: [authKey]
        }, function (a,b,c) {

            console.log('uuid', uuid, 'has access to', key, 'with authkey', authKey)

            if(db[key].indexOf(channel) == -1) {
                db[key].push(channel);
            }

           done();

        });

    } else {
        done('no autheky supplied')
    }

}

// we logged in, grant
app.post('/insecure/setup', function (req, res) {

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

    let key = ['private', req.param.uuid].join(':');
    let myPrivateChats = db[key] || [];

    key = ['public', req.param.uuid].join(':');
    let myPublicChats = db[key] || [];

    globalGrant(req.body.channel, req.body.uuid, req.body.authKey, () => {

        db['authkeys:' + req.body.uuid] = req.body.authKey;

        console.log('response returning json')

        return res.json({
            fixed: fixed,
            private: myPrivateChats,
            public: myPublicChats
        });

    });

});

// new chat
app.post('/insecure/chats', function(req, res) {

    // if the client says this is public, add them to the list of public chats for this user

    // logic goes here to tell if user can create this specific chat
    console.log('new chat created on behalf of ', req.body.uuid, req.body.authKey, 'for channel', req.body.chat.channel, 'privatE?', req.body.chat.private);

    let newChan = [req.body.globalChannel, 'user', req.body.uuid, 'write.', 'direct'].join('#');

    console.log('new chan', newChan)

    console.log(req.body)

    console.log(req.body.chat);

    pubnub.publish({
        channel: newChan,
        message: {
            event: '$.server.chat.created',
            chat: req.body.chat
        }
    }, function(a,b) {
        console.log(a,b)
    });

    if(!req.body.chat.private) {

        let key = ['public', req.body.uuid].join(':');
        db[key] = db[key] || [];

        if(db[key].indexOf(req.body.chat.channel) == -1) {
            db[key].push(req.body.chat.channel);
        }

        return res.sendStatus(200);

    } else {

        // needs to check that chat does not exist within private listing
        if(db['private'].indexOf(req.body.chat.channel) == -1) {

            db['private'].push(req.body.chat.channel);

            authUser(req.body.uuid, req.body.authKey, req.body.chat.channel, () => {
                console.log('chat finished auth')
                return res.sendStatus(200);
            });

        } else {
            console.log('not auto granting', req.body.uuid, req.body.authKey, 'permissions on', req.body.chat.channel, 'because the channel already has permissions');
            return res.sendStatus(200)
        }

    }

});

app.post('/insecure/invite', function (req, res) {

    // you can only invite if you're in the channel
    // grants the user permission in the channel
    let key = ['private', req.body.myUUID].join(':');

    console.log('invite called', req.body.uuid, req.body.authKey, 'in channel', req.body.chat.channel, 'with key', key)
    console.log(db[key])

    if(db[key] && db[key].indexOf(req.body.chat.channel) > -1) {

        console.log('this user has auth in this chan, and can invite other users... proceeding');

        // grants, grants, grants, grants, grants grants, grants everybody!
        authUser(req.body.uuid, db['authkeys:' + req.body.uuid], req.body.chat.channel, () => {
            res.sendStatus(200);
        });

    } else {

        console.log('can not invite user to this channel')

        res.sendStatus(401)
    }

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

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
