import { isObject } from "../utils";
import { arrayMethods } from "./array";

/**
 * 数据劫持：
 * 1. 如果是对象，则递归对象所有属性，进行劫持
 * 2. 如果数组，则会劫持数组方法（方法中如果是新增元素，会劫持新增元素），并对数组中类型为数组/对象的元素进行劫持
 */

class Observer {
  // 通过new命令生成class实例时，会自动调用constructor()，即会执行this.walk(data)方法
  constructor(data) {
    // 在数据data上新增属性 data.__ob__；指向经过new Observer(data)创建的实例，可以访问Observer.prototype上的方法observeArray、walk等
    // 所有被劫持过的数据都有__ob__属性（通过这个属性可以判断数据是否被检测过）
    Object.defineProperty(data, "__ob__", {
      //  值指代的就是Observer的实例
      value: this,
      //  设为不可枚举，防止在forEach对每一项响应式的时候监控__ob__，造成死循环
      enumerable: false,
      writable: true,
      configurable: true,
    });

    /**
     * 思考一下数组如何进行响应式？
     * 和对象一样，对每一个属性进行代理吗？
     * 如果数组长度为10000，给每一项设置代理，性能非常差！
     * 用户很少通过索引操作数组，我们只需要重写数组的原型方法，在方法中进行响应式即可。
     */
    if (Array.isArray(data)) {
      // 数组响应式处理

      // 重写数组的原型方法，将data原型指向重写后的对象
      data.__proto__ = arrayMethods;

      // 如果数组中的数据是对象，需要监控对象的变化
      this.observeArray(data);
    } else {
      // 对象响应式处理
      this.walk(data);
    }
  }
  observeArray(data) {
    // 【关键】递归了，监控数组每一项（observe会筛选出对象和数组，其他的不监控）的改变，数组长度很长的话，会影响性能
    // 【*********】数组并没有对索引进行监控，但是对数组的原型方法进行了改写，还对每一项（数组和对象类型）进行了监控
    data.forEach((item) => {
      observe(item);
    });
  }
  walk(data) {
    Object.keys(data).forEach((key) => {
      // 对data中的每个属性进行响应式处理
      defineReactive(data, key, data[key]);
    });
  }
}

function defineReactive(data, key, value) {
  observe(value); // 【关键】递归，劫持对象中所有层级的所有属性
  // 如果Vue数据嵌套层级过深 >> 性能会受影响【******************************】

  Object.defineProperty(data, key, {
    get() {
      // todo...收集依赖
      return value;
    },
    set(newVal) {
      // 对新数据进行观察
      observe(newVal);
      value = newVal;
      // todo...更新视图
    },
  });
}

export function observe(data) {
  // 如果是object类型（对象或数组）才观测；第一次调用observe(vm.$options._data)时，_data一定是个对象，官方要求的写法（data函数返回一个对象）
  if (!isObject(data)) {
    return;
  }
  // 如果已经是响应式的数据，直接return
  if (data.__ob__) {
    return;
  }
  // 返回经过响应式处理之后的data
  return new Observer(data);
}
