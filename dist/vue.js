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

  // arrayMethods是继承自Array.prototype，不直接修改Array.prototype，不污染Array.prototype
  var oldArrayPrototype = Array.prototype;
  var arrayMethods = Object.create(oldArrayPrototype);
  var methods = ['push', 'pop', 'unshift', 'shift', 'sort', 'reverse', 'splice'];
  methods.forEach(function (method) {
    arrayMethods[method] = function () {
      var _oldArrayPrototype$me;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var result = (_oldArrayPrototype$me = oldArrayPrototype[method]).call.apply(_oldArrayPrototype$me, [this].concat(args)); // this指向调用该方法的data（即经过响应式处理的数组）
      // 对于数组中新增的元素，也需要进行监控


      var ob = this.__ob__;
      var inserted;

      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;

        case "splice":
          inserted = args.slice(2);
      } // inserted是个数组，需要调用observeArray来监测


      if (inserted) ob.observeArray(inserted);
      return result;
    };
  });

  /**
   * 数据劫持：
   * 1. 如果是对象，则递归对象所有属性，进行劫持
   * 2. 如果数组，则会劫持数组方法（方法中如果是新增元素，会劫持新增元素），并对数组中类型为数组/对象的元素进行劫持
   */

  var Observer = /*#__PURE__*/function () {
    // 通过new命令生成class实例时，会自动调用constructor()，即会执行this.walk(data)方法
    function Observer(data) {
      _classCallCheck(this, Observer);

      // 在数据data上新增属性 data.__ob__；指向经过new Observer(data)创建的实例，可以访问Observer.prototype上的方法observeArray、walk等
      // 所有被劫持过的数据都有__ob__属性（通过这个属性可以判断数据是否被检测过）
      Object.defineProperty(data, "__ob__", {
        //  值指代的就是Observer的实例
        value: this,
        //  设为不可枚举，防止在forEach对每一项响应式的时候监控__ob__，造成死循环
        enumerable: false,
        writable: true,
        configurable: true
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
        data.__proto__ = arrayMethods; // 如果数组中的数据是对象，需要监控对象的变化

        this.observeArray(data);
      } else {
        // 对象响应式处理
        this.walk(data);
      }
    }

    _createClass(Observer, [{
      key: "observeArray",
      value: function observeArray(data) {
        // 【关键】递归了，监控数组每一项（observe会筛选出对象和数组，其他的不监控）的改变，数组长度很长的话，会影响性能
        // 【*********】数组并没有对索引进行监控，但是对数组的原型方法进行了改写，还对每一项（数组和对象类型）进行了监控
        data.forEach(function (item) {
          observe(item);
        });
      }
    }, {
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
    observe(value); // 【关键】递归，劫持对象中所有层级的所有属性
    // 如果Vue数据嵌套层级过深 >> 性能会受影响【******************************】

    Object.defineProperty(data, key, {
      get: function get() {
        // todo...收集依赖
        return value;
      },
      set: function set(newVal) {
        // 对新数据进行观察
        observe(newVal);
        value = newVal; // todo...更新视图
      }
    });
  }

  function observe(data) {
    // 如果是object类型（对象或数组）才观测；第一次调用observe(vm.$options._data)时，_data一定是个对象，官方要求的写法（data函数返回一个对象）
    if (!isObject(data)) {
      return;
    } // 如果已经是响应式的数据，直接return


    if (data.__ob__) {
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

  function compileToFunctions(template) {
    console.log('template', template);
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

      initState(vm); // 如果有el属性 进行模板渲染

      if (vm.$options.el) {
        vm.$mount(vm.$options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      // $mount 由vue实例调用，所以this指向vue实例
      var vm = this;
      var options = vm.$options;
      el = document.querySelector(el);
      /**
       * 1. 把模板转化成render函数
       * 2. 执行render函数，生成VNode
       * 3. 更新时进行diff
       * 4. 产生真实DOM
       */
      // 可以直接在options中写render函数，它的优先级比template高

      if (!options.render) {
        var template = options.template; // 如果不存在render和template但是存在el属性，则直接将template赋值为el元素

        if (!template && el) {
          template = el.outerHTML;
        } // 最终需要把tempalte模板转化成render函数


        if (template) {
          // 将template转化成render函数
          var render = compileToFunctions(template);
          options.render = render;
        }
      } // 将当前组件实例挂载到真实的el节点上面


      return mountComponent(vm, el);
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
