
const findCookie = (name) => {
    let cookies = document.cookie.split(';');
    let result = null;

    cookies.forEach((cookie) => {
        let cookieName = cookie.split('=')[0];
        let cookieValue = cookie.split('=')[1];

        if (cookieName.endsWith(name)) {
            result = cookieValue;
        }
    });

    return result;
};

const extractError = (err, defaultMessage) => {
    if (err && err.responseJSON && err.responseJSON.message) {
        return err.responseJSON.message;
    } else {
        return defaultMessage;
    }
};

module.exports = { findCookie };
