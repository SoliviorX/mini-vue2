import Collapse from "./collapse.js";
import CollapseItem from "./collapse-item.js";

window.customElements.define("zy-collapse", Collapse);
window.customElements.define("zy-collapse-item", CollapseItem);

// 设置组件默认显示状态
let defaultActive = ['1', '2']  // name:1、name:2默认展开，name:3 折叠
document.querySelector('zy-collapse').setAttribute('active',JSON.stringify(defaultActive))
// 然后，每个item需要获取到defaultActive 和自己的name属性作比较，如果在里面就显示，不在就隐藏

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