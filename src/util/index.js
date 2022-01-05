import { ASSETS_TYPE } from "../global-api/const";

export const LIFECYCLE_HOOKS = [
  "beforeCreate",
  "created",
  "beforeMount",
  "mounted",
  "beforeUpdate",
  "updated",
  "beforeDestroy",
  "destroyed",
];

const strats = {}; // 存放各种策略
// 生命周期的合并策略
function mergeHook(parentVal, childVal) {
  if (childVal) {
    if (parentVal) {
      // 简单说就是数组的合并
      return parentVal.concat(childVal);  // 后续合并
    } else {
      return [childVal];  // 第一次合并结果是一个数组（因为第一次合并时，Vue.options为空对象，parentVal为undefined，会走这一步）
    }
  } else {
    return parentVal;
  }
}
LIFECYCLE_HOOKS.forEach((hook) => {
  strats[hook] = mergeHook;
})

// components、directives、filters的合并策略
function mergeAssets(parentVal, childVal) {
  // 比如有【同名】的全局组件和自己定义的局部组件，那么parentVal代表全局组件，自己定义的组件是childVal
  // 首先会查找自已局部组件有就用自己的，没有就从原型继承全局组件，res.__proto__===parentVal
  const res = Object.create(parentVal); 
  if (childVal) {
    for (let k in childVal) {
      res[k] = childVal[k];
    }
  }
  return res;
}
ASSETS_TYPE.forEach((type) => {
  strats[type + "s"] = mergeAssets;
});

export function mergeOptions(parent, child) {
  const options = {}; // 合并后的结果
  /**
   * 遍历父子option中所有的属性，调用mergeFiled进行合并
   */
  for (let k in parent) {   // 遍历父亲所有属性，进行合并
    mergeFiled(k);
  }

  for (let k in child) {   // 遍历儿子；对儿子有、父亲没有的属性，同样进行合并
    if (!parent.hasOwnProperty(k)) {
      mergeFiled(k);
    }
  }

  // 真正进行属性合并的方法
  function mergeFiled(key) {
    let parentVal = parent[key]
    let childVal = child[key]
    // 1. 使用【策略模式】处理生命周期：生命周期的合并，需要合并成数组
    if(strats[key]) {
      // 不同策略调用对应的方法 来合并parentVal和childVal
      options[key] = strats[key](parentVal, childVal);
    } else {
      // 2. 生命周期外其他数据的合并

      // 如果parentVal和childVal都是对象的话，则进行对象的合并
      if(isObject(parentVal) && isObject(childVal)) {
        options[key] = {...parentVal, ...childVal}
      } else {
        // 如果有一方为基本数据类型/函数
        // 儿子有则以儿子为准；
        // 儿子没有，父亲有，则取父亲的属性
        options[key] = childVal || parentVal
      }
    }
  }
  // 真正合并字段方法
  // function mergeFiled(k) {
  //   // 【策略模式】
  //   if (strats[k]) {  // 如果有对应的策略
  //     options[k] = strats[k](parent[k], child[k]);
  //   } else {
  //     // 默认策略
  //     options[k] = child[k] ? child[k] : parent[k];
  //   }
  // }
  return options
}

// 判断val是否是对象/数组
export function isObject(val) {
  return typeof val === "object" && val !== null;
}

// 判断是否是函数
export function isFunction(val) {
  return typeof val === "function";
}

// 判断tagName是否是普通标签
export function isReservedTag(tagName) {
  // 定义常见标签
  let str =
    "html,body,base,head,link,meta,style,title," +
    "address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section," +
    "div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul," +
    "a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby," +
    "s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video," +
    "embed,object,param,source,canvas,script,noscript,del,ins," +
    "caption,col,colgroup,table,thead,tbody,td,th,tr," +
    "button,datalist,fieldset,form,input,label,legend,meter,optgroup,option," +
    "output,progress,select,textarea," +
    "details,dialog,menu,menuitem,summary," +
    "content,element,shadow,template,blockquote,iframe,tfoot";
  let obj = {};
  str.split(",").forEach((tag) => {
    obj[tag] = true;
  });
  return obj[tagName];
}
