# JS 多线程并发

## 为什么需要并发
我们常听说 JS 是单线程模型，即所有代码都在[主线程](https://developer.mozilla.org/zh-CN/docs/Glossary/Main_thread)中执行的。  
如果某些任务计算量较大，将阻塞主线程，UI 界面轻则掉帧、重则卡死。  

```js
// 在任意网页控制台执行以下代码，页面将卡住 3s
function execTask() {
    const t = performance.now()
    // 模拟耗时任务
    while(performance.now() - t < 3000){}
}
execTask()
```
所以在计算量大的场景，JS 需要支持并发能力，避免主线程阻塞，影响用户体验。

## 并发面临的问题
用一个极简化示例，来说明并发面临问题：  
10 个线程同时执行 1000 个任务，如何**避免某个任务被重复**执行？

方法 1：  
任务列表对线程不可见，而是新开一个线程来统一分配任务，并收集其他线程的执行结果。

方法 2：  
任务列表对所有线程可见（共享内存），线程**先排队去领取任务编号**，然后执行对应编号的任务。  


*拓展阅读[并发问题](https://mp.weixin.qq.com/s/K9gsRxy9idy2_k6Gbmyw9g)*

## JS 中如何实现上述两种方法
JS 采用 [Web Worker](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API) API 来实现多线程并发。

### 分配任务，多 Worker 执行
```js
function workerSetup() {
  self.onmessage = (evt) => {
    const t = performance.now()
    // 模拟耗时任务,随机消耗时间 0~100ms
    while(performance.now() - t < Math.random() * 100){}

    const { idx, val } = evt.data
    // 实际上只是算一下参数的平方
    self.postMessage({
      idx: idx,
      val: val * val
    })
  }
}
// 创建一个运行 workerSetup 函数的 worker
const createWorker = () => {
  const blob = new Blob([`(${workerSetup.toString()})()`])
  const url = URL.createObjectURL(blob)
  return new Worker(url)
}
// 模拟 1000 个任务
const tasks = Array(1000).fill(0).map((_, idx) => idx + 1)
const result = []
let rsCount = 0
const onMsg = (evt) => {
  result[evt.data.idx] = evt.data.val
  rsCount += 1
  // 所有任务完成时打印结果
  if (rsCount === tasks.length) {
    console.log('task:', tasks)
    console.log('result:', result)
  }
}

// 模拟线程池
const workerPool = Array(10).fill(0).map(createWorker)
workerPool.forEach((worker, idx) => {
  worker.onmessage = onMsg
  worker.id = idx
})

for (const idx in tasks) {
  // 随机分配任务
  const worker = workerPool[Math.floor(Math.random() * workerPool.length)]
  worker.postMessage({ idx, val: tasks[idx] })
  console.log(`Worker ${worker.id}, process task ${idx}`)
}
```

### 多 Worker 共享任务（内存）
[SharedArrayBuffer](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) 是 JS 提供的唯一可在不同线程间共享内存的方式。

> 为应对幽灵漏洞，所有主流浏览器均默认于 2018 年 1 月 5 日禁用 SharedArrayBuffer。  
> 在 2020 年，一种新的、安全的方法已经标准化，以重新启用 SharedArrayBuffer。  
> 需要设置两个 HTTP 消息头以跨域隔离你的站点：  
> Cross-Origin-Opener-Policy: same-origin  
> Cross-Origin-Embedder-Policy: require-corp  

:::tip
在浏览器中执行以下代码，请先确保 SharedArrayBuffer 可用。  
可复制代码在 <a href="https://live.bilibili.com/3" target="_blank">该页面</a> 的控制台执行测试
:::
```js
function workerSetup() {
  function execTask(val) {
    const t = performance.now()
    // 模拟耗时任务,随机消耗时间 0~100ms
    while (performance.now() - t < Math.random() * 100) {}
    return val * val
  }
  self.onmessage = (evt) => {
    const { idx, sab } = evt.data
    const uint16Arr = new Uint16Array(sab)
    while(true){
      // 模拟排队领取任务
      // 如果使用taskNo = uint16Arr[0]获取任务编号，会出现抢任务的现象（重复执行任务）
      const taskNo = Atomics.add(uint16Arr, 0, 1) 
      if (taskNo >= uint16Arr.length) break
      
      // 每个任务写不同的位置，所以不需要原子操作
      uint16Arr[taskNo] = execTask(uint16Arr[taskNo])
      console.log(`Worker ${idx}, process task ${taskNo}`)
    }
    self.postMessage(true)
  }
}

const createWorker = () => {
  const blob = new Blob([`(${workerSetup.toString()})()`])
  const url = URL.createObjectURL(blob)
  return new Worker(url)
}

// 第一位存放下一个任务编号， 后面 1000 存放对应任务及结果
const sab = new SharedArrayBuffer((1 + 1000) * 2)
const uint16Arr = new Uint16Array(sab)
uint16Arr[0] = 1
for (let i = 1; i < uint16Arr.length; i++) {
  uint16Arr[i] = i 
}
// 模拟线程池，创建 10 个 worker
const workerPool = Array(10).fill(0).map(createWorker)

let rsCount = 0
const onMsg = () => {
  rsCount += 1
  if (rsCount === workerPool.length) {
    console.log('result:', uint16Arr, sab)
  }
}
workerPool.forEach((worker, idx) => {
  worker.onmessage = onMsg
  worker.postMessage({ idx, sab })
})
```

> [Atomics](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Atomics)对象提供了一组静态方法对 SharedArrayBuffer 对象进行原子操作。

## 两个方法对比
### 方法 1（分配任务）
处理 1000 个任务，调用了 2000 次（分配任务、反馈结果） postMessage，也就是数据在两个 worker 间传递，经历了 2000 次[结构化克隆](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API/Structured_clone_algorithm)。  
通常来说结构化克隆的速度比较快，[影响不大](https://surma.dev/things/is-postmessage-slow/)

> Even on the slowest devices, you can postMessage() objects up to 100KiB and stay within your 100ms response budget. If you have JS-driven animations, payloads up to 10KiB are risk-free. This should be sufficient for most apps.   
> 即使在非常慢的设备上，你也可以使用 postMessage() 传递 100KiB 的对象，可保证在 100 毫秒内响应。如果有用 JS 驱动的动画，那么传递 10KiB 的数据是无风险的。这对于大多数应用程序来说应该足够了。

另外，部分原生对象是 [Transferable objects](https://developer.mozilla.org/en-US/docs/Glossary/Transferable_objects)，postMessage(arrayBuffer, [arrayBuffer]) 可以**传递这些对象对所有权，无需clone**。  
目前实现 Transferrable 的对象有：`ArrayBuffer, MessagePort, ReadableStream, WritableStream, TransformStream, AudioData, ImageBitmap, VideoFrame, OffscreenCanvas, RTCDataChannel`  

**所以应优先采用该方法**。  

### 方法 2（共享内存）
共享内存（ SharedArrayBuffer ）节省了线程间通信的消耗，但增加了代码复杂性，只能共享二进制数据，且 ShareArrayBuffer 、Atomics 有一定的兼容性问题。  
（目前我还没碰到必须使用 SharedArrayBuffer 的场景，只看到 WASM 软解 HEVC 用到了）  

## 其他
JS 中可在其他线程/进程中执行代码的其他方法。  

### Cluster
[Cluster文档](http://nodejs.cn/api/cluster.html#how-it-works)  
> 工作进程使用 child_process.fork() 方法衍生，因此它们可以通过 IPC 与父进程通信并且来回传递服务器句柄。  
> 尽管 node:cluster 模块的主要使用场景是网络，但它也可用于需要工作进程的其他使用场景。  

多进程，一般用于在 Node.js 上运行 WEB 服务器。  
[Cluster共享端口有点骚](https://segmentfault.com/a/1190000014701988)  

### worker-threads
[worker-threads文档](http://nodejs.cn/api/worker_threads.html#worker-threads)  
Node.js 上的 Worker 实现。  

> worker-threads对于执行 CPU 密集型的 JavaScript 操作很有用。 它们对 I/O 密集型的工作帮助不大。 Node.js 内置的异步 I/O 操作比工作线程更高效。  
> 与 child_process 或 cluster 不同，worker_threads 可通过传输 ArrayBuffer 实例或共享 SharedArrayBuffer 实例来实现共享内存。  

### Worklet
[Worklet](https://developer.mozilla.org/en-US/docs/Web/API/Worklet)用于特定场景，非通用多线程能力

> Worklet接口是Web Workers的轻量级版本，使开发人员能够访问渲染管道的低级部分。  
> 通过Worklet，你可以运行JavaScript和WebAssembly代码来进行图形渲染或需要高性能的音频处理。  


- PaintWorklet 自定义 css 绘制行为  
- AudioWorklet 用于自定义AudioNodes的音频处理
