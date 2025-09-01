---
tags:
  - WebAV_EN
  - Audio & Video
  - WebCodecs
  - Web
date: 2024-07-27
---

# WebCodecs Performance and Optimization Insights

_[**ZingAI.video**](https://www.zingai.video) is a video editing tool built with WebCodecs. You can experience the performance of video exporting here._

---

It's been a year and a half since I open-sourced [WebAV][1] and wrote a [series of articles](/tag/WebAV_EN) to help beginners get started with Web audio and video.

I've always had concerns about potential performance gaps between Web platform and Native APP audio/video processing, given that WebCodecs API is proxied through the browser and requires JavaScript for some data processing. The extent of performance overhead wasn't clear.

I believe readers new to WebCodecs share this concern about its performance capabilities.

Now that [WebAV][1] has stabilized and v1.0 is approaching release, I conducted some simple performance tests, and **the results are encouraging :)**

_Note: WebAV is a WebCodecs-based SDK for **creating/editing video files** on the Web platform_

## Test Environment

Test Resource: bunny_avc_frag.mp4 (fMP4), 1080P, 10min, AVC encoded  
Output: 10min, 3Mbps bitrate, 30 FPS  
Method: Draw simple text in the video center, composite and export

## Hardware

1. Device 1: MacBook Pro, M1 (2020), 16 GB
2. Device 2: AMD Ryzen 7 5800 8-core, RTX 3080, 32 GB
3. Device 3: Intel i9-9900k, RTX 2070, 32 GB
4. Device 4: Intel i5-8265U, UHD Graphics 620, 8 GB

## WebCodecs Performance Results

Numbers represent video composition time (in seconds), **WebAV performance data is based on latest version below**  
![benchmark](./benchmark.png)

_Note 1: Local composition (WebAV, ffmpeg, CapCut APP) heavily depends on hardware configuration; cloud composition (CapCut Web) depends on allocated server resources_  
_Note 2: CapCut APP version 4.1.0, installed via official downloader, shows unusual behavior for unknown reasons_

**2024.08.12 Update: WebAV v0.14.6 Optimized Data**

![benckmark-240812](./benckmark-240812.png)

**2024.08.16 Update: WebAV v0.14.9 Optimized Data**
![benckmark-240816](./benckmark-240816.png)

Interested readers can compare results or discuss in comments. WebAV performance test code is [here][2]; other tools require separate installation.

### Summary

WebCodecs leverages hardware acceleration for encoding/decoding. After three optimization rounds, WebAV shows significant performance improvements.  
While some performance gaps remain compared to Native solutions on certain devices, I believe performance is no longer a primary consideration in solution selection.  
Moving forward, we'll focus on SDK stability and preparing for [v1.0 release](https://github.com/WebAV-Tech/WebAV/issues/122).

Future performance optimizations are possible. To stay updated on WebAV (WebCodecs) performance optimization data, subscribe to this [article's comment issue](https://github.com/hughfenghen/hughfenghen.github.io/issues/205).

![image](https://github.com/user-attachments/assets/498d2a3f-d45c-434e-8244-67a8e624503e)

## Performance Optimization Strategies

_Below are my experiences; reader discussion and additions welcome_

### Encoding is the Performance Bottleneck

Encoding tasks consume the most computational resources. Don't let other tasks (demuxing, decoding, compositing, etc.) block the encoder.  
Prepare frame data in advance to keep the encoder continuously working with an uninterrupted supply of video frames once video composition begins.

However, carefully manage memory/VRAM usage - don't decode too much data in advance.  
Keep the encoding queue manageable to avoid VRAM overflow; see **VRAM Usage Control** below for details.

### Parallel Encoders

Since video encoding is the performance bottleneck, analysis shows significant time spent waiting for encoder output.  
Creating multiple encoders can better utilize GPU hardware acceleration. Distribute encoding tasks by GOP across encoders, then assemble outputs in chronological order. This shows notable improvements on some devices.

### Memory Usage Optimization

Audio/video files are typically large. Loading entire files into memory consumes excessive space, causing frequent GC and performance degradation. Very large files may overflow, causing errors or crashes.

Store video files in OPFS (Origin Private File System) and load into memory as needed.  
[WebAV][1] uses [opfs-tools][3] for private origin file operations, significantly reducing memory usage.

### Memory Allocation Optimization

In JavaScript, ArrayBuffer abstracts operable memory data.

Web developers rarely need to consider memory allocation and collection, but audio/video processing frequently operates on large memory blocks. Frequent memory allocation and collection can impact performance.

Here are some APIs relevant to Web audio/video performance optimization:

- [subarray][4]: Reuse allocated memory, reducing new memory allocation. Modifying shared portions affects all sharing objects
- [resize][9]: Dynamically adjust ArrayBuffer size, reducing new memory allocation
- [transfer][5]: Create new ArrayBuffer (larger/smaller) from existing one quickly, but source becomes unusable after transfer
- [Transferable][6]: Objects implementing this interface transfer between threads efficiently, optimizing WebWorker performance
- [SharedArrayBuffer][8]: Direct memory sharing between threads, avoiding data transfer overhead but requiring lock consideration
- WebWorker concurrent processing; see my article on [JS Concurrency][7]

_**Note** compatibility of resize, transfer, and SharedArrayBuffer activation requirements_

### VRAM Usage Control

Video frames ([VideoFrame][10]) contain raw image data, consuming significant VRAM. **Never hold too many video frame objects simultaneously**. Create as needed and close immediately after use to avoid VRAM overflow and severe performance impact.

During decoding, if VideoFrames from VideoDecoder aren't closed promptly, accumulation will **stop decoder output**.

During encoding, JavaScript-created VideoFrames for VideoEncoder require **active developer management** of object count.  
Monitor [VideoEncoder encodeQueueSize][11]; pause new frame creation when queue size grows too large, allowing encoder to process queued frames.

## Appendix

- [WebAV][1]
- [WebAV Performance Tests][2]
- [opfs-tools][3]
- [subarray][4]
- [resize][9]
- [transfer][5]
- [Transferable][6]
- [JS Concurrency][7]
- [SharedArrayBuffer][8]

[1]: https://github.com/WebAV-Tech/WebAV/
[2]: https://github.com/WebAV-Tech/WebAV/blob/0f1ed722032057d3efdb56c19209964739adef8a/packages/av-cliper/demo/performance.demo.ts#L14
[3]: https://github.com/hughfenghen/opfs-tools
[4]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/subarray
[5]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/transfer
[6]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects
[7]: https://fenghen.me/posts/2023/03/27/js-concurrent/
[8]: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer
[9]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/resize
[10]: https://developer.mozilla.org/en-US/docs/Web/API/VideoFrame
[11]: https://developer.mozilla.org/en-US/docs/Web/API/VideoEncoder/encodeQueueSize
