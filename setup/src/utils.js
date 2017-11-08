
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

module.exports = { findCookie };
