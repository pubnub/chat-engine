let StatsPlugin = require('stats-webpack-plugin');
let Uglify = require('uglifyjs-webpack-plugin');

let config = {
    module: {
        loaders: [
            { test: /\.json/, loader: 'json-loader' },
        ],
    },
    output: {
        filename: 'chat-engine-setup.js',
        library: 'ChatEngineSetupCore',
        libraryTarget: 'umd',
    },
    plugins: [
        new StatsPlugin('stats.json', {
            chunkModules: true,
            exclude: ['node_modules']
        }),
        new Uglify({})
    ],
    externals: [],
    profile: true
};

module.exports = config;
