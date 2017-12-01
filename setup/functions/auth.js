export default (request, response) => {

    const db = require('kvstore');

    response.headers['Access-Control-Allow-Origin'] = '*';
    response.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept';
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, DELETE';

    let proxyRequest = JSON.parse(request.body);
    let proxyParams = proxyRequest.params;
    let proxyData = JSON.parse(proxyRequest.body) || proxyParams;

    let isAuthed = (record, who) => {

        if (!record) {
            return true;
        } else {
            return who && record && record.length > 0 && record.indexOf(who) > -1;
        }

    };

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

    let authInChannel = (record, who) => {

        record = record || [];

        let key = ['authed', proxyData.chat.channel].join(':');

        if (record.indexOf(who) === -1) {

            record.push(who);

            return db.set(key, record, 525600).then(() => {
                return allow();
            }).catch((err) => {
                console.error(err);
                return die('Internal Server Error');
            });

        } else {
            return allow();
        }

    };

    if (proxyParams.route === 'invite') {

        if (!proxyData.chat.private) {
            return allow();
        } else {

            let key = ['authed', proxyData.chat.channel].join(':');

            return db.get(key).then((record) => {

                if (isAuthed(record, proxyData.uuid)) {
                    return authInChannel(record, proxyData.to);
                } else {
                    return unauthorized();
                }
            }).catch((err) => {
                console.error(err);
                return die('Internal Server Error');
            });

        }

    } else if (proxyParams.route === 'grant') {

        if (proxyData.chat.private) {

            let key = ['authed', proxyData.chat.channel].join(':');

            return db.get(key).then((record) => {
                if (isAuthed(record, proxyData.uuid)) {
                    return authInChannel(record, proxyData.uuid);
                } else {
                    return unauthorized();
                }
            }).catch((err) => {
                console.error(err);
                return die('Internal Server Error');
            });
        } else {
            return allow();
        }

    } else {
        return allow();
    }

};
