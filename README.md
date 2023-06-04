# 手写Vue2源码

### 实现Vue2大部分功能，包括但不限于：数据响应式、模板编译、虚拟DOM、Diff算法、生命周期、keep-alive、GlobalAPI（minin、extend、filter、directive等），基于rollup打包；
[![license](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**中文** | [English](./README.EN.md)

## 克隆项目

```shell
git clone git@github.com:Shideshanxx/vite-vue3-lowcode.git
```

## 功能清单
分支 ——> 功能
+ 1-data-observe：实现数据监控
+ 2-compiler：实现模板编译，template——>AST——>render函数
+ 3-virTialDOM：实现创建虚拟DOM及数据渲染
+ ...

## 开发文档
开发文档与分支一一对应，文档中具体介绍相关分支实现的功能流程及要点

## 快速开始
### 安装依赖

```sh
npm install
# or
yarn
```

### 启动项目

```sh
npm run serve
```

### 项目打包

```sh
npm run build
```
