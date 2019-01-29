const path = require('path');
const chai = require('chai');
const { Pact } = require('@pact-foundation/pact');
const axios = require('axios');

const assert = chai.assert;

const MOCK_SERVER_PORT = 2210;

const subscribeExpected = {
    t: {
        t: '15483650229757386',
        r: 2
    },
    m: [
        {
            a: '3',
            f: 0,
            i: 'user2',
            p: {
                t: '15483650229791065',
                r: 2
            },
            k: 'sub-c-key',
            c: 'chat-engine-demo#chat#public.#chat',
            d: {
                sender: 'user2',
                event: '$typingIndicator.stopTyping',
                chatengineSDK: '0.9.19'
            },
            b: 'chat-engine-demo#user1#custom'
        },
        {
            a: '3',
            f: 0,
            i: 'user2',
            p: {
                t: '15483650229732509',
                r: 2
            },
            k: 'sub-c-bfaaf6f8-da0e-11e8-befe-22cc51e2fc9c',
            c: 'chat-engine-demo#chat#public.#chat',
            d: {
                data: {
                    text: 'test message'
                },
                sender: 'user2',
                event: 'message',
                chatengineSDK: '0.9.19'
            },
            b: 'chat-engine-angular2-simple#user1#custom'
        }
    ]
};

const presentExpected = {
    t: {
        t: '15485145047631864',
        r: 2
    },
    m: [
        {
            a: '3',
            f: 0,
            p: {
                t: '15485145047329573',
                r: 1
            },
            k: 'sub-c-key',
            c: 'chat-engine-demo#user#user2#write.#direct-pnpres',
            d: {
                action: 'join',
                uuid: 'user2',
                timestamp: 1548514504,
                occupancy: 1
            },
            b: 'chat-engine-demo#user2#system-pnpres'
        }
    ]
};

describe('Pact', () => {
    const provider = new Pact({
        port: MOCK_SERVER_PORT,
        log: path.resolve(process.cwd(), 'logs', 'pact.log'),
        dir: path.resolve(process.cwd(), 'pacts'),
        spec: 2,
        consumer: 'CE-client',
        provider: 'PUBSUB-server'
    });

    // Setup the provider
    before(() => provider.setup());

    // Write Pact when all tests done
    after(() => provider.finalize());

    // verify with Pact, and reset expectations
    afterEach(() => provider.verify());

    describe('publish', () => {
        before((done) => {
            const publish = {
                uponReceiving: 'GET publish',
                withRequest: {
                    method: 'GET',
                    path: '/publish/pub-c-key/sub-c-key/0/chat-engine-demo%23chat%23public.%23chat/0/%7B%22data%22%3A%7B%22text%22%3A%22hello%22%7D%2C%22sender%22%3A%22user1%22%2C%22event%22%3A%22message%22%2C%22chatengineSDK%22%3A%220.9.19%22%7D',
                    query: 'store=1&uuid=user1&pnsdk=PubNub-JS-Web%2F4.20.2&auth=auth-key'
                },
                willRespondWith: {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
                        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE'
                    }
                }
            };

            provider.addInteraction(publish).then(() => {
                done();
            });
        });

        it('verify', (done) => {
            const url = `http://localhost:${MOCK_SERVER_PORT}/publish/pub-c-key/sub-c-key/0/chat-engine-demo%23chat%23public.%23chat/0/%7B%22data%22%3A%7B%22text%22%3A%22hello%22%7D%2C%22sender%22%3A%22user1%22%2C%22event%22%3A%22message%22%2C%22chatengineSDK%22%3A%220.9.19%22%7D?store=1&uuid=user1&pnsdk=PubNub-JS-Web%2F4.20.2&auth=auth-key`;

            axios({ method: 'GET', headers: {}, url })
                .then((res) => {
                    assert(res.status === 200);
                    done();
                });

        });
    });

    describe('here now', () => {
        before((done) => {
            const presence = {
                uponReceiving: 'GET here now',
                withRequest: {
                    method: 'GET',
                    path: '/v2/presence/sub-key/sub-c-key/channel/chat-engine-demo%23chat%23public.%23chat',
                    query: 'state=1&uuid=user1&pnsdk=PubNub-JS-Web%2F4.20.2&auth=auth-key'
                },
                willRespondWith: {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
                        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE'
                    },
                    body: {
                        status: 200,
                        message: 'OK',
                        occupancy: 2,
                        uuids: [{ uuid: 'user1' }, { uuid: 'user2' }],
                        service: 'Presence'
                    }
                }
            };

            provider.addInteraction(presence).then(() => {
                done();
            });
        });

        it('verify', (done) => {
            const url = `http://localhost:${MOCK_SERVER_PORT}/v2/presence/sub-key/sub-c-key/channel/chat-engine-demo%23chat%23public.%23chat?state=1&uuid=user1&pnsdk=PubNub-JS-Web%2F4.20.2&auth=auth-key`;

            axios({ method: 'GET', headers: {}, url })
                .then((res) => {
                    assert.deepEqual(res.data, {
                        status: 200,
                        message: 'OK',
                        occupancy: 2,
                        uuids: [{ uuid: 'user1' }, { uuid: 'user2' }],
                        service: 'Presence'
                    });
                    done();
                });

        });
    });

    describe('subscribe', () => {
        before((done) => {
            const subscribe = {
                uponReceiving: 'GET subscribe',
                withRequest: {
                    method: 'GET',
                    path: '/v2/subscribe/sub-c-bfaaf6f8-da0e-11e8-befe-22cc51e2fc9c/%2C/0',
                    query: 'heartbeat=300&channel-group=chat-engine-demo%23bat%23rooms%2Cchat-engine-demo%23user1%23system%2Cchat-engine-demo%23user1%23custom%2Cchat-engine-demo%23user1%23rooms-pnpres%2Cchat-engine-demo%23user1%23system-pnpres%2Cchat-engine-demo%23user1%23custom-pnpres&&tt=15483650228517674&tr=2&uuid=user1&pnsdk=PubNub-JS-Web%2F4.20.2&auth=auth-key'
                },
                willRespondWith: {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
                        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE'
                    },
                    body: subscribeExpected
                }
            };

            provider.addInteraction(subscribe).then(() => {
                done();
            });
        });


        it('verify', (done) => {
            const url = `http://localhost:${MOCK_SERVER_PORT}/v2/subscribe/sub-c-bfaaf6f8-da0e-11e8-befe-22cc51e2fc9c/%2C/0?heartbeat=300&channel-group=chat-engine-demo%23bat%23rooms%2Cchat-engine-demo%23user1%23system%2Cchat-engine-demo%23user1%23custom%2Cchat-engine-demo%23user1%23rooms-pnpres%2Cchat-engine-demo%23user1%23system-pnpres%2Cchat-engine-demo%23user1%23custom-pnpres&&tt=15483650228517674&tr=2&uuid=user1&pnsdk=PubNub-JS-Web%2F4.20.2&auth=auth-key`;

            axios({ method: 'GET', headers: {}, url })
                .then((res) => {
                    assert.deepEqual(res.data, subscribeExpected);
                    done();
                });
        });
    });

    describe('presence', () => {
        before((done) => {
            const presence = {
                uponReceiving: 'GET presence',
                withRequest: {
                    method: 'GET',
                    path: '/v2/subscribe/sub-c-key/%2C/0',
                    query: 'heartbeat=300&channel-group=chat-engine-demo%23user2%23rooms%2Cchat-engine-demo%23user2%23system%2Cchat-engine-demo%23user2%23custom%2Cchat-engine-demo%23user2%23rooms-pnpres%2Cchat-engine-demo%23user2%23system-pnpres%2Cchat-engine-demo%23user2%23custom-pnpres&tt=15485145022049956&tr=2&uuid=user2&pnsdk=PubNub-JS-Web%2F4.20.2&auth=auth-key'
                },
                willRespondWith: {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
                        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE'
                    },
                    body: presentExpected
                }
            };

            provider.addInteraction(presence).then(() => {
                done();
            });
        });

        it('verify', (done) => {
            const url = `http://localhost:${MOCK_SERVER_PORT}/v2/subscribe/sub-c-key/%2C/0?heartbeat=300&channel-group=chat-engine-demo%23user2%23rooms%2Cchat-engine-demo%23user2%23system%2Cchat-engine-demo%23user2%23custom%2Cchat-engine-demo%23user2%23rooms-pnpres%2Cchat-engine-demo%23user2%23system-pnpres%2Cchat-engine-demo%23user2%23custom-pnpres&tt=15485145022049956&tr=2&uuid=user2&pnsdk=PubNub-JS-Web%2F4.20.2&auth=auth-key`;

            axios({ method: 'GET', headers: {}, url })
                .then((res) => {
                    assert.deepEqual(res.data, presentExpected);
                    done();
                });
        });
    });

    describe('history', () => {
        before((done) => {
            const history = {
                uponReceiving: 'GET history',
                withRequest: {
                    method: 'GET',
                    path: '/v1/channel-registration/sub-key/sub-c-key/channel-group/chat-engine-demo%23user1%23custom',
                    query: 'uuid=user1&pnsdk=PubNub-JS-Web%2F4.20.2&auth=auth-key'
                },
                willRespondWith: {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
                        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE'
                    },
                    body: {
                        status: 200,
                        payload: {
                            channels: [],
                            group: 'chat-engine-demo#user1#custom'
                        },
                        service: 'channel-registry',
                        error: false
                    }
                }
            };

            provider.addInteraction(history).then(() => {
                done();
            });
        });

        it('verify', (done) => {
            const url = `http://localhost:${MOCK_SERVER_PORT}/v1/channel-registration/sub-key/sub-c-key/channel-group/chat-engine-demo%23user1%23custom?uuid=user1&pnsdk=PubNub-JS-Web%2F4.20.2&auth=auth-key`;

            const expected = {
                status: 200,
                payload: {
                    channels: [],
                    group: 'chat-engine-demo#user1#custom'
                },
                service: 'channel-registry',
                error: false
            };

            axios({ method: 'GET', headers: {}, url })
                .then((res) => {
                    assert.deepEqual(res.data, expected);
                    done();
                });
        });
    });
});
