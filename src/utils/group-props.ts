import * as ts from 'typescript'
import makeMap from './make-map'

const isTopLevel = makeMap('class,staticClass,style,key,ref,refInFor,slot,scopedSlots')
const nestableRE = /^(props|domProps|on|nativeOn|hook)([\-_A-Z])/
const dirRE = /^v-/
const xlinkRE = /^xlink([A-Z])/

/**
 * 分类合并对象内的属性
 *
 * @export
 * @param {ts.PropertyAssignment[]} props
 * @returns
 */
export default function groupProps (props: ts.PropertyAssignment[]): ts.ObjectLiteralExpression {
  var newProps = [],
  currentNestedObjects = Object.create(null)

  props.forEach((prop) => {
    var name = (prop.name as ts.Identifier).text

    /* 如果是顶层的 property，直接push进 object */
    if (isTopLevel(name)) {
      // top-level special props
      newProps.push(prop)
    } else {
      // 嵌套属性
      var nestMatch = name.match(nestableRE)
      if (nestMatch) {
        var prefix = nestMatch[1]
        var suffix = name.replace(nestableRE, ({}, {}, $2) => {
          return $2 === '-' ? '' : $2.toLowerCase()
        })

        var nestedProp: ts.ObjectLiteralElementLike = ts.createPropertyAssignment(
          ts.createLiteral(suffix),
          prop.initializer
        )

        var nestedObject = currentNestedObjects[prefix]
        if (!nestedObject) {
          nestedObject = currentNestedObjects[prefix] = ts.createPropertyAssignment(
            prefix,
            ts.createObjectLiteral([(nestedProp)])
          )
          newProps.push(nestedObject)
        } else {
          nestedObject.initializer.properties.push(nestedProp)
        }
      } else if (dirRE.test(name)) {
        // 自定义指令
        name = name.replace(dirRE, '')
        var dirs = currentNestedObjects.directives
        if (!dirs) {
          dirs = currentNestedObjects.directives = ts.createPropertyAssignment(
            'directives',
            ts.createArrayLiteral([])
          )
          newProps.push(dirs)
        }
        dirs.value.elements.push(ts.createObjectLiteral([
          ts.createPropertyAssignment(
            'name',
            ts.createStringLiteral(name)
          ),
          ts.createPropertyAssignment(
            'value',
            prop.initializer
          )
        ]))
      } else {
        // rest are nested under attrs
        var attrs = currentNestedObjects.attrs
        // guard xlink attributes
        if (xlinkRE.test(name)) {
          prop.name = ts.createIdentifier(
            JSON.stringify(name.replace(xlinkRE, function ({}, p1) {
              return 'xlink:' + p1.toLowerCase()
            }))
          )
        }
        if (!attrs) {
          attrs = currentNestedObjects.attrs = ts.createPropertyAssignment(
            ts.createIdentifier('attrs'),
            ts.createObjectLiteral([prop])
          )
          newProps.push(attrs)
        } else {
          attrs.initializer.properties.push(prop)
        }
      }
    }
  })

  return ts.createObjectLiteral(newProps)
}