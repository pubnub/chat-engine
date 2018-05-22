### THIS DOES NOT REFLECT TRUE CONDITONAL EXECUTION

That is what code is for.

# Example Scenarios:

-



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
