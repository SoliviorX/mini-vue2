/**
 * 数据初始化：initProps、initMethod、initData、initComputed、initWatch
 */

import { observe } from "./observer/index";
import { isFunction } from "./utils";
import Watcher from "./observer/watcher";

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
function initComputed() {}

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
    let watcher = new Watcher(vm, exprOrFn, cb, { ...options, user: true });  // user: true表示该watcher为用户自己创建地watcher
    if (options.immediate) {
      cb(watcher.value); // 如果立刻执行
    }
  };
}
