import { parse } from "./parse";
import { generate } from "./codegen";
export function compileToFunctions(template) {
  // 1. 把template转成AST语法树；AST用来描述代码本身形成树结构，不仅可以描述html，也能描述css以及js语法
  let ast = parse(template);
  console.log("🚀AST-----", ast);
  // 2. 优化静态节点
  // 这个有兴趣的可以去看源码  不影响核心功能就不实现了
  //   if (options.optimize !== false) {
  //     optimize(ast, options);
  //   }

  // 3. 通过ast，重新生成代码
  // 我们最后生成的代码需要和render函数一样
  // 类似_c('div',{id:"app"},_c('div',undefined,_v("hello"+_s(name)),_c('span',undefined,_v("world"))))
  // _c代表创建元素 _v代表创建文本 _s代表文Json.stringify--把对象解析成文本
  let code = generate(ast);
  console.log("🚀renderFunction-----", code);
  
  // 通过new Function生成函数
  let renderFn = new Function(`with(this){return ${code}}`);
  return renderFn;
}
