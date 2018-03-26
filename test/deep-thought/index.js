const chalk = require('chalk');
const winston  = require('winston');

require('winston-loggly-bulk');

module.exports = {
    init: function() {

        let self = {};

        self.globalTestNameMap = {};
        self.identifyGlobal = (globalName, title) => {
            self.globalTestNameMap[globalName] = title;

            let now = new Date().getTime();
            let hour = 60 * 60 * 1000;
            var when = new Date(now - hour);

            console.log('This test can be found at:\n' + 'https://chatengine.loggly.com/search#terms=json.global:'+globalName+'&from=' + when.toISOString());
            console.log('Loggly has a pretty substantial delay. Wait 5 minutes after test completion for full report');
            console.log(' ');;
            console.log(' ');
            console.log('-------');

        };
        self.report = {};

        winston.remove(winston.transports.Console)

        winston.add(winston.transports.Loggly, {
            token: "5bab6902-12b2-4b15-bc72-5bc00e30cb5f",
            subdomain: "chatengine",
            tags: ["Winston-NodeJS"],
            json:true
        });

        function hashCode(str) { // java String#hashCode
            var hash = 0;
            if(str) {

                for (var i = 0; i < str.length; i++) {
                   hash = str.charCodeAt(i) + ((hash << 5) - hash);
                }

                return hash;

            } else {
                return 'FFFFFF';
            }
        }

        function intToRGB(i){
            var c = (i & 0x00FFFFFF)
                .toString(16)
                .toUpperCase();

            return "00000".substring(0, 6 - c.length) + c;
        }

        let colorHashOutput = (i) => {
            return chalk.hex('#' +intToRGB(hashCode(i)))(i);
        }

        const url = require('url');

        var globalLog = require('global-request-logger');
        globalLog.initialize();

        globalLog.on('success', function(request, response) {

          let o = {request};

          // console.log('SUCCESS');
          //
          o.body = request.body && JSON.parse(request.body);
          o.query = url.parse(request.path, true).query;

          let channel = o.query.channel || o.body.channel;

          if(channel) {
            o.channel = channel.split('#');
          }

          o.global = o.query.global || o.body.global || o.channel && o.channel[0];

          o.path = o.request.path.replace('/', '').split('/');

          o.service = o.path[1];

          o.response = response.body;

          o.test = self.globalTestNameMap[o.global];

          if(o.path[0] == 'publish') {
            o.service = 'publish';
            o.global = o.path[4].split('%23')[0];
          }

          if(!o.global) {

            let channelGroups = o.query['channel-group'] && o.query['channel-group'].split(',');

            if(channelGroups) {
                o.channelGroups = channelGroups;
                o.global = channelGroups[0].split('#')[0];
            }

          }

          if(!o.global) {
            o.global = o.path && o.path[5] && o.path[5].split('?')[0];
          }

          if(o.service === 'blocks') {
            o.segment = o.query.route;
          }

          if(o.service == 'presence') {
            // console.log(o)

            if(o.query.state) o.segment ='state';
            if(o.query.heartbeat) o.segment ='heartbeat';

            o.global = o.global.split('%23')[0];
            // console.log(o.channelGroups)
          }

          if(o.service == 'subscribe') {
            if(o.query.heartbeat) o.segment = 'heartbeat';
          }


          self.report[self.globalTestNameMap[o.global]] = self.report[self.globalTestNameMap[o.global]] || {};
          self.report[self.globalTestNameMap[o.global]][o.service] = self.report[self.globalTestNameMap[o.global]][o.service] || 0;
          self.report[self.globalTestNameMap[o.global]][o.service]++;

          if(o.request.host && o.request.host.indexOf('loggly') === -1) {
            winston.log ('info', o);
            console.log(o.global, colorHashOutput(self.globalTestNameMap[o.global]) || 'no test', colorHashOutput(o.service) || 'not sure', o.segment && colorHashOutput(o.segment));
          }

          // console.log(o)

          // console.log(request.query);
          // console.log(request.body)
          // console.log(request.query.route)
          // console.log(JSON.stringify(request.body, null, 2), JSON.stringify(, null, 2));
          // console.log(request.)

          // console.log('Response', response);
        });

        globalLog.on('error', function(request, response) {

          // console.log('ERROR');
          // console.log('Request', request);
          // console.log('Response', response);

        });

        return self;

    }
}
