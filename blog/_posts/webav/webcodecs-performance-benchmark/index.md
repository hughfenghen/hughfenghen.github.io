---
tags:
  - WebAV
  - 音视频
  - WebCodecs
  - Web
date: 2024-07-27
---

# WebCodecs 性能表现及优化思路

笔者开源 [WebAV][1] 已经一年半，还写了[系列文章](/tag/WebAV)帮助初学者入门 Web 音视频。

之前一直隐隐担心在 Web 平台处理音视频与 Native APP 会有明显性能差距，因为 WebCodecs API 毕竟被浏览器代理了一层，且一些数据处理需要 js 配合，不确定有多大的性能损耗。

相信刚接触 WebCodecs 的读者也非常关心它的性能表现如何。

如今 [WebAV][1] 已经稳定下来，v1.0 即将发布，于是做了一次简单的性能测试，~~**结果是乐观的 ：）**~~

_注：WebAV 是基于 WebCodecs 构建的 SDK，在 Web 平台**创建/编辑视频文件**_

## 环境信息

测试资源：bunny_avc_frag.mp4 (fMP4)，1080P，10min，AVC 编码；  
输出： 10min，3M 码率，30 FPS  
方法：在视频中央绘制一个最简单的文本，合成导出视频

## WebCodecs 性能表现

数字是合成视频消耗的时间，单位 s  
![benchmark](./benchmark.png)

_注 1：本地合成（WebAV、ffmpeg、剪映 APP），跟设备的硬件配置强相关；云端合成（剪映 Web），跟服务资源分配的资源强相关_  
_注 2：剪映 APP 是由官方下载器自动安装的，有个 4.1.0 版本很奇怪，我也不知道原因_

若读者有兴趣可自行对比或在评论区讨论，WebAV 性能测试代码[在这里][2]，其它工具请自行安装。

### 总结

1. 结果**只在 MacOS 下是乐观的**，与 Native APP 性能表现在同一水准
2. WebCodecs API 能利用硬件加速，但在 Windows 设备下仍有一定差距
3. 设备性能越差，WebAV 性能劣化越快

接下来需要重点分析低性能设备下，WebAV 有多大的优化空间，结果会在这里更新，感兴趣的读者请可以[订阅](/subscribe.html)博客。

## 性能优化思路

_以下记录一些笔者的经验，欢迎读者讨论与补充_

### 优化内存占用

音视频文件体积通常会比较大，如果将整个文件加载到内存中将占用过多内存空间，导致频繁 GC 降低性能，加载特别大的音视频文件还会溢出导致错误或崩溃。

可以将视频文件写入到 OPFS（私有源文件系统），按需读取到内存中。  
[WebAV][1] 依赖了 [opfs-tools][3] 来操作私有源文件，大幅降低了内存占用。

### 优化内存分配

在 js 语言中 ArrayBuffer 是可操作的内存数据的抽象。

Web 开发者很少需要关注内存的分配与回收，但音视频处理过程中经常需要对较大的内存数据进行操作，如果频繁创建、回收内存会对性能造成负面影响。

这里介绍一些跟 Web 音视频性能优化相关的 API。

- [subarray][4] 复用已分配的内存，减少开辟新的内存空间，如果修改了复用部分的数据，所有复用的对象会一起改变
- [resize][9] 动态调整 ArrayBuffer 对象的大小，减少开辟新的内存空间
- [transfer][5] 基于已有 ArrayBuffer 创建（扩大或缩小）新的 ArrayBuffer 对象，速度很快，但注意 transfer 之后旧的对象将不可用
- [Transferable][6] js 中实现了该接口的对象，能以极低的成本在不同线程间传递，配合 WebWorker 来优化性能
- [SharedArrayBuffer][8] 在线程间直接共享内存空间，避免传递数据的损耗，但要考虑“锁”的问题
- WebWorker 多线程并发，详情参考笔者的另一篇文章 [JS 多线程并发][7]

_**注意** resize、transfer 的兼容性，启用 SharedArrayBuffer 的条件_

### 控制显存占用

视频帧（[VideoFrame][10]）是图像的原始数据，会占用较大的显存空间，切记**同一时刻不能持有过多的视频帧对象**，按需创建、用完立即 close，否则会打爆显存，严重影响性能。

解码阶段，解码器（VideoDecoder）输出的 VideoFrame 如果没有及时关闭，累积一定数量后，**解码器将停止输出**。

编码阶段，编码器（VideoEncoder）接收的 VideoFrame 是 js 创建的，此时**需要开发者主动控制**创建视频帧对象的数量；  
检测到 [VideoEncoder encodeQueueSize][11] 数量过大，应暂停创建新的视频帧，等待编码器消化队列中的视频帧。

## 附录

- [WebAV][1]
- [WebAV 性能测试][2]
- [opfs-tools][3]
- [subarray][4]
- [resize][9]
- [transfer][5]
- [Transferable][6]
- [js 多线程并发][7]
- [SharedArrayBuffer][8]

[1]: https://github.com/bilibili/WebAV/
[2]: https://github.com/bilibili/WebAV/blob/0f1ed722032057d3efdb56c19209964739adef8a/packages/av-cliper/demo/performance.demo.ts#L14
[3]: https://github.com/hughfenghen/opfs-tools
[4]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/subarray
[5]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/transfer
[6]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects
[7]: https://hughfenghen.github.io/posts/2023/03/27/js-concurrent/
[8]: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer
[9]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/resize
[10]: https://developer.mozilla.org/en-US/docs/Web/API/VideoFrame
[11]: https://developer.mozilla.org/en-US/docs/Web/API/VideoEncoder/encodeQueueSize
