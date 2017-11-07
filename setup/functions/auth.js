export default (request, response) => {

    const db = require('kvstore');

    response.headers['Access-Control-Allow-Origin'] = '*';
    response.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept';
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, DELETE';

    let proxyRequest = JSON.parse(request.body);
    let proxyBody = JSON.parse(proxyRequest.body);
    let proxyParams = proxyRequest.params;

    let key = ['authed', proxyBody.chat.channel].join(':');

    let isAuthed = (who) => {

        return new Promise((resolve, reject) => {

            return db.get(key).then((record) => {

                record = record || [];

                // check that record exists, and this uuid is inside it
                if (who && record && record.length > 0 && record.indexOf(who) > -1) {
                    return resolve(record);
                } else {
                    return reject(record || false);
                }

            }).catch(() => {
                reject(false);
            });

        });

    };

    let authInChannel = (record, who) => {

        console.log('authorizing', who, 'in', key);

        record.push(proxyBody.uuid);
        return db.set(key, record, 525600);
    };

    if (proxyParams.route === 'invite') {

        if (!proxyBody.chat.private) {
            response.status = 200;
            return response.send();
        }

        return isAuthed(proxyBody.uuid).then((record) => {

            console.log('!!!!', proxyBody.uuid, 'is permitted to invite', key);

            return authInChannel(record, proxyBody.to).then(() => {
                response.status = 200;
                return response.send();
            }).catch(() => {
                response.status = 500;
                return response.send();
            });

        }).catch(() => {

            console.log(proxyBody.uuid, 'is NOT permitted to invite in', key);

            response.status = 401;
            return response.send();
        });

    }

    if (proxyParams.route === 'grant') {

        if (!proxyBody.chat.private) {
            response.status = 200;
            return response.send();
        }

        return isAuthed(proxyBody.uuid).then(() => {

            console.log('!!!!', proxyBody.uuid, 'is permitted in', key);

            response.status = 200;
            return response.send();

        }).catch((record) => {

            if (!record.length) {

                console.log('!!!!', 'The auth list is empty, so permit them');

                return authInChannel(record, proxyBody.uuid).then(() => {
                    response.status = 200;
                    return response.send();
                }).catch(() => {
                    response.status = 500;
                    return response.send();
                });

            } else {

                console.log('And the auth list is full');

                response.status = 401;
                return response.send();
            }

        });

    }

    return request.json().then((body) => {
        return response.send(body);
    }).catch(() => {
        // console.log(err)
        return response.send("Malformed JSON body.");
    });

};
