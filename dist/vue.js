(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  function isFunction(val) {
    return typeof val === 'function';
  }
  function isObject(val) {
    return _typeof(val) === 'object' && val !== null;
  }

  var Observer = /*#__PURE__*/function () {
    // 通过new命令生成class实例时，会自动调用constructor()，即会执行this.walk(data)方法
    function Observer(value) {
      _classCallCheck(this, Observer);

      // 对对象中的所有属性进行劫持
      this.walk(value);
    }

    _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
        Object.keys(data).forEach(function (key) {
          // 对data中的每个属性进行响应式处理
          defineReactive(data, key, data[key]);
        });
      }
    }]);

    return Observer;
  }();

  function defineReactive(data, key, value) {
    observe(value); // 【关键】递归，给data中所有层级的所有属性添加getter、setter
    // 如果Vue数据嵌套层级过深 >> 性能会受影响【******************************】

    Object.defineProperty(data, key, {
      get: function get() {
        return value;
      },
      set: function set(newVal) {
        // 对新数据进行观察
        observe(newVal);
        value = newVal;
      }
    });
  }

  function observe(data) {
    // 如果是对象才观测；第一次调用observe(vm.$options._data)时，_data一定是个对象，官方要求的写法（data函数返回一个对象）
    if (!isObject(data)) {
      return;
    } // 返回经过响应式处理之后的data


    return new Observer(data);
  }

  /**
   * 数据初始化：initProps、initMethod、initData、initComputed、initWatch
   */
  function initState(vm) {
    var opts = vm.$options;

    if (opts.props) ;

    if (opts.methods) ;

    if (opts.data) {
      // 初始化data
      initData(vm);
    }

    if (opts.computed) ;

    if (opts.watch) ;

    function initData(vm) {
      var data = vm.$options.data; // 往实例上添加一个属性 _data，即传入的data
      // vue组件data推荐使用函数 防止数据在组件之间共享

      data = vm._data = isFunction(data) ? data.call(vm) : data; // 将vm._data上的所有属性代理到 vm 上

      for (var key in data) {
        proxy(vm, "_data", key);
      } // 对数据进行观测 -- 数据响应式


      observe(data);
    }


    function proxy(vm, source, key) {
      Object.defineProperty(vm, key, {
        get: function get() {
          return vm[source][key];
        },
        set: function set(newValue) {
          vm[source][key] = newValue;
        }
      });
    }
  }

  /**
   * initMixin
   * 表示在vue的基础上做一次混合操作
   */
  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      // this指向实例
      var vm = this;
      vm.$options = options; // 后面会对options进行扩展
      // 初始化状态，包括initProps、initMethod、initData、initComputed、initWatch等

      initState(vm);
    };
  }

  function Vue(options) {
    // new Vue创建实例时会调用_init()方法
    this._init(options);
  }

  initMixin(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
