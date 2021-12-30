import { initMixin } from "./init"
import { lifecycleMixin } from './lifecycle'
import { renderMixin } from './render'
import { initGlobalApi } from './global-api/index'

function Vue(options) {
    // new Vue创建实例时会调用_init()方法
    this._init(options)
}
initMixin(Vue) // 在原型上挂载_init()（数据监控；props、events、computed、watch初始化等）、$mount()（compiler流程）方法
lifecycleMixin(Vue) // 在原型上挂载 _update()方法（第一次创建dom及更新dom（有diff过程））
renderMixin(Vue)  //  在原型上挂载_c、_v、_s、$nextTick、_render()方法
initGlobalApi(Vue)

export default Vue