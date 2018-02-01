export default (request, response) => {

    response.headers['Access-Control-Allow-Origin'] = '*';
    response.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept';
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, DELETE';

    let proxyRequest = JSON.parse(request.body);

    // body from oritinal auth request
    let body = JSON.parse(proxyRequest.body);

    // query params from original auth request
    let params = proxyRequest.params;

    let allow = () => {
        response.status = 200;
        return response.send();
    };

    let unauthorized = () => {
        response.status = 401;
        return response.send();
    };

    let die = (error) => {
        response.status = 500;
        return response.send(error);
    };

    if (params.route === 'invite') {

        // can this user invite?
        return allow();

    } else if (params.route === 'grant') {

        // is this user allowed in the channel they're trying to join?
        return allow();

    } else {

        // all other requests
        return allow();

    }

};
