let StatsPlugin = require('stats-webpack-plugin');

let config = {
    module: {
        rules: [
            { test: /\.json/, use: 'json-loader' },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['es2015']
                    }
                }
            }
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
