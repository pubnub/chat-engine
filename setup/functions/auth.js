export default (request, response) => {

    const db = require('kvstore');

    response.headers['Access-Control-Allow-Origin'] = '*';
    response.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept';
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, DELETE';

    let proxyRequest = JSON.parse(request.body);
    let proxyBody = JSON.parse(proxyRequest.body);
    let proxyParams = proxyRequest.params;

    let isAuthed = (record, who) => {
        return who && record && record.length > 0 && record.indexOf(who) > -1;
    };

    let authInChannel = (record = [], who) => {

        let key = ['authed', proxyBody.chat.channel].join(':');

        record.push(who);
        return db.set(key, record, 525600);
    };


    if (proxyParams.route === 'invite') {

        if (!proxyBody.chat.private) {
            response.status = 200;
            return response.send();
        }


        let key = ['authed', proxyBody.chat.channel].join(':');
        db.get(key).then((record) => {

            if (isAuthed(record, proxyBody.uuid)) {

                return authInChannel(record, proxyBody.to).then(() => {
                    response.status = 200;
                    return response.send();
                }).catch(() => {
                    response.status = 500;
                    return response.send();
                });

            } else {

                response.status = 401;
                return response.send();

            }
        }).catch(() => {
            response.status = 500;
            return response.send();
        });

    } else if (proxyParams.route === 'grant') {

        if (!proxyBody.chat.private) {

            response.status = 200;
            return response.send();
        } else {

            let key = ['authed', proxyBody.chat.channel].join(':');
            db.get(key).then((record) => {

                if (isAuthed(record, proxyBody.uuid)) {

                    response.status = 200;
                    return response.send();

                } else {

                    response.status = 401;
                    return response.send();
                }

            }).catch(() => {

                return authInChannel(record, proxyBody.uuid).then(() => {
                    response.status = 200;
                    return response.send();
                }).catch(() => {
                    response.status = 500;
                    return response.send();
                });

            });

        }

    }

    return request.json().then((body) => {
        return response.send(body);
    }).catch(() => {
        return response.send('Malformed JSON body');
    });

};
