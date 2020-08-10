const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const webpack = require('webpack')

module.exports = {
    devtool: false,
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader'
            },
        ]
    },
    entry: './src/ts/index.ts',
    output: {
        filename: 'main.js',
        // TODO fix or remove
        // chunkFilename: '[name].[chunkhash].js',
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ],
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        publicPath: "/",
        compress: true,
        port: 8080
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'index.html'),
                    to: path.resolve(__dirname, 'dist')
                },
                {
                    from: path.resolve(__dirname, 'src/img/**/*'),
                    context: path.resolve(__dirname, 'src'),
                    to: path.resolve(__dirname, 'dist')
                },
                {
                    from: path.resolve(__dirname, 'src/font/**/*'),
                    context: path.resolve(__dirname, 'src'),
                    to: path.resolve(__dirname, 'dist')
                },
                {
                    from: path.resolve(__dirname, 'src/snd/**/*'),
                    context: path.resolve(__dirname, 'src'),
                    to: path.resolve(__dirname, 'dist')
                },
            ]
        }),
        new webpack.DefinePlugin({
            'typeof CANVAS_RENDERER': JSON.stringify(true),
            'typeof WEBGL_RENDERER': JSON.stringify(true)
        }),
    ],

    performance: {
        maxEntrypointSize: 900000,
        maxAssetSize: 900000
    },

    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    output: {
                        comments: false
                    }
                }
            })
        ],
    }
}
