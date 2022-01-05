## 前言
我们日常开发使用的框架都支持组件化，组件化使得组件得以复用，大幅提高开发效率。浏览器的原生组件 [Web Components](https://developer.mozilla.org/zh-CN/docs/Web/Web_Components)旨在解决组件复用问题，相比框架更加直接，不用加载任何外部模块，目前大部分浏览器已原生支持Web Components，对于IE、safiri、以及一些老版本浏览器兼容性不太好。
![web components](http://cdn.zjutshideshan.cn/juejin/webcomponents.png)

## 语法
### 自定义元素
自定义元素必须以短横线拼接。
```html
<zy-button type='primary'>custom按钮</zy-button>
```
### customElements.define()
自定义元素需要使用 JavaScript 定义一个类，所有`<zy-button>`都会是这个类的实例。
```js
class ZyButton extends HTMLElement {
  constructor() {
    super();
  }
}
window.customElements.define('zy-button', ZyButton);
```
### template标签
Web Components API 提供了`<template>`标签，可以在它里面使用 HTML 定义 DOM。
template标签不会被渲染到页面上，仅为了提供shadowDOM使用，它们可以作为自定义元素结构的基础被多次重用。
```html
<template id="btn">
    <button class="zy-button">
        <slot>默认按钮</slot>
    </button>
</template>
```
### shadowDOM
用于将封装的“影子”DOM树附加到元素（与主文档DOM分开呈现）并控制其关联的功能。

例如`<video>`标签，内部有倍速、进度条、音量等元素，它们都被封装到shadowDOM里面，外部无法改变这些元素。

相关API：
1. 可以使用 `Element.attachShadow()` 方法来将一个 shadow root 附加到任何一个元素上。
2. 使用 shadow.appendChild(ele) 将 Shadow DOM 附加到一个元素之后。

### 自定义元素的内容
自定义元素需要继承一个类，在该类中可以**监听元素的属性**、定义元素的**生命周期钩子**、**定义样式**等。

自定义元素的内容：
```js
class ZyButton extends HTMLElement {
    constructor() {
        // 继承HTMLElement
        super()
        // 创建shadowDOM
        let shadow = this.attachShadow({mode: 'open'});
        // 获取template
        let btnTmpl = document.getElementById('btn')
        // 克隆了它的所有子元素，这是因为可能有多个自定义元素的实例，这个模板还要留给其他实例使用，所以不能直接移动它的子元素。
        let cloneTemplate = btnTmpl.content.cloneNode(true)

        // this是zy-button元素
        let type = this.getAttribute('type') || 'default'

        const btnList = {
            'primary': {
                background: '#409eff',
                color: '#fff'
            },
            'default': {
                background: '#909399',
                color: '#fff'
            }
        }
        // 创建style元素
        const style = document.createElement('style')
        // 设置shadowDOM的样式
        style.textContent = `
            .zy-button{
                outline: none;
                border:none;
                border-radius:4px;
                padding:5px 20px;
                display:inline-flex;
                background: var(--zy-background-color,${btnList[type].background});
                color: var(--zy-color,${btnList[type].color});
                cursor:pointer;
            }
        `
        // 在shadowDOM中添加style元素
        shadow.appendChild(style)
        // 在shadowDOM中添加cloneTemplate
        shadow.appendChild(cloneTemplate)
    }
    /**
     * 生命周期钩子
    */
    connectedCallback() {
        console.log('插入到dom时执行的回调')
    }
    disconnectedCallback() {
        console.log('移除dom时执行的回调')
    }
    adoptedCallback() {
        console.log('将组件移动到iframe会执行')
    }
    attributeChangedCallback(key, oldVal, newVal) {
        console.log("属性变化时执行");
    }
    
    /**
     * 监听属性（监听属性'active'的变化）
    */
    static get observedAttributes() {
        return ["active"];
    }
}
```

## 创建collapse自定义组件
### 目录组织结构
```
public
├─ webcomponent                 // class定义相关
│  ├─ collapse-item.js
│  ├─ collapse.js
│  └─ index.js
└─ webcomponent-collapse.html   // 自定义组件、template等
```

### webcomponent-collapse.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>collapse</title>
</head>
<body>
    <!-- 直接打开html文件，会报错不支持file引入 -->
    <!-- 安装live server插件，用插件打开html文件 -->
    <!-- live server是一个实时小型服务器 -->
    <zy-collapse>
        <zy-collapse-item title='Node' name='1'>
            <div>nodejs welcome</div>
        </zy-collapse-item>
        <zy-collapse-item title='react' name='2'>
            <div>react welcome</div>
        </zy-collapse-item>
        <zy-collapse-item title='vue' name='3'>
            <div>vue welcome</div>
        </zy-collapse-item>
    </zy-collapse>

    <!-- template 没有实际意义，不会渲染 -->
    <template id="collapse_tmpl">
        <div class="zy-collapse">
            <slot></slot>
        </div>
    </template>

    <template id="collapse_item_tmpl">
        <div class="zy-collapse-item">
            <div class="title"></div>
            <div class="content">
                <slot></slot>
            </div>
        </div>
    </template>
    <!-- vite实现原理就依赖于 type='module' -->
    <script src='./webcomponent/index.js' type="module"></script>
</body>
</html>
```
自定义的collapse组件类似于element-ui中的collapse组件，外部为`<zy-collapse>`，有`activeList`属性，为默认展开的items；内部为多个`<zy-collapse-item>`，支持展开和折叠，有name属性（标识符）、title属性（标题）。
> tip: 直接打开html文件会报错，不支持file引入文件；解决方式：安装live server插件，使用该插件打开html文件

### index.js
```js
import Collapse from "./collapse.js";
import CollapseItem from "./collapse-item.js";

window.customElements.define("zy-collapse", Collapse);
window.customElements.define("zy-collapse-item", CollapseItem);

// 设置组件默认显示状态
let defaultActive = ['1', '2']  // name:1、name:2默认展开，name:3 折叠
document.querySelector('zy-collapse').setAttribute('active',JSON.stringify(defaultActive))
// 然后，每个item需要获取到defaultActive 和自己的name属性作比较，如果在里面就显示，不在就隐藏

// 组件通信（监听到自定义事件changeName，获取到子组件传递过来的参数，然后触发defaultActive的更改，子组件监听到defaultActive的修改，进行展开/折叠）
document.querySelector('zy-collapse').addEventListener('changeName', (e) => {
    let { isShow, name } = e.detail
    console.log(isShow, name)
    // isShow为true，就隐藏；反之则展示
    if(isShow) {
        let index = defaultActive.indexOf(name)
        defaultActive.splice(index,1)
    } else {
        defaultActive.push(name)
    }
    document.querySelector('zy-collapse').setAttribute('active',JSON.stringify(defaultActive))
})
```
### collapse.js
```js
class Collapse extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    const tmpl = document.getElementById("collapse_tmpl");
    let cloneTemplate = tmpl.content.cloneNode(true); // true表示克隆所有子节点
    const style = document.createElement("style");
    style.textContent = `
            :host {
                display: flex;
                border: 2px solid #ebebeb;
                border-radius: 5px;
                width: 100%;
            }
            .zy-collapse {
                width: 100%;
            }
        `;

    shadow.appendChild(style);
    shadow.appendChild(cloneTemplate);

    // 监听slot变化（初次渲染，slot赋值时就会监听到）
    let slot = shadow.querySelector("slot");
    slot.addEventListener("slotchange", (e) => {
      // slotList为所有子元素
      this.slotList = e.target.assignedElements();
      this.render();
    });
  }
  // 监听属性'active'的变化（语法就是这样的）
  static get observedAttributes() {
    return ["active"];
  }
  // 属性变化时执行
  attributeChangedCallback(key, oldVal, newVal) {
    if (key === "active") {
      this.activeList = JSON.parse(newVal);
      this.render();
    }
  }
  render() {
    if (this.slotList && this.activeList) {
      // slotList是类数组，用扩展运算符转化成数组
      [...this.slotList].forEach(child => {
          child.setAttribute('active', JSON.stringify(this.activeList))
      })
    }
  }
}

export default Collapse;
```

### collapse-item.js
```js
class CollapseItem extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    const tmpl = document.getElementById("collapse_item_tmpl");
    let cloneTemplate = tmpl.content.cloneNode(true); // true表示克隆所有子节点
    const style = document.createElement("style");
    this.isShow = true; // 默认需要展开
    style.textContent = `
            :host {
                width: 100%;
            }
            .title {
                background: #f1f1f1;
                line-height: 35px;
                height: 35px;
            }
            .content {
                font-size: 14px;
            }
        `;
    shadow.appendChild(style);
    shadow.appendChild(cloneTemplate);

    this.titleEle = shadow.querySelector('.title')
    this.titleEle.addEventListener('click', () => {
        // 将结果传递给父亲；发布订阅模式！！
        // 自定义事件 new CustomEvent
        document.querySelector('zy-collapse').dispatchEvent(new CustomEvent('changeName', {
            detail: {
                name: this.getAttribute('name'),
                isShow: this.isShow
            }
        }))
    })
  }
  // 监听属性active、title、name的变化
  static get observedAttributes() {
    return ["active", "title", "name"];
  }
  // 属性变化时执行
  attributeChangedCallback(key, oldVal, newVal) {
    switch (key) {
      case "active":
          this.activeList = JSON.parse(newVal)
        break;
      case "title":
          this.titleEle.innerHTML = newVal; // 接收到title属性，将它作为 .title 元素的内容
        break;
      case "name":
          this.name = newVal
        break;
      default:
        break;
    }
    let name = this.name
    // 进行内容的展示/折叠
    if(this.activeList && name) {
        this.isShow = this.activeList.includes(name);
        this.shadowRoot.querySelector('.content').style.display = (this.isShow ? 'block' : 'none')
    }
  }
}

export default CollapseItem;
```

### 组件通信方式
在父组件绑定一个自定义事件：
```js
document.querySelector('zy-collapse').addEventListener('changeName', (e) => {
    // 获取到子组件传递过来的数据
    let { isShow, name } = e.detail
    console.log(isShow, name)
   
})
```
在子组件中派发自定义事件，并传递参数：
```js
this.titleEle.addEventListener('click', () => {
    // 自定义事件 new CustomEvent
    document.querySelector('zy-collapse').dispatchEvent(new CustomEvent('changeName', {
        detail: {
            name: this.getAttribute('name'),
            isShow: this.isShow
        }
    }))
})
```

## 参考资料
[MDN Web Components](https://developer.mozilla.org/zh-CN/docs/Web/Web_Components)

[阮一峰 Web Components 入门实例教程](http://www.ruanyifeng.com/blog/2019/08/web_components.html)