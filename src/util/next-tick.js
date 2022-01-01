const callbacks = [];
function flushCallbacks() {
  callbacks.forEach((cb) => cb());
  waiting = false;
}
let waiting = false;
/**
 * 流程：
 * 1. watcher更新流程：
 *       ——> watcher.update()
 *       ——> queueWatcher(watcher)
 *       ——> 对watcher去重，并将watcher放到一个数组中；最后执行 nextTick(flushSchedulerQueue)（flushSchedulerQueue的作用是遍历watcher数组，调用watcher.run()）
 *       ——> 将 flushSchedulerQueue 放入一个 回调函数数组callbacks 中；定义一个微任务：flushCallbacks(callbacks)；
 * 2. vm.$nextTick(cb)：
 *       ——> 直接会执行Vue原型上的$nextTick()方法，即nextTick(cb)方法
 *       ——> 将cb 放入 上述的回调函数数组 callbacks 中，紧接着上述的flushSchedulerQueue，在微任务中一并执行
 *       ——> 由于在flushSchedulerQueue中会执行 watcher.run() 创建真实DOM，所以可以在$nextTick()回调中获取到最新DOM节点
 * 
 * 总结：
 * 1. callbacks 中包含 flushSchedulerQueue，以及$nextTick()的回调
 * 2. dep.subs中每个watcher执行update时，最后都会执行nextick，
 * 3. 执行nextick是否会创建微任务，取决于上一个微任务是否完成
 * 4. 执行微任务在UI渲染完成之前，为何能拿到页面dom？：：：$nextTick()回调中获取的时内存中的DOM，不关心UI有没有渲染完成
 */
export function nextTick(cb) {
  callbacks.push(cb);

  if (!waiting) {
    // 异步执行callBacks
    Promise.resolve().then(flushCallbacks);
    waiting = true;
  }
}
