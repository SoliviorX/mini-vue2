import { nextTick } from "../util/next-tick";

let queue = [];
let has = {}; // 维护存放了哪些watcher

/**
 * queueWatcher逻辑：
 * 1. 对watcher去重（有相同watcher的情况下，不重复push）
 * 2. 防抖：一段时间内只执行一次的更新（遍历所有watcher，执行watcher.run()）
 */
export function queueWatcher(watcher) {
  const id = watcher.id;

  // watcher去重，即相同watcher只push一次
  if (!has[id]) {
    //  同步代码执行 把全部的watcher都放到队列里面去
    queue.push(watcher);
    has[id] = true;

    // 开启一次异步更新操作，批处理（防抖）
    // 进行异步调用
    nextTick(flushSchedulerQueue);
  }
}

function flushSchedulerQueue() {
  for (let index = 0; index < queue.length; index++) {
    // 调用watcher的run方法，执行真正的更新操作
    queue[index].run();
  }

  // 执行完之后清空队列
  queue = [];
  has = {};
}
