/**
 * 数据初始化：initProps、initMethod、initData、initComputed、initWatch
 */

import { observe } from "./observer/index";
import { isFunction } from "./util/index";
import Watcher from "./observer/watcher";
import Dep from "./observer/dep.js";

export function initState(vm) {
  const opts = vm.$options;
  if (opts.props) {
    initProps(vm);
  }
  if (opts.methods) {
    initMethod(vm);
  }
  // 初始化data
  if (opts.data) {
    initData(vm);
  }
  // 初始化computed
  if (opts.computed) {
    initComputed(vm);
  }
  // 初始化watch
  if (opts.watch) {
    initWatch(vm);
  }
}

function initProps() {}
function initMethod() {}

// 初始化data
function initData(vm) {
  let data = vm.$options.data;
  // 往实例上添加一个属性 _data，即传入的data
  // vue组件data推荐使用函数 防止数据在组件之间共享
  data = vm._data = isFunction(data) ? data.call(vm) : data;

  // 将vm._data上的所有属性代理到 vm 上
  for (let key in data) {
    proxy(vm, "_data", key);
  }
  // 对数据进行观测 -- 数据响应式
  observe(data);
}

// 初始化computed
function initComputed(vm) {
  const computed = vm.$options.computed;
  const watchers = vm._computedWatchers = {}; // 用watchers和vm._computedWatchers 用来存放计算watcher

  for (let k in computed) {
    const userDef = computed[k]; // 获取用户定义的计算属性；可能是函数。也可能是对象（内部有get、set函数）
    // 获取computed的getter
    let getter = typeof userDef === "function" ? userDef : userDef.get;

    // 每个计算属性本质就是watcher
    // 有多少个getter，就创建多少个watcher
    // 创建计算watcher，lazy设置为true
    watchers[k] = new Watcher(vm, getter, () => {}, { lazy: true });
    // 将computed中的属性直接代理到vm下
    defineComputed(vm, k, userDef);
  }
}

/**
 * 1. 将computed中的属性直接代理到vm上
 * 2. 将代理的get进行包裹（即进行缓存处理，不用每次获取computed都进行重新计算）
 */
const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: () => {},
  set: () => {},
};
function defineComputed(vm, key, userDef) {
  if (typeof userDef === "function") {    
    sharedPropertyDefinition.get = createComputedGetter(key);
  } else {
    sharedPropertyDefinition.get = createComputedGetter(key);
    sharedPropertyDefinition.set = userDef.set;
  }
  Object.defineProperty(vm, key, sharedPropertyDefinition);
}
// 取计算属性的值，走这个函数
function createComputedGetter(key) {
  return function () {
    const watcher = this._computedWatchers[key];
    if(watcher) {
      // 根据dirty属性，判断是否需要重新计算（脏就是要调用getter，不脏就是直接取watcher.value）
      if (watcher.dirty) {
        watcher.evaluate(); // 计算属性取值的时候，如果是脏的，需要重新求值；依赖的参数会收集计算属性watcher；

        /**
         * 计算属性的依赖不仅需要收集计算属性watcher，还应该收集渲染watcher，这样当依赖项改变的时候，页面才会重新渲染；
         * 在执行mountComponent时，会先设置Dep.target等于渲染watcher，然后将它push到targetStack中
         * 当解析到计算属性时，将Dep.target设置成计算属性watcher，pushTarget()，依赖项收集当前计算属性watcher，然后popTarget()，然后依赖项收集当前渲染watcher
         * 对所有计算属性循环此操作
         * 将渲染watcher  popTarget()
         */
        // 如果Dep还存在target，这个时候一般为渲染watcher，计算属性依赖的数据需要继续收集渲染watcher
        if (Dep.target) {
          watcher.depend()
        }
      }
      return watcher.value;
    }
  };
}

// 初始化watch
function initWatch(vm) {
  let watch = vm.$options.watch;
  for (let k in watch) {
    const handler = watch[k]; // 可能是数组、对象、函数、字符串，watch支持多种写法
    if (Array.isArray(handler)) {
      handler.forEach((handle) => {
        createWatcher(vm, k, handle);
      });
    } else {
      createWatcher(vm, k, handler);
    }
  }
}

function createWatcher(vm, key, handler, options = {}) {
  if (typeof handler === "object") {
    options = handler; //保存用户传入的对象
    handler = handler.handler; //是函数
  }
  if (typeof handler === "string") {
    handler = vm[handler];
  }
  // watch相当于调用了 vm.$watch()
  return vm.$watch(key, handler, options);
}

// 将vm._data上的属性代理到 vm 上
function proxy(vm, source, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[source][key];
    },
    set(newValue) {
      vm[source][key] = newValue;
    },
  });
}

export function stateMixin(Vue) {
  Vue.prototype.$watch = function (exprOrFn, cb, options) {
    const vm = this;
    // 这里表示是一个用户watcher
    let watcher = new Watcher(vm, exprOrFn, cb, { ...options, user: true }); // user: true表示该watcher为用户自己创建地watcher
    if (options.immediate) {
      cb(watcher.value); // 如果立刻执行
    }
  };
}
