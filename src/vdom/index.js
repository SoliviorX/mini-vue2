import { isReservedTag } from "../util/index";

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
    console.log(
      "🚀 ~ file: index.js ~ line 5 ~ Vnode ~ constructor ~ componentOptions",
      componentOptions
    );
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
    let Ctor = vm.$options.components[tag]; //获取组件的构造函数
    return createComponent(vm, tag, data, key, children, Ctor);
  }
}

// 组件处理
function createComponent(vm, tag, data, key, children, Ctor) {
  // todo...如果 _c(tag,...) 创建的是自定义组件，如何处理？
  //   if (isObject(Ctor)) {
  //     Ctor = vm.$options._base.extend(Ctor);
  //   }
}

// 创建文本vnode
export function createTextNode(vm, text) {
  return new Vnode(undefined, undefined, undefined, undefined, text);
}
