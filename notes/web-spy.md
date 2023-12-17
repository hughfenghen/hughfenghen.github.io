---
tags:
  - Web
date: 2023-12-17
---

# Web 终极拦截技巧（全是骚操作）

## 拦截的价值

> 计算机科学领域的任何问题都可以通过增加一个中间层来解决。 ——— Butler Lampson

如果系统的控制权、代码完全被掌控，很容易添加中间层；  
现实情况我们往往无法控制系统的所有细节，所以需要使用一些 **“非常规”（拦截）** 手段来**增加中间层**。

常见的场景有

- 自动上报未捕获的错误，进行错误监控
- 拦截网络请求（fetch、xhr）进行接口性能统计、统一错误码处理、远程 debug 接口
- 构造执行第三方代码、微应用必须的沙盒环境

## 拦截方法

### 拦截/覆写浏览器 API

最常见的场景有通过拦截 `console` 实现错误上报。

```js
const _error = console.error;
console.error = (...args) => {
  _error.apply(console, args);

  console.info('在此处上报错误信息...');
};

// 其它代码打印错误
console.error('error message');
```

项目中通常会基于 axios 此类的网络请求库，做一些统一处理逻辑  
某些场景，我们需要做一些统一处理，但无法修改项目代码，就能通过拦截 `fetch, xhr` 来达到目的。

```js
// 接口性能监控，打开 https://example.com/， 在控制台执行以下代码
const _fetch = window.fetch;
window.fetch = (...args) => {
  const startTime = performance.now();
  return _fetch(...args).finally(() => {
    console.info('接口耗时：', Math.round(performance.now() - startTime), 'ms');
  });
};

await fetch('//example.com');
```

你可以选择第三方库（比如 [xhook](https://github.com/jpillora/xhook/)）来快速实现 `fetch, xhr` 拦截功能。

浏览器中大多数 API 都是可以覆写的，**打开脑洞**，可以实现非常多的神奇功能：

- 网络 API （`xhr, fetch, WebSocket`）
  - 性能监控、统一错误码处理
  - 添加额外 HTTP 参数（`header, query`）实现接口染色功能
  - 修改 `Host` 将接口自动转向代理服务，实现远程调试接口、Mock 数据
- 修改原型 `Array.prototype.at = ...`
  - polyfill 库的必备手段
- 页面跳转 API （`window.open`, `history.go back pushState`）
  - 修改跳转的目的页面
  - 页面跳转埋点
- 删除特定 API 禁用浏览器功能
  - 禁止访问摄像头 `navigator.mediaDevices.getDisplayMedia = null`
  - 禁止 p2p 连接 `window.RTCPeerConnection = null`

### 事件、DOM 元素

浏览器也会提供一些具备拦截性质的 API，允许开发者实现特定功能。

一个 DOM 元素经常会绑定许多事件，如果你想让特定的事件回调函数先执行，以便添加一些前置逻辑或取消后续事件的执行；  
可以了解 [addEventListener#usecapture][1] 的用法。

```js
// 禁止响应某个 div 下的所有点击事件，第三个参数（usecapture）设为 true
divElemet.addEventListener(
  'click',
  (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
  },
  true
);
```

许多 DOM 元素都是在运行时动态创建的，如果需要修改动态创建的 DOM 元素可使用 [MutationObserver][2]  
比如，拦截所有超链接（`a` 标签），给目标链接添加 `_source` 参数

```js
const observer = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    if (mutation.type !== 'childList' || !mutation.addedNodes) return;
    mutation.addedNodes.forEach((item) => {
      if (!item.nodeName === 'A') return;
      const targetUrl = new URL(item.href, location.href);
      targetUrl.searchParams.append('_source', 'any string');
      item.href = targetUrl.href;
    });
  }
});
observer.observe(document.body, {
  attributes: true,
  childList: true,
  subtree: true,
});
```

::: tip
`MutationObserver` 同样适应于修改 `iframe, img` 的链接，或其它任意 DOM 元素的属性
:::

### 调试小技巧

如果你的页面因未知代码（http 302 属于非代码页面跳转）陷入了快速刷新的死循环，可在项目中添加以下以下代码；  
页面刷新前会进入 debug 状态，在 devtools 中查看调用堆栈（call stack）即可了解刷新的原因

```js
window.addEventListener('beforeunload', () => {
  debugger;
});
```

当调试第三方代码时，需要监听某个不符合期望的对象属性值

```js
// debug 状态下任意可访问对象
const obj = { prop: 1 };

// 在 devtools -> console 中执行以下代码
_obj_prop = obj.prop;
Object.defineProperty(obj, 'prop', {
  set: (v) => {
    _obj_prop = v;
    // 每次赋值都会进入 debug 状态
    debugger;
  },
  get: () => _obj_prop,
});
// 后续可在 console 中随时访问 _obj_prop 的当前值
```

### ServiceWorker

### 沙箱

new Function

### 服务器

如果你掌握了真正的服务控制权，配置服务器和内网 DNS 域名的权限（公司内的工程效率团队），再配合前面介绍的浏览器拦截技巧，将大幅增加可玩性。

你可以读取到：

- HTTP 请求所有信息
  - Header、Cookie、Body
  - 可以修改 host 注入任何内容 分发请求

## 附录

- [addEventListener#usecapture][1]
- [MutationObserver][2]

[1]: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#usecapture
[2]: https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver

## 如何注入代码

构建、推送、加载、运行时（项目种子代码、devtool console 面板、浏览器插件）

## 实践案例

### 前端微应用

ff-dev， ff-env

安全分析
总结

#### 系统开放的 API

**beforeUnload**  
未知原因导致页面快速刷新，可通过监听 beforeUnload 事件，断点查看刷新的原因。

```js
window.addEventListener('beforeUnload', () => {
  debugger;
});
```

技巧种类总结
客户端
系统开放的 API
beforeUnload
ServiceWorker
MutationObserver
事件捕获阶段
API 复写
不能复写
只读属性
对象属性复写
DOM 修改
沙盒
编译阶段
服务层
DNS
网关
常用工具
代理：devtool、charles
switch
nginx

小案例举例说明
大案例分析
ff-env
ff-dev
web container

## 大案例

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

## Web 安全模型

csp、站点隔离
灵活，js 不安全、Web 是安全的

## 总结

黑魔法：能力却强、责任越大，容易误伤，性能损耗
非必要，不使用
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

例子：ff-dev 支持 vite，uat CDN 支持 染色

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
