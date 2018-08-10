import * as ts from 'typescript'
import jsx from './jsx'

/* ----------------------------------分割线--------------------------- */

function compile(sourceCode: string) {

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

// import Button from "antd/lib/button";
let a = compile(`
function render (h) {
  return (
    <input
      checked
      type="text"
      id="foo"
      domPropsInnerHTML="bar"
      onClick={this.clickHandler}
      nativeOnClick={this.nativeClickHandler}
      class={{ foo: true, bar: false }}
      style={{ color: 'red', fontSize: '14px' }}
      key="key"
      ref="ref"
      refInFor
      slot="slot">
    </input>
  )
}
`)
console.log(a)
