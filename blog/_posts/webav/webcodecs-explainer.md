---
tags:
  - WebAV
  - 音视频
  - WebCodecs
date: 2023-10-02
---

# 【译】WebCodecs 说明

_本文翻译至 [WebCodecs Explainer][1]_

## 问题与动机

已有许多 Web API 在内部使用媒体编解码器来支持特定用途，比如:

- HTMLMediaElement and Media Source Extensions
- WebAudio (decodeAudioData)
- MediaRecorder
- WebRTC

但是还没有一种通用的方式来灵活地配置和使用这些媒体编解码器。因此，许多 Web 应用程序仍然选择 JavaScript 或 WebAssembly 来实现媒体编解码器，尽管存在劣势：

- 增加了网络消耗去下载浏览器中已有的编解码器
- 降低了性能
- 增加了功耗

它们这样做可能是因为当前开放的 Web API 在特定场景都存在难以克服的障碍:

- WebAudio 允许将媒体文件(以二进制缓冲区的形式)解码为 PCM，但它需要是一个有效且完整的媒体文件。它不支持数据流，不提供解码的进度信息。当然，也不支持解码视频，更不支持编码。
- MediaRecorder 允许对具有音频和视频轨道的 MediaStream 进行编码。可以粗略地控制一些参数(比特率、带编解码器字符串的 mimetype)，但它是非常高层次的。它不支持超过现实速度来快速编码；由于输出可能被缓冲，因此不适合低延迟编码。编码比特流被封装在一个容器中，这为需要自定义容器格式的使用场景增加了开销。许多事情不透明：数据不足时会发生什么，编码速度太慢而无法实时时会发生什么。它对于基础应用非常友好，但缺少许多功能。（译注：总结来说，这是一个高层次的 API，无法做到偏底层的精细控制）
- WebRTC PeerConnection 允许对网络 RTP 流进行编码和解码，并且与其他 WebRTC 和 MediaStream API 高度耦合，实际上无法用于其他用途。它也非常不透明，JavaScript 无法访问编码后的数据。（译注：WebRTC Insertable Stream 已支持访问编码后的数据）
- HTMLMediaElement 和 Media Source Extensions 允许在流式传输压缩数据的同时实时解码媒体。视频和音频输出几乎没有灵活性(可以通过 canvas 调整视频，但不是很高效)。对解码速度的控制方法很少，唯一的可能性是通过 playbackRate，但这会增加音频的频率。无法得到已解码新图像的通知，也无法决定提前解码多少。不能以设备极限的最快速度解码图像数据并对数据运行计算。编码比特流必须以特定的容器格式提供，这限制了非浏览器原生支持的视频容器格式的应用。

## 目标

为 Web 应用程序提供高效访问内置(软件和硬件)媒体编码器和解码器的途径，以编码和解码具有以下属性的媒体：

- **流式传输**：能够对不是全部在内存中的数据流进行操作的能力(可能从网络、磁盘上读取)。
- **效率**：能够利用用户代理、系统或主机上的可用硬件，使编解码过程更高效。限制垃圾量(在“垃圾回收”意义上)，将 GC 压力降到最低，避免 GC 带来的固有非确定性，允许编码和解码脱离主线程运行（译注：可在 WebWorker 中运行）。
- **组合性**：与其他 Web API(如 Streams、WebTransport 和 WebAssembly)配合良好。
- **可恢复性**：在出现问题时能够恢复的能力(网络不足、资源缺乏导致的帧下降等)。
- **灵活性**：能够用于各种用例的能力(硬实时、软实时、非实时)，能在此之上实现类似 MSE 或 WebRTC 的功能，且能达到同等级别的功耗和延迟。
- **对称性**：编码和解码具有相似的模式。

## 非目标

- 直接操作媒体容器的 API (封装/解封装)
- 在 JavaScript 或 WebAssembly 中实现编解码器

## 关键用例

- 极低延迟直播(< 3 秒延迟)
- 云游戏
- 直播推流
- 非实时编码/解码/转码，例如本地音视频文件编辑
- 高级实时通信：
  - 端到端加密
  - 对缓冲行为的控制
  - 空间和时间可扩展性（译注：指能够控制或改变视频的分辨率、帧率等）
- 解码和编码图片
- 对多个输入媒体流重新编码，以便将许多编码媒体流合并为一个编码媒体流（译注：音视频常见的“合流”）。

## 提案的解决方案

WebCodecs 接口模仿了流行平台和软件编解码器的 API。这种 API 形态经过时间的验证，对于具有音视频开发者来说也很直观。

核心接口包括：

- **EncodedAudioChunks** and **EncodedVideoChunks** 包含指定格式的已编码字节数据.
- **AudioFrame** 包含解码后的音频数据。它可以通过 [AudioWorklet](https://webaudio.github.io/web-audio-api/#audioworklet) 渲染为 [AudioBuffer](https://webaudio.github.io/web-audio-api/#audiobuffer)。(译注：音频帧 `AudioFrame` 对应的 API 实现为 **`AudioData`**)
- **VideoFrame** 包含解码后的视频数据。 它将提供一个 [ImageBitmap](https://html.spec.whatwg.org/multipage/imagebitmap-and-animations.html#imagebitmap) 用于在 WebGL、Canvas 进行操作和渲染。它还能 [访问 YUV 数据](https://github.com/w3c/webcodecs/issues/30), 但是其设计目前尚未确定。
- **AudioEncoder** 编码 AudioFrames （音频帧）生成 EncodedAudioChunks.
- **VideoEncoder** 编码 VideoFrames（视频帧）生成 EncodedVideoChunks.
- **AudioDecoder** 解码 EncodedAudioChunks 生成 AudioFrames.
- **VideoDecoder** 解码 EncodedVideoChunks 生成 VideoFrames.

WebCodecs 还将定义了从 getUserMedia() 导入内容的机制。

- [**MediaStreamTrackProcessor**](https://w3c.github.io/mediacapture-transform/#track-processor) 将音视频 MediaStreamTrack 转换为 `ReadableStream<AudioFrame | VideoFrame>`。

## 示例

### 可运行的 DEMO

请注意，下面概述的示例仅为了简洁起见而留下了几个未实现的方法。要获取完整的工作示例，请参阅：

- <https://w3c.github.io/webcodecs/samples/>
- <https://web.dev/webcodecs/>

(译注：省略了代码示例没有翻译，因为 WebCodecs API 已经在浏览器中实现，跟原先设计有一点点差异；如果你想了解真实可运行的示例代码，可参前面官方示例源码，或译者写的 [WebAV 系列][3]文章)

## 详细的设计讨论

### 执行环境

编码器和解码器对象可在主线程和专用 Worker 上实例化。编解码器的输入和输出可以使用 postMessage() 在上下文之间传输。传输序列化将使用移动语义实现，并避免复制。

编码和解码操作的计算成本非常高。因此，用户代理必须与启动操作的 JavaScript 异步执行这些操作。编解码器的执行环境由用户代理定义。一些可能性包括：在内部线程池上顺序执行或并行执行，或在硬件加速单元（如 GPU）上执行。

用户代理应谨慎高效地处理昂贵的资源（如视频帧内容、GPU 资源句柄）。

### 编解码器配置

许多编解码器实现都是高度可配置的。WebCodecs 打算支持当今编解码器中可用的大多数配置选项，以有效地支持高级用例。

当编解码器状态不是“closed”时，编解码器可以随时重新配置。传递给 decode() 或 encode() 的块/帧 (Chunks/Frames) 将根据最近对 configure() 的调用进行解码/编码。

WebCodecs 定义了一组可与任何编解码器一起使用的配置参数。特定于编解码器的参数由编解码器在 <https://www.w3.org/TR/webcodecs-codec-registry/> 中注册时定义。对特定设置的支持可能与具体实现有关。支持的配置可使用静态方法 isConfigSupported() 进行支持性检测。

## 考虑过的替代设计

### Media Source Extensions (MSE)

MSE 已被广泛用于低延迟流媒体。 但也存在一些问题：

- 触发 "低延迟模式 "的方式是隐式的，没有标准化，也不是所有主要浏览器都支持。
- 应用程序必须绕过 MSE 默认的 "欠载（数据不足）时停止"行为
- 应用程序必须在将输入添加到缓冲区之前将其容器化
- 不需要历史记录的应用程序（云游戏）必须设法删除/禁用历史记录
- 应用程序无法轻松访问解码输出（用于渲染以外的用途，如转码）

所有这些问题都可以通过扩展 MSE API 来解决，以明确支持低延迟控制。但这只能解决解码方面的问题，而不能解决编码方面的问题。

### 与 WhatWG Streams 集成

早期的设计将编码器和解码器定义为 WhatWG 流规范中的 TrasformStreams。这是一个很有吸引力的模型；从概念上讲，编解码器是具有输入和输出流的转换器。但在 Streams 的基础上实现基本的编解码器控制（配置、刷新、重置）会导致设计复杂，我们无法向用户隐藏这种复杂性（更多详情[此处](https://docs.google.com/document/d/10S-p3Ob5snRMjBqpBf5oWn6eYij1vos7cujHoOCCCAw/edit?usp=sharing)）。我们选择如上所述定义编解码器接口。用户可以根据需要将这些接口封装到 Streams 中。

## 未来的考虑

早期的提案将 AudioTrackWriter 和 VideoTrackWriter 定义为向 `<video>` 传输解码媒体以进行演示的一种方式。大多数潜在用户都表示他们更喜欢通过 Canvas 来管理演示，因此 `<video>` 演示 "目前已不再优先考虑。

未来的另一个想法是公开一个编解码器 "worklet"，用户可以在其中实现自己的编解码器，以便在现有的媒体管道中使用。例如，WASM 解码器可与现有的 MSE 和 `<video>` API 结合使用。

**译注附录**

- [WebCodecs Explainer][1]
- [WebRTC Insertable Stream 初探与 WebRTC"管道化"][2]
- [WebAV 系列文章][3]
- [WebAV][4] 基于 WebCodecs 构建的音视频处理 SDK

[1]: https://github.com/w3c/webcodecs/blob/main/explainer.md#webcodecs-explainer
[2]: https://cloud.tencent.com/developer/article/1968374
[3]: https://fenghen.me/tag/WebAV/
[4]: https://github.com/WebAV-Tech/WebAV
