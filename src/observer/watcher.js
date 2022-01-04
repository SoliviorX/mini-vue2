import { pushTarget, popTarget } from "./dep";
import { queueWatcher } from "./scheduler";
import { isObject } from "../util/index";

// 全局变量id  每次new Watcher都会自增
let id = 0;
export default class Watcher {
  constructor(vm, exprOrFn, cb, options) {
    this.vm = vm;
    this.exprOrFn = exprOrFn;
    this.cb = cb;
    this.options = options;
    this.user = !!options.user; // 表示是不是用户watcher
    this.lazy = !!options.lazy; // 表示是不是computed watcher
    this.dirty = this.lazy; // dirty可变，默认为true；表示计算watcher是否需要重新计算-执行用户定义的方法。

    this.id = id++; // watcher的唯一标识

    this.deps = []; //存放dep的容器
    this.depsId = new Set(); //用来去重dep

    /**
     * 1. 渲染watcher中，exprOrFn为updateComponent()，是一个函数
     * 2. 在用户watcher中，exprOrFn为字符串（watch中的属性名，即监听地属性）
     */
    // 当是渲染watcher 或 computed watcher时
    if (typeof exprOrFn === "function") {
      this.getter = exprOrFn;
    } else {
      // 当是用户自定义watcher时
      this.getter = function () {
        // watch的key可能是 'obj1.a.d' 这种格式，需要处理成vm.obj1.a.d
        let path = exprOrFn.split(".");
        let obj = vm;
        for (let i = 0; i < path.length; i++) {
          obj = obj[path[i]]; //vm.a.a.a.a.b
        }
        return obj; // 执行getter()，返回obj，会触发依赖收集，将用户watcher收集到监听的数据上
      };
    }

    // 如果是计算属性watcher，则创建watcher的时候，什么都不执行（后续用到计算属性的时候再执行）
    this.value = this.lazy ? undefined : this.get();
  }

  // new Watcher时会执行get方法；之后数据更新时，直接手动调用get方法即可
  get() {
    // 把当前watcher放到全局栈，并设置Dep.target（无法继承，具唯一性）为当前watcher
    pushTarget(this);
    /**
     * 执行exprOrFn，如果watcher是渲染watcher，则exprOrFn为vm._update(vm._render())
     * 在执行render函数的时候，获取变量会触发属性的getter（定义在对象数据劫持中），在getter中进行依赖收集
     */
    const res = this.getter.call(this.vm); // 如果是用户watcher，则上一次执行getter得到的值即为oldValue
    // 执行完getter就把当前watcher删掉，以防止用户在methods/生命周期中访问data属性时进行依赖收集（数据劫持时会判断Dep.target是否存在）
    popTarget(); // 在调用方法之后把当前watcher实例从全局watcher栈中移除，设置Dep.target为新的栈顶watcher
    return res;
  }

  /**
   * 1. 保证dep唯一，因为在render过程中，同一属性可能被多次调用，只需收集一次依赖即可；另外初始渲染收集过的dep，在更新时也不用再次收集（通过dep的id来判断）
   * 2. 将dep放到watcher中的deps数组中
   * 3. 在dep实例中添加watcher
   */
  addDep(dep) {
    let id = dep.id;
    if (!this.depsId.has(id)) {
      this.depsId.add(id);
      // 将dep放到watcher中的deps数组中
      this.deps.push(dep);
      // 直接调用dep的addSub方法  把自己watcher实例添加到dep的subs容器里面
      dep.addSub(this);
    }
  }

  // 更新当前watcher相关的视图
  // Vue中的更新是异步的
  // 当计算属性的依赖项发生改变，会触发依赖项相关 watcher（一般依赖项会收集computed watcher和渲染watcher，所以下面if、else都会走） 的update方法
  update() {
    // 计算属性的值发生变化，也会执行到update；
    // 这里做个判断，如果是计算属性watcher，则将dirty设置成true，下次访问计算属性时就会重新计算。
    if (this.lazy) {
      this.dirty = true;
      /**
       * 计算属性的依赖不仅需要收集计算属性watcher，还应该收集渲染watcher，这样当依赖项改变的时候，页面才会重新渲染
       */
    } else {
      // 每次watcher进行更新的时候，可以让他们先缓存起来，之后再一起调用
      // 异步队列机制
      queueWatcher(this);
    }
  }

  // 在计算属性的代理中，当dirty为true时会执行evaluate
  evaluate() {
    this.value = this.get(); // 计算新值，并对依赖项收集computed watcher
    this.dirty = false;
  }
  depend() {
    // 计算属性的watcher存储了依赖项的dep
    let i = this.deps.length;
    while (i--) {
      this.deps[i].depend(); // 调用依赖项的dep去收集渲染watcher
    }
  }

  run() {
    // 执行getter，更新视图/获取新值
    const newVal = this.getter(); // 新值
    const oldVal = this.value; //老值
    this.value = newVal; // newVal就成为了现在的值；为了保证下一次更新时，上一次的新值是下一次的老值

    // 如果是用户watcher
    if (this.user) {
      if (newVal !== oldVal || isObject(newVal)) {
        this.cb.call(this.vm, newVal, oldVal);
      }
    } else {
      // 渲染watcher
      this.cb.call(this.vm);
    }
  }
}
