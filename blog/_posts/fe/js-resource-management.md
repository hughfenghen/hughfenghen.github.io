---
tags:
  - Web
  - OPFS
date: 2026-10-20
---

# JS 进阶资源管理技巧

如果你在 Web 开发中，有需要构建复杂的应用、长时间运行的应用、遇到过内存溢出（OOM）错误，那么你可能需要了解本文 JS 资源管理 API。

Web 平台近些年开放了一些底层的 API，可以帮助我们进行细致地资源管理，从而在网页中构建复杂、健壮的 APP。

## 从一个简单例子开始

Web 页面使用 DOM 来构建 UI，功能模块的具体实现依赖 DOM 向用户展现内容，如果 DOM 被意外移除，则可能触发资源泄露。

假设有一个时钟程序，将时间数值渲染到 DOM 中，然后使用定时器（setInterval）每秒更新时钟数值。

```js
const clock = document.getElementById("clock");
const timer = setInterval(() => {
  clock.textContent = new Date().toLocaleTimeString();
}, 1000);
```

如果时钟 DOM（clock 节点）被意外移除（如页面跳转），定时器（setInterval）永远不会停止，后台会持续做无意义的计算，就算触发了资源泄露。

有人说，我们可以通过 DOM API 检测 clock 节点是否存在于 DOM 树中，如果不存在就清除定时器；  
但这种实现方法，无法兼容 clock 节点被临时移除，后续再重新插入的情况。

现在，我们可以借助一些新 API（[WeakRef][2] , [FinalizationRegistry][1]），检测 clock DOM 节点对象是否被 js 引擎的 GC 回收掉，如果是，就清除定时器；  
这个实现方式有时会严谨一些。

下面通过真实场景，介绍 JS 中的资源管理 API 或语法。

## FinalizationRegistry（对象被 GC 触发事件）

假设，你需要实现一个创建临时文件的函数，当返回的文件对象被 GC 回收后，删除硬盘中的临时文件。  
_没错，现在 Web 已经拥有底层文件 API 了，参考 [OPFS][3]。_

```js
const registry = new FinalizationRegistry(async (path) => {
  // 临时文件对象被回收时可以拿到它的 path
  await file(path).remove();
});

function tmpfile() {
  const f = file(`/tmp/${uuid()}`);
  registry.register(f, f.path);
  return f;
}
```

## WeakRef（弱引用）

因为文件在硬盘上只会存在一份，我们希望采用单例模式实现上个例子中的 file 函数，相同的 path 共享同一个文件对象。

我们可以根据 path 缓存文件对象，优先返回缓存文件对象。

```js
const fileCache = new Map();
function file(path) {
  const cacheF = fileCache.get(filePath);
  if (cacheF) return cacheF;
  // OTFile 是方便创建 OPFS 文件对象的工具
  const f = new OTFile(filePath);
  fileCache.set(filePath, f);
  return f;
}
```

但上述实现会导致 tmpfile 出现 bug，因为 fileCache 持有了文件对象，导致文件对象永远不会被 GC 回收，无法自动清除临时文件。

可以借助 [WeakRef][2]（弱引用）来实现，**持有对象，但不阻碍文件对象被 GC 回收**。

```js
const fileCache = new Map();
function file(path) {
  // deref 返回弱引用持有的源对象，如果被回收则返回 undefined
  const cacheF = fileCache.get(filePath)?.deref();
  if (cacheF) return cacheF;
  const f = new OTFile(filePath);
  // 弱引用持有对象
  fileCache.set(filePath, new WeakRef(f));
  return f;
}
```

## 全局锁管理竞争资源

我们可以创建一个 `writer = file(path).createWriter()`，持续向文件中写入数据；  
安全的文件句柄一般是独占的，如果多个 tab，对同一个文件同时创建 `writer`，就会报错。

我们可以使用 [Navigator.locks][4] API 来管理此类竞态资源。

```js
async function appendToFile(path, data) {
  // 同源下所有 tab、Worker 共享同一个锁名称空间
  await navigator.locks.request(`file:${path}`, async () => {
    // 拿到锁后才会执行该回调，同一时刻只有一个回调在运行
    const writer = await file(path).createWriter();
    await writer.write(data);
    await writer.close();
  });
  // 回调返回的 Promise 结束后，锁自动释放
}
```

locks API 有几个特点，让它比自己实现的锁更可靠：

- **跨上下文**：同源的多个 tab、iframe、Worker 共享锁，天然解决多 tab 竞争问题
- **自动释放**：回调结束（包括抛出异常）后释放；持有锁的 tab 被关闭或崩溃，锁也会被释放，不会出现死锁残留
- **灵活的获取策略**：
  - `ifAvailable: true` 拿不到锁时立即返回 `null`，不排队等待
  - `mode: 'shared'` 共享锁，适合多读单写的场景（默认 `exclusive` 独占）
  - `signal` 传入 `AbortSignal`，可超时取消排队
  - `steal: true` 强制抢占锁，原持有者的锁会被释放

例如，只允许一个 tab 写文件，其他 tab 直接放弃：

```js
await navigator.locks.request(
  `file:${path}`,
  { ifAvailable: true },
  async (lock) => {
    if (lock == null) {
      console.warn("文件正在被其他页面写入");
      return;
    }
    // ...写入文件
  },
);
```

_`navigator.locks.query()` 可以查看当前持有、等待中的锁，方便调试。_

## using 自动清理

像文件句柄、数据库事务、网络连接此类资源，创建之后必须安全回收，否则会造成资源泄露。

以前我们会用 try-catch-finally 语法来手动回收资源

```js
async function writeLog(path, data) {
  const writer = await file(path).createWriter();
  try {
    await writer.write(data);
  } finally {
    // 无论成功与否，都要关闭 writer
    await writer.close();
  }
}
```

当需要同时管理多个资源时，代码会嵌套多层 try-finally，可读性很差，且很容易遗漏。

现在 JS 引入了 [using][5] 语法（显式资源管理），变量离开作用域时自动回收资源。  
只需要给资源对象实现 `Symbol.dispose`（同步）或 `Symbol.asyncDispose`（异步）方法：

```js
async function createWriter(path) {
  const writer = await file(path).createWriter();
  return {
    write: (data) => writer.write(data),
    // await using 变量离开作用域时自动调用
    [Symbol.asyncDispose]: () => writer.close(),
  };
}

async function writeLog(path, data) {
  await using writer = await createWriter(path);
  await writer.write(data);
  // 函数结束（包括抛出异常）时，自动执行 writer[Symbol.asyncDispose]()
}
```

多个 using 变量会按声明的**相反顺序**依次回收，与 try-finally 嵌套的效果一致。

对于没有实现 dispose 方法的资源，可以借助 `DisposableStack` / `AsyncDisposableStack` 统一托管：

```js
function startClock(el) {
  using stack = new DisposableStack();
  const timer = setInterval(() => {
    el.textContent = new Date().toLocaleTimeString();
  }, 1000);
  // 注册清理函数
  stack.defer(() => clearInterval(timer));
  // ...其他可能抛出异常的初始化逻辑

  // 初始化成功，将资源所有权转移出去，由调用方决定何时回收
  const owned = stack.move();
  return { [Symbol.dispose]: () => owned.dispose() };
}

using clock = startClock(document.getElementById("clock"));
```

_using 语法较新，使用前请检查目标环境兼容性；TypeScript 5.2+ 已支持该语法。_

## 附录

- [FinalizationRegistry][1]
- [WeakRef][2]
- [Origin_private_file_system][3]
- [Web_Locks_API][4]
- [using][5]

[1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/FinalizationRegistry
[2]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakRef
[3]: https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system
[4]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API
[5]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/using
