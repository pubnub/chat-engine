const path = require('path');
const chai = require('chai');
const { Pact } = require('@pact-foundation/pact');
const axios = require('axios');

const assert = chai.assert;

const MOCK_SERVER_PORT = 2208;

describe("Pact", () => {
  const provider = new Pact({
    port: MOCK_SERVER_PORT,
    log: path.resolve(process.cwd(), "logs", "pact.log"),
    dir: path.resolve(process.cwd(), "pacts"),
    logLevel: "INFO",
    spec: 2,
    consumer: "MyConsumer",
    provider: "MyProvider"
  });

// Setup the provider
  before(() => provider.setup());

  // Write Pact when all tests done
  after(() => provider.finalize());

  // verify with Pact, and reset expectations
  afterEach(() => provider.verify());

  describe('GET -> bootstrap', () => {
    before(done => {
      const interaction = {
        uponReceiving: 'GET bootstrap',
        withRequest: {
          method: 'GET',
          path: '/v1/blocks/sub-key/sub-c-key/chat-engine-server',
          query: 'route=bootstrap'
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: {}
        }
      };

      provider.addInteraction(interaction).then(() => {
        done();
      });
    });

    it("pact test", (done) => {
      const url = `http://localhost:${MOCK_SERVER_PORT}/v1/blocks/sub-key/sub-c-key/chat-engine-server?route=bootstrap`;

      axios({ method:'GET', url })
        .then((res) => {
          assert(res.status === 200);
          done();
        }).catch(err => console.log(err));
    }).timeout(5000);
  });

});

