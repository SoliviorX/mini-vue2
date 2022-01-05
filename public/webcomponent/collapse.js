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

    // 监听slot变化
    let slot = shadow.querySelector("slot");
    slot.addEventListener("slotchange", (e) => {
      this.slotList = e.target.assignedElements();
      this.render();
    });
  }
  // 监听属性'active'的变化（语法就是这样的）
  static get observedAttributes() {
    return ["active"];
  }
  /**
   * 生命周期钩子：connectedCallback、disconnectedCallback、adoptedCallback、attributeChangedCallback
   */
  // connectedCallback() {
  //     console.log('插入到dom时执行的回调')
  // }
  // disconnectedCallback() {
  //     console.log('移除dom时执行的回调')
  // }
  // adoptedCallback() {
  //     console.log('将组件移动到iframe会执行')
  // }
  attributeChangedCallback(key, oldVal, newVal) {
    // console.log("属性变化时执行");
    if (key === "active") {
      this.activeList = JSON.parse(newVal);
      this.render();
    }
  }
  render() {
    if (this.slotList && this.activeList) {
      [...this.slotList].forEach(child => {
          child.setAttribute('active', JSON.stringify(this.activeList))
      })
    }
  }
}

export default Collapse;
