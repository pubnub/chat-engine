let StatsPlugin = require('stats-webpack-plugin');

let config = {
    module: {
        loaders: [
            { test: /\.json/, loader: 'json-loader' },
        ],
    },
    output: {
        filename: 'chat-engine.js',
        library: 'ChatEngineCore',
        libraryTarget: 'umd',
    },
    plugins: [
        new StatsPlugin('stats.json', {
            chunkModules: true,
            exclude: ['node_modules']
        })
    ],
    externals: [],
    profile: true
};

module.exports = config;
