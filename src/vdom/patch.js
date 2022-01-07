export function patch(oldVnode, vnode) {
  // 第一次渲染组件元素时；没有$el，也没有oldVnode
  if (!oldVnode) {
    // 组件的创建过程是没有el属性的
    return createElm(vnode);
  } else {
    // Vnode没有设置nodeType，值为undefined；真实节点可以获取到nodeType
    const isRealElement = oldVnode.nodeType;
    // 如果是初次渲染
    if (isRealElement) {
      const oldElm = oldVnode;
      const parentElm = oldElm.parentNode;
      // 将虚拟dom转化成真实dom节点
      const el = createElm(vnode);

      // 插入到 老的el节点 的下一个节点的前面，就相当于插入到老的el节点的后面
      // 这里不直接使用父元素appendChild是为了不破坏替换的位置
      parentElm.insertBefore(el, oldElm.nextSibling);

      // 删除老的el节点
      parentElm.removeChild(oldVnode);
      return el;
    } else {
      /**
       * 如果是更新视图
       */
      // 1. 如果标签名不一样，直接删掉老的，换成新的
      // debugger;
      if (oldVnode.tag !== vnode.tag) {
        // vnode.el就是在 createElm(vnode)创建真实dom时添加到vnode上的，vnode.el是真实dom
        oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el); // oldVnode.el代表的是真实dom节点
      }
      // 2. 如果新旧节点是一个文本节点（新节点是一个文本节点，则旧节点一定是文本节点，否则两者tag不同，会走上面的判断）
      if (!vnode.tag) {
        if (oldVnode.text !== vnode.text) {
          oldVnode.el.textContent = vnode.text;
        }
      }
      // 3. 不符合上面两种，代表标签名一致，并且不是文本节点
      const el = (vnode.el = oldVnode.el); // 为了节点复用 所以直接把旧的虚拟dom对应的真实dom赋值给新的虚拟dom的el属性
      updateProperties(vnode, oldVnode.data); // 更新属性
      const oldCh = oldVnode.children || []; // 老的儿子
      const newCh = vnode.children || []; // 新的儿子
      if (oldCh.length > 0 && newCh.length > 0) {
        // 3.1. 新老都存在子节点
        updateChildren(el, oldCh, newCh); // 【核心算法】
      } else if (oldCh.length) {
        // 3.2 老的有儿子，新的没有
        el.innerHTML = "";
      } else if (newCh.length) {
        // 3.3 新的有儿子，老的没儿子
        for (let i = 0; i < newCh.length; i++) {
          const child = newCh[i];
          el.appendChild(createElm(child));
        }
      }
    }
  }
}

// 虚拟dom转成真实dom
function createElm(vnode) {
  const { tag, data, key, children, text } = vnode;
  // 判断虚拟dom 是元素节点、自定义组件 还是文本节点（文本节点tag为undefined）
  if (typeof tag === "string") {
    // 如果是组件，返回组件渲染的真实dom
    if (createComponent(vnode)) {
      return vnode.componentInstance.$el;
    }

    // 否则是元素
    // 虚拟dom的el属性指向真实dom，方便后续更新diff算法操作
    vnode.el = document.createElement(tag);
    // 解析vnode属性
    updateProperties(vnode);
    // 如果有子节点就递归插入到父节点里面
    children.forEach((child) => {
      return vnode.el.appendChild(createElm(child));
    });
  } else {
    // 否则是文本节点
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}

// 创建组件的真实dom
function createComponent(vnode) {
  // 初始化组件，创建组件实例
  let i = vnode.data;
  // 相当于执行 vnode.data.hook.init(vnode)
  if ((i = i.hook) && (i = i.init)) {
    i(vnode);
  }
  // 如果组件实例化完毕，有componentInstance属性，那证明是组件
  if (vnode.componentInstance) {
    vnode.el = vnode.componentInstance.$el; // 【关键】
    return true;
  }
}

// 解析vnode的data属性，映射到真实dom上
// 初次调用时oldProps为空，更新时oldProps可能有值，都可以调用此方法来解析vnode的属性
function updateProperties(vnode, oldProps = {}) {
  let newProps = vnode.data || {};
  let el = vnode.el; // 真实节点

  // 如果新的节点没有该属性，需要把老的节点属性移除
  for (let k in oldProps) {
    if (!newProps[k]) {
      el.removeAttribute(k);
    }
  }

  // 对style样式做特殊处理，如果新的没有，需要把老的style值置为空
  let newStyle = newProps.style || {};
  let oldStyle = oldProps.style || {};
  for (let key in oldStyle) {
    if (!newStyle[key]) {
      el.style[key] = "";
    }
  }

  // 遍历新的属性，进行增加操作
  for (const key in newProps) {
    if (key === "style") {
      for (const styleName in newProps.style) {
        el.style[styleName] = newProps.style[styleName];
      }
    } else if (key === "class") {
      el.className = newProps.class;
    } else {
      // 给这个元素添加属性 值就是对应的值
      el.setAttribute(key, newProps[key]);
    }
  }
}

// 判断两个vnode的标签和key是否相同，如果相同，就可以认为是同一节点就地复用
function isSameVnode(oldVnode, newVnode) {
  return oldVnode.tag === newVnode.tag && oldVnode.key === newVnode.key;
}
// diff算法核心，采用双指针的方式，对比新老vnode的儿子节点
function updateChildren(parent, oldCh, newCh) {
  let oldStartIndex = 0; //老儿子的起始下标
  let oldStartVnode = oldCh[0]; //老儿子的第一个节点
  let oldEndIndex = oldCh.length - 1; //老儿子的结束下标
  let oldEndVnode = oldCh[oldEndIndex]; //老儿子的结束节点

  let newStartIndex = 0; // 新儿子的，同上
  let newStartVnode = newCh[0];
  let newEndIndex = newCh.length - 1;
  let newEndVnode = newCh[newEndIndex];

  // 根据key来创建老的儿子的index映射表；类似 {'a':0,'b':1}：表示key为'a'的节点在第一个位置，key为'b'的节点在第二个位置

  function makeIndexByKey(children) {
    let map = {};
    children.forEach((item, index) => {
      item.key && (map[item.key] = index);
    });
    return map;
  }
  // 生成oldCh的映射表（key:index）
  let keysMap = makeIndexByKey(oldCh);

  // 只有当新老儿子的双指标的起始位置不大于结束位置的时候，才能循环；
  // 一方的开始位置大于结束位置，说明该方循环完毕，需要结束循环
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    // 如果节点已经被移走了，直接跳过
    if (!oldStartVnode) {
      oldStartVnode = oldCh[++oldStartIndex];
    } else if (!oldEndVnode) {
      oldEndVnode = oldCh[--oldEndIndex];
    } else if (isSameVnode(oldStartVnode, newStartVnode)) {
      // 头头比较
      patch(oldStartVnode, newStartVnode); // 递归比较儿子以及他们的子节点
      // 指针往后移一位，startVnode也相应改变
      oldStartVnode = oldCh[++oldStartIndex];
      newStartVnode = newCh[++newStartIndex];
    } else if (isSameVnode(oldEndVnode, newEndVnode)) {
      // 尾尾比较
      patch(oldEndVnode, newEndVnode); // 递归比较儿子以及他们的子节点
      // 指针往前移一位，endVnode也相应改变
      oldEndVnode = oldCh[--oldEndIndex];
      newEndVnode = newCh[--newEndIndex];
    } else if (isSameVnode(oldStartVnode, newEndVnode)) {
      // 头尾比较
      patch(oldStartVnode, newEndVnode);
      //  比较完，就需要将递归的结果，放到oldEndVnode后面（因为新的是在尾部，所以当头尾比较满足samavnode时，需要将老的vnode移到尾部，与newCh顺序保持一致）
      parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling); // 比较完，就需要将结果移动到末尾
      // 指针改变，oldStartVnode、newEndVnode相应改变
      oldStartVnode = oldCh[++oldStartIndex];
      newEndVnode = newCh[--newEndIndex];
    } else if (isSameVnode(oldEndVnode, newStartVnode)) {
      // 尾头比较
      patch(oldEndVnode, newStartVnode);
      //  比较完，就需要将递归的结果，放到oldStartVnode前面（因为新的是在头部，所以当尾头比较满足samavnode时，需要将老的vnode移到头部，与newCh顺序保持一致）
      parent.insertBefore(oldEndVnode.el, oldStartVnode.el);
      // 指针改变，oldEndVnode、newStartVnode相应改变
      oldEndVnode = oldCh[--oldEndIndex];
      newStartVnode = newCh[++newStartIndex];
    } else {
      // 如果以上四种情况都不满足，需要进行暴力对比
      // 在oldCh中寻找newStartVnode对应key相同的节点（keysMap是表示oldCh中key-index对应关系的对象）
      let moveIndex = keysMap[newStartVnode.key];
      if (!moveIndex) {
        // 如果老的节点找不到与newStartVnode相同key的节点，则直接将newStartVnode插入
        parent.insertBefore(createElm(newStartVnode), oldStartVnode.el);
      } else {
        // 如果在oldCh中找到与newStartVnode相同key的节点
        let moveVnode = oldCh[moveIndex]; // 找得到就拿到老的节点
        oldCh[moveIndex] = null; //  这个是占位操作，避免数组塌陷，防止老节点移动走了之后破坏了初始的映射表位置，即后续如果再次采用乱序比对会出现索引位置错乱（因为moveVnode是根据索引获取的）
        parent.insertBefore(moveVnode.el, oldStartVnode.el); //把找到的节点移动到最前面
        patch(moveVnode, newStartVnode); //  递归patch
      }
      // 指针和newStartVnode相应做出改变
      newStartVnode = newCh[++newStartIndex];
    }
  }

  // 如果老节点循环完毕了，但是新节点还有；证明新节点需要被添加到头部或者尾部
  if (newStartIndex <= newEndIndex) {
    // 此时newStartIndex并非为0，而是等于oldCh比对完时，newCh所处的位置
    // 遍历newCh剩余的节点，生成真实dom，插入到parent中
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      // 看下一个指针是否为null，不是的话，取它的el属性
      // 这是一个优化写法 insertBefore的第二个参数是null等同于appendChild作用
      const anchor =
        newCh[newEndIndex + 1] == null ? null : newCh[newEndIndex + 1].el;
      parent.insertBefore(createElm(newCh[i]), anchor);
    }
  }

  // 如果新节点循环完毕，老节点还有；证明老的节点需要直接被删除
  if (oldStartIndex <= oldEndIndex) {
    // 遍历oldCh剩余的节点，将他们从parent中删除
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      let child = oldCh[i];
      if (!child) {
        parent.removeChild(child.el);
      }
    }
  }
}
