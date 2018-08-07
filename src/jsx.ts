import * as ts from 'typescript'
import * as kind from 'ts-is-kind'
// import mustUseProp from './utils/must-use-prop'
// 先写思路
// 1. 在碰到jsxElement解析成 看看(h)在不在，如果在的话，
//    解析成 { 'h1', this.blogTitle, chidren } 这种形式的
// 2. 在分析函数父级层是否有 (h参数)

// 下面这四种情况下会写jsx
// MethodsDeclaration
// ClassDeclaration
// FunctionDeclaration
// ArrowFunction

// 如果有， 那么之后遇到jsx解析，不然的话不解析
// return 这个ast 结束

// 3. 测试结果

function transformer(
  ctx: ts.TransformationContext
): ts.Transformer<ts.SourceFile> {
  const visitor: ts.Visitor = (node: ts.Node): ts.Node => {
    if (kind.isJsxText(node)) {
      return ts.createStringLiteral(node.getText())
    }
    if (kind.isJsxExpression(node)) {
      let tempJsxExpression: ts.JsxExpression = ts.visitEachChild(node, visitor, ctx)
      // console.log(w)
      return tempJsxExpression.expression
    }

    if (kind.isJsxElement(node)) {
      return createJsxCall(node.openingElement, node.children, visitor)
    }

    // 递归传递
    if (node.getChildCount()) {
      return ts.visitEachChild(node, visitor, ctx)
    }
    return node
  }

  return (sf: ts.SourceFile) => {
    return ts.visitNode(sf, visitor)
  }
}

export default transformer

/**
 * 创建h函数
 *
 * @param {ts.JsxOpeningLikeElement} openingElement
 * @param {(ts.NodeArray<ts.JsxChild> | null)} [nodeChilds=null]
 * @returns
 */
function createJsxCall(
  openingElement: ts.JsxOpeningLikeElement,
  nodeChilds: ts.NodeArray<ts.JsxChild> | any = null,
  visitor: ts.Visitor
) {
    // 获取attr
    const attributes = openingElement.attributes.properties
    let props = ts.createObjectLiteral(
      attributes.map(attr => {
        return ts.createPropertyAssignment(
          ts.createLiteral(attr.name.getText()),
          (visitor(attr) as ts.JsxAttribute).initializer
        )
      })
    )

    // 如果有children 的话
    if (nodeChilds.length) {
      var children = ts.createArrayLiteral(
        nodeChilds.filter(v => v).map(v => visitor(v))
      )
    }

    let ca = ts.createCall(
      ts.createIdentifier('h'),
      [],
      [ts.createLiteral(openingElement.tagName.getText()), props, children]
    )
    return ca
}
