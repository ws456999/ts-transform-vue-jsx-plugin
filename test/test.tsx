// import * as Vue from 'vue'
const Vue = require('vue')

describe('babel-plugin-transform-vue-jsx', () => {
  it('should contain text', () => {
    const vnode = render(h => <div>test</div>)
    console.log(vnode)
    expect(vnode.tag).toEqual('div')
    expect(vnode.children[0].text).toEqual('test')
  })
})

function render (render) {
  return new Vue({
    render
  })._render()
}

function createComponentInstanceForVnode (vnode) {
  const opts = vnode.componentOptions
  return new opts.Ctor({
    _isComponent: true,
    parent: opts.parent,
    propsData: opts.propsData,
    _componentTag: opts.tag,
    _parentVnode: vnode,
    _parentListeners: opts.listeners,
    _renderChildren: opts.children
  })
}