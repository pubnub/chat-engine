const path = require('path');
const chai = require('chai');
const { Pact } = require('@pact-foundation/pact');
const axios = require('axios');

const assert = chai.assert;

const MOCK_SERVER_PORT = 2209;

describe('Pact', () => {
    const provider = new Pact({
        port: MOCK_SERVER_PORT,
        log: path.resolve(process.cwd(), 'logs', 'pact.log'),
        dir: path.resolve(process.cwd(), 'pacts'),
        spec: 2,
        consumer: 'CE-client',
        provider: 'CE-server'
    });

    // Setup the provider
    before(() => provider.setup());

    // Write Pact when all tests done
    after(() => provider.finalize());

    // verify with Pact, and reset expectations
    afterEach(() => provider.verify());

    describe('POST bootstrap', () => {
        before((done) => {
            const postBootstrap = {
                uponReceiving: 'POST bootstrap',
                withRequest: {
                    method: 'POST',
                    path: '/v1/blocks/sub-key/sub-c-key/chat-engine-server',
                    query: 'route=bootstrap',
                    body: { uuid: 'user1', global: 'chat-engine-demo', authKey: 'auth-key' },
                    headers: {
                        'Content-Type': 'application/json'
                    }
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

            provider.addInteraction(postBootstrap).then(() => {
                done();
            });
        });

        it('verify', (done) => {
            const url = `http://localhost:${MOCK_SERVER_PORT}/v1/blocks/sub-key/sub-c-key/chat-engine-server?route=bootstrap`;

            const data = {
                uuid: 'user1',
                global: 'chat-engine-demo',
                authKey: 'auth-key'
            };

            axios({ method: 'POST', headers: { 'Content-Type': 'application/json' }, data, url })
                .then((res) => {
                    assert(res.status === 200);
                    done();
                });
        });
    });

    describe('POST join', () => {
        before((done) => {
            const postJoin = {
                uponReceiving: 'POST join',
                withRequest: {
                    method: 'POST',
                    path: '/v1/blocks/sub-key/sub-c-key/chat-engine-server',
                    query: 'route=join'
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

            provider.addInteraction(postJoin).then(() => {
                done();
            });
        });

        it('verify', (done) => {
            const url = `http://localhost:${MOCK_SERVER_PORT}/v1/blocks/sub-key/sub-c-key/chat-engine-server?route=join`;

            axios({ method: 'POST', headers: {}, url })
                .then((res) => {
                    assert(res.status === 200);
                    done();
                });
        });
    });

    describe('POST grant', () => {
        before((done) => {
            const postGrant = {
                uponReceiving: 'POST grant',
                withRequest: {
                    method: 'POST',
                    path: '/v1/blocks/sub-key/sub-c-key/chat-engine-server',
                    query: 'route=grant'
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

            provider.addInteraction(postGrant).then(() => {
                done();
            });
        });

        it('verify', (done) => {
            const url = `http://localhost:${MOCK_SERVER_PORT}/v1/blocks/sub-key/sub-c-key/chat-engine-server?route=grant`;

            axios({ method: 'POST', headers: {}, url })
                .then((res) => {
                    assert(res.status === 200);
                    done();
                });
        });
    });

    describe('POST user_read', () => {
        before((done) => {
            const postUserRead = {
                uponReceiving: 'POST user_read',
                withRequest: {
                    method: 'POST',
                    path: '/v1/blocks/sub-key/sub-c-key/chat-engine-server',
                    query: 'route=user_read',
                    body: { uuid: 'user1', global: 'chat-engine-demo', authKey: 'auth-key' },
                    headers: {
                        'Content-Type': 'application/json'
                    }
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

            provider.addInteraction(postUserRead).then(() => {
                done();
            });
        });

        it('verify', (done) => {
            const url = `http://localhost:${MOCK_SERVER_PORT}/v1/blocks/sub-key/sub-c-key/chat-engine-server?route=user_read`;

            const data = {
                uuid: 'user1',
                global: 'chat-engine-demo',
                authKey: 'auth-key'
            };

            axios({ method: 'POST', headers: { 'Content-Type': 'application/json' }, data, url })
                .then((res) => {
                    assert(res.status === 200);
                    done();
                });
        });
    });

    describe('POST user_write', () => {
        before((done) => {
            const postUserWrite = {
                uponReceiving: 'POST user_write',
                withRequest: {
                    method: 'POST',
                    path: '/v1/blocks/sub-key/sub-c-key/chat-engine-server',
                    query: 'route=user_write',
                    body: { uuid: 'user1', global: 'chat-engine-demo', authKey: 'auth-key' },
                    headers: {
                        'Content-Type': 'application/json'
                    }
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

            provider.addInteraction(postUserWrite).then(() => {
                done();
            });
        });

        it('verify', (done) => {
            const url = `http://localhost:${MOCK_SERVER_PORT}/v1/blocks/sub-key/sub-c-key/chat-engine-server?route=user_write`;

            const data = {
                uuid: 'user1',
                global: 'chat-engine-demo',
                authKey: 'auth-key'
            };

            axios({ method: 'POST', headers: { 'Content-Type': 'application/json' }, data, url })
                .then((res) => {
                    assert(res.status === 200);
                    done();
                });
        });
    });

    describe('POST group', () => {
        before((done) => {
            const postGroup = {
                uponReceiving: 'POST group',
                withRequest: {
                    method: 'POST',
                    path: '/v1/blocks/sub-key/sub-c-key/chat-engine-server',
                    query: 'route=group',
                    body: { uuid: 'user1', global: 'chat-engine-demo', authKey: 'auth-key' },
                    headers: {
                        'Content-Type': 'application/json'
                    }
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

            provider.addInteraction(postGroup).then(() => {
                done();
            });
        });

        it('verify', (done) => {
            const url = `http://localhost:${MOCK_SERVER_PORT}/v1/blocks/sub-key/sub-c-key/chat-engine-server?route=group`;

            const data = {
                uuid: 'user1',
                global: 'chat-engine-demo',
                authKey: 'auth-key'
            };

            axios({ method: 'POST', headers: { 'Content-Type': 'application/json' }, data, url })
                .then((res) => {
                    assert(res.status === 200);
                    done();
                });

        });
    });

    describe('GET chat', () => {
        before((done) => {
            const getChat = {
                uponReceiving: 'GET chat',
                withRequest: {
                    method: 'GET',
                    path: '/v1/blocks/sub-key/sub-c-key/chat-engine-server',
                    query: 'route=chat&channel=chat-engine-demo&uuid=user1&global=chat-engine-demo&authKey=auth-key'
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
                        found: true,
                        chat: {
                            channel: 'chat-engine-demo',
                            group: 'system',
                            private: false,
                            meta: {}
                        }
                    }
                }
            };

            provider.addInteraction(getChat).then(() => {
                done();
            });
        });

        it('verify', (done) => {
            const url = `http://localhost:${MOCK_SERVER_PORT}/v1/blocks/sub-key/sub-c-key/chat-engine-server?route=chat&channel=chat-engine-demo&uuid=user1&global=chat-engine-demo&authKey=auth-key`;

            axios({ method: 'GET', headers: {}, url })
                .then((res) => {
                    assert(res.status === 200);
                    assert.deepEqual(res.data, {
                        found: true,
                        chat: {
                            channel: 'chat-engine-demo',
                            group: 'system',
                            private: false,
                            meta: {}
                        }
                    });
                    done();
                });

        });
    });
});
