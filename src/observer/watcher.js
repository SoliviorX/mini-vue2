import { pushTarget, popTarget } from "./dep";
import { queueWatcher } from "./scheduler";

// 全局变量id  每次new Watcher都会自增
let id = 0;
export default class Watcher {
  constructor(vm, exprOrFn, cb, options) {
    this.vm = vm;
    this.exprOrFn = exprOrFn;
    this.cb = cb;
    this.options = options;
    this.id = id++; // watcher的唯一标识

    this.deps = []; //存放dep的容器
    this.depsId = new Set(); //用来去重dep

    this.getter = exprOrFn;
    this.get();
  }

  // new Watcher时会执行get方法；之后数据更新时，直接手动调用get方法即可
  get() {
    // 把当前watcher放到全局栈，并设置Dep.target（无法继承，具唯一性）为当前watcher
    pushTarget(this);

    /**
     * 执行exprOrFn，如果watcher是渲染watcher，则exprOrFn为vm._update(vm._render())
     * 在执行render函数的时候，获取变量会触发属性的getter（定义在对象数据劫持中），在getter中进行依赖收集
     */
    const res = this.getter.call(this.vm);

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
      console.log("watcher.deps", this.deps);
      // 直接调用dep的addSub方法  把自己watcher实例添加到dep的subs容器里面
      dep.addSub(this);
    }
  }

  // 更新当前watcher相关的视图
  // Vue中的更新是异步的
  update() {
    // 每次watcher进行更新的时候，可以让他们先缓存起来，之后再一起调用
    // 异步队列机制
    queueWatcher(this);
  }

  run() {
    // TODO 其他功能扩展
    this.getter.call(this.vm)
  }
}
