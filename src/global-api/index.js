import initMixin from "./mixin";

export function initGlobalApi(Vue) {
    // 每个组件初始化的时候都会和Vue.options选项进行合并
    Vue.options = {}; // 用来存放全局属性，例如Vue.component、Vue.filter、Vue.directive
    initMixin(Vue);
}