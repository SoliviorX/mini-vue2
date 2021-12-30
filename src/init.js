/**
 * initMixin
 * 表示在vue的基础上做一次混合操作
 */
import { initState } from "./state";
import { compileToFunctions } from './compiler/index'

export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    // this指向实例
    const vm = this;
    vm.$options = options; // 后面会对options进行扩展

    // 初始化状态，包括initProps、initMethod、initData、initComputed、initWatch等
    initState(vm);

    // 如果有el属性 进行模板渲染
    if (vm.$options.el) {
      vm.$mount(vm.$options.el);
    }
  };

  Vue.prototype.$mount = function (el) {
    // $mount 由vue实例调用，所以this指向vue实例
    const vm = this;
    const options = vm.$options;
    el = document.querySelector(el);

    /**
     * 1. 把模板转化成render函数
     * 2. 执行render函数，生成VNode
     * 3. 更新时进行diff
     * 4. 产生真实DOM
     */
    // 可以直接在options中写render函数，它的优先级比template高
    if (!options.render) {
      let template = options.template;

      // 如果不存在render和template但是存在el属性，则直接将template赋值为el元素
      if (!template && el) {
        template = el.outerHTML;
      }

      // 最终需要把tempalte模板转化成render函数
      if (template) {
        // 将template转化成render函数
        const render = compileToFunctions(template);
        options.render = render;
      }
    }

    // 将当前组件实例挂载到真实的el节点上面
    return mountComponent(vm, el);
  };
}
