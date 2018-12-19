/* eslint-disable import/no-extraneous-dependencies */

const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const jsBundleFilename = 'bundle.js';
const cssBundleFilename = 'bundle.css';

module.exports = {
  entry: path.resolve(__dirname, 'src', 'app.js'),

  output: {
    path: path.resolve(__dirname, 'www'),
    filename: jsBundleFilename,
  },

  plugins: [
    new ExtractTextPlugin(path.join(cssBundleFilename)),
    new HtmlWebpackPlugin({
      title: 'index.html',
      template: path.join(__dirname, 'views', 'index.pug'),
      inject: false,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['env', 'react'],
        },
      },

      {
        test: /\.s?css$/,
        use: ['extracted-loader'].concat(ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            'css-loader',
            'postcss-loader',
            'sass-loader',
          ],
        })),
      },

      {
        test: /\.(gif|svg|woff|woff2|ttf|eot)(\?.*$|$)/,
        loader: 'file-loader',
        options: {
          publicPath: '/fonts',
          outputPath: 'fonts/',
          name: '[name].[ext]',
        },
      },

      {
        test: /\.(png|jpg|jpeg)$/,
        loader: 'file-loader',
        options: {
          publicPath: '/images',
          outputPath: 'images/',
          name: '[name].[ext]',
        },
      },

      {
        test: /\.(glb)$/,
        loader: 'file-loader',
        options: {
          publicPath: '/models',
          outputPath: 'models/',
          name: '[name].[ext]',
        },
      },

      {
        test: /\.(ico)(\?.*$|$)/,
        loader: 'file-loader',
        options: {
          publicPath: '/',
          name: '[name].[ext]',
        },
      },

      {
        test: /\.pug$/,
        use: [
          'html-loader',
          {
            loader: 'pug-html-loader',
            query: {
              pretty: true,
              export: false,
              data: { cordova: false },
            },
          },
        ],
      },

    ],
  },
};
