const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // 匹配花括号 {{  }}；捕获花括号里面的内容
function gen(node) {
  // 如果是元素类型
  if (node.type == 1) {
    // 【关键】递归创建
    return generate(node);
  } else {
    // else即文本类型
    let text = node.text;

    // 1. 如果text中不存在花括号变量表达式
    if (!defaultTagRE.test(text)) {
      // _v表示创建文本
      return `_v(${JSON.stringify(text)})`;
    }

    // 正则是全局模式 每次需要重置正则的lastIndex属性，不然会引发匹配bug（defaultTagRE.exec()匹配完一次后，再次匹配为null，需要重置lastIndex）
    let lastIndex = (defaultTagRE.lastIndex = 0);
    let tokens = [];
    let match, index;

    // 2. 如果text中存在花括号变量（使用while循环，是因为可能存在多个{{变量}}）
    while ((match = defaultTagRE.exec(text))) {
      // match如果匹配成功，其结构为：['{{myValue}}', 'myValue', index: indexof({) ]
      // index代表匹配到的位置
      index = match.index;
      // 初始 lastIndex 为0，index > lastIndex 表示在{{ 前有普通文本
      if (index > lastIndex) {
        // 在tokens里面放入 {{ 之前的普通文本
        tokens.push(JSON.stringify(text.slice(lastIndex, index)));
      }
      // tokens中放入捕获到的变量内容
      tokens.push(`_s(${match[1].trim()})`);
      // 匹配指针后移，移到 }} 后面
      lastIndex = index + match[0].length;
    }

    // 3. 如果匹配完了花括号，text里面还有剩余的普通文本，那么继续push
    if (lastIndex < text.length) {
      tokens.push(JSON.stringify(text.slice(lastIndex)));
    }
    // _v表示创建文本
    return `_v(${tokens.join("+")})`;
  }
}

// 生成子节点：遍历children调用gen(item)，使用逗号拼接每一项的结果
function getChildren(el) {
  const children = el.children;
  if (children) {
    return `${children.map((c) => gen(c)).join(",")}`;
  }
}

// 处理attrs/props属性：将[{name: 'class', value: 'home'}, {name: 'style', value: "font-size:12px;color:red"}]
//                  转化成 "class:"home",style:{"font-size":"12px","color":"red"}"
function genProps(attrs) {
  let str = "";
  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i];
    // 对attrs属性里面的style做特殊处理
    if (attr.name === "style") {
      let obj = {};
      attr.value.split(";").forEach((item) => {
        let [key, value] = item.split(":");
        obj[key] = value;
      });
      attr.value = obj;
    }
    str += `${attr.name}:${JSON.stringify(attr.value)},`;
  }
  return `{${str.slice(0, -1)}}`;
}

// 将ast转化成render函数
export function generate(ast) {
  let children = getChildren(ast);

  let code = `_c('${ast.tag}',${
    ast.attrs.length ? `${genProps(ast.attrs)}` : "undefined"
  }${children ? `,${children}` : ""})`;

  return code;
}
