# JS语言历史及基本特性介绍

## JS历史

1. 1994年，网景公司（Netscape）发布了Navigator浏览器0.9版。  
   网景公司急需一种网页脚本语言，使得浏览器可以与网页互动。  
   评：初始设计目标。  
2. 1995年5月，网景公司做出决策，未来的网页脚本语言必须"看上去与Java足够相似"，但是比Java简单，使得非专业的网页作者也能很快上手。  
   评：划重点 “非专业也能很快上手”。  
3. 1995年5月，Brendan Eich 花10天设计了Javascript。  
   评：天生劣势。  
4. 1996年8月，JScript随IE3.0发布。  
   浏览器大战。  
   评：标准化动机。  
5. 1996年11月，网景公司将JavaScript提交给欧洲计算机制造商协会进行标准化。  
   ECMA-262的第一个版本于1997年6月被ECMA组织采纳。  
6. 2007年10月，ECMAScript 4.0版草案发布，各方对于是否通过这个标准，发生了严重分歧。  
   4.0 流产，小改动发布为3.1，后改名为**ECMAScript 5**。  
   评：我们接触JS的开端；产商撕逼。  
7. 2008 年谷歌发布v8引擎。  
   评：性能飞跃；WEB最强盟友出现。  
8. 2009年Nodejs发布。  
   评：JS突破次元（参考1）  
9. 2014年 6to5 发布，2015年改名为Babel。  
   评：社区的力量。  

JS设计目标是为了在浏览器中运行，推荐阅读[浏览器大战](https://baike.baidu.com/item/%E6%B5%8F%E8%A7%88%E5%99%A8%E5%A4%A7%E6%88%98/8488119?fr=aladdin)相关资料，了解[ECMAScript](https://baike.baidu.com/item/ECMAScript)标准化的幕后故事。  

[Javascript诞生记](https://www.ruanyifeng.com/blog/2011/06/birth_of_javascript.html)  
[JavaScript深入浅出](https://blog.fundebug.com/tags/JavaScript%E6%B7%B1%E5%85%A5%E6%B5%85%E5%87%BA/)  
[巴别塔 (Babel)](https://baike.baidu.com/item/%E5%B7%B4%E5%88%AB%E5%A1%94/67557)  


## JS语言基础（如何学习一门编程语言）

### 保留关键字、符号、语法
1. [JavaScript 保留关键字](https://www.runoob.com/js/js-reserved.html)    
2. 符号：{}、[]、()、+ - * /、~ ! & |、&& ||、?:  
3. 基本语法：变量定义（const、let、var），函数定义（function、箭头函数），条件分支（if、switch），循环（for、while）  

### 数据结构、标准库
#### 原始数据类型：字面量
1. String: 'hello world'
2. Number: 42
3. Boolean: true
4. BigInt: 42n
5. null
6. undefined
7. Symbol

**注意区别**  
```js
const a = '111'; 
const b = new String('111'); 
console.log(a === b)
```

#### 复杂数据类型及常用方法
1. 简单Object 
   Object.assign, Object.keys, Object.values, Object.entries, Object.fromEntries, Object.freeze, ~~Object.defineProperty~~, ~~Object.create~~  
2. Array
   map, filter, reduce, slice, concat, flat, flatMap, join  
   pop, push, shift, unshift, splice, sort, fill  
   some, every, includes   
   find, findIndex, indexOf  
   forEach  
3. Map
   get, set, has, delete, keys, values  
4. Set
   add, delete, has, values  
5. WeakMap WeakSet
   WeakMap的key、WeakSet中的元素是弱引用，即它们引用的对象不会被垃圾回收机制额外增加计数  

熟练使用自带方法，写出更加简洁优雅的代码
```js
[1, 2, 3, 2, 1].reduce((s, p) => s.includes(p) ? s : s.concat(p), [])
```

社区默认的标准库：[Lodash](https://lodash.com/docs/4.17.15)  
[JavaScript 标准内置对象](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects)  

### 代码调试
1. [Chrome devtools](https://developers.google.com/web/tools/chrome-devtools)  
2. [Nodejs inspect](https://nodejs.org/zh-cn/docs/guides/debugging-getting-started/)  
3. [VSCode Debugging](https://code.visualstudio.com/docs/editor/debugging)  

### 模块化、包管理（项目代码组织必要能力）
#### 模块化
- 原始：N/A  
- 历史：[AMD , CMD, CommonJS，UMD](https://juejin.im/post/5b7d2f45e51d4538826f4c28)  
- 未来已至：[ES Module](https://es6.ruanyifeng.com/#docs/module)  

#### 包管理
- [Yarn](https://yarnpkg.com)  
- [NPM](https://docs.npmjs.com)  

### IO、并发/异步（通用能力）

#### Nodejs
- [文件系统（File System）](https://www.runoob.com/nodejs/nodejs-fs.html)  
- [流](https://www.runoob.com/nodejs/nodejs-stream.html)  
- 网络: [Web 模块](https://www.runoob.com/nodejs/nodejs-web-module.html)、[HTTP](https://nodejs.org/api/http.html)  

#### 浏览器
- [File](https://developer.mozilla.org/zh-CN/docs/Web/API/File)  
- [FileReader](https://developer.mozilla.org/zh-CN/docs/Web/API/FileReader)  
- 网络：[Fetch](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API)、[XMLHttpRequest](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest)  

#### 并发/异步
- setTimeout
- [Worker](https://developer.mozilla.org/zh-CN/docs/Web/API/Worker/Worker)  
- [Nodejs cluster](http://www.alloyteam.com/2015/08/nodejs-cluster-tutorial)  

## 值得关注的未来
- 持续关注标准规范：[TC39](https://github.com/tc39)  
- 解决前端工具链过于复杂的问题：[Rome](https://romejs.dev)  
- 解决大型项目可维护性问题：[TypeScript](https://www.typescriptlang.org/)  
- 新的运行环境：[Deno](https://deno.land/)  

--------------

## 讲稿

```
### 本次分享

主要内容包括介绍JS的历史，然后汇总JS基础涉及的知识

## 内容

### 第一节

1. **历史1、2项**，我个人认为，JS语言天生的优缺点都可以归结到这两个原因上
2. 预期一个月的任务你一个星期做完了，有两种可能：你牛逼；你偷懒了。就这个案例来说，布兰登·艾奇应该是牛逼并且偷懒了。  
3. 关于标准化的意义我没什么要说的
4. 我们最开始基本上都是学习使用ES5的，其实早在07年就发布了；**在座的有没有一开始就学习ES6的？**  
5. ES5是妥协的产物，妥协原因就是背后厂商的利益诉求不同，这种现象会一直持续下去
6. V8的性能飞跃创造了很多可能性，没有V8可能Nodejs就不会出现
7. **为什么说谷歌是WEB最强盟友?** 
8. Nodejs对前端的意义不言而喻，其实它最开始主要应用于前端工程化。以前广泛应用的谷歌 提供的closure-compiler 是用java写的，就是用来混淆压缩js源码的那个工具
9. Babel象征社区的力量参与标准制定。
10. 大家看这个历史过程，都是环环相扣的

下面是一些参考链接，有兴趣的同学可以深入了解

### 第二节

这些基础知识大家应该都比较熟悉了（除了保留字）

我尝试从“如何学习一门编程语言”这个视角来介绍JS语言基础，大家可以了解一下通用编程语言（对应DSL）的一些相通之处

根据我个人经验，汇总一下几个方面了解一门编程语言：

1. 保留关键字、符号、语法，数据结构、操作数据结构的标准库，然后再学习一下调试方法基本可以写代码了
2. 如果要用来写项目，就需要用到模块化、包管理知识，项目代码组织的必要能力
3. 加减乘除 单纯的计算逻辑，肯定不能满足常规需求，不论实现项目功能还是自己写脚本工具，IO、并发/异步这些通用能力都是必不可少的。

这部分的内容基本都是一些资料的合集，我们快速过一下，大家有感兴趣的点可以随时提出来

---

JS的保留字超级多，有些还没用到，即使十年经验，绝大部分都背不出来

这里只提一个有意思的点，ES6有一个for...of的语法，of看起来类似in，但不是保留字，也就是说可以用来命名变量，但最好不要这么做k

js的符号比较神奇，我提一个问题，**圆括号有几个应用场景？**（函数参数、函数调用、表达式求值）

这其实是一个不好的地方，虽然我们已经习惯，初学者需要下意识区分的

另举一个对我们有影响的例子：花括号既用来做对象的字面量，有用来定义代码块，所以简写的箭头函数返回对象的时候会有一些麻烦。`({...})`

---

基本数据类型，只提一个点 ，注意原始类型跟对象的区别

**有人有其他疑问么？**

---

复杂数据类型及常用方法 太多了，就不逐个介绍了。

熟练使用这些这些方法，你会发现“我靠，JS还可以这样写”。

看下面这个例子，**这行代码返回什么？**

当熟练使用lodash/fp之后，你又会重复前面那句话。

先挖个坑，以后再深入介绍JS数据处理。

---

代码调试，基础功能应该很容易上手，深入一点点的话Chrome devtools可以单独做一次分享，**有人报名么？**

---

原始时代，JS没有模块化、包管理，随着前端项目复杂度增加，出现了一系列模块化方案，底层都是通过函数作用域来隔离模块

然后终于标准规范ES Module让JS 语言终于有了原生的模块支持

---

IO、并发/异步（通用能力）的资料都在这里，我讲不动了

自由讨论。。。

---

值得关注的未来，大家有新提议么。。

我学不动了。。
```
