
const throwError = (ceConfig, self, cb, key, ceError, payload = {}) => {

    if (ceConfig.throwErrors) {
        // throw ceError;
        throw ceError;
    }

    payload.ceError = ceError.toString();

    self[cb](['$', 'error', key].join('.'), payload);

};

module.exports = { throwError };
