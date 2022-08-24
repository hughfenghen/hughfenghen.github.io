# JS 定时器延迟时长细节

## 背景
[实际延时比设定值更久的原因：最小延迟时间](https://developer.mozilla.org/zh-CN/docs/Web/API/setTimeout#%E5%AE%9E%E9%99%85%E5%BB%B6%E6%97%B6%E6%AF%94%E8%AE%BE%E5%AE%9A%E5%80%BC%E6%9B%B4%E4%B9%85%E7%9A%84%E5%8E%9F%E5%9B%A0%EF%BC%9A%E6%9C%80%E5%B0%8F%E5%BB%B6%E8%BF%9F%E6%97%B6%E9%97%B4)  

## 最小延迟时长 >=4ms 场景
> 在浏览器中，由于函数嵌套（嵌套层级达到一定深度），或者是由于已经执行的 setInterval 的回调函数阻塞导致 setTimeout()/setInterval() 的每调用一次定时器的最小间隔是 4ms。  

尝试在不同浏览器分别执行以下两段代码，观察打印的间隔值。  
前几次（不同浏览器有差异）间隔差不多1ms，后续间隔市场都大于4ms。  
```js
var t = performance.now()
setInterval(() => {
  console.log(performance.now() - t)
  t = performance.now()
}, 1)
```

```js
var t = performance.now()
function loop() {
  console.log(performance.now() - t)
  t = performance.now()

  setTimeout(loop, 1)
}
loop()
```
也就是说：**小于 5ms 的异步循环任务** 期望的延迟时间是不靠谱的。  
如果有小于 5ms 的异步循环任务，得小心了。   

## 后台页面 最小延迟>=1000ms
> 为了优化后台 tab 的加载损耗（以及降低耗电量），在未被激活的 tab 中定时器的最小延时限制为 1000ms。  

这经常导致一些看似正常工作的程序，后台运行一段时间后就出现 bug 了。  
甚至导致需要常驻后台的主要功能无法正常工作。  

解决方法：使用 **WebWorker** 中的 `setInterval`。  

### 基于WebWorker的后台定时器
有了解决思路，但每次碰到需要后台的定时器，就创建一个WebWorker也不合适。  

**一个极简、可以在后台页面定时运行任务的工具函数实现。**  
提供简单的API，支持在有任务时自动启动定时器，无任务自动终止。  

<details>
<summary>
<span style="color: #1989fa; cursor: pointer;">展开看源码</span>
</summary>
  
```ts
const setup = (): void => {
  let timerId: number

  let interval: number = 16.6

  self.onmessage = (e) => {
    if (e.data.event === 'start') {
      self.clearInterval(timerId)
      timerId = self.setInterval(() => {
        self.postMessage({})
      }, interval)
    }

    if (e.data.event === 'stop') {
      self.clearInterval(timerId)
    }
  }
}

const createWorker = (): Worker => {
  const blob = new Blob([`(${setup.toString()})()`])
  const url = URL.createObjectURL(blob)
  return new Worker(url)
}

const handlerMap = new Map<number, Set<() => void>>()
let runCount = 1

const worker = createWorker()
worker.onmessage = () => {
  runCount += 1
  for (const [k, v] of handlerMap.entries()) {
    if (runCount % k === 0) {
      v.forEach(fn => fn())
    }
  }
}
/**
 * 16.6ms 执行一次回调
 * 解决页面后台时，定时器不（或延迟）执行的问题
 */
export const timer16ByWorker = (handler: () => void, time = 1): () => void => {
  const fns = handlerMap.get(time) ?? new Set()
  fns.add(handler)
  handlerMap.set(time, fns)

  if (handlerMap.size === 1 && fns.size === 1) {
    worker.postMessage({ event: 'start' })
  }

  return () => {
    fns.delete(handler)
    if (fns.size === 0) handlerMap.delete(time)
    if (handlerMap.size === 0) {
      runCount = 0
      worker.postMessage({ event: 'stop' })
    }
  }
}

```
</details>

**使用示例**  
```ts
const stopTimer = timer16ByWorker(() => {
  // 如果期望 setTimeout 的效果，只要执行一次，可以在首次执行时stopTimer
  // 不执行 stopTimer 则类似 setInterval
  // stopTimer() 

  // do sth
}, 1) // 间隔 1 * 16.6ms 执行一次回调

// 终止循环任务
// stopTimer()
```

**选择 16.6ms 作为基础间隔时长的原因**    
- 大约是普通情况下（60FPS）浏览器每帧的间隔时间，方便执行跟渲染相关的任务  
- 方便计算间隔时长，比如 5s 一次的循环任务 `timer16ByWorker(() => {}, 5 * 60)`  

有其他时间间隔的需要也可以修改 `let interval = 16.6` 的值。  
注意参考前文，**值不能小于 5ms**。