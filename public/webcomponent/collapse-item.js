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
  // 监听属性'active'的变化
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
    if(this.activeList && name) {
        this.isShow = this.activeList.includes(name);
        this.shadowRoot.querySelector('.content').style.display = (this.isShow ? 'block' : 'none')
    }
  }
}

export default CollapseItem;
