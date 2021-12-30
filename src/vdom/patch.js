export function patch(oldVnode, vnode) {
  // 如果没有el，也没有oldVnode
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
        // 如果是更新视图
    }
  }
}

// 虚拟dom转成真实dom
function createElm(vnode) {
  const { tag, data, key, children, text } = vnode;

  // 判断虚拟dom 是元素节点还是文本节点（文本节点tag为undefined）
  if (typeof tag === "string") {
    // 虚拟dom的el属性指向真实dom，方便后续更新diff算法操作
    vnode.el = document.createElement(tag);

    // 解析vnode属性
    updateProperties(vnode);

    // 如果有子节点就递归插入到父节点里面
    children.forEach((child) => {
      return vnode.el.appendChild(createElm(child));
    });
  } else {
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}

// 解析vnode的data属性，映射到真实dom上
function updateProperties(vnode, oldProps = {}) {
  const newProps = vnode.data || {};
  const el = vnode.el; // 真实节点

  // 如果新的节点没有 需要把老的节点属性移除
  for (const k in oldProps) {
    if (!newProps[k]) {
      el.removeAttribute(k);
    }
  }

  // 对style样式做特殊处理 如果新的没有 需要把老的style值置为空
  const newStyle = newProps.style || {};
  const oldStyle = oldProps.style || {};
  for (const key in oldStyle) {
    if (!newStyle[key]) {
      el.style[key] = "";
    }
  }

  // 遍历新的属性 进行增加操作
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
