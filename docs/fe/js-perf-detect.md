# JS 检测设备性能

**性能检测包括**
1. 检测当前运行时的性能（繁忙度）  
2. 检测设备硬件所反映的性能水平  

## 运行时性能
首先，在 JS 中并不能直接获取 CPU 占用率、内存使用信息。  
但可以统计一些性能相关的数值来间接评估主线程当前的繁忙度。  
注意是[**主线程**](https://developer.mozilla.org/zh-CN/docs/Glossary/Main_thread)，不是设备CPU的繁忙度或占用率。  

### LongTask
[**LongTask**](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceLongTaskTiming) 必然导致绘制丢帧、交互延迟响应。  
根据 LongTask 触发频率、持续时间，可在一定程度上判定当前主线程、UI线程性能状况。  

```js
// 按经验调整“回血”速度、减分力度
let score = 100
const timerId = setInterval(() => {
  // 回血
  score += 2
}, 1000)

const observer = new PerformanceObserver((list) => {
  score -= list.length * 10

  if (score < 0) score = 0
});

observer.observe({ type: "longtask", buffered: true });
```

### FPS
计算 FPS（每秒渲染帧数）可评估当前页面渲染的压力，一般期望大于等于60帧，页面看起来流畅。  
FPS 越小体验越差，若小于30，一般人都能感觉到动画的卡顿现象。  

<details>
<summary><span style="color: #1989fa; cursor: pointer;">可展开</span>
<div>一个轻量的检测 FPS 模块</div>
</summary>

```ts
// 特性
// 1. 监听 FPS，连续 10s 低于阈值，执行回调告警
// 2. 检测一段事件区间的平均FPS值
// 3. 无监听者时体制检测，降低性能损耗

/**
 * fps 告警监听器
 * [阈值, 监听器]
 */
const alertMonitors: Array<[number, Set<() => void>]> = []

/**
 * fps 均值监听器
 */
const avgCheckers = new Set<(avg: number) => void>()

let frame = 0
let lastTime = 0

let fpsList: number[] = []

let running = false
let rafId = 0
const loop = function (): void {
  frame++

  const now = performance.now()
  const gap = now - lastTime

  if (gap >= 1000) {
    const fps = Math.round((frame * 1000) / gap)
    lastTime = now
    frame = 0

    fpsList.push(fps)
    // 保留最近 10 个记录
    fpsList = fpsList.slice(-10)
    if (fpsList.length === 10) {
      const maxFPS = Math.max(...fpsList)
      for (const [lowerLimit, fns] of alertMonitors) {
        // 连续 10s 低于预期值，执行回调
        if (maxFPS < lowerLimit) {
          fns.forEach(fn => fn())
        }
      }
    }

    const avg = fpsList.reduce((a, b) => a + b, 0) / fpsList.length
    avgCheckers.forEach(fn => fn(avg))
  }

  if (running) rafId = requestAnimationFrame(loop)
}

function restart (): void {
  lastTime = performance.now()
  fpsList = []
  frame = 0
  cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(loop)
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    restart()
  }
  // hidden 时， raf 会自动停止执行
})

/**
 * 监听 FPS ，连续 10s 低于指定值会触发回调 opts: { type: 'alert' }
 * 或监听 FPS 平均值 opts: { type: 'avg' }
 * @param fn
 * @return 取消监听函数
 */
export function monitorFPS (
  opts: { type: 'avg' } | { type: 'alert', threshold: number },
  fn: (v?: number) => void
): () => void {
  if (opts.type === 'alert') {
    let entity = alertMonitors.find(([v]) => opts.threshold === v)
    if (entity == null) {
      entity = [opts.threshold, new Set()]
      alertMonitors.push(entity)
      alertMonitors.sort(([v1], [v2]) => v1 - v2)
    }
    entity[1].add(fn)
  } else if (opts.type === 'avg') {
    avgCheckers.add(fn)
  }

  if (!running) {
    running = true
    restart()
  }

  // 移除监听逻辑
  return () => {
    if (opts.type === 'alert') {
      alertMonitors.find(
        ([thrshold]) => thrshold === opts.threshold
      )?.[1].delete(fn)
    } else if (opts.type === 'avg') {
      avgCheckers.delete(fn)
    }

    if (
      alertMonitors.map(([, s]) => s)
        .every(s => s.size === 0) &&
      avgCheckers.size === 0
    ) {
      running = false
      cancelAnimationFrame(rafId)
    }
  }
}
```
</details>

### CPU 空闲
通过定时执行 `window.requestIdleCallback` 可评估主线程的空闲度。  

以下是原理代码，分析idleTime中的可一定程度反应当前主线线程的繁忙度。  
```js
// **idleTime越小主线程越繁忙**，当前主线程性能压力越大。  
const idleTime = []
window.setInterval(() => {
  window.requestIdleCallback((idle) => {
    idleTime.push(idle.timeRemaining())
  })
} , 500)
```

### 内存
[Performance.memory](https://developer.mozilla.org/zh-CN/docs/Web/API/Performance/memory) 包含三个属性   
```shell
jsHeapSizeLimit 上下文内可用堆的最大体积，以字节计算。
totalJSHeapSize 已分配的堆体积，以字节计算。
usedJSHeapSize 当前 JS 堆活跃段（segment）的体积，以字节计算。
```
一般内存占用不会明显影响运行效率，但如果内存占用过大，或出现内存泄露时，页面会出现卡爆的现象。  

## 设备硬件信息
设备硬件可以反应当前设备的性能水平如何，可用于决定密集型任务的执行策略。  
比如低端设备不运行软解视频，而是选择合适的编码格式视频。  

1. CPU 逻辑核心个数[Navigator.hardwareConcurrency](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/hardwareConcurrency)  
2. 设备内存[Navigator.deviceMemory](https://developer.mozilla.org/zh-CN/docs/Web/API/Navigator/deviceMemory)（不一定是准确，避免泄露隐私）  
3. 获取GPU信息，常用于高度依赖 GPU 的网页应用（游戏、软解视频、机器学习）做决策  
```ts
function getUnmaskedInfo() {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext("experimental-webgl");
  const unMaskedInfo = {
    renderer: '',
    vendor: ''
  };
  if (gl == null) return unMaskedInfo

  const dbgRenderInfo = gl.getExtension("WEBGL_debug_renderer_info");
  if (dbgRenderInfo != null) {
    unMaskedInfo.renderer = gl.getParameter(dbgRenderInfo.UNMASKED_RENDERER_WEBGL);
    unMaskedInfo.vendor = gl.getParameter(dbgRenderInfo.UNMASKED_VENDOR_WEBGL);
  }

  return unMaskedInfo;
}
getUnmaskedInfo() // { renderer: 'ANGLE (Intel HD Graphics 3000)', vendor: 'Intel Inc.' }
```