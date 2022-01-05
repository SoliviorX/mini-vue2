import { patch } from "./vdom/patch";
import Watcher from "./observer/watcher";

export function lifecycleMixin(Vue) {
  // _update：初始挂载及后续更新
  // 更新的时候，不会重新进行模板编译，因为更新只是数据发生变化，render函数没有改变。
  Vue.prototype._update = function (vnode) {
    const vm = this;
    const prevVnode = vm._vnode; // 保留上一次的vnode
    vm._vnode = vnode; // 获取本次的vnode

    // 【核心】patch是渲染vnode为真实dom
    if (!prevVnode) {
      // 初次渲染
      vm.$el = patch(vm.$el, vnode); // 初次渲染 vm._vnode肯定不存在 要通过虚拟节点 渲染出真实的dom 赋值给$el属性
    } else {
      // 视图更新
      vm.$el = patch(prevVnode, vnode, vm); // 更新时把上次的vnode和这次更新的vnode穿进去 进行diff算法
    }
  };
}

/**
 * 1. 调用render方法，生成虚拟DOM —— 即执行 vm._render()
 * 2. 将VNode渲染成真实DOM —— 即执行 vm._update(VNode)
 */
export function mountComponent(vm, el) {
  vm.$el = el;
  // 执行beforeMount生命周期钩子
  callHook(vm, "beforeMount");

  let updateComponent = () => {
    vm._update(vm._render());
  };

  // 每个组件渲染的时候，都会创建一个watcher，并执行updateComponent；true表示是渲染Watcher
  new Watcher(
    vm,
    updateComponent,
    () => {
      console.log('视图更新了')
      callHook(vm, "beforeUpdate");
    },
    true
  );
  callHook(vm, "mounted");
}

export function callHook(vm, hook) {
  // vm.$options[hook]经过mergeOptions合并之后，是一个数组
  const handlers = vm.$options[hook];
  if (handlers) {
    for (let i = 0; i < handlers.length; i++) {
      handlers[i].call(vm); //生命周期里面的this指向当前实例
    }
  }
}
