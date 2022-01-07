import { isReservedTag, isObject } from "../util/index";

export default class Vnode {
  /**
   * @param {标签名} tag
   * @param {属性} data
   * @param {标签唯一的key} key
   * @param {子节点} children
   * @param {文本节点} text
   * @param {组件节点的其他属性} componentOptions
   */
  constructor(tag, data, key, children, text, componentOptions) {
    this.tag = tag;
    this.data = data;
    this.key = key;
    this.children = children;
    this.text = text;
    this.componentOptions = componentOptions;
  }
}

// 创建元素vnode
export function createElement(vm, tag, data = {}, ...children) {
  let key = data.key;
  // 如果是普通标签
  if (isReservedTag(tag)) {
    return new Vnode(tag, data, key, children);
  } else {
    // 否则就是组件
    let Ctor = vm.$options.components[tag]; // 获取组件的构造函数
    return createComponent(vm, tag, data, key, children, Ctor);
  }
}

// 组件处理
function createComponent(vm, tag, data, key, children, Ctor) {
  // Ctor如果是局部组件，则为一个对象；如果是全局组件（Vue.component创建的），则为一个构造函数
  if (isObject(Ctor)) {
    Ctor = vm.$options._base.extend(Ctor);
  }

  // 定义组件自己内部的生命周期；
  // 【关键】等会渲染组件时，需要调用此初始化方法
  data.hook = {
    // 组件创建过程的自身初始化方法
    init(vnode) {
      // new Ctor()相当于执行Vue.extend()，即相当于new Sub；则组件会将自己的配置与{ _isComponent: true }合并
      let child = (vnode.componentInstance = new Ctor({ _isComponent: true })); // 实例化组件
      // 因为没有传入el属性，需要手动挂载，为了在组件实例上面增加$el方法可用于生成组件的真实渲染节点
      child.$mount(); // 组件挂载后会在vm上添加vm.$el 真实dom节点
    },
  };

  // 组件vnode也叫占位符vnode  ==> $vnode
  return new Vnode(
    `vue-component-${tag}`,
    data,
    key,
    undefined,
    undefined,
    {
      Ctor,
      children,
    }
  );
}

// 创建文本vnode
export function createTextNode(vm, text) {
  return new Vnode(undefined, undefined, undefined, undefined, text);
}
