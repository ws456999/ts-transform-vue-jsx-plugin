const tsPreprocessor = require('ts-jest/preprocessor')
const ts = require('typescript')
const jsx = require('./lib/jsx.js').default
// import * as ts from 'typescript'

/* ----------------------------------分割线--------------------------- */

function compile(sourceCode) {

  const source = ts.createSourceFile(
    'vue-jsx.tsx',
    sourceCode,
    ts.ScriptTarget.ES2016,
    true,
    ts.ScriptKind.TSX
  )

  const result = ts.transform(source, [jsx])
  const transformedSourceFile = result.transformed[0]
  const printer = ts.createPrinter()
  const resultCode = printer.printFile(transformedSourceFile)

  return resultCode
}

module.exports = {
  process: function(src, path, config, transformOptions) {
    return compile(src)
    // src = tsPreprocessor.process(src, path, config, transformOptions)

    // return src
  }
}
