import { isObject } from "../util/index";
import { arrayMethods } from "./array";
import Dep from "./dep";

/**
 * 数据劫持：
 * 1. 如果是对象，则递归对象所有属性，进行劫持
 * 2. 如果数组，则会劫持数组方法（方法中如果是新增元素，会劫持新增元素），并对数组中类型为数组/对象的元素进行劫持
 */

class Observer {
  // 通过new命令生成class实例时，会自动调用constructor()，即会执行this.walk(data)方法
  constructor(data) {
    this.value = data
    this.dep = new Dep(); // 给data添加一个dep，收集data整体的一个dep（主要用于数组的依赖收集）

    // 在数据data上新增属性 data.__ob__；指向经过new Observer(data)创建的实例，可以访问Observer.prototype上的方法observeArray、walk等
    // 所有被劫持过的数据都有__ob__属性（通过这个属性可以判断数据是否被检测过）
    Object.defineProperty(data, "__ob__", {
      // 值指代的就是Observer的实例，即监控的数据
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
  let childOb =  observe(value); // 【关键】递归，劫持对象中所有层级的所有属性
  // 如果Vue数据嵌套层级过深 >> 性能会受影响【******************************】

  let dep = new Dep() // 为每个属性创建一个独一无二的dep
  Object.defineProperty(data, key, {
    get() {
      if(Dep.target) {
        dep.depend()
        // 如果属性的值依然是一个数组/对象，则对该 数组/对象 整体进行依赖收集
        if(childOb) {
          childOb.dep.depend(); // 让对象和数组也记录watcher
          // 如果数据结构类似 {a:[1,2,[3,4,[5,6]]]} 这种数组多层嵌套，数组包含数组的情况，那么我们访问a的时候，只是对第一层的数组进行了依赖收集
          // 里面的数组因为没访问到，所以无法收集依赖，但是如果我们改变了a里面的第二层数组的值，是需要更新页面的，所以需要对数组递归进行依赖收集
          if (Array.isArray(value)) {
            // 如果内部还是数组
            dependArray(value); // 遍历 + 递归数组，对数组不同层级的所有数组元素 进行依赖收集
          }
        }
      }
      return value;
    },
    set(newVal) {
      if (newVal === value) return;
      // 对新数据进行观察
      observe(newVal);
      value = newVal;
      console.log('-------------------数据更新，通知watchers更新-------------------')
      dep.notify(); // 通知dep存放的watcher去更新--派发更新
    },
  });
}

// 递归收集数组依赖
function dependArray(value) {
  for (let e, i = 0, l = value.length; i < l; i++) {
    e = value[i];
    // 对每一项进行依赖收集
    e && e.__ob__ && e.__ob__.dep.depend();
    if (Array.isArray(e)) {
      // 【递归】如果数组里面还有数组，就递归去收集依赖
      dependArray(e);
    }
  }
}

export function observe(data) {
  // 如果是object类型（对象或数组）才观测；第一次调用observe(vm.$options._data)时，_data一定是个对象，官方要求的写法（data函数返回一个对象）
  if (!isObject(data)) {
    return;
  }
  // 如果已经是响应式的数据，直接return
  if (data.__ob__) {
    return data.__ob__;
  }
  // 返回经过响应式处理之后的data
  return new Observer(data);
}
