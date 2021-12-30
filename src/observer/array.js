// arrayMethods是继承自Array.prototype，不直接修改Array.prototype，不污染Array.prototype
let oldArrayPrototype = Array.prototype
export let arrayMethods = Object.create(oldArrayPrototype)

let methods = [
    'push',
    'pop',
    'unshift',
    'shift',
    'sort',
    'reverse',
    'splice'
]

methods.forEach(method => {
    arrayMethods[method] = function(...args) {
        const result = oldArrayPrototype[method].call(this,...args) // this指向调用该方法的data（即经过响应式处理的数组）

        // 对于数组中新增的元素，也需要进行监控
        const ob = this.__ob__;
        let inserted;
        switch (method) {
            case 'push':
            case 'unshift':
                inserted = args;
                break;
            case "splice":
                inserted = args.slice(2);
            default:
                break;
        }
        // inserted是个数组，需要调用observeArray来监测
        if (inserted) ob.observeArray(inserted);
        return result
    }
})