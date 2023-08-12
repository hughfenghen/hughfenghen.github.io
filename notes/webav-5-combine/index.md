---
tags:
  - WebAV
  - 音视频
  - WebCodecs
  - Web
date: 2023-08-12
---

# Web 音视频（五）合成视频

> [**Web 音视频目录**](/tag/webav)

经过前序章节的介绍，读者能大致了解如何在播放器中解析、创建视频。  
本章介绍何在浏览器中合成视频，这是视频编辑中最基础的功能。  

## 在视频上叠加素材
常见的素材有：视频、图片、文字  

[在浏览器中创建视频]()章节介绍了，视频编码器只接受 VideoFrame 对象，而 canvas 可以构造 VideoFrame；  

在视频上叠加素材的实现原理：`视频 + 素材 -> canvas -> VideoFrame -> VideoEncoder`  
1. 先绘制视频到 canvas，再绘制其他素材
2. 使用 canvas 元素构造 VideoFrame 对象
3. 使用编码器编码 VideoFrame
4. 处理下一帧

原理非常简单，

## 拼接多个视频

### 重编码拼接

### 快速拼接

## 裁剪视频时间


