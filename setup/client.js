let Client = function (options) {

    var self = this;

    var errHandle = function (text) {
        if (options.debug) {
            console.error(colors.red('API Error: ' + text));
        }
    };

    var clog = function (input) {

        if (options.debug) {
            if (typeof(input) === 'object') {
                console.log(input);
            } else {
                console.log('API:'.yellow, input);
            }
        }
    };

    options = options || {};

    self.endpoint = options.endpoint || 'https://portal1.gold.aws-pdx-3.ps.pn';

    self.session = false;

    self.request = function (method, url, opts, holla) {

        if (url[1] !== 'me' && !self.session) {
            return errHandle('Authorize with init() first.');
        }

        opts = opts || {};

        opts.url = self.endpoint + '/' + url.join('/');
        opts.method = method;

        opts.json = true;
        opts.headers = opts.headers || {};
        // opts.headers.Authorization =
        //     'Basic cHVibnViLWJldGE6YmxvY2tzMjAxNg===';

        if (self.session) {
            opts.headers['X-Session-Token'] = self.session.token;
        }

        // clog('-- URL:'.yellow);
        clog(opts.method.red + ' ' + opts.url);
        clog('-- opts:'.yellow);
        clog(opts);

        $.ajax(opts)
            .done((data) => {
                console.log(data)
                holla(null, data)
            })
            .fail((data) => {
                console.log('fail', data)
                holla(data || data.message || data)
            })


    };

    self.init = function (input, holla) {

        self.request('post', ['api', 'me'], {
            data: {
                email: input.email || errHandle('No Email Supplied'),
                password: input.password || errHandle('No Password Supplied')
            }
        }, function (err, body) {

            if (body && body.error) {
                holla(body.error);
            } else if (err) {
                holla(err);
            } else {
                self.session = body.result;
                holla(null, body);
            }

        });

    };

    return self;

};
