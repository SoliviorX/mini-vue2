import initMixin from "./mixin";
import initExtend from "./extend";
import { ASSETS_TYPE } from "./const";
import initAssetRegisters from "./assets";

export function initGlobalApi(Vue) {
  // 每个组件初始化的时候都会和Vue.options选项进行合并
  Vue.options = {}; // 用来存放全局属性，例如Vue.component、Vue.filter、Vue.directive
  initMixin(Vue);

  // 初始化Vue.options.components、Vue.options.directives、Vue.options.filters设为空对象
  ASSETS_TYPE.forEach((type) => {
    Vue.options[type + "s"] = {};
  });

  // Vue.options会与组件的options合并，所以无论创建多少子类，都可以通过实例的options._base找到Vue
  Vue.options._base = Vue;
  initExtend(Vue); // 注册extend方法

  initAssetRegisters(Vue); // 注册Vue.component()、Vue.filter()、Vue.directive()方法
}
