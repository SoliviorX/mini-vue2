import { isObject } from "../utils";

class Observer {
    // 通过new命令生成class实例时，会自动调用constructor()，即会执行this.walk(data)方法
    constructor(value) { // 对对象中的所有属性进行劫持
        this.walk(value)
    }
    walk(data) {
        Object.keys(data).forEach(key => {
            // 对data中的每个属性进行响应式处理
            defineReactive(data, key, data[key]);
        })
    }
}

function defineReactive(data, key, value) {
    observe(value)  // 【关键】递归，给data中所有层级的所有属性添加getter、setter
    // 如果Vue数据嵌套层级过深 >> 性能会受影响【******************************】

    Object.defineProperty(data, key, {
        get() {
            return value
        },
        set(newVal) {
            // 对新数据进行观察
            observe(newVal)
            value = newVal
        }
    })
}

export function observe(data) {
  // 如果是对象才观测；第一次调用observe(vm.$options._data)时，_data一定是个对象，官方要求的写法（data函数返回一个对象）
  if (!isObject(data)) {
    return;
  }
  // 返回经过响应式处理之后的data
  return new Observer(data);
}
