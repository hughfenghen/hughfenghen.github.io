# JS数据处理

***如何把代码写得更优雅？***  

## 基础

### 实践原则
1. 数据处理时，尽量避免临时变量（特别是let）、修改参数、改变外部引用、for等  
2. 分离数据处理与副作用（DOM操作、存储、网络请求等）代码  

数据处理指：数值计算和数据结构变换。  

#### 第一点：如何避免？
**1. 熟悉并灵活使用自带函数**  
> 1. 包装函数  
>  Array, Boolean, String, Number
> 2. 简单Object  
   Object.assign, Object.keys, Object.values, Object.entries, Object.fromEntries  
> 3. Array  
   map, filter, reduce, slice, concat, flat, join  
   pop, push, shift, unshift, splice, sort, fill  
   some, every, includes   
   find, findIndex, indexOf  
   forEach  
> 4. Math  
>  random, floor, round, ceil

-- 在线答疑：有人对这些函数有疑问么？  
-- 有同学会说，太简单了，都用过。来看看下面灵活运用的例子

例：
```js
['1', '2', '3'].map(Number)  // => [1, 2, 3]

[1, 2, 3].map(String)  // => ['1', '2', '3'] 

Array(10).fill().map(Math.random) // => [...] 十个随机数

[0, 1, null, {}, []].filter(Boolean) // => [1, {}, []] 过滤假值

['1', '2', '3'].map(parseInt) // => ? <危>
```

-- 点名环节：forEach、map的区别？  

**2. Pointfree（后文）**  
-- 高阶内容，后文介绍

#### 第二点：如何分离？
*剥离并不一定要隔离到不同的函数，也可以在同一个函数中分段，忌讳数据处理跟副作用混在一起。*  

例：
```js
// 榜单，排序后插入的容器中（ul）
const data = [{ nickName: '张三', score: 75 }, { nickName: '张三', score: 10 }, { nickName: '张三', score: 42 }]

const container = document.getElementById('rank')

function renderRank(container, data) {
  // 计算逻辑
  const items = data.sort((a, b) => b.score - a.score).map(createRankItem)

  // 副作用操作
  container.append(...items)

  function createRankItem({ nickName, score }) {
    const it = document.createElement('div')
    it.text = `${nickName} - ${score}`
    return it
  }
}

renderRank(container, data)
```

## 进阶
-- 接下来这个章节的目的，就是要让你们在心里说出：“原来JS还可以这样写”

### 柯里化
-- 有人听说过这个名词么？

**柯里化是把接受多个参数的函数变换成接受一个单一参数的函数，并且返回接受余下的参数而且返回结果的新函数的技术。**  

```js
const f = (a, b, c) => a + b + c

currying(f)(1)(2)(3) // => 6
```

#### 自动柯里化
如果接收参数个数满足预期，则求值；否则返回新的可以接受剩余参数的函数。  

-- 没找到官方定义，大家都这么叫

```js
const f = (a, b, c) => a + b + c

autoCurrying(f)(1)(2, 3) // => 6
```

### lodash/fp
JS自带数据结构就那么几个，操作数据结构的函数虽然比较多，也是有限的。  
lodash提供了几乎所有简单数据操作工具函数。  
lodash/fp则使lodash提供的工具函数支持自动柯里化，然后调整了参数顺序（function first，data last），方便函数组合。  

[FP-Guide](https://github.com/lodash/lodash/wiki/FP-Guide)

类似的库还有[Ramda](http://ramdajs.com/docs/)，甚至可以说Ramda更“专业”，但鉴于lodash的流行度和学习成本，后文例子依赖lodash/fp

#### 例：数组求和
```js
function sum(arr) {
  let rs = 0
  for (const v of arr) {
    rs += v
  }
  return rs
}

sum([1, 2, 3]) // => 6
```

```js
const sum = (arr) => arr.reduce((a, b) => a + b)

sum([1, 2, 3]) // => 6
```

-- 也许有人会觉得第一种实现更容易理解，第二种实现只是看起来简洁一些。之所以会有这样的感觉是因为缺少思维练习，因为基础编程知识都是从命令式开始教的。  
-- 经过少量练习，甚至可以说函数式更符合人的逻辑思维，后文有个例子。  
```js
import { reduce, add } from 'lodash/fp'
const sum = reduce(add, 0) // lodash/fp reduce要求三个参数

sum([1, 2, 3]) // => 6
// 如果sum不需要复用，则不需要命名： reduce(add, 0)([1, 2, 3])

// Lisp中符号‘+’ 也是一个函数，可以这样写：(+ 1 2 3)  或  (apply + [1 2 3])
```

-- 曾经有个姑娘跟我讲：要转行学Java。我问：为什么？她说：一看见回调函数就头晕。。
-- 函数可以作为参数传递绝对是JS的优点哈，如果有同学感觉晕的话一定要多练习。

### pipe
在使用Unix或Linux命令行的时候，其实已经接触过管道的概念了（符号`|`），把这个概念应用到编程语言中是这样的：  
![](./pipe.png)  


**总结：不使用所要处理的值，只合成运算过程。**  

#### 例：找到用户 Scott 的所有未完成任务，并按到期日期升序排列。
```js
const { pipe, prop, filter, matches, sortBy } = require('lodash/fp');

const data = {
  result: "SUCCESS",
  interfaceVersion: "1.0.3",
  requested: "10/17/2020 15:31:20",
  lastUpdated: "10/16/2020 10:52:39",
  tasks: [
    {
      id: 104, complete: false, priority: "high",
      dueDate: "2020-11-29", username: "Scott",
      title: "Do something", created: "9/22/2020"
    },
    {
      id: 105, complete: false, priority: "medium",
      dueDate: "2020-11-22", username: "Lena",
      title: "Do something else", created: "9/22/2020"
    },
    {
      id: 107, complete: true, priority: "high",
      dueDate: "2020-11-22", username: "Mike",
      title: "Fix the foo", created: "9/22/2020"
    },
    {
      id: 108, complete: false, priority: "low",
      dueDate: "2020-11-15", username: "Punam",
      title: "Adjust the bar", created: "9/25/2020"
    },
    {
      id: 110, complete: false, priority: "medium",
      dueDate: "2020-11-15", username: "Scott",
      title: "Rename everything", created: "10/2/2020"
    },
    {
      id: 112, complete: true, priority: "high",
      dueDate: "2020-11-27", username: "Lena",
      title: "Alter all quuxes", created: "10/5/2020"
    }
  ]
};

pipe(
  prop('tasks'),
  filter(matches({ complete: false, username: 'Scott' })),
  sortBy(prop('dueDate'))
)(data)

// [
//   {
//     id: 110,
//     complete: false,
//     priority: 'medium',
//     dueDate: '2020-11-15',
//     username: 'Scott',
//     title: 'Rename everything',
//     created: '10/2/2020'
//   },
//   {
//     id: 104,
//     complete: false,
//     priority: 'high',
//     dueDate: '2020-11-29',
//     username: 'Scott',
//     title: 'Do something',
//     created: '9/22/2020'
//   }
// ]
```

-- 如果有数据处理是一个pipe搞不定的，那可能是你对工具函数的熟悉度不够  

优雅流畅地处理数据，除了了解几个简单的基本概念之后（柯里化、管道），还需要花费一些时间来学习、练习常用的工具函数。  
有点像编辑器，记下了许多快捷键之后，写代码的速度会有较大提升。  

--------------

-- 回顾：基础篇中介绍了数据处理代码遵守【实践原则】；进阶篇中介绍了柯里化、管道两个概念，然后安利了lodash/fp。  

<!-- 函数式编程强调没有”副作用”，意味着函数要保持独立，所有功能就是返回一个新的值，尤其是不得修改外部变量的值。 


学成曲线：
vscode
vim

纯函数的好处主要有几点：

无状态，线程安全，不需要线程同步。
纯函数相互调用组装起来的函数，还是纯函数。
应用程序或者运行环境（Runtime）可以对纯函数的运算结果进行缓存，运算加快速度。 -->

## 参考
[Pointfree 编程风格指南](https://www.ruanyifeng.com/blog/2017/03/pointfree.html)  
[Ramda 函数库参考教程](http://www.ruanyifeng.com/blog/2017/03/ramda.html)  
[FP-Guide](https://github.com/lodash/lodash/wiki/FP-Guide)  
[Ramda](http://ramdajs.com/docs/)  
[柯里化](https://zh.wikipedia.org/zh/%E6%9F%AF%E9%87%8C%E5%8C%96)  