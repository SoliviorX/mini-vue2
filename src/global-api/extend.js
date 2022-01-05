import { mergeOptions } from "../util/index";

export default function initExtend(Vue) {
  let cid = 0;

  // Vue.extend(extendOptions)做的事情就是：创建子类，继承Vue父类；并且身上有父类的所有功能
  Vue.extend = function (extendOptions) {
    // 创建子类的构造函数，并且调用初始化方法
    const Sub = function VueComponent(options) {
      this._init(options); // this指向子类的实例
    };
    Sub.cid = cid++; // 组件的唯一标识

    // 使用原型继承，将子类继承父类
    Sub.prototype = Object.create(this.prototype); // 子类原型指向父类
    Sub.prototype.constructor = Sub; // constructor指向自己

    Sub.options = mergeOptions(this.options, extendOptions); // 合并自己的extendOptions和父类的options（即Vue.options）
    return Sub;
  };
}
