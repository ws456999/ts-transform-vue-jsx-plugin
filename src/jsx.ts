import * as ts from 'typescript'
import * as kind from 'ts-is-kind'
import mustUseProp from './utils/must-use-prop'
import groupProps from './utils/group-props'

/*
* ===========   先写思路   ============
* 1. 在碰到jsxElement解析成 看看(h)在不在，如果在的话，
*    解析成 { 'h1', {}, chidren } 这种形式的
* 2. 在分析函数父级层是否有 (h参数)
*
* 如果有， 那么之后遇到jsx解析，不然的话不解析
* return 这个ast 结束
*
* 3. 测试结果
*
* ============   todo   =============
* -[] support JsxSpreadAttribute
* -[] inject h
*
*/

function transformer(
  ctx: ts.TransformationContext
): ts.Transformer<ts.SourceFile> {
  const visitor: ts.Visitor = (node: ts.Node): ts.Node => {
    if (kind.isJsxText(node)) {
      return ts.createStringLiteral(node.getText())
    }

    if (kind.isJsxAttribute(node)) {
      // attributes.find(
      // let attributes: ts.JsxAttributes = node.parent.parent.attributes
      // let tag = node.parent.parent.tagName.getText()
      // const typeAttribute = attributes.properties.find(attr => attr.name.getText() && attr.name.getText() === 'type')
      // const type = typeAttribute && ts.createStringLiteral(
      //   (node as ts.JsxAttribute).initializer && (node as ts.JsxAttribute).initializer.getText() ? (node as ts.JsxAttribute).initializer.getText() : null)

      // //  && kind.isJsxExpression((typeAttribute as ts.JsxAttribute).initializer)
      // if (mustUseProp(tag, type, node.name.getText())) {
      //   node.name = ts.createIdentifier(`domProps-${node.name.text}`)
      // }
      // return node
      // mustUseProp()
    }

    if (kind.isJsxExpression(node)) {
      let tempJsxExpression: ts.JsxExpression = ts.visitEachChild(node, visitor, ctx)
      return tempJsxExpression.expression
    }

    if (kind.isJsxElement(node)) {
      return createJsxCall(node.openingElement, node.children, visitor)
    }

    if (kind.isJsxSelfClosingElement(node)) {
      return createJsxCall(node, null, visitor)
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
    let tag = openingElement.tagName.getText()
    const typeAttribute = attributes.find(attr => attr.name.getText() && attr.name.getText() === 'type')
    const type = typeAttribute && ts.createStringLiteral(
      (typeAttribute as ts.JsxAttribute).initializer && (typeAttribute as ts.JsxAttribute).initializer.getText() ? (typeAttribute as ts.JsxAttribute).initializer.getText() : null
    )

    let attrs: ts.VisitResult<ts.Node>[] = attributes.map(attr => {
      return visitor(attr)
    })

    // if must use prop
    attrs = attrs.map(v => {
      let name = (v as ts.JsxAttribute).name.getText()
      if (mustUseProp(tag, type, name)) {
        return  ts.createJsxAttribute(ts.createIdentifier(`domProps-${name}`), null)
      }
      return v
    })
    let props = buildOpeningElementAttributes(attrs)

    // 如果有children 的话
    let children: any = []
    if (nodeChilds && nodeChilds.length) {
      children = ts.createArrayLiteral(
        nodeChilds.filter(v => v).map(v => visitor(v))
      )
    }

    return ts.createCall(
      ts.createIdentifier('h'),
      [],
      [ts.createLiteral(openingElement.tagName.getText()), props, children]
    )
}


/**
 * 构建 attributes
 *
 * @param {ts.VisitResult<ts.Node>[]} attrs
 * @returns {ts.ObjectLiteralExpression}
 */
function buildOpeningElementAttributes (attrs: ts.VisitResult<ts.Node>[]): ts.ObjectLiteralExpression {
  var _props = []

  function pushProps (): ts.ObjectLiteralExpression {
    if (!_props.length) return ts.createObjectLiteral([])
    return ts.createObjectLiteral(
      _props.map(p => {
        return ts.createPropertyAssignment(
          ts.createLiteral(p.name.text),
          (p as ts.JsxAttribute).initializer
        )
      })
    )
  }

  while (attrs.length) {
    var prop: any = attrs.shift()
    if (ts.isJsxSpreadAttribute(prop)) {
      throw new Error('TSX 参数暂不支持 ...spread 表达式')
    } else {
      _props.push(convertAttribute(prop))
    }
  }

  return groupProps((pushProps().properties as any))
}

/**
 * 去掉多余空格，如果只有key，没value的话，加上 true 值
 *
 * @param {*} node
 * @returns {ts.PropertyAssignment}
 */
function convertAttribute (node): ts.PropertyAssignment {
  var value = convertAttributeValue(node.initializer || ts.createTrue())
  if (kind.isStringLiteral(value) && !kind.isJsxExpression(node.initializer)) {
    value.text = value.text.replace(/\n\s+/g, ' ')
  }

  if (ts.isIdentifier(node.name)) {
    node.name.type = 'Identifier'
  } else {
    node.name = ts.createStringLiteral(node.name.name)
  }
  return ts.createPropertyAssignment(ts.createLiteral(node.name.text), value)
}


/**
 * 如果是变量的话，对应的值
 *
 * @param {*} node
 * @returns
 */
function convertAttributeValue (node: ts.Identifier): ts.Expression {
  return kind.isJsxExpression(node) ? node.expression : node
}

export default transformer
