import babel from 'rollup-plugin-babel'
import serve from 'rollup-plugin-serve'

export default {
    input: './src/index.js',    // 入口文件
    output: {
        format: 'umd',  // 支持amd 和 commonjs规范
        name: 'Vue',
        file: 'dist/vue.js',    // 输出文件
        sourcemap: true,
    },
    plugins: [
        babel({ // 使用babel进行转化，但是排除node_modules文件
            exclude: 'node_modules/**'
        }),
        process.env.ENV === 'development'
            ? serve({
                open: true,
                openPage: '/public/index.html',
                port: 3000,
                contentBase: ''
            })
            : null
    ]
}