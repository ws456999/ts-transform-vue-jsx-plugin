const Vue = require('vue')
// console.log(Vue)
function render (render) {
  return new Vue({
    render
  })._render()
}
// const vnode = render(h => <div>test</div>)
const vnode = render(h => 
  {
    console.log(h('h1', '123'))
  }
)
// console.log(vnode)
