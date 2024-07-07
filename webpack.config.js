const path = require('path');
const webpack = require('webpack')

module.exports = {
  entry: {
    main: './src/main.js', // Your main JS file
    background: './src/background.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/, 
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'] 
          }
        }
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer']
    }),
    new webpack.IgnorePlugin({
        resourceRegExp: /\.pem$/
    })
  ],
  resolve: {
    fallback: {
      "crypto": false,
      "stream": false,
      "buffer": false
    }
  },
  devtool: 'cheap-module-source-map',
  mode: 'development'
};
