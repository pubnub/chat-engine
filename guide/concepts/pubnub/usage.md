### THIS DOES NOT REFLECT TRUE CONDITONAL EXECUTION

That is what code is for.

# Example Scenarios:

Each scenario is 30 seconds long

## One user connects. This is an example of a single user connecting to the system

User connects to ChatEngine See (#connect)

```
'blocks.bootstrap': 1 // user
'blocks.user_read': 1 // user
'blocks.user_write': 1 // user
'blocks.group': 1 // user
'blocks.grant': 3 // global + direct + feed
'blocks.join': 3 // global + direct + feed
```

User updates own state twice (see #connect) *
Makes two hereNow requests on global channel (see #connect)

* One state call is duplicated (this is a bug)

```
'presence.state': 2 // updates own state
'presence.heartbeat': 2 // calls hereNow twice
```

Subscribes to global channel

```
'subscribe.heartbeat': 1
```

## Two users invite each other into private channels and call search twice. They each send two messages in private chat.

Two users each bootstrap their own client

```
'blocks.bootstrap': 2
'blocks.user_read': 2
'blocks.user_write': 2
'blocks.group': 2
```

2 users (* 3 chats (global, direct, feed) + (other user's direct) + (channel I invite you to) + (channel you invite me to))

```
'blocks.grant': 12
'blocks.join': 12
'presence.state': 12
```

2 users * (I subscribe to my own invite + I get your invite) + 2 chats * (I publish a message + you publish a message)

* 10 subscribe heartbeats here unaccounted for

```
'subscribe.heartbeat': 18
```

Each user updates state twice.

```
'presence.heartbeat': 4
```

Each user invites another (grants access)

```
'blocks.invite': 2
```

Two users call search twice
(2 search * 2  users)

```
history: 4
```

2 users * 2 messages in private chat + (2 users * 1 invite in direct)

```
publish: 6
```

# Usage

## Connect

- handshake() - happens automatically
    - PubNub function bootstrap
        - executes auth policy
        - performs grant
            - grants on global
            - global presence
            - my channel
            - my read
            - my write
    - PubNub function user_read
        - grants everbody access on feed channel
    - PubNub function user_write
        - grants everybody access on direct channel
    - PubNub function group
        - grants me access to
        - rooms, system, custom
    - makes a new global chat
        - see #chat
    - makes session calls (if enableSync is true) (see #session)
    - creates a new user for self (see #user)
        - PubNub setState() with provided state on global channel
    - calls PubNub hereNow() to get user updates on global channel

## User

- automatic
    - PubNub function user_state
        - attempts to get state from server if state has not been set through other means
- update()
    - PubNub setState()
        - received by all other users in global channel

## Chat

- connect()
    - PubNub function grant
        - gives user permission to chat channel
    - PubNub function join
        - adds channel to channel group
    - PubNub function get chat
        - tries to get chat metadata
    - if enableMeta
        - if no chat metadata
            - PubNub function set chat metadata
    - if enableSync
        - PubNub publishes a message
            - received by self in multiple windows
    - PubNub hereNow()
    - PubNub hereNow()
        - 5 seconds later
- publish()
    - PubNub publish to chat channel
- search()
    - see #search
- invite()
    - User must be created. See (#user)
    - PubNub function invite
    - Connects to other user's direct channel (see #chat)
    - PubNub publish an invitation message to their channel
- leave()
    - Unsubscribes from channel
    - PubNub function leave
    - PubNub publish leave

## Search
- automatic
    - calls PubNub.history() a max of 10 times and limit of 100
        - this can happen as little as 1 time depending on inputs
    - can be called again with search.next()
    - if message is from user that is offline, user is created. See #user

# Session

- automatic
    - creates a new chat for session (see #chat)
    - PubNub.channelGroups.listChannels() to get current channels
