export default (request, response) => {

    const kvdb = require('kvstore');
    const xhr = require('xhr');
    const pubnub = require('pubnub');

    const oneHourInMinutes = 60;

    response.headers["Access-Control-Allow-Origin"] = "*";
    response.headers["Access-Control-Allow-Headers"] = "Origin, X-Requested-With, Content-Type, Accept";
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS, PUT, DELETE";

    const body = JSON.parse(request.body);

    let controllers = {};

    controllers['bootstrap'] = {};
    controllers['bootstrap']['POST'] = function() {

        console.log('performing global grant for', body.uuid)

        let chanMeRW = [
            body.global,
            body.global + '-pnpres',
            body.global + '#chat#public.*',
            body.global + '#user#' + body.uuid + '#read.*',
            body.global + '#user#' + body.uuid + '#write.*'
        ];

        let chanEverybodyR = [
            body.global + '#user:' + body.uuid + '#read.*'
        ];

        let chanEverybodyW = [
            body.global + '#user:' + body.uuid + '#write.*'
        ];

        return pubnub.grant({
            channels: chanMeRW,
            read: true, // false to disallow
            write: true, // false to disallow,
            authKeys: [body.authKey],
            ttl: 0
        }).then((status) => {
            return pubnub.grant({
                channels: chanEverybodyW,
                write: true, // false to disallow
                read: false,
                ttl: 0
            });
        }).then((status) => {
            return pubnub.grant({
                channels: chanEverybodyR,
                read: true, // false to disallow
                write: false,
                ttl: 0
            })
        }).then((status) => {
            if ( !status.message || status.message !== "Success" ) {
                console.log("PAM Issue: ", status.message);
                response.status = 500;
                return response.send("Internal Server Error");
            } else {
                response.status = 200;
                return response.send();
            }
        }).catch( ( err ) => {
            console.log("PAM Error: ", err);
            response.status = 500;
            return response.send("Internal Server Error");
        });

    }

    // Choose route based on request.params and request.method
    // Execute the controller function in the controllers object
    const route = request.params.route;
    const method = request.method.toUpperCase();

    // GET request with empty route returns the homepage
    // If a requested route or method for a route does not exist, return 404
    if ( !route && method === 'GET' ) {
        return controllers['/index']['GET']();
    } else if ( controllers[route] && controllers[route][method] ) {
        console.log(method, route)
        return controllers[route][method]();
    } else {
        response.status = 404;
        console.log('not found', route, method);
        return response.send();
    }
};
