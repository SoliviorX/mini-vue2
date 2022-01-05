import { ASSETS_TYPE } from "./const";
export default function initAssetRegisters(Vue) {
  ASSETS_TYPE.forEach((type) => {
    Vue[type] = function (id, definition) {
      if (type === "component") {
        // Vue.component(id,definition)就是调用 Vue.extend(definition)，并配置Vue.options.components.id = definition
        definition = this.options._base.extend(definition);
      } else if (type === "filter") {
        // ...
      } else if (type === "directive") {
        // ...
      }

      // 配置Vue.options[components/filters/directive]
      this.options[type + "s"][id] = definition;
    };
  });
}
