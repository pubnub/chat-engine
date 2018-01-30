module.exports = class {

    constructor(options) {
        options = options || {};

        this.endpoint = options.endpoint || 'https://admin.pubnub.com';
        this.session = options.session || false;
        this.debug = options.debug || false;
    }

    errHandle(text) {
        if (this.debug) {
            console.error('API Error: ' + text);
        }
    }

    clog(input) {
        if (this.debug) {
            if (typeof (input) === 'object') {
                console.log(input);
            } else {
                console.log('API:'.yellow, input);
            }
        }
    }

    request(method, url, opts, holla) {

        if (url[1] !== 'me' && !this.session) {
            return this.errHandle('Authorize with init() first.');
        }

        opts = opts || {};

        opts.url = this.endpoint + '/' + url.join('/');
        opts.method = method;

        opts.json = true;
        opts.headers = opts.headers || {};
        // opts.headers.Authorization =
        //     'Basic cHVibnViLWJldGE6YmxvY2tzMjAxNg===';

        if (this.session) {
            opts.headers['X-Session-Token'] = this.session;
        }

        // clog('-- URL:'.yellow);
        this.clog(opts.method.red + ' ' + opts.url);
        this.clog('-- opts:'.yellow);
        this.clog(opts);

        $.ajax(opts)
            .done((data) => {
                console.log(data);
                holla(null, data);
            })
            .fail((data) => {
                console.log('fail', data);
                holla(data || data.message || data);
            });
    }

    init(input, holla) {
        this.request('post', ['api', 'me'], {
            data: {
                email: input.email || this.errHandle('No Email Supplied'),
                password: input.password || this.errHandle('No Password Supplied')
            }
        }, (err, body) => {
            if (body && body.error) {
                holla(body.error);
            } else if (err) {
                holla(err);
            } else {
                this.session = body.result.token;
                holla(null, body);
            }
        });
    }

    /* shortcuts to avoid pollution of executors */
    startFunction({ block, key }, callback) {
        this.request('post', ['api', 'v1', 'blocks', 'key', key.id, 'block', block.id, 'start'], {
            data: {
                block_id: block.id,
                key_id: key.id,
                action: 'start'
            }
        }, callback);
    }

    storeSecretKey({ key }, callback) {
        this.request('put', ['api', 'vault', key.subscribe_key, 'key', 'secretKey'], {
            contentType: 'application/json',
            data: JSON.stringify({
                keyName: 'secretKey',
                key_id: key.id,
                subscribeKey: key.subscribe_key,
                value: key.secret_key
            })
        }, callback);
    }

};
