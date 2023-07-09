---
tags:
  - 前端基础
  - JS
date: 2020-09-20
---

# JS优缺点

*回顾上两期*  

## 优点（简单）
<!-- 可以快速讲完js的运行机制 -->
- 对象  
- 链（原型链 & 作用域链）  

**一切都是对象（包括函数）**，构建世界的原料，越少越简单、灵活。  
![jimu](./jimu.jpg)  

观察者模式，例：
```js
class Observer {
  constructor() {
    this.subscribers = new Set()
  }

  subscribe(fn) {
    this.subscribers.add(fn)
    // 为什么要return一个函数？
    return () => {
      this.subscribers.delete(fn)
    }
  }

  publish(subject) {
    this.subscribers.forEach((fn) => {
      fn(subject)
    })
  }
}
```
*java对比：https://www.runoob.com/design-pattern/observer-pattern.html*  




> 1. 单线程事件轮询是个很适合异步并发的模型，因为避免了在程序内部管理多个线程带来的各种问题。这也是为什么Ryan Dahl当时选择了js写了Node。  
> 2. 函数作为一等公民存在，简单够用的原生数据结构，闭包，如果你想的话完全可以写出函数式风格的js。披着C系语言的外衣，流着scheme的血。  
> 3. 灵活。duck typing，动态指定函数的执行语境，动态混入，动态修改原型，动态修改原型链，甚至修改原生对象的原型... 很多时候你会发现java的一些设计模式就是带着镣铐跳舞，在js里完全没有必要。当然，js的灵活也是把双刃剑，在好的工程师手里是一个助力，但在糟糕的工程师手里会产生很多反模式。  
> 原文链接：https://www.zhihu.com/question/21735081/answer/19169798




滥用class、继承
单例

## 缺点

原型链
规则：
1. JS中一切都是对象  
2. 所有对象的`__proto__`指向构造函数的`prototype` (`Object.prototype`除外)  

小知识：
1. 函数也是对象，它的构造函数是`Function`  
2. 函数可以使用`new`来构造对象（箭头函数除外）  
3. 普通对象的构造函数是`Object`  

https://juejin.im/post/6844903839070421000  

纯知识，js语言的基础规则，不知道也不影响写代码，就像我们不懂社会学、经济学也能过得不错。  
