
var path = require('path')

module.exports = {
  target: 'node',
  entry: './runner.tsx',
  mode: 'development',
  output: {
    path: path.resolve(`${__dirname}`),
    filename: 'ts-vue-jsx-transformer.min.js',
    library: 'ts-vue-jsx-transformer',
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['.js', '.json', '.ts', '.tsx'],
  },
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: 'ts-loader'
    }]
  }
}