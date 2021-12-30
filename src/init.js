
/**
 * initMixin
 * 表示在vue的基础上做一次混合操作
 */
import { initState } from './state'
export function initMixin(Vue) {
    Vue.prototype._init = function(options) {
        // this指向实例
        const vm = this
        vm.$options = options  // 后面会对options进行扩展

        // 初始化状态，包括initProps、initMethod、initData、initComputed、initWatch等
        initState(vm)
    }
}