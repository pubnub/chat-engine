// polyfill Promise
require('es6-promise/auto');

const Client = require('./client');
const ProvisionAccount = require('./setup_account');
const utils = require('./utils');


const extractError = (err) => {
    if (err && err.responseJSON && err.responseJSON.error) {
        return err.responseJSON.error;
    }
};

module.exports = class {

    constructor() {
        this.loginElement = $('#login');
        this.provisionElement = $('#setup');
        this.loadElement = $('#load');
        this.errorElement = $('#error');
        this.errorOutElement = $('#error-out');
        this.statusElement = $('#status');
        this.codeElement = $('#code');
        this.outputElement = $('#output');
        this.emailElement = $('#email');
        this.passwordElement = $('#password');

        this.loginElement.submit(this.onLoginRegister.bind(this));
        this.provisionElement.submit(this.onSetup.bind(this));

        this.userId = utils.findCookie('pnAdminId');
        let tokenCookie = utils.findCookie('pnAdminToken');

        this.client = new Client({
            session: tokenCookie,
            debug: false,
            endpoint: 'https://admin.pubnub.com'
        });

        if (this.userId && tokenCookie) {
            this.provisionElement.show();
            this.loginElement.hide();

            // analytics.identify(this.userId);
            this.identify(this.userId);
        }

    }

    displayStatus(statusText) {
        this.statusElement.show();
        this.statusElement.append($('<li class="list-group-item">' + statusText + '</li>'));
    }

    clearErrors() {
        this.errorElement.hide();
    }

    raiseError(err) {
        this.errorOutElement.html(err);
        this.errorElement.show();
    }

    onProvisionSuccess(err, data) {
        if (err) {
            this.loadElement.hide();
            this.provisionElement.show();

            this.errorOutElement.html(err);
            this.errorElement.show();
        } else {
            this.loadElement.hide();

            let output = '';
            output += '// Make sure to import ChatEngine first!\n';
            output += 'ChatEngine = ChatEngineCore.create({\n';
            output += "    publishKey: '" + data.pub + "',\n";
            output += "    subscribeKey: '" + data.sub + "'\n";
            output += '});\n';

            // analytics.track('chat_engine_activation');
            this.track('chat_engine_activation');

            this.codeElement.text(output);
            this.outputElement.show();
        }
    }

    onLoginRegister() {
        this.clearErrors();
        const email = this.emailElement.val();
        const password = this.passwordElement.val();

        if (!email || email === '') {
            this.raiseError('email not valid');
            return false;
        }

        if (!password || password === '') {
            this.raiseError('password not valid');
            return false;
        }

        this.client.init({ email, password }, (err, response) => {
            if (err) {
                this.raiseError(extractError(err));
            } else {
                this.userId = response.result.user_id;

                // analytics.identify(this.userId);
                this.identify(this.userId);

                this.provisionElement.show();
                this.loginElement.hide();
            }
        });


        return false;
    }

    onSetup() {
        this.clearErrors();

        this.loadElement.show();
        this.errorElement.hide();
        this.statusElement.empty();

        ProvisionAccount(this.client, this.userId, this.onProvisionSuccess.bind(this), this.displayStatus.bind(this));

        return false;
    }

    identify(id) {
        const analyticsData = {
            type: 'identify',
            anonymousId: document.cookie.substring(document.cookie.indexOf('=') + 4, document.cookie.indexOf(';') - 3),
            context: {
                library: {
                    name: 'PubNub Functions',
                    version: '0.0.1'
                },
                page: {
                    path: location.pathname,
                    url: location.href,
                    title: document.title,
                    search: location.search,
                    referrer: document.referrer
                },
                userAgent: navigator.userAgent
            },
            userId: id
        };
        $.ajax({
            type: 'POST',
            url: 'https://pubsub.pubnub.com/v1/blocks/sub-key/sub-c-218ba154-c8ba-11e7-9178-bafd478c18bc/analytics',
            data: JSON.stringify(analyticsData),
            contentType: 'application/json; charset=utf-8'
        });
    }

    track(event) {
        const analyticsData = {
            type: 'track',
            anonymousId: document.cookie.substring(document.cookie.indexOf('=') + 4, document.cookie.indexOf(';') - 3),
            event: event,
            context: {
                library: {
                    name: 'PubNub Functions',
                    version: '0.0.1'
                },
                page: {
                    path: location.pathname,
                    url: location.href,
                    title: document.title,
                    search: location.search,
                    referrer: document.referrer
                },
                userAgent: navigator.userAgent
            },
            userId: this.userId
        };
        $.ajax({
            type: 'POST',
            url: 'https://pubsub.pubnub.com/v1/blocks/sub-key/sub-c-218ba154-c8ba-11e7-9178-bafd478c18bc/analytics',
            data: JSON.stringify(analyticsData),
            contentType: 'application/json; charset=utf-8'
        });
    }

};
