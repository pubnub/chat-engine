/**
 *
 * Runs the loop
 *
 * @private
 * @param {Array} collection of items.
 * @param {number} iteration index.
 * @param {Function} function to execute on an array item, must return Promise.
 * @return {Promise} completed all or errored during a function execution
 *
 */
let forEachSeries = (collection, iteration, toRun) => {
    return new Promise((resolve, reject) => {
        toRun(collection[iteration]).then(() => {
            if (iteration < collection.length - 1) {
                iteration++;
                forEachSeries(collection, iteration, toRun).then(resolve);
            } else {
                resolve();
            }
        }).catch(reject);
    });
};

/**
 *
 * Execute a function on each member of an array in series.
 *
 * @param {Array} collection of items.
 * @param {Function} function to execute on an array item, must return Promise.
 * @return {Promise} completed all or errored during a function execution
 *
 */
module.exports = (collection, toRun) => {
    return forEachSeries(collection, 0, toRun);
};
