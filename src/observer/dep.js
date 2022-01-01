/**
 * 1. 每个属性我都给他分配一个dep（一对一的关系），一个dep可以存放多个watcher（一个属性可能对应多个watcher）
 * 2. 一个watcher中还可以存放多个dep（一个watcher可能对应多个属性，而dep与属性一一对应）
 * 3. dep具有唯一性
 */
let id = 0; // 给dep添加一个标识，保证它的唯一性
export default class Dep {
  constructor() {
    this.id = id++;
    this.subs = [];  // 用来存放watcher
  }

  // 将dep实例放到watcher中
  depend() {
    // 如果当前存在watcher
    if (Dep.target) {
      // Dep.target即当前watcher，是在new Watcher时设置的
      Dep.target.addDep(this); // this为dep实例（与属性一一对应），即把自身dep实例存放在watcher里面
    }
  }

  // 依次执行subs里面的watcher更新方法
  notify() {
    this.subs.forEach((watcher) => watcher.update());
  }

  // 把watcher加入到dep实例的subs容器（因为一个dep可能对应多个watcher）
  addSub(watcher) {
    console.log('dep.subs', this.subs)
    this.subs.push(watcher);
  }
}

/**
 * targetStack定义在全局，为整个项目所有watcher
 * Dep.target定义在Dep自身而非prototype上，无法被实例继承，标识当前的watcher，具有唯一性
 */
// 栈结构用来存众多watcher
const targetStack = [];
// Dep.target 为 dep 当前所对应的watcher（即栈顶的watcher），默认为null
Dep.target = null;

export function pushTarget(watcher) {
  targetStack.push(watcher);
  Dep.target = watcher; // Dep.target指向当前watcher
}

export function popTarget() {
  targetStack.pop(); // 当前watcher出栈 拿到上一个watcher
  Dep.target = targetStack[targetStack.length - 1];
}
