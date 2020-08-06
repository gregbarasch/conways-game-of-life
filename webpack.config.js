const path = require('path');

/*
TODO
optimization: {
    splitChunks: {
        cacheGroups: {
            commons: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all',
            },
        },
    },
},
 */

module.exports = {
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader'
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: 'file-loader'
            },
        ]
    },
    entry: './src/ts/index.ts',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js'],
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        publicPath: "/",
        compress: true,
        port: 8080
    }
};
