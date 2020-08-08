const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const webpack = require('webpack')

/*
TODO
UglifyJs plugin to minify your code
*/

module.exports = {
    devtool: 'inline-source-map',
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
        extensions: [ '.tsx', '.ts', '.js', '.png'],
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
            ]
        }),
        new webpack.DefinePlugin({
            'typeof CANVAS_RENDERER': JSON.stringify(true),
            'typeof WEBGL_RENDERER': JSON.stringify(true)
        }),
    ],

    // FIXME not working it seems
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendors: {
                    priority: -10,
                    test: /[\\/]node_modules[\\/]/
                }
            },
            chunks: 'async',
            minChunks: 1,
            minSize: 30000,
            name: false
        },
        minimize: true,
        minimizer: [new TerserPlugin()],
    }
}
