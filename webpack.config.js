
const path = require('path')
const tsJsxPlugin = require('./lib/jsx.js').default

module.exports = {
  target: 'node',
  entry: './src/test.tsx',
  mode: 'development',
  output: {
    filename: './bundle.js'
  },
  resolve: {
    extensions: ['.js', '.json', '.ts', '.tsx'],
  },
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: {
        loader: 'ts-loader',
        options: {
          getCustomTransformers: () => ({
            before: [tsJsxPlugin],
          })
        }
      }
    }]
  }
}