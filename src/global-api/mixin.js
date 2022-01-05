import { mergeOptions } from '../util/index'

export default function initMixin(Vue) {
    Vue.mixin = function(mixin) {
        // this 指向 VUe，this.options即Vue.options
        // 将mixin合并到Vue.options中，而组件会和Vue.options合并，所以最后会把mixin合并到组件中
        this.options = mergeOptions(this.options,mixin)
        return this;
    }
}