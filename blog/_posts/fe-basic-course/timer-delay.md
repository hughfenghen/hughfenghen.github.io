---
tags:
  - 前端基础
date: 2023-06-15
---

# JS 定时器时长控制细节

## 背景

JS 最常使用 `setTimeout`、`setInterval` 来延迟或定时循环执行函数，通常会传递第二个参数来控制延迟或间隔执行的时间。  

但开发者必须意识到函数执行时间**并非精确**地符合预期，在以下场景中它会超出你的预期
1. CPU 繁忙（主线程被长时间占用），JS 无法按开发者设定的预期时间延迟函数
2. 定时器过于频繁地执行（第二个参数 < 4），达到一定条件后浏览器（或说 JS 执行引擎）会限制定时器执行频率
3. 页面处于后台，浏览器为了降低 CPU 资源占用、电池消耗，会主动限制定时器的执行频率  
   - 后文会介绍如何在并要的时候**绕过**这个限制

总结以上的特征，定时器在你进行简单主动地检测时它往往符合预期，但经常会悄悄地偏离你的预期。  
因为简单检测时，页面肯定处于前台，而且不会达到限制条件；你可以复制后文中设计好的代码来检测定时器的延迟特性。  

## CPU 繁忙
```js
const t = performance.now()
setTimeout(() => {
  // 期望 100ms 后执行，实际因为 while 占用主线程，将在 1s 后执行
  console.log(performance.now() - t)
}, 100)
while(performance.now() - t < 1000){}
```

## 最小延迟时长 >= 4ms
> 在浏览器中，由于函数嵌套（嵌套层级达到一定深度），或者是由于已经执行的 setInterval 的回调函数阻塞导致 setTimeout()/setInterval() 的每调用一次定时器的最小间隔是 4ms。  

尝试在不同浏览器分别执行以下两段代码，观察打印的间隔值。  
前几次（不同浏览器有差异）间隔差不多1ms，后续间隔时长都大于4ms。  
```js
let t = performance.now()
setInterval(() => {
  console.log(performance.now() - t)
  t = performance.now()
}, 1)
```

```js
// setTimeout 构建循环
let t = performance.now()
function loop() {
  console.log(performance.now() - t)
  t = performance.now()

  setTimeout(loop, 1)
}
loop()
```
也就是说：**小于 4ms 的异步循环任务** 期望的延迟时间是不靠谱的。  
如果有小于 4ms 的异步循环任务，得小心了，这个限制**无法绕过**。  

## 后台页面 最小延迟 >= 1000ms
> 为了优化后台 tab 的加载损耗（以及降低耗电量），在未被激活的 tab 中定时器的最小延时限制为 1000ms。  

这经常导致一些看似正常工作的程序，后台运行一段时间后就出现 bug 了。  
甚至导致需要常驻后台的主要功能无法正常工作。  

解决方法：使用 **WebWorker** 中的 `setInterval` 向主线程发送消息（postmessage），主线程会立即执行。  
*理解浏览器限制的原因，如非必要不要随意使用该方法*  

### 基于 WebWorker 的后台定时器
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
注意参考前文，**值不能小于 4ms**。

## 附录
- [MDN setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout)
- [MDN setInterval](https://developer.mozilla.org/en-US/docs/Web/API/setInterval)