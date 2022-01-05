/**
 * initMixin
 * 表示在vue的基础上做一次混合操作
 */
import { initState } from "./state";
import { compileToFunctions } from './compiler/index'
import { callHook, mountComponent } from './lifecycle'
import { mergeOptions } from "./util/index";

export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    // this指向实例
    const vm = this;
    // 将全局的Vue.options（也有可能是继承的其他组件的options，所以下面使用的是vm.constructor.options而不是Vue.options）与组件中的options进行合并
    // 将合并之后的结果放到vm.$options上
    vm.$options = mergeOptions(vm.constructor.options, options);
    console.log('$options-----',vm.$options)
    callHook(vm, "beforeCreate");
    
    // 初始化状态，包括initProps、initMethod、initData、initComputed、initWatch等
    initState(vm);

    callHook(vm, "created");
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

    // 调用render方法，渲染成真实DOM
    // 组件挂载方法
    return mountComponent(vm, el);
  };
}
