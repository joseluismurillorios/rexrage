/* eslint-disable import/no-extraneous-dependencies */

const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',

  devServer: {
    contentBase: path.join(__dirname, 'www'),
    compress: true,
    port: 9000,

    historyApiFallback: true,
    hot: true,
    host: '0.0.0.0',
  },
});
