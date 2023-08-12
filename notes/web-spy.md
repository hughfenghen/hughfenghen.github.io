---
tags:
  - Web
date: 2023-07-11
---

# Web 终极拦截技巧（全是骚操作）

## 拦截技巧指什么？


## 拦截技巧的价值

> 计算机科学领域的任何问题都可以通过增加一个中间层来解决。  
>                           ———— Butler Lampson

在无法更改某些模块源代码的情况下，可以通过**拦截来增加中间层**。  

## Web 安全模型
csp、站点隔离
灵活，js 不安全、Web 是安全的

拦截技巧的基础

## 案例目标

**使用一台服务器，搭建多个前端测试环境**

```
ff-test1.bilibili.com  -> /app/test1/index.html
ff-test2.bilibili.com  -> /app/test2/index.html
...
```

**搭建开发环境反向代理**

通过结合案例来展现实战价值，当然拦截的作用不限于该目标。  

FF 经常长时间迭代，已经比较复杂了，各种拦截技巧就是 FF 最初的核心

## 拦截技巧

### 服务层
DNS
Nginx 注入
图解： 客户端 - dns - 服务器
两个拦截点，可以做什么
ff-dev

### 客户端网络

### DOM/BOM
a、iframe，MutationObsever
window.open 
history 拦截
console.error

### 其它

## 总结
黑魔法：能力却强、责任越大，容易误伤，性能损耗
其他作用：监控、全局修改、定位问题


---


### 前端黑魔法：拦截

**前端安全模型**

边界清晰（高墙），内部灵活

CSP、站点隔离

**拦截的价值**

监控、全局修改、定位问题

黑魔法：能力却强、责任越大，容易误伤，性能损耗

**拦截方法**

服务层拦截

DNS、Nginx（拦截注入 ff-sdk chii eruda），url、header { cookie、 referer }

例子：ff-dev 支持vite，uat CDN 支持 染色

客户端网络

xhr、fetch、websocket、ServiceWorker

DOM/BOM

a、iframe，MutationObsever

window.open 

history 拦截

console.error

Object.definePorperty 定位问题

proxy

new Function