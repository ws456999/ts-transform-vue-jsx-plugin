// import Vue, { VNode, VueConstructor } from 'vue'
import * as ts from 'typescript'
// import transformer from './src/transformer'
import jsx from './src/jsx'

// function render (render: (h: typeof Vue.prototype.$createElement) => VNode): VNode {
//   return (new (Vue as VueConstructor)({
//     render
//   }) as typeof Vue.prototype.Component)._render()
// }
// // const vnode = render(h => <div>test</div>)
// const vnode = render(h => {
//   return <h1>123</h1>
//   // console.log(h('h1', '123'))
//   // return h('h1', '123')
// })
// console.log(vnode)

/* ----------------------------------分割线--------------------------- */

function compile(sourceCode: string) {

  const source = ts.createSourceFile(
    'a.tsx',
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
let a = compile('<h1 what="123" ttt="1"><span>ssss</span>123</h1>')
console.log(a)
